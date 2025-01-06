const { Schema, model } = require("mongoose");
const ListingModel = require("../models/listingModel"); // Import Listing model
const TraderDealModel = require("../models/traderDeal");

const authorSchema = new Schema(
  {
    dealId: { type: Schema.ObjectId, ref: "traderDeals", required: true }, // Links to TraderDeals
    sellerId: { type: Schema.ObjectId, required: true },
    listing: [
      {
        type: Schema.ObjectId,
        ref: "listings", // References the listings collection
        required: true,
      },
    ],
    price: { type: Number, required: true },
    shippingFee: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"], // Restrict valid values
      required: true,
    },
    shippingInfo: { type: Object, required: true }, // Can be further structured if needed
    shipPickUpStatus: {
      type: String,
      enum: ["pending", "confirmed", "shipped"],
      required: true,
    },
    date: { type: String, required: true },
    shippingMethod: { type: String, required: true },
    mapsLink: { type: String, required: true },
  },
  { timestamps: true }
);

// Pre-save middleware to update 'isAvailable' field in associated listings
authorSchema.pre("save", async function (next) {
  if (this.isModified("shipPickUpStatus") && this.shipPickUpStatus === "confirmed") {
    try {
      // Update the 'isAvailable' field to false for all associated listings
      await ListingModel.updateMany(
        { _id: { $in: this.listing } }, // Use the 'listing' array of ObjectIds
        { $set: { isAvailable: false } }
      );
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});

// Post-save middleware to sync 'shipPickUpStatus' with related TraderDeal
authorSchema.post("save", async function (doc, next) {
  try {
    // Update the related traderDeal's 'shipPickUpStatus'
    await TraderDealModel.findOneAndUpdate(
      { _id: doc.dealId }, // Find the related trader deal using dealId
      { shipPickUpStatus: doc.shipPickUpStatus }
    );
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = model("authorDeals", authorSchema);
