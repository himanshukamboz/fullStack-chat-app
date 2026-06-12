import {
  createGroupService,
  getMyGroupsService,
  getGroupMessagesService,
  sendGroupMessageService,
} from "../services/index.js";

export const createGroup = async (req, res) => {
  try {
    const { name, members } = req.body;

    const group = await createGroupService(name, members, req.user._id);

    res.status(201).json(group);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const getMyGroups = async (req, res) => {
  try {
    const groups = await getMyGroupsService(req.user._id);

    res.status(200).json(groups);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const getGroupMessages = async (req, res) => {
  try {
    const messages = await getGroupMessagesService(req.params.groupId);

    res.status(200).json(messages);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
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

    res.status(201).json(message);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
