import express from "express";
import { acceptRequest, addFriendRequests, cancelRequest, getAllfriends, rejectRequest } from "../controllers/index.js";
import {protectedRoute} from "../middleware/auth.middleware.js"
const router = express.Router()

router.get('/friends',protectedRoute,getAllfriends)
router.post('/sendFriendRequest',protectedRoute,addFriendRequests)
router.post("/acceptRequest",protectedRoute,acceptRequest)
router.delete('/requestCancel',protectedRoute,cancelRequest)
router.patch("/rejectRequest",protectedRoute,rejectRequest)


export default router