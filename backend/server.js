//https://www.w3schools.com/nodejs/nodejs_get_started.asp
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import router from './routes.js'

dotenv.config()

const app = express();

app.use(cors()); //we'll write the location of front end here (its port)


// app.get('/test', (req, res) => {
//   res.send('Backend is working!');
// });
// app.get('/retrieve-data', retrieveData);
// app.get('/retrieve-xaxis-data', retrieveXAxisData);
// app.get('/run-cpp', runCpp);

app.use('/', router) //just using this for now so when you open localhost:3001 itll try and create the data file

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));