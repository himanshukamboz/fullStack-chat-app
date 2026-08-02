import express from "express";

import {
  createGroup,
  getMyGroups,
  getGroupMessages,
  sendGroupMessage,
  addMember,
  makeAdmin,
  removeMember,
  demoteAdmin,
  updateGroup,
  deleteGroup,
  exitGroup
} from "../controllers/index.js";

import { protectedRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/create", protectedRoute, createGroup);

router.get("/my-groups", protectedRoute, getMyGroups);

router.get("/messages/:groupId", protectedRoute, getGroupMessages);

router.post("/send/:groupId", protectedRoute, sendGroupMessage);

router.put("/:groupId", protectedRoute, updateGroup);

router.post("/:groupId/exit", protectedRoute, exitGroup);

router.post("/:groupId/members", protectedRoute, addMember);

router.post("/:groupId/remove-member", protectedRoute, removeMember);

router.post("/:groupId/make-admin", protectedRoute, makeAdmin);

router.post("/:groupId/demote-admin", protectedRoute, demoteAdmin);

router.delete("/:groupId", protectedRoute, deleteGroup);

export default router;
