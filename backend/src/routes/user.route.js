import express from 'express'
import { directUserLogin, handleLogout, login, searchUser, SignUp } from '../controller/user.controller.js'
import { upload } from '../../config/multer.js'
import { isAuthenticated } from '../auth/isAuthenticated.js'

const user = express.Router()


user.post("/signup",upload.single('avatar'), SignUp)

user.post("/login",login)

user.get("/direct-login",directUserLogin)

user.get("/search/:name",isAuthenticated,searchUser)

user.post("/logout",isAuthenticated,handleLogout)

export {user}