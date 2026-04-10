import {cancelFriendRequestService,rejectFriendRequestService,sendFriendRequestService} from "../services/index.js";

export const getAllfriends = async(req,res)=>{
  try {
    const userId = req.user._id
    const friends = await getAllfriendsService(userId)
    res.json({friends})
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export const addFriendRequests = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { receiverId } = req.body;

    const request = await sendFriendRequestService(senderId, receiverId);

    res.status(201).json({
      message: "Friend request sent",
      request,
    });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const acceptRequest = async(req,res)=>{
  
} 

export const cancelRequest = async (req, res) => {
  try {
      const senderId = req.user._id;
      const { receiverId } = req.body;
  
      await cancelFriendRequestService(senderId, receiverId);
  
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
  
      res.json({ message: "Friend request rejected" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
};