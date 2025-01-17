const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  traderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  }, // Buyer (trader)

  sellerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  }, // Seller

  listingId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Listing", 
    required: true 
  }, // Reference to the listing

  dealId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Deals", 
    required: true 
  }, // Reference to the associated deal
  
  traderDealId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "traderDeal", 
    required: true 
  }, // Reference to the associated deal

  listingName: { 
    type: String, 
    required: true 
  },

  listingPrice: { 
    type: Number, 
    required: true 
  },

  depositAmount: { 
    type: Number, 
    required: true 
  },

  depositStatus: { 
    type: String, 
    enum: ["Pending", "Confirmed"], 
    default: "Pending" 
  },

  fullPaymentStatus: { 
    type: String, 
    enum: ["Pending", "Confirmed"], 
    default: "Pending" 
  },

  buyerStep: { 
    type: Number, 
    default: 1 // Initial step for buyer: 1 (Waiting for Deposit Payment)
  },

  sellerStep: { 
    type: Number, 
    default: 1 // Initial step for seller: 1 (Waiting for Deposit Proof)
  },

  createdAt: { 
    type: Date, 
    default: Date.now 
  },

}, { timestamps: true });

// Adding a unique compound index to prevent repeated transactions
transactionSchema.index({ traderId: 1, sellerId: 1, listingId: 1, dealId: 1 }, { unique: true });

module.exports = mongoose.model("Transaction", transactionSchema);
