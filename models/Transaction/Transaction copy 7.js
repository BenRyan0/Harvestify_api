const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'sellers', required: true },
  trader: { type: mongoose.Schema.Types.ObjectId, ref: 'traders', required: true },
  listing: {
    type: Array,
    required: true
},
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'listings', required: true },
  shippingInfo: { type: Object, required: true },
  deal: { type: mongoose.Schema.Types.ObjectId, ref: "authorDeal", required: true },
  traderDeal: { type: mongoose.Schema.Types.ObjectId, ref: "traderDeals", required: true },
  totalAmount: { type: Number, required: true },
  paymentTerm: { type: Number, required: true },

  deposit : {
    depositPaymentAmount: { type: Number },
    depositPaymentAmountProofUrl: { type: String },
    depositPaymentAmountProofMessage: { type: String },
    depositPaymentCompleted: { type: String, enum: ["Completed", "In-dispute", "Resolved", "Pending"], default: "Pending" , required: true },
  },

  
  depositPaymentAmount: { type: Number },
  depositPaymentAmountProofUrl: { type: String },
  depositPaymentAmountProofMessage: { type: String },
  depositPaymentCompleted: { type: String, enum: ["Completed", "In-dispute", "Resolved", "Pending"], default: "Pending" , required: true },


  midwayPaymentAmount: { type: Number },
  midwayPaymentAmountProofUrl: { type: String },
  midwayPaymentAmountProofMessage: { type: String },
  midwayPaymentCompleted: { type: String, enum: ["Completed", "In-dispute", "Resolved", "Pending"], default: "Pending" , required: true },

  partialPaymentAmount: { type: Number },
  partialPaymentAmountProofUrl: { type: String },
  partialPaymentAmountProofMessage: { type: String },
  partialPaymentCompleted: { type: String, enum: ["Completed", "In-dispute", "Resolved", "Pending"], default: "Pending" , required: true },


  finalPaymentPaymentAmount: { type: Number },
  finalPaymentAmountProofUrl: { type: String },
  finalPaymentAmountProofMessage: { type: String },
  finalPaymentCompleted: { type: String, enum: ["Completed", "In-dispute", "Resolved", "Pending"], default: "Pending" , required: true },

  status: { type: String, default: 'Pending' },
  traderSteps: [
    {
      stepNumber: Number,
      description: String,
      completed: { type: Boolean, default: false },
      proof: String,
      confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'traders' }
    }
  ],
  sellerSteps: [
    {
      stepNumber: Number,
      description: String,
      completed: { type: Boolean, default: false },
      proof: String,
      confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'sellers' }
    }
  ],
  buyerStep: { type: Number },
  sellerStep: { type: Number },
  totalSteps: { type: Number },
  createdAt: { type: Date, default: Date.now }
}, {
  indexes: [
    { unique: true, fields: ['seller', 'trader', 'listing', 'deal'] }
  ]
});

transactionSchema.statics.createTransaction = async function (data) {
  const stepsMap = {
    2: {
      seller: [
        "Review",
        "Initialization",
        "1st Payment Confirmation",
        "Delivery/Receipt",
        "Handoff Confirmation",
        "2nd Payment Confirmation",
        "Complete"
      ],
      trader: [
        "Review",
        "Proof_Upload",
        "Confirmation",
        "Delivery/Receipt",
        "Upload_Proof",
        "Confirmation",
        "Review",
        "Complete"
      ]
    },
    3: {
      seller: [
        "Review",
        "Initialization",
        "1st Payment Confirmation",
        "Delivery/Receipt",
        "Midway Payment Confirmation",
        "2nd Payment Confirmation",
        "Complete"
      ],
      trader: [
        "Review",
        "Proof_Upload",
        "Confirmation",
        "Delivery/Receipt",
        "Upload_Midway_Proof",
        "Confirmation",
        "Review",
        "Complete"
      ]
    },
    4: {
      seller: [
        "Review",
        "Initialization",
        "1st Payment Confirmation",
        "Partial Payment Confirmation",
        "Delivery/Receipt",
        "Midway Payment Confirmation",
        "2nd Payment Confirmation",
        "Complete"
      ],
      trader: [
        "Review",
        "Proof_Upload",
        "Confirmation",
        "Upload_Partial_Proof",
        "Confirmation",
        "Delivery/Receipt",
        "Upload_Midway_Proof",
        "Confirmation",
        "Review",
        "Complete"
      ]
    }
  };

  const sellerSteps = (stepsMap[data.paymentTerm]?.seller || []).map((desc, index) => ({
    stepNumber: index + 1, description: desc, completed: false
  }));

  const traderSteps = (stepsMap[data.paymentTerm]?.trader || []).map((desc, index) => ({
    stepNumber: index + 1, description: desc, completed: false
  }));

  const totalSteps = Math.max(sellerSteps.length, traderSteps.length);

  return this.create({
    ...data,
    sellerSteps,
    traderSteps,
    totalSteps
  });
};

module.exports = mongoose.model('Transaction', transactionSchema);
