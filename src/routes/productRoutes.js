import express from "express";
import { getProductRatings } from "../controllers/productController.js";
import {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  decreaseStock
} from "../controllers/productController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getProducts);
router.post("/", protect, adminOnly, createProduct);
router.put("/:id", protect, adminOnly, updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

export default router;

router.get("/ratings/stats", getProductRatings);

router.patch("/:id/decrease", protect, adminOnly, decreaseStock);
