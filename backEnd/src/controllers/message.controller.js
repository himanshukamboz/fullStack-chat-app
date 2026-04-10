import User from '../models/user.model.js'
import Message from '../models/message.model.js'
import cloudinary from '../lib/cloudinary.js'

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
    res.status(201).json(newMessage)
   } catch (error) {
    console.log("Error in sendMessage controller:",error);
    return res.status(500).json({ message: "Internal Server error" });
   }

}