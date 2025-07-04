import express from 'express'
import { directUserLogin, login, SignUp } from '../controller/user.controller.js'
import { upload } from '../../config/multer.js'

const user = express.Router()


user.post("/signup",upload.single('avatar'), SignUp)

user.post("/login",login)

user.get("/direct-login",directUserLogin)

export {user}