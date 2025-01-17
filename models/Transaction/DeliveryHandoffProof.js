const mongoose = require("mongoose");

const DeliveryHandoffProofSchema = new mongoose.Schema({
  transactionId: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction", required: true },
  imageUrl: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model("DeliveryHandoffProofs", DeliveryHandoffProofSchema);
