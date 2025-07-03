import express from 'express'
import { SignUp } from '../controller/user.controller.js'
import { upload } from '../../config/multer.js'

const user = express.Router()


user.post("/signup",upload.single('avatar'), SignUp)


export {user}