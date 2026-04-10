import FriendRequest from "../models/friendRequest.model.js";
import User from "../models/user.model.js"
export const getAllfriendsService = async (userId) =>{
  const user = await User.findById(userId).select("friends").populate("friends","fullName email profilePic")
  if (!user) {
    throw new Error("User not found");
  }
  return user.friends
}


export const sendFriendRequestService = async (senderId, receiverId) => {

  if (senderId.toString() === receiverId) {
    throw new Error("You cannot send request to yourself");
  }

  const receiver = await User.findById(receiverId);
  if (!receiver) {
    throw new Error("Receiver not found");
  }

  const sender = await User.findById(senderId);
  if (sender.friends.includes(receiverId)) {
    throw new Error("Already friends");
  }

  const existingRequest = await FriendRequest.findOne({
    sender: senderId,
    receiver: receiverId,
    status: "pending",
  });

  if (existingRequest) {
    throw new Error("Request already sent");
  }

  const request = await FriendRequest.create({
    sender: senderId,
    receiver: receiverId,
  });

  return request;
};

export const cancelFriendRequestService = async (senderId, receiverId) => {
  const request = await FriendRequest.findOneAndDelete({
    sender: senderId,
    receiver: receiverId,
    status: "pending",
  });

  if (!request) {
    throw new Error("Request not found or already handled");
  }

  return request;
};

export const rejectFriendRequestService = async (senderId, receiverId) => {
  const request = await FriendRequest.findOneAndUpdate(
    {
      sender: senderId,
      receiver: receiverId,
      status: "pending",
    },
    { status: "rejected" },
    { returnDocument: "after" }
  );

  if (!request) {
    throw new Error("Request not found or already handled");
  }

  return request;
};