import express from "express";
import { getOrdersStats } from "../controllers/orderController.js";
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  deleteOrder
} from "../controllers/orderController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/my", protect, getMyOrders);
router.get("/", protect, adminOnly, getAllOrders);
router.delete("/:id", protect, adminOnly, deleteOrder);
router.get("/stats", protect, adminOnly, getOrdersStats);

export default router;

