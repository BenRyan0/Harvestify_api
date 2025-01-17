const mongoose = require("mongoose");

const proofSchema = new mongoose.Schema({
  transactionId: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction", required: true },
  paymentType: { type: String, enum: ["Deposit", "FullPayment"], required: true },
  imageUrl: { type: String, required: true },
  message: { type: String},
  uploadDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Proof", proofSchema);
