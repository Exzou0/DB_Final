import Order from "../models/Order.js";

export const ordersPerUser = async (req, res) => {
  const result = await Order.aggregate([
    // 1. Разворачиваем массив продуктов, чтобы каждый товар стал отдельным документом
    { $unwind: "$products" },
    
    // 2. Группируем по ID пользователя И названию товара
    {
      $group: {
        _id: {
          user_id: "$user_id",
          product_name: "$products.name"
        },
        totalQuantity: { $sum: "$products.quantity" }, // Суммируем количество штук
        ordersCount: { $sum: 1 } // Сколько раз этот товар встречался в заказах
      }
    },
    
    // 3. Красиво форматируем вывод
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