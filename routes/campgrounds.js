const express = require("express");
const multer = require("multer");

const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const { validateCampground } = require("../utils/Validations");
const Campground = require("../models/campground");
const { isLoggedIn, isAuthor } = require("../utils/Middleware");
const campgrounds = require("../controllers/campgrounds");

// node automaticallys looks for an index.js file, no need to specify it below for cloudinary
const { storage } = require("../cloudinary");
const upload = multer({ storage });

/**GET Routes**/

router
  .route("/")
  .get(catchAsync(campgrounds.index))
  .post(
    
    isLoggedIn,
    upload.array("image"),
    validateCampground,
    catchAsync(campgrounds.addCampground)
);


router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router
  .route("/:id")
  .get(catchAsync(campgrounds.showCampground))
  .put(
    isLoggedIn,
    isAuthor,
    upload.array("image"),
    validateCampground,
    catchAsync(campgrounds.updateCampground)
  )
  .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(campgrounds.renderEditForm)
);

module.exports = router;
