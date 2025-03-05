const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    paymentTerm: {
        type: String,
        required: true,
        enum: ['Four-Phase Payment', 'Three-Phase Payment', 'Two-Phase Payment']
    },
    trader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    deposit: {
        amount: { type: Number, required: true },
        proof: { type: String },
        confirmed: { type: Boolean, default: false }
    },
    partialPaymentBeforeShipping: {
        amount: { type: Number },
        proof: { type: String },
        confirmed: { type: Boolean, default: false }
    },
    midwayPayment: {
        amount: { type: Number },
        proof: { type: String },
        confirmed: { type: Boolean, default: false }
    },
    finalPayment: {
        amount: { type: Number },
        proof: { type: String },
        confirmed: { type: Boolean, default: false }
    },
    proofOfShipment: { type: String },
    itemReceived: { type: Boolean, default: false },
    review: { type: String }
}, {
    timestamps: true
});

module.exports = mongoose.model("Transaction", transactionSchema);