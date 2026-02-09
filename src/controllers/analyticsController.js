import Order from "../models/Order.js";

export const ordersPerUser = async (req, res) => {
  const result = await Order.aggregate([

    { $unwind: "$products" },
    
    {
      $group: {
        _id: {
          user_id: "$user_id",
          product_name: "$products.name"
        },
        totalQuantity: { $sum: "$products.quantity" }, 
        ordersCount: { $sum: 1 } 
      }
    },
    

    {
      $project: {
        _id: 0,
        user_id: "$_id.user_id",
        name: "$_id.product_name",
        totalQuantity: 1,
        ordersCount: 1
      }
    }
  ]);

  res.json(result);
};
export const totalRevenue = async (req, res) => {
  const result = await Order.aggregate([
    {
      $group: {
        _id: null,
        revenue: { $sum: "$total_price" }
      }
    }
  ]);

  res.json(result[0]);
};

export const topProducts = async (req, res) => {
  const result = await Order.aggregate([
    { $unwind: "$products" },
    {
      $group: {
        _id: "$products.product_id",
        name: { $first: "$products.name" }, 
        sold: { $sum: "$products.quantity" }
      }
    },
    { $sort: { sold: -1 } },
    { $limit: 5 }
  ]);

  res.json(result);
};