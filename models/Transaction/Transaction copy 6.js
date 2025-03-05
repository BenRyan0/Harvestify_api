const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'sellers', required: true },
  trader: { type: mongoose.Schema.Types.ObjectId, ref: 'traders', required: true },
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'listings', required: true },
  deal: { type: mongoose.Schema.Types.ObjectId, ref: "authorDeal", required: true },
  traderDeal: { type: mongoose.Schema.Types.ObjectId, ref: "traderDeals", required: true },
  totalAmount: { type: Number, required: true },
  paymentTerm: { type: Number, enum: [2, 3, 4], required: true },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'], default: 'Pending' },
  traderSteps: [
    {
      stepNumber: Number,
      description: String,
      completed: { type: Boolean, default: false },
      proof: { type: String }, // URL to proof image or document
      confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'traders' }
    }
  ],
  sellerSteps: [
    {
      stepNumber: Number,
      description: String,
      completed: { type: Boolean, default: false },
      proof: { type: String }, // URL to proof image or document
      confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'sellers' }
    }
  ],
  buyerStep: { type: Number, default: 1 }, // 1: Waiting for Deposit Payment
  sellerStep: { type: Number, default: 1 }, // 1: Waiting for Deposit Proof
  totalSteps: { type: Number }, // Track total steps based on payment term
  createdAt: { type: Date, default: Date.now }
});

// ✅ Define the unique index **outside** the function
transactionSchema.index({ listing: 1, deal: 1 }, { unique: true });

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

  if (!stepsMap[data.paymentTerm]) {
    throw new Error(`Invalid payment term: ${data.paymentTerm}. Allowed values: 2, 3, 4.`);
  }

  const sellerSteps = stepsMap[data.paymentTerm].seller.map((desc, index) => ({ stepNumber: index + 1, description: desc, completed: false }));
  const traderSteps = stepsMap[data.paymentTerm].trader.map((desc, index) => ({ stepNumber: index + 1, description: desc, completed: false }));
  const totalSteps = Math.max(sellerSteps.length, traderSteps.length);

  return this.create({
    ...data,
    sellerSteps,
    traderSteps,
    totalSteps
  });
};

module.exports = mongoose.model('Transaction', transactionSchema);
