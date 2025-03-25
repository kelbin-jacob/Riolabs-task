const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// Define the User Schema
const userSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (email) => email.length >= 6 && email.length <= 50,
        message: "Email must be between 6 and 50 characters in length.",
      },
    },
    password: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      unique: true,
      // required: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (value) => value.length >= 6 && value.length <= 50,
        message: "Username must be between 6 and 50 characters in length.",
      },
    },
    phoneNumber: {
      type: String,
      unique: true,
      // required: true,
      trim: true,
      validate: {
        validator: (value) => /^\+?[1-9]\d{1,14}$/.test(value),
        message: "Invalid phone number format. Enter a valid phone number.",
      },
    },
    isAdmin: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// 🔹 Indexing for Performance
userSchema.index({ email: 1, userName: 1, phoneNumber: 1 }, { unique: true });

// 🔹 Prevent Password Exposure in API Response
userSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.password; // Remove password from output
    return ret;
  },
});

// Create the User model
const User = mongoose.model("User", userSchema);

module.exports = User;
