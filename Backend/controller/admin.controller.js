// adminController.js
const User = require("../models/user.model");
const Food = require("../models/foodproduct.model");
const Category = require("../models/category.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ERROR_CODES = require("../utils/errorCodes.util");
const ERROR_MESSAGES = require("../utils/errorMessage.util");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");

// Load environment variables using a library like dotenv
require("dotenv").config();

//CREATING ADMIN
exports.createAdmin = async () => {
  try {
    const adminExists = await User.findOne({ isAdmin: true }).exec();
    if (adminExists) {
      console.log("✅ Admin user already exists.");
      return;
    }

    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
      throw new Error(
        "Missing required environment variables: ADMIN_EMAIL or ADMIN_PASSWORD."
      );
    }

    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

    const admin = await User.create({
      email: process.env.ADMIN_EMAIL,
      password: hashedPassword,
      isAdmin: true,
      isActive: true,
      userName: "ADMIN@123",
      phoneNumber: process.env.ADMIN_PHONE || "+917025258640",
    });

    console.log("🎉 Admin user created successfully:", admin.email);
  } catch (error) {
    console.error("❌ Error creating admin user:", error.message);
    throw new Error("Admin creation failed: " + error.message);
  }
};

// Admin Login

// Admin Login
exports.login = async (req, res, next) => {
  try {
    const email = req.body.email?.trim();
    const password = req.body.password;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        errorCode: ERROR_CODES.EMAIL_OR_PASSWORD_REQUIRED,
        message: ERROR_MESSAGES.EMAIL_OR_PASSWORD_REQUIRED,
      });
    }

    // Find admin by email
    const admin = await User.findOne({ email }).lean(); // `lean()` improves query performance for read operations

    if (!admin || !admin.isAdmin) {
      return res.status(403).json({
        errorCode: ERROR_CODES.UNAUTHORISED_ACCESS,
        message: ERROR_MESSAGES.UNAUTHORISED_ACCESS,
      });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        errorCode: ERROR_CODES.INCORRECT_PASSWORD,
        message: ERROR_MESSAGES.INCORRECT_PASSWORD,
      });
    }

    // Generate authentication tokens
    const accessToken = generateAccessToken(admin?._id, admin.email);
    const refreshToken = generateRefreshToken(admin?._id, admin.email);

    // Respond with admin details and tokens
    return res.status(200).json({
      name: admin.userName,
      email: admin.email,
      status: admin.isActive,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({
      errorCode: ERROR_CODES.UNEXPECTED_ERROR,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR,
    });
  }
};

// Generate Access Token (valid for 60 minutes)
function generateAccessToken(id, email) {
  return jwt.sign({ id, email }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "60m",
  });
}

// Generate Refresh Token (valid for 1 day)
function generateRefreshToken(id, email) {
  return jwt.sign({ id, email }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "1d",
  });
}

// List All Users with Pagination (Admin Only)
exports.listUsers = async (req, res) => {
  try {
    // Get pagination parameters from query, with defaults
    let { page = 1, limit = 10 } = req.query;

    // Convert pagination parameters to integers
    page = parseInt(page);
    limit = parseInt(limit);

    // Ensure valid pagination parameters
    if (page < 1 || limit < 1) {
      return res.status(400).json({
        success: false,
        message: "Page and limit must be positive integers",
      });
    }

    // Get total user count
    const totalUsers = await User.countDocuments({isAdmin:false});

    // Calculate total pages
    const totalPages = Math.ceil(totalUsers / limit);

    // Fetch users with pagination, excluding passwords
    const users = await User.find({isAdmin:false})
      .select("-password") // Exclude sensitive data
      .skip((page - 1) * limit) // Skip previous pages
      .limit(limit) // Limit results per page
      .lean(); // Optimize query performance

    // Determine if there is a next page
    const hasNextPage = page < totalPages;

    // Respond with paginated user list
    return res.status(200).json({
      success: true,
      totalUsers,
      currentPage: page,
      totalPages,
      hasNextPage,
      data:users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      errorCode: ERROR_CODES.UNEXPECTED_ERROR,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR,
    });
  }
};

