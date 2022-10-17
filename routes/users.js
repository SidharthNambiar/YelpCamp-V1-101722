const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const { checkReturnTo } = require("../utils/Middleware");
const users = require("../controllers/users");

router
  .route("/register")
  .get(users.renderRegisterForm)
  .post(catchAsync(users.register));

router
  .route("/login")
  .get(users.renderLoginForm)
  .post(checkReturnTo, users.authenticate, users.login);

router.get("/logout", users.logout);

module.exports = router;
