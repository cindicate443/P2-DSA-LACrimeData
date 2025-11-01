import { execFile } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import dotenv from 'dotenv'

dotenv.config()

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export async function retrieveData(req, res){
    try{

        const get20 = 20 // how many requests we make at a time
        let pageNumber = 1
        for(let i = 0; i < 10; i++){
            console.log(`trying page ${i}`)
            let chunk = []
            for(let k = 1; k < 201; k+=get20){

                let requests = [] // we will house all fetch requests in this array

                for (let j = k; j < k + get20 && j < 201; j++) {
                    requests.push(fetch(process.env.DATA_API +
                        "?pageNumber=" + pageNumber +
                        "&pageSize=50" +
                        "&orderingSpecifier=discard" +
                        "&app_token=" + process.env.SECRET_TOKEN))
                    pageNumber++;
                }

               //DATA_API and SECRET_TOKEN are hidden in the .env file.
                const response = await Promise.all(requests)
                /*
                we will do 20 requests at a time and await for the 20 to finish
                This is faster than doing one requests at a time because instead of waiting one by one
                we only wait for 20 than do next 20
                we have it set to 20 for now so we dont get blocked by the api
                i personally am to afraid to go higher than that for now
                 */

                const jsonArr = await Promise.all(response.map(r => r.json()))



                //turn all the response into json so we can put them into file



                const filter = jsonArr.flatMap(item =>
                    Array.isArray(item) ?
                        item.map(d => ({
                            [req.query.xAxis]: d[req.query.xAxis],
                            dr_no: d.dr_no
                        }))
                        : [])

                /*
                this will filter the data so that we only have certain values. that are requested
                 */


                chunk.push(...filter)
                /*
                this chunk we just aquired after all that will now be inputted into the file so we
                dont write a bajillion lines at once
                 */
                }
            fs.writeFileSync(`crimeData_${i}.json`, JSON.stringify(chunk))
            console.log("input crimeData: ", i)
        }


        console.log("saved dataset.json");
        res.status(200).json({msg: "got the data!"})
    } catch(error){
        console.error("Couldnt get crime data", error)
        res.status(400).json({msg: "failed to retrieve data"})
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


//just for testing retrieveData. run by going to localhost:PORT/test. same as other just only does one .json file with less data
export async function retrieveDataTest(req, res){ //doesnt need req only need res
    try{

        const get20 = 20 // how many requests we make at a time
        let pageNumber = 1
        for(let i = 0; i < 1; i++){
            console.log(`trying page ${i}`)
            let chunk = []
            for(let k = 1; k < 201; k+=get20){

                let requests = [] // we will house all fetch requests in this array

                for (let j = k; j < k + get20 && j < 201; j++) {
                    requests.push(fetch(process.env.DATA_API +
                        "?pageNumber=" + pageNumber +
                        "&pageSize=20" +
                        "&orderingSpecifier=discard" +
                        "&app_token=" + process.env.SECRET_TOKEN))
                    pageNumber++;
                }
                /*
                page number which will be indexed so we go through first 2010 pages
                pageSize which is a bit misleading as this just ask how many rows per page so we will take 50
                ordering specifier which the documentation said would make things run faster
                and an app token which the documentation asks us to have so we can have valid api calls
                 */

                const response = await Promise.all(requests)
                /*
                we will do 20 requests at a time and await for the 20 to finish
                This i faster than doing one requests at a time because instead of waiting one by one
                we only wait for 20 than do next 20
                we have it set to 20 for now so we dont get blocked by the api
                i personally am to afraid to go higher than that for now
                 */

                const jsonArr = await Promise.all(response.map(r => r.json()))



                //turn all the response into json so we can put them into file

                /*

                DATA_API and SECRET_TOKEN are hidden in the .env file.
                secret token is the token it specifically gave me. we'll find out later if we all share one or use separates - c


                take in crime code, area code and area name?
                 */

                const filter = jsonArr.flatMap(item =>
                    Array.isArray(item) ?
                        item.map(d => ({
                            [req.query.xAxis]: d[req.query.xAxis],
                            dr_no: dr_no
                        }))
                        : [])

                /*
                this will filter the data so that we only have certain values. as of now its just area thats kept
                flatMap makes it all one contiguous array
                Array.isArray(item) ? is actually a conditional statement checking if the current item is a valid response
                so an array or if it was returned some bad value.
                the conditional shows that itll run the filter on the data if its a array and if it isnt itll : [] return an
                empty array so its ignored
                 */


                //const chunk = JSON.stringify(filter)
                chunk.push(...filter)
                /*
                this chunk we just aquired after all that will now be inputted into the file so we
                dont write a bajillion lines at once
                 */

                //write the chunk to file

                //just for us to see what page were on
                //
            }
            fs.writeFileSync(`crimeData_${i}.json`, JSON.stringify(chunk))
            console.log("input crimeData: ", i)
        }

        console.log("saved dataset.json");
        res.status(200).json({msg: "got the data!"})
        //responds to the front end with a valid status code telling us everything went well
    } catch(error){
        console.error("Couldnt get crime data", error)
        res.status(400).json({msg: "failed to retrieve data"})
    }
}
