import Chat from "../models/chat.model.js";

export const getChatListService = async (userId) => {
  const chats = await Chat.find({
    members: userId,
  })
    .populate("members", "fullName profilePic email")
    .populate({
      path: "groupId",
      select: "name groupImage description members admins",
      populate: [{
        path: "members",
        select: "fullName profilePic",
      },{
        path:'admins',
        select:"fullname profilePic"
      }],
    })
    .sort({ lastMessageTime: -1 });

  return chats.map((chat) => {
    if (chat.type === "private") {
      const otherUser = chat.members.find(
        (member) => String(member._id) !== String(userId)
      );

      return {
        _id: chat._id,
        type: "private",

        user: otherUser,

        lastMessage: chat.lastMessage,
        lastMessageTime: chat.lastMessageTime,
      };
    }

    return {
      _id: chat._id,
      type: "group",

      group: chat.groupId,

      lastMessage: chat.lastMessage,
      lastMessageTime: chat.lastMessageTime,
    };
  });
};