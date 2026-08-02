import User from '../models/user.model.js'
import Message from '../models/message.model.js'
import Chat from '../models/chat.model.js'
import cloudinary from '../lib/cloudinary.js'
import {io,getReceiverSocketId} from '../lib/socket.js'
export const getUsersForSideBar = async(req,res)=>{
    try {
        const loggedInUserId = req.user._id
        const filteredUsers = await User.find({isVerified:true,_id:{$ne:loggedInUserId}}).select("-password")
        return res.status(200).json(filteredUsers)
    } catch (error) {
        console.log("Error in getUsersForSideBar controller:",error);
        return res.status(500).json({ message: "Internal Server error" });
    }
}

export const getMessages = async(req,res)=>{
    try {
        const userToChatId = req.params.id
        const myId = req.user._id

        const messages = await Message.find({
            $or:[
              {senderId:myId,receiverId:userToChatId},
              {senderId:userToChatId,receiverId:myId}
            ]
          })
          .sort({ createdAt: 1 });
        return res.status(200).json(messages)

    } catch (error) {
        console.log("Error in getMessages controller:",error);
        return res.status(500).json({ message: "Internal Server error" });
    }
}

export const sendMessage = async(req,res)=>{
   try {
    const {text,image} = req.body;
    const receiverId = req.params.id
    const senderId = req.user._id

    let imageUrl

    if(image){
        const uploadResponse = await cloudinary.uploader.upload(image)
        imageUrl = uploadResponse.secure_url
    }
    const newMessage = new Message({
        senderId,
        receiverId,
        text,
        image:imageUrl
    })
    await newMessage.save()

    await Chat.findOneAndUpdate(
      {
        type: "private",
        members: {
          $all: [senderId, receiverId],
        },
      },
      {
        lastMessage: text || "",
        lastMessageTime: new Date(),
        lastMessageSender: senderId,
      }
    );
    const receiverSockets = getReceiverSocketId(receiverId);
    if (receiverSockets?.length > 0) {

        newMessage.status = "delivered";
        await newMessage.save(); 
      }
    const senderSockets = getReceiverSocketId(senderId);
    
    receiverSockets?.forEach((socketId) => {
      io.to(socketId).emit("newMessage", newMessage);
    });
    
    senderSockets?.forEach((socketId) => {
      io.to(socketId).emit("newMessage", newMessage);
    });

    res.status(201).json(newMessage)
   } catch (error) {
    console.log("Error in sendMessage controller:",error);
    return res.status(500).json({ message: "Internal Server error" });
   }

}
export const markMessagesAsRead = async (req, res) => {
    try {
      const senderId = req.params.id;
      const receiverId = req.user._id;
  
      const messages = await Message.find({
        senderId,
        receiverId,
        status: { $ne: "read" }
      });
  
      if (messages.length === 0) {
        return res.status(200).json({ success: true });
      }
  
      const messageIds = messages.map(m => m._id);
  
      await Message.updateMany(
        {
          senderId,
          receiverId,
          status: { $ne: "read" }
        },
        {
          status: "read",
          readAt: new Date()
        }
      );
  
      const senderSockets = getReceiverSocketId(senderId);
  
      if (senderSockets?.length) {
        senderSockets.forEach((socketId) => {
          io.to(socketId).emit("messageRead", {
            senderId,
            receiverId,
            messageIds
          });
        });
      }
  
      return res.status(200).json({ success: true });
  
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal Server Error"
      });
    }
  };
  export const getUnreadCounts = async (req, res) => {
    try {
      const myId = req.user._id;
  
      const unreadCounts = await Message.aggregate([
        {
          $match: {
            receiverId: myId,
            status: { $ne: "read" },
          },
        },
        {
          $group: {
            _id: "$senderId",
            count: { $sum: 1 },
          },
        },
      ]);
  
      res.status(200).json(unreadCounts);
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Internal Server Error",
      });
    }
  };