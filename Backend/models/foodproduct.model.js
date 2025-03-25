const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// Custom validation functions for length limits
const validateDescriptionLength = (description) => {
  return description.length >= 5 && description.length <= 250;
};

const validateNameLength = (name) => {
  return name.length >= 1 && name.length <= 50;
};

// Define the Product schema
const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true, // Product name is required
      trim: true, // Removes extra spaces
      lowercase: true, // Stores name in lowercase for consistency
      validate: {
        validator: validateNameLength,
        message: "Name must be between 1 and 50 characters in length.",
      },
    },
    price: {
      type: Number,
      required: true, // Price is mandatory
      min: [0, "Price cannot be negative"], // Ensures non-negative price
    },
    description: {
      type: String,
      required: true, // Description is mandatory
      validate: {
        validator: validateDescriptionLength,
        message: "Description must be between 10 and 250 characters in length.",
      },
    },
    category: {
      type: Schema.Types.ObjectId, // Self-referencing field to allow categories
      ref: "Category", // References the Category model
      required: true, // A product must belong to a category
    },
    isActive: {
      type: Boolean,
      default: false, // Default status is inactive
    },
    stock: {
      type: Number,
      required: true,
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    deletedAt: {
      type: Date,
      default: null, // Null means not deleted
    },
  },
  { timestamps: true } // Automatically manages createdAt & updatedAt fields
);

productSchema.index({ name: 1, category: 1 }); // Compound index for name + category

// Create the Product model
const Product = mongoose.model("Product", productSchema);

// Export the Product model
module.exports = Product;
