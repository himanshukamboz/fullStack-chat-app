
import { getChatListService } from "../services/index.js";

export const getChatList = async (req, res) => {
  try {
    const chats = await getChatListService(req.user._id);

    res.status(200).json(chats);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
