import Group from "../models/group.model.js";
import GroupMessage from "../models/groupMessage.model.js";
import cloudinary from "../lib/cloudinary.js";

export const createGroupService = async (name, members, creatorId) => {
  const group = await Group.create({
    name,
    members: [...new Set([...members, creatorId])],
    admins: [creatorId],
    createdBy: creatorId,
  });
  await Chat.create({
    type: "group",
    groupId: group._id,
    members: group.members,
  });
  return group
};

export const getMyGroupsService = async (userId) => {
  return await Group.find({
    members: userId,
  })
    .populate("members", "fullName profilePic")
    .sort({
      updatedAt: -1,
    });
};

export const getGroupMessagesService = async (groupId) => {
  return await GroupMessage.find({
    groupId,
  })
    .populate("senderId", "fullName profilePic")
    .sort({
      createdAt: 1,
    });
};

export const sendGroupMessageService = async ({
  senderId,
  groupId,
  text,
  image,
}) => {
  let imageUrl = null;

  if (image) {
    const uploadResponse = await cloudinary.uploader.upload(image);

    imageUrl = uploadResponse.secure_url;
  }

  const message = await GroupMessage.create({
    senderId,
    groupId,
    text,
    image: imageUrl,
  });

  await Chat.findOneAndUpdate(
    {
      groupId,
    },
    {
      lastMessage: text || "",
      lastMessageTime: new Date(),
      lastMessageSender: senderId,
    }
  );

  return message;
};
