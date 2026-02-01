import Review from "../models/Review.js";

export const createReview = async (req, res) => {
  try {
    const { product_id, rating, comment } = req.body;

    const review = await Review.create({
      user_id: req.user.id,
      product_id,
      rating,
      comment
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getProductReviews = async (req, res) => {
  const reviews = await Review.find({ product_id: req.params.productId })
    .populate("user_id", "full_name");

  res.json(reviews);
};

export const deleteReview = async (req, res) => {
  await Review.findByIdAndDelete(req.params.id);
  res.json({ message: "Review deleted" });
};
