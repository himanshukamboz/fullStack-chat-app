import Group from "../models/group.model.js";
import GroupMessage from "../models/groupMessage.model.js";
import cloudinary from "../lib/cloudinary.js";
import Chat from "../models/chat.model.js"
import { removeMember } from "../controllers/group.controller.js";
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

  return message.populate("senderId", "fullName profilePic");
};

export const updateGroupService = async ({ groupId, name, description, image, removeImage, userId }) => {
  const group = await Group.findById(groupId);
  if (!group) throw new Error("Group not found");

  const isAdmin = group.admins.some((a) => String(a) === String(userId));
  if (!isAdmin) throw new Error("Only admins can edit group info");

  if (name !== undefined) group.name = name;
  if (description !== undefined) group.description = description;

  if (removeImage) {
    group.groupImage = null;
  } else if (image) {
    const uploadResponse = await cloudinary.uploader.upload(image);
    group.groupImage = uploadResponse.secure_url;
  }

  await group.save();
  return group.populate([
    { path: "members", select: "fullName profilePic" },
    { path: "admins", select: "fullName profilePic" },
  ]);
};
export const exitGroupService = async (groupId, userId) => {
  const group = await Group.findById(groupId);
  if (!group) throw new Error("Group not found");

  const isMember = group.members.some((m) => String(m) === String(userId));
  if (!isMember) throw new Error("You are not a member of this group");

  group.members = group.members.filter((m) => String(m) !== String(userId));
  group.admins = group.admins.filter((a) => String(a) !== String(userId));

  // If no admins remain but members still exist, promote the oldest remaining member
  if (group.admins.length === 0 && group.members.length > 0) {
    group.admins = [group.members[0]];
  }

  if (group.members.length === 0) {
    await Group.findByIdAndDelete(groupId);
    await Chat.findOneAndDelete({ groupId });
    await GroupMessage.deleteMany({ groupId });
    return { deleted: true, groupId };
  }

  await group.save();
  await Chat.findOneAndUpdate({ groupId }, { members: group.members });

  return { deleted: false, group: await group.populate("members", "fullName profilePic") };
};

export const deleteGroupService = async (groupId, userId) => {
  const group = await Group.findById(groupId);
  if (!group) throw new Error("Group not found");

  const isAdmin = group.admins.some((a) => String(a) === String(userId));
  if (!isAdmin) throw new Error("Only admins can delete this group");

  const memberIds = group.members.map((m) => String(m));

  await Group.findByIdAndDelete(groupId);
  await Chat.findOneAndDelete({ groupId });
  await GroupMessage.deleteMany({ groupId });

  return { groupId, memberIds };
};

export const addMemberService = async (groupId, newMemberIds, requesterId) => {
  const group = await Group.findById(groupId);
  if (!group) throw new Error("Group not found");

  const isAdmin = group.admins.some((a) => String(a) === String(requesterId));
  if (!isAdmin) throw new Error("Only admins can add members");

  const existingIds = group.members.map((m) => String(m));
  const idsToAdd = newMemberIds.filter((id) => !existingIds.includes(String(id)));

  if (idsToAdd.length === 0) {
    throw new Error("Selected users are already members");
  }

  group.members.push(...idsToAdd);
  await group.save();

  await Chat.findOneAndUpdate({ groupId }, { members: group.members });

  return {
    group: await group.populate([
      { path: "members", select: "fullName profilePic" },
      { path: "admins", select: "fullName profilePic" },
    ]),
    addedIds: idsToAdd,
  };
};

export const removeMemberService = async(groupId,requesterId,memberIds)=>{
  const group = await Group.findById(groupId)
  if(!group) throw new Error("Group not found")

  const isAdmin = group.admins.some(a=>String(a)=== String(requesterId))
  if(!isAdmin) throw new Error("Only admins can remove members")

  group.members = group.members.filter(m=>!memberIds.includes(String(m)))
  group.admins = group.admins.filter((a) => !memberIds.includes(String(a)));
  await group.save()

  await Chat.findOneAndUpdate({groupId},{members:group.members})

  return {
    group: await group.populate([
      { path: "members", select: "fullName profilePic" },
      { path: "admins", select: "fullName profilePic" },
    ]),
  };
}

export const makeAdminService = async (groupId, requesterId, memberIds) => {
  const group = await Group.findById(groupId);
  if (!group) throw new Error("Group not found");

  const isAdmin = group.admins.some((a) => String(a) === String(requesterId));
  if (!isAdmin) throw new Error("Only admins can promote members");

  const idsToPromote = memberIds.map(String);

  const validIds = idsToPromote.filter((id) =>
    group.members.some((m) => String(m) === id)
  );
  if (validIds.length === 0) {
    throw new Error("Selected users are not members of this group");
  }

  const currentAdminIds = group.admins.map(String);
  const newAdmins = validIds.filter((id) => !currentAdminIds.includes(id));

  if (newAdmins.length === 0) {
    throw new Error("Selected users are already admins");
  }

  group.admins.push(...newAdmins);
  await group.save();

  return group.populate([
    { path: "members", select: "fullName profilePic" },
    { path: "admins", select: "fullName profilePic" },
  ]);
};

export const demoteAdminService = async (groupId, requesterId, memberIds) => {
  const group = await Group.findById(groupId);
  if (!group) throw new Error("Group not found");

  const isAdmin = group.admins.some((a) => String(a) === String(requesterId));
  if (!isAdmin) throw new Error("Only admins can demote admins");

  const idsToDemote = memberIds.map(String);

  if (idsToDemote.includes(String(requesterId))) {
    throw new Error("You cannot demote yourself this way");
  }

  const remainingAdmins = group.admins.filter((a) => !idsToDemote.includes(String(a)));
  if (remainingAdmins.length === 0) {
    throw new Error("A group must have at least one admin");
  }

  group.admins = remainingAdmins;
  await group.save();

  return group.populate([
    { path: "members", select: "fullName profilePic" },
    { path: "admins", select: "fullName profilePic" },
  ]);
};