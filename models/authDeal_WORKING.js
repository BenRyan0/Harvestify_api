const { Schema, model } = require("mongoose");
const ListingModel = require('../models/listingModel'); // Import the Listing model

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
      valid: { type: Boolean, required: true },
      discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
      value: { type: Number, required: true }
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
        { code: this.voucher.code, isRedeemed: false }, // Ensure it's not already redeemed
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

// Pre-save middleware to check and update listings if shipPickUpStatus is "confirmed"
authorSchema.pre("save", async function (next) {
  if (this.isModified("shipPickUpStatus") && this.shipPickUpStatus === "confirmed") {
    try {
      // Update the `isAvailable` field of all associated listings
      await ListingModel.updateMany(
        { _id: { $in: this.listing_ } }, // Use the `listing` array (assuming it's an array of ObjectIds)
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

module.exports = model("authorDeals", authorSchema);
