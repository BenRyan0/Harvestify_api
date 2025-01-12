const { Schema, model } = require("mongoose");
const Voucher = require('../models/voucher'); // Import the Listing model

const traderDeal = new Schema({
    traderId: {
        type: Schema.ObjectId,
        required: true
    },
    listing: {
        type: Array,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    shipping_fee: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        required: true
    },
    shippingInfo: {
        type: Object,
        required: true
    },
    shipPickUpStatus: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    shippingMethod: {
        type: String,
        required: true
    },
    mapsLink: {
        type: String,
    },
    voucher: {
        code: { type: String },
        v_id: { type: String },
        valid: { type: Boolean },
        discountType: { type: String, enum: ['percentage', 'fixed'] },
        value: { type: Number }
    },
    shipping_distance: { type: Number }
}, {timestamps: true});

traderDeal.pre('save', async function(next) {
  if (this.isModified('voucher') && this.voucher && this.voucher.valid) {
    // Set the isRedeemed field to true for the associated voucher
    try {
      await Voucher.findOneAndUpdate(
        {_id: this.voucher.v_id, code: this.voucher.code, isRedeemed: false }, // Make sure it's not already redeemed
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

module.exports = model("traderDeals", traderDeal);
