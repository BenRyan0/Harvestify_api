const { Schema, model } = require("mongoose");

const listingSchema = new Schema(
  {
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "sellers",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    clusterName: {
      type: String,
      required: true,
    },
    harvestStartDate: { 
      type: Date,
      required: true,
    },
    harvestEndDate: {
      type: Date,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    stock: {
      type: Number,
      default: 1,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    expectedHarvestYield: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    yieldUnit: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    images: {
      type: Array,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    pricePerUnit: {
      type: Number,
      default: 0,
      min: 0, // Ensures pricePerUnit cannot be negative
    },
    perYield: {
      type: Number,
    },
    sellerDelivery: {
      type: Boolean,
      required: true,
    },
    traderPickup: {
      type: Boolean,
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
      required: true,
    },
    locationInfo: {
      type: String,
      required: true,
    },
    additionalLocationInfo: {
      type: String,
      required: true,
    },
    mapsLink: {
      type: String,
      required: true,
    },
    additionalFeatures: {
      type: Array,
      required: false,
    },
  },
  { timestamps: true }
);

listingSchema.index(
  {
    name: "text",
    category: "text",
    description: "text",
  },
  {
    weights: {
      name: 5,
      category: 4,
      description: 2,
    },
  }
);

module.exports = model("listings", listingSchema);
