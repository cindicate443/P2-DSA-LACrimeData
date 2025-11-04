/* eslint-env node */
import { execFile, exec, spawn } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import dotenv from 'dotenv'

dotenv.config()

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export async function retrieveData(req, res){
    try{
        //http://localhost:3001/api/test?xAxis=(wtv u want)
        // const xAxis = req.query.Xaxis || "AREA"; //default to area_name if not provided
        let cppReqSet = new Set()
        const get20 = 20 // how many requests we make at a time
        let pageNumber = 1
        for(let i = 0; i < 1; i++){
            console.log(`trying page ${i}`)
            let chunk = []
            for(let k = 1; k < 21; k+=get20){


                let requests = [] // we will house all fetch requests in this array

                for (let j = k; j < k + get20 && j < 21; j++) {

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


                const filter = jsonArr.flatMap((item) => {
                    if (Array.isArray(item)) {
                        return item.map((d) => {
                            cppReqSet.add(d[req.query.xAxis])
                            return {
                                [req.query.xAxis]: d[req.query.xAxis],
                                dr_no: d.dr_no
                            };
                        });
                    } else {
                        return [];
                    }
                });


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
        const result = retrieveXAxisData(req.query.xAxis)
        runCpp(cppReqSet)
        res.status(200).json(result)
    } catch(error){
        console.error("Couldnt get crime data", error)
        res.status(400).json({msg: "failed to retrieve data"})
    }
}

export function runCpp(cppReqSet){
        const filesToCompile = "tree.cpp crime.cpp"
        const exeName = process.platform == "win32" ? "P2-DSA_LACrimeData.exe" : "P2-DSA-LACrimeData"


        const binPath = path.join(__dirname, "cpp", "build", process.platform === 'win32' ? 'P2-DSA-LACrimeData.exe' : 'P2-DSA-LACrimeData'); //Executable path
        if (!fs.existsSync(binPath)) {
            throw new Error("Cant find exe at ", binPath)
        }

        const args = [...cppReqSet];
    const cppProc = spawn(binPath, args, {
        cwd: path.join(__dirname, "cpp", "build")
    });


    cppProc.stdout.on("data", (data) =>{
        process.stdout.write(data)
    })

        cppProc.stderr.on("data", (data) => {
            console.error("C++ stderr:", data.toString());
        });

        cppProc.on("close", (code) => {
            console.log(`C++ process exited with code ${code}`);
        });
}


//just for testing retrieveData. run by going to localhost:PORT/test. same as other just only does one .json file with less data
export async function retrieveDataTest(req, res){
    try{

        const get20 = 20
        let pageNumber = 1
        for(let i = 0; i < 1; i++){
            console.log(`trying page ${i}`)
            let chunk = []
            for(let k = 1; k < 201; k+=get20){

                let requests = []

                for (let j = k; j < k + get20 && j < 201; j++) {
                    requests.push(fetch(process.env.DATA_API +
                        "?pageNumber=" + pageNumber +
                        "&pageSize=20" +
                        "&orderingSpecifier=discard" +
                        "&app_token=" + process.env.SECRET_TOKEN))
                    pageNumber++;
                }

                const response = await Promise.all(requests)


                const jsonArr = await Promise.all(response.map(r => r.json()))




                const filter = jsonArr.flatMap(item =>
                    Array.isArray(item) ?
                        item.map(d => ({
                            [req.query.xAxis]: d[req.query.xAxis],
                            dr_no: dr_no
                        }))
                        : [])



                chunk.push(...filter)

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
export function retrieveXAxisData(xAxisReq){
    try{
        const xAxis =  xAxisReq || "AREA NAME"; //default to area_name if not provided
        //let allData = []; was how i had it, this is to test
        const allData = [];
        //read
        for (let i = 0; i < 10; i++) {
            try {
                const chunk = JSON.parse(fs.readFileSync(`crimeData_${i}.json`));
                allData.push(...chunk);
            } catch (err) {
                console.error(`Error reading file crimeData_${i}.json:`, err);
            }
        }
        //Grouped by x axis
        const grouped = {};
        allData.forEach(item => {
            const key = item[xAxis] || "UNKNOWN";
            if (grouped[key]) { //count the frequencies
                grouped[key]++;
            } else {
                grouped[key] = 1;
            }
        });
        const result = Object.keys(grouped).map(key => ({
            label: key,
            value: grouped[key]
        }));
        console.log("grouped data ready");
        // res.status(200).json(result);
        return result
    } catch (error) {
        console.error("Error processing data:", error);
        // res.status(500).json({ msg: "Error processing data" });
    }
}