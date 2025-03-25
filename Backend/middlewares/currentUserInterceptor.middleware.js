require("dotenv").config();
const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const errorCodes = require("../utils/errorCodes.util");
const errorMessages = require("../utils/errorMessage.util");
const mongoose = require("mongoose");


// Middleware to authenticate and authorize an admin user
const currentUserAdmin = async (req, res, next) => {
  try {
    // Retrieve authorization token from request headers
    const token = req.headers["authorization"];
    
    if (!token) {
      return next(
        res.status(401).json({
          errorCode: errorCodes.AUTH_HEADER_MISSING,
          message: errorMessages.AUTH_HEADER_MISSING,
        })
      );
    }

    // Verify and decode JWT token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    
    // Validate decoded user ID format
    if (!mongoose.Types.ObjectId.isValid(decoded?.id)) {
      
      return next(
        res.status(400).json({
          errorCode: errorCodes.INVALID_ID,
          message: errorMessages.INVALID_ID,
        })
      );
    }

    // Find user by ID, ensuring they are an active admin
    const user = await User.findOne({
      _id: decoded?.id,
      isActive: true,
      isAdmin: true,
    }).exec();

    
    // If user is not found or is not an admin, return unauthorized error
    if (!user) {
      return next(
        res.status(401).json({
          errorCode: errorCodes.INVALID_TOKEN,
          message: errorMessages.INVALID_TOKEN,
        })
      );
    }

    // Construct admin user object and attach it to request
    const currentAdminObj = {
      userID: user.id,
      email: user.email,
      userName: user.userName,
      status: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    req.currentAdminObj = currentAdminObj;

    // Ensure the email from the token matches the user's email in the database
    if (decoded.email !== user.email) {
      return next(
        res.status(401).json({
          errorCode: errorCodes.INVALID_TOKEN,
          message: errorMessages.INVALID_TOKEN,
        })
      );
    }

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    // Handle expired JWT token error
    if (error.name === "TokenExpiredError") {
      return next(
        res.status(401).json({
          errorCode: errorCodes.TOKEN_EXPIRED,
          message: errorMessages.TOKEN_EXPIRED,
        })
      );
    }

    // Handle other authentication errors
    return next(
      res.status(401).json({
        errorCode: errorCodes.UNAUTHORISED_ACCESS,
        message: errorMessages.UNAUTHORISED_ACCESS,
      })
    );
  }
};

// Middleware to authenticate and authorize a regular user
const currentUser = async (req, res, next) => {
  try {
    // Retrieve authorization token from request headers
    const token = req.headers["authorization"];
    console.log(token,"TOKENNNN");
    
    if (!token) {
      return next(
        res.status(401).json({
          errorCode: errorCodes.AUTH_HEADER_MISSING,
          message: errorMessages.AUTH_HEADER_MISSING,
        })
      );
    }

    // Verify and decode JWT token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    console.log(decoded,"decoded");
    

    // Validate decoded user ID format
    if (!mongoose.Types.ObjectId.isValid(decoded?.id)) {
      return next(
        res.status(400).json({
          errorCode: errorCodes.INVALID_ID,
          message: errorMessages.INVALID_ID,
        })
      );
    }

    // Find user by ID, ensuring they are an active regular user (not admin)
    const user = await User.findOne({
      _id: decoded?.id,
      isActive: true,
      isAdmin: false,
    });

    // If user is not found, return unauthorized error
    if (!user) {
      return next(
        res.status(401).json({
          errorCode: errorCodes.INVALID_TOKEN,
          message: errorMessages.INVALID_TOKEN,
        })
      );
    }

    // Construct user object and attach it to request
    const currentUserObj = {
      userID: user.id,
      email: user.email,
      userName: user.userName,
      status: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    req.currentUserObj = currentUserObj;

    // Ensure the email from the token matches the user's email in the database
    if (decoded.email !== user.email) {
      return next(
        res.status(401).json({
          errorCode: errorCodes.INVALID_TOKEN,
          message: errorMessages.INVALID_TOKEN,
        })
      );
    }

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.log(error,"ERRORRRR");
    
    // Handle expired JWT token error
    if (error.name === "TokenExpiredError") {
      return next(
        res.status(401).json({
          errorCode: errorCodes.TOKEN_EXPIRED,
          message: errorMessages.TOKEN_EXPIRED,
        })
      );
    }

    // Handle other authentication errors
    return next(
      res.status(401).json({
        errorCode: errorCodes.UNAUTHORISED_ACCESS,
        message: errorMessages.UNAUTHORISED_ACCESS,
      })
    );
  }
};

module.exports = { currentUserAdmin, currentUser };
