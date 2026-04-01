import dotenv from "dotenv"
import express from "express"
import {authRoutes,messageRoutes} from "./routes/index.js";
import connectDb from "./lib/connectDb.js";
import cookieParser from "cookie-parser";
import cors from 'cors';
import {server,app} from "./lib/socket.js"
dotenv.config()
const PORT = process.env.PORT
app.use(express.json({limit:"10mb"}))
app.use(cookieParser());
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))
app.use('/api/auth',authRoutes)
app.use('/api/messages',messageRoutes)
server.listen(PORT,()=>{
    console.log("server started")
    connectDb()
})