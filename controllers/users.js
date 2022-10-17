const User = require("../models/user");
const passport = require("passport");

module.exports.renderRegisterForm = (req, res) => {
  res.render("users/register");
};

module.exports.renderLoginForm = (req, res) => {
  const { returnTo } = req.session;
  originalURL = returnTo;

  res.render("users/login", { returnTo });
};

module.exports.logout = function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash("success", "Goodbye");
    res.redirect("/campgrounds");
  });
};

module.exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    //create a new user with the submitted username and email
    const user = new User({ username, email });
    // pass in the newly created user and pass the password to register method which was created by passport-local-mongoose

    const registeredUser = await User.register(user, password);
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome To Yelp Camp");
      res.redirect("/campgrounds");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/register");
  }
};

module.exports.login = (req, res) => {
  req.flash("success", `Welcome Back ${req.session.passport.user}!`);
  const redirectUrl = res.locals.returnTo || "/campgrounds";
  delete req.session.returnTo;
  res.redirect(redirectUrl);
};

module.exports.authenticate = passport.authenticate("local", {
  failureFlash: true,
  failureRedirect: "/login",
});
