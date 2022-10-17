const Review = require("../models/review");
const Campground = require("../models/campground")

module.exports.createReview = async (req, res, next) => {
  const { id } = req.params;
  const { review } = req.body;

  review.author = req.user._id;

  const campground = await Campground.findById(id);
  const newReview = new Review(review);

  campground.reviews.push(newReview);
  await Promise.all([campground.save(), newReview.save()]);
  req.flash("success", "Successfully added a review.");
  res.redirect(`/campgrounds/${id}`);
};

module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;
  await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Successfully deleted a review.");
  res.redirect(`/campgrounds/${id}`);
};
