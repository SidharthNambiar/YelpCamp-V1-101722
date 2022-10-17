const path = require("path");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: `${path.join(__dirname, ".env")}` });
}

const express = require("express");
const session = require("express-session");

const flash = require("connect-flash");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const helmet = require("helmet");
const mongoSantize = require("express-mongo-sanitize");

const mongoose = require("mongoose");
const ExpressError = require("./utils/ExpressError");

const passport = require("passport");
const LocalStrategy = require("passport-local");

const app = express();
const port = process.env.PORT || 3000;
const campgroundRoute = require("./routes/campgrounds");
const reviewRoute = require("./routes/reviews");
const userRoute = require("./routes/users");
const User = require("./models/user");
const MongoStore = require("connect-mongo");
/**
 *
 * DATABASE Setup (MONGODB)
 *
 */
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/yelp-camp";
//
mongoose
  .connect(dbUrl)
  .then(() => console.log("Open Connection"))
  .catch((e) => console.log(e));

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

/**
 *
 * EXPRESS
 *
 */

const secret = process.env.SECRET || "thisshouldbeabettersecret";
const options = {
  mongoUrl: dbUrl,
  secret,
  touchAfter: 24 * 60 * 60, // in seconds
};

// Session configuration

const sessionConfig = {
  store: MongoStore.create(options),
  name: "yelpSession",
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure:true,
    sameSite: "lax",
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7, //milliseconds
  },
};

// use ejs-locals for all ejs templates:
app.engine("ejs", ejsMate);

/**
 * Express Settings
 */
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

/**
 * Express Middleware
 */
const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.tiles.mapbox.com/",
  "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/dxkbldwc9/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
        "https://images.unsplash.com/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);
app.use(mongoSantize());
app.use(express.static(path.join(__dirname, "public")));
app.use(session(sessionConfig));
app.use(flash());

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

// how do we store a user in the session
passport.serializeUser(User.serializeUser());

//how you remove a user from a sessions
passport.deserializeUser(User.deserializeUser());

// temporarily viewing session object
// app.use((req, res, next)=> {
//   console.log("session is>>> ",req.session)
//   next();
// })

// all templates will have access to these variables
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

app.use("/", userRoute);
app.use("/campgrounds", campgroundRoute);
app.use("/campgrounds/:id/reviews", reviewRoute);

/**
 * Express ROUTES
 */

/**GET Routes**/

app.get("/fakeUser", async (req, res) => {
  const user = new User({ email: "bunny@gmail.com", username: "bugsbunny" });
  const newUser = await User.register(user, "chicken");
  res.send(newUser);
});

app.get("/", (req, res) => {
  res.render("home");
});

/**CUSTOM ERROR Handlers**/

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Oh No! Something went wrong.";
  res.status(statusCode).render("error", { err });
});

/**
 * Express SERVER on PORT 3000
 */

app.listen(port, () => {
  console.log("Listening on PORT: ", port);
});
