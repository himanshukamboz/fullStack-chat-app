import express from "express";
import { acceptRequest, addFriendRequests, cancelRequest, getAllfriends, rejectRequest,getFriendRequests,getSentRequests,removeFriend} from "../controllers/index.js";
import {protectedRoute} from "../middleware/auth.middleware.js"
const router = express.Router()

router.get('/',protectedRoute,getAllfriends)
router.get('/getRequests',protectedRoute,getFriendRequests)
router.get("/sentRequests", protectedRoute, getSentRequests);
router.post('/add',protectedRoute,addFriendRequests)
router.post("/accept",protectedRoute,acceptRequest)
router.post("/remove", protectedRoute, removeFriend);
router.delete('/cancel/:receiverId',protectedRoute,cancelRequest)
router.patch("/reject",protectedRoute,rejectRequest)
export default router