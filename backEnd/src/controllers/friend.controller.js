import {getAllfriendsService,cancelFriendRequestService,rejectFriendRequestService,sendFriendRequestService,getIncomingFriendRequestsService,acceptRequestService,getSentFriendRequestsService,removeFriendService} from "../services/index.js";
import {io,getReceiverSocketId} from "../lib/socket.js"
export const getAllfriends = async(req,res)=>{
  try {
    const userId = req.user._id
    const friends = await getAllfriendsService(userId)
    res.json({friends})
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}


export const getFriendRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const requests = await getIncomingFriendRequestsService(userId);

    res.status(200).json({
      requests, 
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const getSentRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const requests = await getSentFriendRequestsService(userId);

    res.status(200).json({
      requests,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const addFriendRequests = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { receiverId } = req.body;

    const request = await sendFriendRequestService(senderId, receiverId);

    const receiverSocketId = getReceiverSocketId(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newFriendRequest", {
        request,
      });
    }
    res.status(201).json({
      message: "Friend request sent",
      request,
    });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const acceptRequest = async (req, res) => {
  try {
    const { senderId } = req.body;
    const receiverId = req.user._id;

    await acceptRequestService(senderId, receiverId);

    const senderSocketId = getReceiverSocketId(senderId);
    const receiverSocketId = getReceiverSocketId(receiverId);


    if (senderSocketId) {
      io.to(senderSocketId).emit("requestAccepted", {
        receiverId,
      });
    }


    if (receiverSocketId) {
      io.to(receiverSocketId).emit("requestAcceptedByMe", {
        senderId,
      });
    }

    res.json({ message: "New friend added" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 

export const removeFriend = async (req, res) => {
  try {
    const userId = req.user._id;
    const { friendId } = req.body;

    const result = await removeFriendService(userId, friendId);

    const friendSocketIds = getReceiverSocketId(String(friendId));
    const userSocketIds = getReceiverSocketId(String(userId));
    console.log(friendSocketIds)
    console.log(userSocketIds)

    if (friendSocketIds) {
      friendSocketIds.forEach((socketId)=>{
        console.log("EMITTING friendRemoved TO:", socketId);
        io.to(socketId).emit("friendRemoved", {
        userId,
        friendId,
      });
    })
      
    }

    if (userSocketIds) {
      userSocketIds.forEach((socketId)=>{
        console.log("EMITTING friendRemoved TO:", socketId);
        io.to(socketId).emit("friendRemoved", {
        userId,
        friendId,
      });
    })
    }

    res.json({
      message: "Friend removed successfully",
      result,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const cancelRequest = async (req, res) => {
  try {
      const senderId = req.user._id;
      const { receiverId } = req.params;
  
      await cancelFriendRequestService(senderId, receiverId);
      const receiverSocketId = getReceiverSocketId(receiverId);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("requestCancelled", {
          senderId, 
        });
      }
  
      res.json({ message: "Friend request cancelled" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
};
  
export const rejectRequest = async (req, res) => {
    try {
      const receiverId = req.user._id;
      const { senderId } = req.body;
  
      await rejectFriendRequestService(senderId, receiverId);

      const senderSocketId = getReceiverSocketId(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("requestRejected", {
          receiverId,
        });
      }
  
      res.json({ message: "Friend request rejected" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
};