// Promote User to Admin
exports.promoteUser = async (req, res) => {
  const { id } = req.params;
  // Find the user who is not already an admin
  const user = await User.findOne({ _id: id, isAdmin: false });

  if (!user) {
    return res.status(400).json({
      errorCode: ERROR_CODES.USER_NOT_FOUND,
      message: ERROR_MESSAGES.USER_NOT_FOUND,
    });
  }

  // Promote the user to admin
  user.isAdmin = true;
  await user.save();

  return res.status(200).json({
    success: true,
    message: "User promoted to admin successfully",
    data:user,
  });
};
//ADD FOOD CATEGORY
exports.productCategoryAdd = async (req, res, next) => {
  try {
    // Validate request data
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ success: false, message: errors.errors[0].msg

         });
    }

    const { name, description, parentCategory } = req.body; // Extract category details

    // Check for duplicate category
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({
        errorCode: ERROR_CODES.CATEGORY_NAME_EXIST,
        message: ERROR_MESSAGES.CATEGORY_NAME_EXIST,
      });
    }

    // Create a new category
    const category = await Category.create({
      name,
      description,
      parentCategory: parentCategory || null, // Allow nesting if parentCategory exists
      isActive: true,
    });

    return res
      .status(200)
      .json({
        success: true,
        message: "Category added successfully",
        data:category,
      });
  } catch (error) {
    console.log(error,"ERRORRRRRR");
    
    return res.status(500).json({
      errorCode: ERROR_CODES.UNEXPECTED_ERROR,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR,
    });
  }
};
//GET FOOD CATEGORY
exports.getProductCategory = async (req, res) => {
  try {
   // Extract pagination parameters from query (default: page 1, limit 10)
   const page = parseInt(req.query.page) || 1;
   const limit = parseInt(req.query.limit) || 10;
   const skip = (page - 1) * limit;
 
   // Fetch total number of active categories
   const totalCategories = await Category.countDocuments({ isActive: true });
 
   // Fetch paginated categories with parent category populated
   const productCategoryList = await Category.find({ isActive: true })
     .populate("parentCategory", "name description") // Populate only specific fields
     .skip(skip)
     .limit(limit)
     .sort({ name: 1 }) // Sort alphabetically
     .lean() // Optimize query performance
     .exec();
 
   // Calculate hasNext (if more results exist after the current page)
   const hasNext = totalCategories > page * limit;
 
   return res.status(200).json({
     success: true,
     currentPage: page,
     totalCategories,
     hasNext,
     data: productCategoryList,
   });
  } catch (error) {
    return res.status(500).json({
      errorCode: ERROR_CODES.UNEXPECTED_ERROR,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR,
    });
  }
};
//EDIT FOOD CATEGORY
exports.editProductCategory = async (req, res) => {
  try {
    const { name, description,parentCategory } = req.body;
    const categoryId = req.params.id;

    // Validate categoryId format
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({
        success: false,
        errorCode: ERROR_CODES.INVALID_ID,
        message: ERROR_MESSAGES.INVALID_ID,
      });
    }

    // Check if category exists and is active (without .lean() because we modify it)
    const category = await Category.findOne({ _id: categoryId, isActive: true }).exec();

    if (!category) {
      return res.status(400).json({
        success: false,
        errorCode: ERROR_CODES.PRODUCT_CATEGORY_NOT_FOUND,
        message: ERROR_MESSAGES.PRODUCT_CATEGORY_NOT_FOUND,
      });
    }

    // Check for duplicate category name only if the name is changing
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ name: name }).lean().exec(); // Use .lean() here for performance
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          errorCode: ERROR_CODES.CATEGORY_NAME_EXIST,
          message: ERROR_MESSAGES.CATEGORY_NAME_EXIST,
        });
      }
    }

      // Handle parent category update (ensure it exists and is not the same as the category itself)
      if (parentCategory) {
        if (!mongoose.Types.ObjectId.isValid(parentCategory)) {
          return res.status(400).json({
            success: false,
            errorCode: ERROR_CODES.INVALID_PARENT_ID,
            message: ERROR_MESSAGES.INVALID_PARENT_ID,
          });
        }
  
        // Check if parent category exists
        const parentExists = await Category.findById(parentCategory).lean().exec();
        if (!parentExists) {
          return res.status(400).json({
            success: false,
            errorCode: ERROR_CODES.PARENT_CATEGORY_NOT_FOUND,
            message: ERROR_MESSAGES.PARENT_CATEGORY_NOT_FOUND,
          });
        }
  
        // Prevent circular reference (category cannot be its own parent)
        if (parentCategory === categoryId) {
          return res.status(400).json({
            success: false,
            errorCode: ERROR_CODES.PARENT_CANNOT_BE_UPDATING_CATEGORY_ITSELF,
            message: ERROR_MESSAGES.PARENT_CANNOT_BE_UPDATING_CATEGORY_ITSELF,
          });
        }
  
        category.parentCategory = parentCategory;
      }
  

    // Update fields only if new values are provided
    if (name) category.name = name;
    if (description) category.description = description;
    category.updatedAt = new Date();

    // Save updated category
    await category.save();

    return res.status(200).json({
      message: "Category updated successfully.",
      data:category,
    });
  } catch (error) {
        // Handle other unexpected errors
      return res.status(500).json({
        errorCode: ERROR_CODES.UNEXPECTED_ERROR,
        message: ERROR_MESSAGES.UNEXPECTED_ERROR,
      });
  }
};

