/* eslint-env node */
import { execFile, exec, spawn } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import dotenv from 'dotenv'

dotenv.config()

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//Function to get data using API
export async function retrieveData(req, res){
    try{
        //http://localhost:3001/api/test?xAxis=(wtv u want)&alg=(bfs/dfs)
        const getXAmt = 200 // how many requests we make at a time
        let pageNumber = 1
        for(let i = 0; i < 10; i++){ //Do 10
            console.log(`trying page ${i}`)
            let chunk = []
            //We want to request in parts
            for(let k = 1; k < 201; k+=getXAmt){


                let requests = [] // we will house all fetch requests in this array

                //Add requests to the request array
                for (let j = k; j < k + getXAmt && j < 201; j++) {

                    requests.push(fetch(process.env.DATA_API +
                        "?pageNumber=" + pageNumber +
                        "&pageSize=50" +
                        "&orderingSpecifier=discard" +
                        "&app_token=" + process.env.SECRET_TOKEN))
                    pageNumber++;
                    }

               //Wait for everything to finish
                const response = await Promise.all(requests)

                /*
                we will do 20 requests at a time and await for the 20 to finish
                This is faster than doing one requests at a time because instead of waiting one by one
                we only wait for 20 than do next 20
                we have it set to 20 for now so we dont get blocked by the api
                i personally am to afraid to go higher than that for now
                 */
                const jsonArr = await Promise.all(response.map(r => r.json())) //make everything json

                //We only want certain fields for the JSON
                const filter = jsonArr.flatMap((item) => {
                    if (Array.isArray(item)) {
                        return item.map((d) => {
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

        //Assuming everything worked, group the data and run the cpp
        console.log("saved dataset.json");
        const result = retrieveXAxisData(req.query.xAxis)
        res.status(200).json({xAxisVals: result[0], yAxisMax: result[1], tree: await runCpp(req.query.alg)})
    } catch(error){
        console.error("Couldnt get crime data", error)
        res.status(400).json({msg: "failed to retrieve data"})
    }
}
//Compile the cpp
export function runCpp(alg){
        let res = ''
        const filesToCompile = "tree.cpp crime.cpp"
        const exeName = process.platform == "win32" ? "P2-DSA_LACrimeData.exe" : "P2-DSA-LACrimeData"
        const exeLoc = path.join(__dirname, "cpp", "build", exeName)
        const fileLoc = path.join(__dirname, "cpp")

        //Compile the c++ files automatically instead of manually
        exec(`g++ -std=c++17 ${filesToCompile} -o ${exeLoc}`, {cwd: fileLoc}, (error, stdout, stderr) =>{
            if(error) {
                console.log("failed to compile ", exeName, error.message)
                return "Failed to compile";
            }

            console.log(`Compiled ${exeName}!`)
        })

        const binPath = path.join(__dirname, "cpp", "build", exeName); //Executable path
        if (!fs.existsSync(binPath)) {
            throw new Error("Cant find exe at ", binPath)
        }
        const args = [alg]; //Run with the selected algo
    return new Promise((resolve, reject) => {
        const cppProc = spawn(binPath, args, {
            cwd: path.join(__dirname, "cpp", "build")
        });


        cppProc.stdout.on("data", (data) => {
            const text = data.toString()
            res += (text)
        })

        cppProc.on("close", (code) => {
            console.log(`C++ process exited with code ${code}`);
            resolve(res)
        });

        cppProc.on('error', reject)
    })
}


//just for testing retrieveData. run by going to localhost:PORT/test. same as other just only does one .json file with less data
export async function retrieveDataTest(req, res){
    try{

        const get20 = 20
        let pageNumber = 1
        // for(let i = 0; i < 1; i++){
            console.log(`trying page 0`)
            let chunk = []
            // for(let k = 1; k < 21; k+=get20){

                let requests = []

        requests = await fetch(process.env.DATA_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-App-Token": process.env.SECRET_TOKEN
            },
            body: JSON.stringify({
                query: `
          SELECT date_extract_y(date_rptd) as year
          WHERE date_extract_y(date_rptd) = 2021
          GROUP BY year
          LIMIT 2
        `
            })
        });

                const response = (requests)
                console.log(response)


                const jsonArr = await (response.json())
        console.log(jsonArr)

                chunk.push(jsonArr)
            fs.writeFileSync(`crimeData_0.json`, JSON.stringify(chunk))
            console.log("input crimeData: ", 0)

        console.log("saved dataset.json");
        res.status(200).json({msg: JSON.stringify(chunk)})
    } catch(error){
        console.error("Couldnt get crime data", error)
        res.status(400).json({msg: "failed to retrieve data"})
    }
}
//Get the X axis values
export function retrieveXAxisData(xAxisReq){
    try{
        const xAxis =  xAxisReq;
        const allData = [];
        //Read all 10 jsons
        for (let i = 0; i < 10; i++) {
            try {
                const chunk = JSON.parse(fs.readFileSync(`crimeData_${i}.json`));
                allData.push(...chunk);
            } catch (err) {
                console.error(`Error reading file crimeData_${i}.json:`, err);
            }
        }
        //Grouped by x axis, count how many times each x axis occurs
        const grouped = {};
        allData.forEach(item => {
            const key = item[xAxis] || "UNKNOWN";
            if (grouped[key]) { //count the frequencies
                grouped[key]++;
            } else {
                grouped[key] = 1;
            }
        });

        //A few variables we need (maxes)
        const maxYVal = Math.max(...Object.values(grouped))
        const yVals = Object.values(grouped);
        const lisXVals = [[...Object.keys(grouped)], maxYVal] //Highest y axis so we can auto set it

        console.log("grouped data ready");
        return lisXVals
    } catch (error) {
        console.error("Error processing data:", error);
    }
}