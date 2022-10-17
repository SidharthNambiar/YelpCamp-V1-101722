const express = require("express");
const router = express.Router({ mergeParams: true });
const { validateReview } = require("../utils/Validations");
const catchAsync = require("../utils/catchAsync");
const Campground = require("../models/campground");
const Review = require("../models/review");
const { isLoggedIn, isReviewAuthor } = require("../utils/Middleware");
const user = require("../models/user");
const reviews = require("../controllers/reviews");

/**POST Routes**/

router.post("/", isLoggedIn, validateReview, catchAsync(reviews.createReview));

/**DELETE Routes**/

// Deleteing a single review from campgrounds and reviews collections. removes reference to review in campground and the review itself .
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  catchAsync(reviews.deleteReview)
);

module.exports = router;
