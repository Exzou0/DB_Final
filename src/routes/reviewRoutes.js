import express from "express";
import {
  createReview,
  getProductReviews,
  deleteReview,
  getAllReviews
} from "../controllers/reviewController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createReview);
router.get("/product/:productId", getProductReviews);
router.delete("/:id", protect, adminOnly, deleteReview);
router.get("/", protect, adminOnly, getAllReviews);

export default router;
