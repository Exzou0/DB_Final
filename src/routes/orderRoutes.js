import express from "express";
import { getOrdersStats } from "../controllers/orderController.js";
import {
  createOrder,
  getMyOrders,
  getAllOrders
} from "../controllers/orderController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/my", protect, getMyOrders);
router.get("/", protect, adminOnly, getAllOrders);

export default router;

router.get("/stats", protect, adminOnly, getOrdersStats);
