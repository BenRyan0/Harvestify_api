const { Schema, model } = require("mongoose");
const ListingModel = require('../models/listingModel'); // Import the Listing model
const Voucher = require('../models/voucher'); // Import the Listing model

const authorSchema = new Schema(
  {
    dealId: { type: Schema.ObjectId, required: true },
    sellerId: { type: Schema.ObjectId, required: true },
    listing: {
        type: Array,
        required: true
    },
    listing_: [
      {
        type: Schema.ObjectId,
        ref: "listings", // Assuming the listing is an ObjectId that references the listings collection
        required: true,
      },
    ],
    price: { type: Number, required: true },
    shipping_fee: { type: Number, required: true },
    paymentStatus: { type: String, required: true },
    shippingInfo: { type: Object, required: true },
    shipPickUpStatus: { type: String, required: true },
    date: { type: String, required: true },
    shippingMethod: { type: String, required: true },
    shipPickUpStatus: { type: String, required: true },
    shipping_distance: { type: Number },
    mapsLink: {
      type: String,
    },
    voucher: {
      code: { type: String, },
      v_id: { type: String, },
      valid: { type: Boolean, },
      discountType: { type: String, enum: ['percentage', 'fixed'], },
      value: { type: Number, }
    },
  },
  { timestamps: true }
);

// Pre-save middleware to check and update voucher redemption
authorSchema.pre("save", async function (next) {
  if (this.isModified("voucher") && this.voucher && this.voucher.valid) {
    // Set the isRedeemed field to true for the associated voucher
    try {
      await Voucher.findOneAndUpdate(
        { v_id: this.voucher.v_id ,code: this.voucher.code, isRedeemed: false }, // Ensure it's not already redeemed
        { $set: { isRedeemed: true } }
      );
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});

authorSchema.pre("save", async function (next) {
  // Check if shipPickUpStatus was modified
  if (this.isModified("shipPickUpStatus")) {
    try {
      // If shipPickUpStatus is "confirmed", set listings to not available
      if (this.shipPickUpStatus === "confirmed") {
        await ListingModel.updateMany(
          { _id: { $in: this.listing_ } }, // Use the `listing_` array (array of ObjectIds)
          { $set: { isAvailable: false } }
        );
      }
      // If shipPickUpStatus is "rejected", set listings to available
      else if (this.shipPickUpStatus === "rejected") {
        await ListingModel.updateMany(
          { _id: { $in: this.listing_ } }, // Use the `listing_` array
          { $set: { isAvailable: true } }
        );
      }

      next(); // Proceed to save
    } catch (err) {
      next(err); // Pass any errors to the next middleware
    }
  } else {
    next(); // If shipPickUpStatus wasn't modified, proceed to save
  }
});

module.exports = model("authorDeals", authorSchema);
