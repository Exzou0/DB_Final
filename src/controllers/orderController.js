import Order from "../models/Order.js";
import Product from "../models/Product.js";

export const createOrder = async (req, res) => {
  try {
    const { products } = req.body;

    let total = 0;
    const orderProducts = [];

    for (const item of products) {
      const product = await Product.findById(item.product_id);
      if (!product)
        return res.status(404).json({ message: "Product not found" });

      total += product.price * item.quantity;

      orderProducts.push({
        product_id: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity
      });
    }

    const order = await Order.create({
      user_id: req.user.id,
      products: orderProducts,
      total_price: total
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user_id: req.user.id });
  res.json(orders);
};

export const getAllOrders = async (req, res) => {
  const orders = await Order.find().populate("user_id");
  res.json(orders);
};

export const getOrdersStats = async (req, res) => {
  const stats = await Order.aggregate([
    {
      $group: {
        _id: "$user_id",
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: "$total_price" }
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user"
      }
    },
    { $unwind: "$user" },
    {
      $project: {
        _id: 0,
        userId: "$user._id",
        userName: "$user.full_name",
        totalOrders: 1,
        totalSpent: 1
      }
    }
  ]);

  res.json(stats);
};

