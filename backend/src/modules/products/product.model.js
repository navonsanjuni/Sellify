const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [100, "Product name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    sku: {
      type: String,
      unique: true,
      trim: true,
      uppercase: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    costPrice: {
      type: Number,
      min: [0, "Cost price cannot be negative"],
      default: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    stock: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 5, // warn when stock drops below this
    },
    unit: {
      type: String,
      default: "pcs",
      trim: true,
    },
    images: [
      {
        type: String, // file paths
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: is stock low?
productSchema.virtual("isLowStock").get(function () {
  return this.stock <= this.lowStockThreshold;
});

// Virtual: profit margin
productSchema.virtual("profitMargin").get(function () {
  if (!this.costPrice || this.costPrice === 0) return null;
  return (((this.price - this.costPrice) / this.price) * 100).toFixed(2);
});

// Index for search performance
productSchema.index({ name: "text", sku: "text" });
productSchema.index({ category: 1 });
productSchema.index({ isActive: 1 });

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
