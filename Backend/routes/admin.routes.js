// adminRoutes.js
const express = require("express");
const router = express.Router();
const adminController = require("../controller/admin.controller");
const currentUser = require("../middlewares/currentUserInterceptor.middleware");

const expressValidator = require("../validators/express.validator"); //imported express validator

// Admin login
router.post("/login", adminController.login);

//Admin create food category
router.post(
  "/productCategory",
  currentUser.currentUserAdmin,
  expressValidator.categoryAdd,
  adminController.productCategoryAdd
);

//Admin get food category
router.get(
  "/getProductCategory",
  currentUser.currentUserAdmin,
  adminController.getProductCategory
);

//Admin update food category
router.put(
  "/updateProductCategory/:id",
  currentUser.currentUserAdmin,
  adminController.editProductCategory
);

//Admin delete food category
router.put(
  "/deleteProductCategory/:id",
  currentUser.currentUserAdmin,
  adminController.deleteProductCategory
);

//Admin create food product
router.post(
  "/productAdd",
  currentUser.currentUserAdmin,
  expressValidator.foodProductAdd,
  adminController.productAdd
);

//Admin get all food products
router.get("/getAllProduct",
  currentUser.currentUserAdmin,
  adminController.getAllProduct);

//Admin get food products from product category
router.get("/getProduct/:id", 
  currentUser.currentUserAdmin,
  adminController.getProduct);

//Admin get food  product by id
router.get(
  "/getProductByID/:id",
  currentUser.currentUserAdmin,
  adminController.getProductById
);

//Admin update food product
router.put(
  "/productUpdate/:id",
  currentUser.currentUserAdmin,
  adminController.productUpdate
);

// User management by admin
router.get(
  "/getUsers",
  currentUser.currentUserAdmin,
  adminController.listUsers
);
router.put(
  "/promoteUser/:id",
  currentUser.currentUserAdmin,
  adminController.promoteUser
);

module.exports = router;
