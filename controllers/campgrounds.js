const Campground = require("../models/campground");
const { cloudinary } = require("../cloudinary");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const mapBoxToken = process.env.MAPBOX_TOKEN;

const geoCoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new");
};

module.exports.showCampground = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("author");

  if (!campground) {
    req.flash("error", "Cannot find that campground.");
    res.redirect("/campgrounds");
  }
  res.render("campgrounds/show", { campground });
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground) {
    req.flash("error", "Unable to edit. Cannot find that campground.");
    res.redirect("/campgrounds");
  }

  res.render("campgrounds/edit", { campground });
};

module.exports.addCampground = async (req, res, next) => {
  // if(!req.body.campground) throw new ExpressError("Invalid Campground Data",400)

  const geoData = await geoCoder
    .forwardGeocode({
      query: req.body.campground.location,
      limit: 1,
    })
    .send();
  const campground = new Campground(req.body.campground);
  // console.log(geoData.body.features[0].geometry)
  if (geoData.body.features.length >0) {
    campground.geometry = geoData.body.features[0].geometry;
  }
  //req.user is added by passport
  campground.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  campground.author = req.user._id;
  await campground.save();
  req.flash("success", "Successfully made a new campground!");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.updateCampground = async (req, res) => {
  const { id } = req.params;
  const { deleteImages } = req.body;
  const campground = await Campground.findByIdAndUpdate(
    id,
    req.body.campground
  );
  campground.images.push(
    ...req.files.map((f) => ({
      url: f.path,
      filename: f.filename,
    }))
  );
  await campground.save();
  if (deleteImages) {
    for (let filename of deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }

    await campground.updateOne({
      $pull: { images: { filename: { $in: deleteImages } } },
    });
  }
  req.flash("success", "Successfully updated campground.");
  res.redirect(`/campgrounds/${id}`);
};

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission!");
    return res.redirect(`/campgrounds/${id}`);
  }
  await Campground.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted a campground.");
  res.redirect("/campgrounds");
};
