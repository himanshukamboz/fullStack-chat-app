import {
  createGroupService,
  getMyGroupsService,
  getGroupMessagesService,
  sendGroupMessageService,
  updateGroupService,
  deleteGroupService,
  exitGroupService,
  addMemberService,
  removeMemberService,
  makeAdminService,
  demoteAdminService
} from "../services/index.js";
import Group from "../models/group.model.js";
import Chat from "../models/chat.model.js"
import { io, getReceiverSocketId } from "../lib/socket.js";

export const createGroup = async (req, res) => {
  try {
    const { name, members } = req.body;
    const group = await createGroupService(name, members, req.user._id);
    res.status(201).json(group);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getMyGroups = async (req, res) => {
  try {
    const groups = await getMyGroupsService(req.user._id);
    res.status(200).json(groups);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getGroupMessages = async (req, res) => {
  try {
    const messages = await getGroupMessagesService(req.params.groupId);
    res.status(200).json(messages);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const sendGroupMessage = async (req, res) => {
  try {
    const message = await sendGroupMessageService({
      senderId: req.user._id,
      groupId: req.params.groupId,
      text: req.body.text,
      image: req.body.image,
    });

    const group = await Group.findById(req.params.groupId).select("members");

    group.members.forEach((memberId) => {
      if (String(memberId) === String(req.user._id)) return;

      const receiverSockets = getReceiverSocketId(memberId.toString());
      receiverSockets?.forEach((socketId) => {
        io.to(socketId).emit("newGroupMessage", message);
      });
    });

    res.status(201).json(message);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateGroup = async (req, res) => {
  try {
    const group = await updateGroupService({
      groupId: req.params.groupId,
      name: req.body.name,
      description: req.body.description,
      image: req.body.image,
      removeImage: req.body.removeImage,
      userId: req.user._id,
    });
    res.status(200).json(group);
  } catch (error) {
    console.log(error);
    const status =
      error.message === "Only admins can edit group info" ? 403 : 500;
    res
      .status(status)
      .json({ message: error.message || "Internal Server Error" });
  }
};
export const exitGroup = async (req, res) => {
  try {
    const result = await exitGroupService(req.params.groupId, req.user._id);
    // notify remaining members so their sidebar updates
    if (!result.deleted) {
      result.group.members.forEach((member) => {
        const sockets = getReceiverSocketId(String(member._id));
        sockets?.forEach((socketId) => {
          io.to(socketId).emit("groupMemberLeft", {
            groupId: req.params.groupId,
            userId: req.user._id,
          });
        });
      });
    }

    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message || "Internal Server Error" });
  }
};
export const deleteGroup = async (req, res) => {
  try {
    const result = await deleteGroupService(req.params.groupId, req.user._id);

    result.memberIds.forEach((memberId) => {
      if (String(memberId) === String(req.user._id)) return;
      const sockets = getReceiverSocketId(memberId);
      sockets?.forEach((socketId) => {
        io.to(socketId).emit("groupDeleted", { groupId: result.groupId });
      });
    });

    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    const status = error.message?.includes("Only admins") ? 403 : 500;
    res
      .status(status)
      .json({ message: error.message || "Internal Server Error" });
  }
};

export const addMember = async (req, res) => {
  try {
    const { memberIds } = req.body;
    const result = await addMemberService(
      req.params.groupId,
      memberIds,
      req.user._id
    );

    const chatDoc = await Chat.findOne({ groupId: req.params.groupId });
    result.group.members.forEach((member) => {
      if (String(member._id) === String(req.user._id)) return;
      const sockets = getReceiverSocketId(String(member._id));
      sockets?.forEach((socketId) => {
        io.to(socketId).emit("groupMemberAdded", {
          groupId: req.params.groupId,
          chatId: chatDoc._id,
          group: result.group,
        });
      });
    });

    res.status(200).json(result.group);
  } catch (error) {
    console.log(error);
    const status = error.message?.includes("Only admins") ? 403 : 400;
    res
      .status(status)
      .json({ message: error.message || "Internal Server Error" });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { memberIds } = req.body;
    const result = await removeMemberService(
      req.params.groupId,
      req.user._id,
      memberIds
    );
    result.group.members.forEach((member) => {
      if (String(member._id) === String(req.user._id)) return;
      const sockets = getReceiverSocketId(String(member._id));
      if(!sockets) return
      sockets.forEach((socketId) => {
        io.to(socketId).emit("groupMemberRemoved", {
          groupId: req.params.groupId,
          group: result.group,
        });
      });
    });

    memberIds.forEach((removedId) => {
      const removedSockets = getReceiverSocketId(String(removedId));
      removedSockets?.forEach((socketId) => {
        io.to(socketId).emit("removedFromGroup", { groupId: req.params.groupId });
      });
    });

    res.status(200).json(result.group);
  } catch (error) {
    console.log(error)
    const status = error.message?.includes("Only admins") ? 403 : 400;
    res
      .status(status)
      .json({ message: error.message || "Internal Server Error" });
  }
};

export const makeAdmin = async (req, res) => {
  try {
    const { memberIds } = req.body;
    const group = await makeAdminService(req.params.groupId, req.user._id, memberIds);

    group.members.forEach((member) => {
      if (String(member._id) === String(req.user._id)) return;
      const sockets = getReceiverSocketId(String(member._id));
      sockets?.forEach((socketId) => {
        io.to(socketId).emit("groupAdminUpdated", { groupId: req.params.groupId, group });
      });
    });

    res.status(200).json(group);
  } catch (error) {
    console.log(error);
    const status = error.message?.includes("Only admins") ? 403 : 400;
    res.status(status).json({ message: error.message || "Internal Server Error" });
  }
};

export const demoteAdmin = async (req, res) => {
  try {
    const { memberIds } = req.body;
    const group = await demoteAdminService(req.params.groupId, req.user._id, memberIds);

    group.members.forEach((member) => {
      if (String(member._id) === String(req.user._id)) return;
      const sockets = getReceiverSocketId(String(member._id));
      sockets?.forEach((socketId) => {
        io.to(socketId).emit("groupAdminUpdated", { groupId: req.params.groupId, group });
      });
    });

    res.status(200).json(group);
  } catch (error) {
    console.log(error);
    const status = error.message?.includes("Only admins") ? 403 : 400;
    res.status(status).json({ message: error.message || "Internal Server Error" });
  }
};