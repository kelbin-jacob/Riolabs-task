const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// Custom validation functions for length limits
const validateDescriptionLength = (description) => {
  return description.length >= 5 && description.length <= 250;
};

const validateNameLength = (name) => {
  return name.length >= 1 && name.length <= 50;
};

// Define the Category schema
const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true, // Category name is required
      trim: true, // Removes extra spaces
      lowercase: true, // Stores name in lowercase for consistency
      validate: {
        validator: validateNameLength,
        message: "Name must be between 1 and 50 characters in length.",
      },
    },
    description: {
      type: String,
      required: true, // Description is mandatory
      validate: {
        validator: validateDescriptionLength,
        message: "Description must be between 5 and 250 characters in length.",
      },
    },
    parentCategory: {
      type: Schema.Types.ObjectId, // Self-referencing field to allow nested categories
      ref: "Category", // References another category
      default: null, // Root categories will have null as parent
    },
    isActive: {
      type: Boolean,
      default: false, // Default category status is inactive
    },
    deletedAt: {
      type: Date,
      default: null, // Null means not deleted
    },
  },
  { timestamps: true } // Automatically adds createdAt & updatedAt timestamps
);

// Index for faster name-based search
categorySchema.index({ name: 1 });

// Index for faster parent-child category lookups
categorySchema.index({ parentCategory: 1 });

// Create the Category model
const Category = mongoose.model("Category", categorySchema);

// Export the Category model
module.exports = Category;
