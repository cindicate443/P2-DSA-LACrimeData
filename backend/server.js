//https://www.w3schools.com/nodejs/nodejs_get_started.asp
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import router from './routes.js'

dotenv.config() //Load env from env file

const app = express(); //Initialize Express

app.use(cors()); //we'll write the location of front end here (its port)

app.use('/', router) //All routes in router should be good

const PORT = process.env.PORT || 3001; //port 3001 is being used
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`)); //Statr server and take requests