//DELETE FOOD CATEGORY
exports.deleteProductCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    // Validate category ID format
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({
        success: false,
        errorCode: ERROR_CODES.INVALID_ID,
        message: ERROR_MESSAGES.INVALID_ID,
      });
    }

    // Fetch category and check if it has subcategories in one query
    const category = await Category.findOne(
      { _id: categoryId, isActive: true },
      { _id: 1, name: 1 } // Select only necessary fields
    ).populate("parentCategory", "_id");

    if (!category) {
      return res.status(400).json({
        success: false,
        errorCode: ERROR_CODES.PRODUCT_CATEGORY_NOT_FOUND,
        message: ERROR_MESSAGES.PRODUCT_CATEGORY_NOT_FOUND,
      });
    }

    // Check if the category has subcategories
    const hasChildCategories = await Category.exists({ parentCategory: categoryId });

    if (hasChildCategories) {
      return res.status(400).json({
        success: false,
        errorCode: ERROR_CODES.CANNOT_DELETE_PARENT_CATEGORY,
        message: ERROR_MESSAGES.CANNOT_DELETE_PARENT_CATEGORY,
      });
    }


    // Soft delete: Update isActive status in a single query
    await Category.updateOne({ _id: categoryId }, { $set: { isActive: false, updatedAt: new Date(),deletedAt:new Date() } });

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      errorCode: ERROR_CODES.UNEXPECTED_ERROR,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR,
    });
  }
};

