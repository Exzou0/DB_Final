import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";

import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);


app.get("/", (req, res) => {
  res.send("API is running...");
});

export default app;