import express from 'express'
import { createServer } from 'http'
import {Server} from 'socket.io'
import { user } from './src/routes/user.route.js'
import { errorHandler } from './src/middleware/GlobalErrorHandler.js'
import './config/connectToDb.js'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import { isAuthenticated } from './src/auth/isAuthenticated.js'

const app = express()
const server = createServer(app)

const io =new Server(server,{})

dotenv.config()

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  }))


// user route
app.use("/api/v1", user)



app.use(errorHandler)
server.listen(3000,()=>{
    console.log("server listen on 3000");
})