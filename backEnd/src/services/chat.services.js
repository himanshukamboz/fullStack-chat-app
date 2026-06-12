import Chat from "../models/chat.model.js";

export const getChatListService = async (userId) => {
  return Chat.find({
    members: userId,
  })
    .populate("groupId", "name groupImage")
    .populate("members", "fullName profilePic")
    .sort({
      lastMessageTime: -1,
    });
};
