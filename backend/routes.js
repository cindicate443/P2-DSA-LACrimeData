import express from 'express'
import {retrieveData} from './controls.js'

const router = express.Router()
//express router so we can organize our controls here. In the future there will probably be a get request for when bfs and dfs are clicked
//maybe a post request for when display is clicked idk


router.get('/', retrieveData)
/*
This is just how it is for now but when i tried retrieving 100k+ data elements it took a very very long time.
since our data will be static we should decide on what portions of the data we want so we can have a final crimeData.json file
 */

export default router