import { execFile } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import dotenv from 'dotenv'

dotenv.config()

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export async function retrieveData(_, res){ //doesnt need req only need res
    try{
        let fullData = [] //this is what will be used to make the json file
        for(let i =1; i < 2050; i++){ //each page of the data set has 50 values so we will go 2050pages * 50rows per page just to get a little more
            const response = await fetch(process.env.DATA_API + "?pageNumber=" + i + "&pageSize=50&orderingSpecifier=discard&app_token=" + process.env.SECRET_TOKEN)
            //this is the response from the api. it takes in four queries
            //page number which will be indexed so we go through first 2050 pages
            //pageSize which is a bit misleading as this just ask how many rows per page so we will take 50
            //ordering specifier which the documentation said would make things run faster but it doesnt seem to be helping our case as of now
            //and an app token which the documentation asks us to have so we can have valid api calls

            //DATA_API and SECRET_TOKEN are hidden in the .env file.
            //secret token is the token it specifically gave me. we'll find out later if we all share one or use separates - c

            const data = await response.json()
            //this will turn the data from the response into json

            const filter = data.map(item => ({
                area: item.area
            }))
            //this will filter the data so that we only have certain values. as of now its just area thats kept

            fullData = fullData.concat(filter)
            //this puts all the data into one variable
        }


        fs.writeFileSync("crimeData.json", JSON.stringify(fullData));
        //this writes a file called crimeData.json (which will be ignored when pushed to git)

        console.log("saved dataset.json");
        res.status(200).json({msg: "got the data!"})
        //responds to the front end with a valid status code telling us everything went well
    } catch(error){
        console.error("Couldnt get crime data", error)
        res.status(400).json({msg: "failed to retrieve data"})
        //something went wrong in retrieving data, from what ive seen biggest reason is
        //too big of a string -c
    }
}
export function runCpp(req, res){
    const type = String(req.query.type || "DISPLAY").slice(0, 20); //Read type, default display if not
    const region = String(req.query.region || "UNKNOWN").slice(0, 20); //Read region, default uknown all if not
    const binPath = path.join(__dirname, "bin", process.platform === 'win32' ? 'crime.exe' : 'crime'); //Executable path
    //Execute C++ binary with args
    if (!fs.existsSync(binPath)) {
        return res.status(500).send("C++ binary not found.");
    }

    const args = [type, region];
    // safety: set timeout and maxBuffer to avoid hangs / excessive memory
    const execOptions = { timeout: 10000, maxBuffer: 10 * 1024 * 1024 };
    execFile(binPath, args, execOptions, (error, stdout, stderr) => {
        if (error) {
            console.error("Error executing C++ binary:", error, stderr);
            if (error.killed) return res.status(504).send("C++ process timed out.");
            return res.status(500).send("Error executing C++ binary.");
        }
        // Send stdout as response
        return res.status(200).send(stdout || "No output from C++ program.");
    });
}
