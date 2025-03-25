const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ERROR_CODES = require("../utils/errorCodes.util");
const ERROR_MESSAGES = require("../utils/errorMessage.util");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");


// USER LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate request body
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        errorCode: ERROR_CODES.INVALID_CREDENTIALS,
        message: "Email and password are required.",
      });
    }

    // Find user by email and ensure the user is not an admin
    const user = await User.findOne({ email, isAdmin: false });
    if (!user) {
      return res.status(404).json({
        success: false,
        errorCode: ERROR_CODES.UNAUTHORISED_ACCESS,
        message: ERROR_MESSAGES.UNAUTHORISED_ACCESS,
      });
    }

    // Compare provided password with stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        errorCode: ERROR_CODES.INCORRECT_PASSWORD,
        message: ERROR_MESSAGES.INCORRECT_PASSWORD,
      });
    }

    // Generate access and refresh tokens
    const accessToken = generateAccessToken(user._id, user.email);
    const refreshToken = generateRefreshToken(user._id, user.email);

    // Return successful response with user details and tokens
    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        userName: user.userName,
        email: user.email,
        status: user.isActive,
        role: user.isAdmin,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({
      success: false,
      errorCode: ERROR_CODES.UNEXPECTED_ERROR,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR,
    });
  }
};

// GENERATE ACCESSTOKEN
function generateAccessToken(id, email) {
  return jwt.sign(
    { id: id, email: email },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "60m",
    }
  );
}

// GENERATE REFERSHTOKEN
function generateRefreshToken(id, email) {
  return jwt.sign(
    { id: id, email: email },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "1d",
    }
  );
}

// USER REGISTRATION
exports.userRegister = async (req, res) => {
  try {
    // Validate request body using express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errorCode: ERROR_CODES.BAD_REQUEST,
        message: errors.errors[0].msg,
      });
    }

    const { email, userName, phoneNumber, password } = req.body;

    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        errorCode: ERROR_CODES.EMAIL_ALREADY_EXISTS,
        message: ERROR_MESSAGES.EMAIL_ALREADY_EXISTS,
      });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await User.create({
      email,
      userName,
      phoneNumber,
      password: hashedPassword,
      isActive: true, // Set user as active by default
      isAdmin: false, // Default role is regular user
    });

    return res.status(200).json({
      success: true,
      message: "User registered successfully.",
      data: {
        id: user._id,
        email: user.email,
        userName: user.userName,
        phoneNumber: user.phoneNumber,
        status: user.isActive,
      },
    });
  } catch (error) {
    console.error("Error during user registration:", error);
    return res.status(500).json({
      success: false,
      errorCode: ERROR_CODES.UNEXPECTED_ERROR,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR,
    });
  }
};



// UPDATE USER PROFILE
exports.updateProfile = async (req, res) => {
  try {
    const { email, userName, phoneNumber } = req.body;
    const userId = req.currentUserObj?.userID; // Extract user ID from request

    // Validate user ID
    if (!userId ||!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        errorCode: ERROR_CODES.INVALID_ID,
        message: ERROR_MESSAGES.INVALID_ID,
      });
    }

    // Find user by ID and ensure they are not an admin
    const user = await User.findOne({ _id: userId, isAdmin: false });
    if (!user) {
      return res.status(400).json({
        success: false,
        errorCode: ERROR_CODES.USER_NOT_FOUND,
        message: ERROR_MESSAGES.USER_NOT_FOUND,
      });
    }

    // Check for duplicate email if email is being updated
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          errorCode: ERROR_CODES.EMAIL_ALREADY_EXISTS,
          message: ERROR_MESSAGES.EMAIL_ALREADY_EXISTS,
        });
      }
      user.email = email;
    }

    // Update user properties only if they are provided in the request body
    if (userName) user.userName = userName;
    if (phoneNumber) user.phoneNumber = phoneNumber;

    // Save updated user profile
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: {
        id: user._id,
        email: user.email,
        userName: user.userName,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    
    return res.status(500).json({
      success: false,
      errorCode: ERROR_CODES.UNEXPECTED_ERROR,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR,
    });
  }
};

