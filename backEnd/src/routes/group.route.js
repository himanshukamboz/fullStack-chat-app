import express from "express";

import {
  createGroup,
  getMyGroups,
  getGroupMessages,
  sendGroupMessage,
} from "../controllers/index.js";

import { protectedRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/create", protectedRoute, createGroup);

router.get("/my-groups", protectedRoute, getMyGroups);

router.get("/messages/:groupId", protectedRoute, getGroupMessages);

router.post("/send/:groupId", protectedRoute, sendGroupMessage);

export default router;
