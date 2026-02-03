import Product from "../models/Product.js";
import mongoose from "mongoose";
import Review from "../models/Review.js";

export const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getProducts = async (req, res) => {
  const products = await Product.find().populate("category_id");
  res.json(products);
};

export const updateProduct = async (req, res) => {
  const updated = await Product.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true }
  );

  res.json(updated);
};


export const deleteProduct = async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Product deleted" });
};

export const getProductRatings = async (req, res) => {
  const stats = await Review.aggregate([
    {
      $group: {
        _id: "$product_id",
        averageRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product"
      }
    },
    { $unwind: "$product" },
    {
      $project: {
        _id: 0,
        productId: "$product._id",
        productName: "$product.name",
        averageRating: { $round: ["$averageRating", 1] },
        reviewCount: 1
      }
    }
  ]);

  res.json(stats);
};

export const decreaseStock = async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { $inc: { stock_quantity: -1 } },
    { new: true }
  );

  res.json(product);
};

