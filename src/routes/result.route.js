import express from 'express'
import { isAuthenticated } from '../auth/isAuthenticated.js'
import {getProfile} from '../controller/result.controller.js'

const resultRoute = express.Router()

resultRoute.get("/getprofile",isAuthenticated,getProfile)

export {resultRoute}