// PRODUCT ADD
exports.productAdd = async (req, res, next) => {
  try {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(res.status(400).send(errors.errors[0].msg));
    }

    const { name, description, price, categoryId,stock } = req.body;

    // Validate categoryId format
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({
        success: false,
        errorCode: ERROR_CODES.INVALID_ID,
        message: ERROR_MESSAGES.INVALID_ID,
      });
    }

    // Check if category exists and is active
    const categoryExists = await Category.exists({ _id: categoryId, isActive: true });
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        errorCode: ERROR_CODES.CATEGORY_NOT_FOUND,
        message: ERROR_MESSAGES.CATEGORY_NOT_FOUND,
      });
    }

    // Check if a product with the same name exists in the same category
    const existingProduct = await Food.exists({ name: name, category: categoryId });
    if (existingProduct) {
      return res.status(409).json({
        success: false,
        errorCode: ERROR_CODES.DUPLICATE_PRODUCT_NAME,
        message: ERROR_MESSAGES.DUPLICATE_PRODUCT_NAME,
      });
    }

    // Create a new product
    const foodProduct = await Food.create({
      category: categoryId,
      name: name,
      description: description,
      price: price,
      isActive: true,
      stock:stock
    });

    return res.status(200).json({
      success: true,
      message: "Product added successfully.",
      data: foodProduct,
    });

  } catch (error) {
    console.error("Error adding product:", error);

    return res.status(500).json({
      success: false,
      errorCode: ERROR_CODES.UNEXPECTED_ERROR,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR,
    });
  }
};
//GET ALL PRODUCT LIST
exports.getAllProduct = async (req, res) => {
  try {
    // Extract pagination parameters from query (default: page 1, limit 10)
    let { page, limit } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    if (page < 1 || limit < 1) {
      return res.status(400).json({
        success: false,
        errorCode: ERROR_CODES.INVALID_PAGINATION,
        message: ERROR_MESSAGES.INVALID_PAGINATION,
      });
    }

    const skip = (page - 1) * limit;

    // Fetch products with pagination
    const products = await Food.find({ isActive: true })
      .sort({ createdAt: -1 }) // Sort by newest first
      .populate("category", "name") // Populate category and return only 'name'
      .skip(skip)
      .limit(limit)
      .lean(); // Use lean() for faster query execution

    // Get total count of active products
    const totalProducts = await Food.countDocuments({ isActive: true });

    return res.status(200).json({
      success: true,
      message: "Products retrieved successfully.",
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
      hasNextPage: skip + products.length < totalProducts, // Check if more pages exist
      totalProducts,
      data: products,
    });

  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({
      errorCode: ERROR_CODES.UNEXPECTED_ERROR,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR,
    });
  }
};
//GET ALL PRODUCT BY CATEGORY
exports.getProduct = async (req, res) => {
  try {
    // Extract pagination parameters from query (default: page 1, limit 10)
    let { page, limit } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    if (page < 1 || limit < 1) {
      return res.status(400).json({
        success: false,
        errorCode: ERROR_CODES.INVALID_PAGINATION,
        message: ERROR_MESSAGES.INVALID_PAGINATION,
      });
    }

    const skip = (page - 1) * limit;

    const categoryId = req.params.id;

    // Validate category ID format
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({
        success: false,
        errorCode: ERROR_CODES.INVALID_ID,
        message: ERROR_MESSAGES.INVALID_ID,
      });
    }

    // Fetch products belonging to the specified category
    const products = await Food.find({ isActive: true, category: categoryId })
      .sort({ createdAt: -1 }) // Sort by newest first
      .populate("category", "name") // Populate category and return only 'name'
      .skip(skip)
      .limit(limit)
      .lean(); // Use lean() for faster query execution

    // Get total count of products in this category
    const totalProducts = await Food.countDocuments({ isActive: true, category: categoryId });

    if (totalProducts === 0) {
      return res.status(400).json({
        success: false,
        errorCode: ERROR_CODES.PRODUCT_NOT_FOUND,
        message: ERROR_MESSAGES.PRODUCT_NOT_FOUND,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Products retrieved successfully.",
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
      hasNextPage: skip + products.length < totalProducts, // Check if more pages exist
      totalProducts,
      data: products,
    });

  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({
      errorCode: ERROR_CODES.UNEXPECTED_ERROR,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR,
    });
  }
};

