const express = require("express");
const router = express.Router();
const userController = require("../controller/user.controller");
const adminController = require("../controller/admin.controller");
const currentUser = require("../middlewares/currentUserInterceptor.middleware");

const expressValidator = require("../validators/express.validator");

// User login
router.post("/login", userController.login);

//User register
router.post(
  "/userRegister",
  expressValidator.userRegister,
  userController.userRegister
);

//User can edit profile
router.put(
  "/updateProfile",
  currentUser.currentUser,
  userController.updateProfile
);

//Get product by category
router.get(
  "/getProduct/:id",
  currentUser.currentUser,
  adminController.getProduct);

//User category list
router.get(
  "/getProductCategory",
  currentUser.currentUser,
  adminController.getProductCategory
);



module.exports = router;
