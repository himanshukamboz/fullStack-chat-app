import {Server} from "socket.io"
import http from "http"
import express from "express"

const app = express()
const server = http.createServer(app)

const io = new Server(server,{
    cors:{
        origin:["http://localhost:5173"]
    }
})

const userSocketMap = {}; 

io.on("connection",(socket)=>{
    console.log("A user connected",socket.id)

    const userId = socket.handshake.query.userId;

    if(userId){
        if(!userSocketMap[userId]){
            userSocketMap[userId] = [];
        }
        userSocketMap[userId].push(socket.id);
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect",()=>{
        console.log("A user disconnected",socket.id);

        if(userId && userSocketMap[userId]){
            userSocketMap[userId] = userSocketMap[userId].filter(
                id => id !== socket.id
            );

            if(userSocketMap[userId].length === 0){
                delete userSocketMap[userId];
            }
        }

        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});
const getReceiverSocketId = (userId)=> userSocketMap[userId]

export {io,server,app,getReceiverSocketId}