//GET PRODUCT BY ID
exports.getProductById = async (req, res) => {
  try {
    const { categoryId } = req.query;
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        errorCode: ERROR_CODES.INVALID_PRODUCT_ID,
        message: ERROR_MESSAGES.INVALID_PRODUCT_ID,
      });
    }
      // Validate product ID format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          errorCode: ERROR_CODES.INVALID_ID,
          message: ERROR_MESSAGES.INVALID_ID,
        });
      }
  

    // Find product by ID (optionally filter by category)
    const query = { _id: id, isActive: true };
    if (categoryId) {
        // Validate product ID format
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
          return res.status(400).json({
            success: false,
            errorCode: ERROR_CODES.INVALID_ID,
            message: ERROR_MESSAGES.INVALID_ID,
          });
        }
    
      query.category = categoryId; // Apply category filter only if provided
    }

    const product = await Food.findOne(query)
      .populate("category", "name") // Populate category with only 'name' field
      .lean(); // Use lean() for better performance

    if (!product) {
      return res.status(400).json({
        success: false,
        errorCode: ERROR_CODES.PRODUCT_NOT_FOUND,
        message: ERROR_MESSAGES.PRODUCT_NOT_FOUND,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product retrieved successfully.",
      data: product,
    });

  } catch (error) {
    console.error("Error fetching product:", error);
    return res.status(500).json({
      errorCode: ERROR_CODES.UNEXPECTED_ERROR,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR,
    });
  }
};


//UPDATE PRODUCT
exports.productUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, categoryId,stock } = req.body;

    // Validate request parameters
    if (!id) {
      return res.status(400).json({
        success: false,
        errorCode: ERROR_CODES.INVALID_PRODUCT_ID,
        message: ERROR_MESSAGES.INVALID_PRODUCT_ID,
      });
    }

     // Validate productId format
     if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        errorCode: ERROR_CODES.INVALID_ID,
        message: ERROR_MESSAGES.INVALID_ID,
      });
    }

    // Check if product exists
    const product = await Food.findOne({ _id: id, isActive: true });
    if (!product) {
      return res.status(400).json({
        errorCode: ERROR_CODES.PRODUCT_NOT_FOUND,
        message: ERROR_MESSAGES.PRODUCT_NOT_FOUND,
      });
    }

    // Check for duplicate product name (if name is being updated)
    if (name && name !== product.name) {
      const existingProduct = await Food.findOne({ name, _id: { $ne: id } }).lean();
      if (existingProduct) {
        return res.status(400).json({
          errorCode: ERROR_CODES.DUPLICATE_PRODUCT_NAME,
          message: ERROR_MESSAGES.DUPLICATE_PRODUCT_NAME,
        });
      }
    }

    // Update fields only if provided in request
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.stock = stock || product.stock;

    // Validate category existence if categoryId is provided
    if (categoryId) {

           // Validate categoryId format
     if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({
        errorCode: ERROR_CODES.INVALID_ID,
        message: ERROR_MESSAGES.INVALID_ID,
      });
    }

      const categoryExists = await Category.findById(categoryId).lean();
      if (!categoryExists) {
        return res.status(400).json({
          errorCode: ERROR_CODES.CATEGORY_NOT_FOUND,
          message: ERROR_MESSAGES.CATEGORY_NOT_FOUND,
        });
      }
      product.category = categoryId;
    }

    await product.save();// saving the product

    return res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      data: product,
    });

  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({
      errorCode: ERROR_CODES.UNEXPECTED_ERROR,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR,
    });
  }
};


// SOFT DELETE PRODUCT
exports.productSoftDelete = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate request parameter
    if (!id) {
      return res.status(400).json({
        success: false,
        errorCode: ERROR_CODES.INVALID_PRODUCT_ID,
        message: ERROR_MESSAGES.INVALID_PRODUCT_ID,
      });
    }

    // Validate productId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        errorCode: ERROR_CODES.INVALID_ID,
        message: ERROR_MESSAGES.INVALID_ID,
      });
    }

    // Check if product exists and is active
    const product = await Food.findOne({ _id: id, isActive: true });
    if (!product) {
      return res.status(404).json({
        success: false,
        errorCode: ERROR_CODES.PRODUCT_NOT_FOUND,
        message: ERROR_MESSAGES.PRODUCT_NOT_FOUND,
      });
    }

    // Perform soft delete by updating isActive flag
    product.isActive = false;
    product.deletedAt = new Date(); // Store deletion timestamp
    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully.",
      data: { id: product._id, deletedAt: product.deletedAt },
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return res.status(500).json({
      success: false,
      errorCode: ERROR_CODES.UNEXPECTED_ERROR,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR,
    });
  }
};
