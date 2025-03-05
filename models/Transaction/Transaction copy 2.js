const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    trader: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
    deal: { type: mongoose.Schema.Types.ObjectId, ref: "Deals", required: true },
    traderDeal: { type: mongoose.Schema.Types.ObjectId, ref: "traderDeal", required: true },
    depositAmount: { type: Number },
    proofOfPayment: { type: String }, // URL for payment proof
    sellerConfirmedPayment: { type: Boolean, default: false },
    shipmentProof: { type: String }, // URL for shipment proof
    traderConfirmedReceipt: { type: Boolean, default: false },
    finalPaymentProof: { type: String },
    sellerConfirmedFinalPayment: { type: Boolean, default: false },
    review: { type: String },
    buyerStep: { type: Number, default: 1 }, // 1: Waiting for Deposit Payment
    sellerStep: { type: Number, default: 1 }, // 1: Waiting for Deposit Proof
    depositProof : {
      imageUrl: { type: String, required: true },
      message: { type: String},
      uploadDate: { type: Date, default: Date.now },
    },
    midwayPaymentProof : {
      imageUrl: { type: String, required: true },
      message: { type: String},
      uploadDate: { type: Date, default: Date.now },
    },
    partialPaymentProof : {
      imageUrl: { type: String, required: true },
      message: { type: String},
      uploadDate: { type: Date, default: Date.now },
    },
    finalPaymentProof : {
      imageUrl: { type: String, required: true },
      message: { type: String},
      uploadDate: { type: Date, default: Date.now },
    },

    status: {
      type: String,
      enum: ["pending", "shipped", "delivered", "completed", "disputed"],
      default: "pending",
    },

    dispute: {
      reason: { type: String },
      resolved: { type: Boolean, default: false },
      resolutionDetails: { type: String },
    },
  },
  { timestamps: true }
);

// Unique index to prevent duplicate transactions
transactionSchema.index({ trader: 1, seller: 1, listingId: 1, dealId: 1 }, { unique: true });

module.exports = mongoose.model("Transaction", transactionSchema);
