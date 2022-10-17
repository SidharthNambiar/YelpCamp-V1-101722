const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cities = require("./cities");
const { descriptors, places } = require("./seedHelpers");

/**
 *
 * DATABASE (MONGODB)
 *
 */

mongoose
  .connect("mongodb://localhost:27017/yelp-camp")
  .then(() => {
    console.log("Connection Open!!!");
  })
  .catch((err) => console.log(err));

mongoose.connection.on("err", console.error.bind(console, "connection error:"));
mongoose.connection.once("open", () => {
  console.log("Database Connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 500; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      author: "634a09a9b491620284bc41c8",
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      geometry: {
        type: "Point",
        coordinates: [cities[random1000].longitude, cities[random1000].latitude]
      },
      images: [
        {
          url: "https://res.cloudinary.com/dxkbldwc9/image/upload/v1665777670/YelpCamp/an5sikysazgutvisck6o.jpg",
          filename: "YelpCamp/an5sikysazgutvisck6o",
        },
        {
          url: "https://res.cloudinary.com/dxkbldwc9/image/upload/v1665777670/YelpCamp/xw7ervmbcz8ltpc6lwcj.jpg",
          filename: "YelpCamp/xw7ervmbcz8ltpc6lwcj",
        },
        {
          url: "https://res.cloudinary.com/dxkbldwc9/image/upload/v1665777670/YelpCamp/vg5xv2lovj4ccrx3fnwh.jpg",
          filename: "YelpCamp/vg5xv2lovj4ccrx3fnwh",
        },
      ],
      description:
        "This upload was part of a seed file. User didn't upload this.",
      price,
    });
    await camp.save();
  }
};

//seed DB returns a promise since it's an async function
seedDB().then(() => {
  mongoose.connection.close();
});
