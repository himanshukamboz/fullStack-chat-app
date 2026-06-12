import express from "express";
import { protectedRoute } from "../middleware/auth.middleware.js";
import { getMessages, getUsersForSideBar, sendMessage,markMessagesAsRead,getUnreadCounts } from "../controllers/index.js";
const router = express.Router()

router.get('/users',protectedRoute,getUsersForSideBar)
router.get("/unread-counts",protectedRoute,getUnreadCounts);
router.get('/:id',protectedRoute,getMessages)
router.post('/send/:id',protectedRoute,sendMessage)
router.patch("/read/:id",protectedRoute,markMessagesAsRead);

export default router