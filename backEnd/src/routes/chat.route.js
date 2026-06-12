import express from "express"
import { getChatList } from "../controllers/index.js";
import { protectedRoute } from "../middleware/auth.middleware.js";
const router = express.Router()

router.get("/chat-list", protectedRoute, getChatList);
export default router