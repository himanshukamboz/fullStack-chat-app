import {Server} from "socket.io"
import http from "http"
import express from "express"
import Message from "../models/message.model.js";
const app = express()
const server = http.createServer(app)

const io = new Server(server,{
    cors:{
        origin:["http://localhost:5173"]
    }
})

const userSocketMap = {}; 

io.on("connection",async(socket)=>{
    console.log("A user connected",socket.id)

    const userId = socket.handshake.query.userId;

    if(userId){
        if(!userSocketMap[userId]){
            userSocketMap[userId] = [];
        }
        userSocketMap[userId].push(socket.id);
    }
    console.log(userSocketMap[userId])
    if (userId) {

        const pendingMessages = await Message.find({
          receiverId: userId,
          status: "sent",
        });
      
        await Message.updateMany(
          {
            receiverId: userId,
            status: "sent",
          },
          {
            status: "delivered",
          }
        );
      
        for (const message of pendingMessages) {
      
          const senderSockets = getReceiverSocketId(
            message.senderId.toString()
          );
      
          senderSockets?.forEach((socketId) => {
            io.to(socketId).emit("messageDelivered", {
              messageId: message._id,
            });
          });
        }
      }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    socket.on("typing",({receiverId})=>{
      const receiverSockets = getReceiverSocketId(receiverId)
      receiverSockets?.forEach((socketId)=>{
        io.to(socketId).emit("userTyping",{
          userId
        })
      })
    });

    socket.on("stopTyping", ({ receiverId }) => {
      const receiverSockets = getReceiverSocketId(receiverId);
      console.log("stoptyping")
      receiverSockets?.forEach((socketId) => {
        io.to(socketId).emit("userStoppedTyping", {
          userId,
        });
      });
    });

    socket.on("groupTyping", ({ groupId, members }) => {
      members?.forEach((memberId) => {
        if (String(memberId) === String(userId)) return;
        const memberSockets = getReceiverSocketId(memberId);
        memberSockets?.forEach((socketId) => {
          io.to(socketId).emit("userGroupTyping", { userId, groupId });
        });
      });
    });

    socket.on("groupStopTyping", ({ groupId, members }) => {
      members?.forEach((memberId) => {
        if (String(memberId) === String(userId)) return;
        const memberSockets = getReceiverSocketId(memberId);
        memberSockets?.forEach((socketId) => {
          io.to(socketId).emit("userGroupStoppedTyping", { userId, groupId });
        });
      });
    });

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