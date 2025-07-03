import express from 'express'
import { SignUp } from '../controller/user.controller.js'

const user = express.Router()


user.get("/signup",SignUp)


export {user}