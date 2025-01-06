const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const voucherSchema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true,  // To ensure voucher codes are unique
  },
  sellerId: { type: Schema.ObjectId, required: true },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  expirationDate: {
    type: Date,
    required: true,
  },
  isRedeemed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

voucherSchema.index({
  code: "text",
});

const Voucher = mongoose.model('vouchers', voucherSchema);

module.exports = Voucher;
