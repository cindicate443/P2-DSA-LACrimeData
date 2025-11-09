import express from 'express'
import { retrieveData, retrieveDataTest } from './controls.js'

const router = express.Router()

router.get('/api/test', retrieveData) //Define endpoint at /api/test
router.get('/test', retrieveDataTest) //Define endpoint at /test


export default router