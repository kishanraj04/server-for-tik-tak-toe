import express from 'express'
import { createServer } from 'http'
import {Server} from 'socket.io'
import { user } from './src/routes/user.route.js'
import { errorHandler } from './src/middleware/GlobalErrorHandler.js'
import './config/connectToDb.js'
const app = express()
const server = createServer(app)

const io =new Server(server,{})

app.use(errorHandler)

// user route
app.use(user)


server.listen(3000,()=>{
    console.log("server listen on 3000");
})