import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import {
  ordersPerUser,
  totalRevenue,
  topProducts
} from "../controllers/analyticsController.js";

const router = express.Router();

router.get("/orders-per-user", protect, adminOnly, ordersPerUser);
router.get("/total-revenue", protect, adminOnly, totalRevenue);
router.get("/top-products", protect, adminOnly, topProducts);

export default router;
