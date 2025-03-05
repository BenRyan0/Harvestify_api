const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  trader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  totalAmount: { type: Number, required: true },
  paymentTerm: { type: Number, enum: [2, 3, 4], required: true },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'], default: 'Pending' },
  traderSteps: [
    {
      stepNumber: Number,
      description: String,
      completed: { type: Boolean, default: false },
      proof: { type: String }, // URL to proof image or document
      confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }
  ],
  sellerSteps: [
    {
      stepNumber: Number,
      description: String,
      completed: { type: Boolean, default: false },
      proof: { type: String }, // URL to proof image or document
      confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }
  ],
  buyerStep: { type: Number, default: 1 }, // 1: Waiting for Deposit Payment
  sellerStep: { type: Number, default: 1 }, // 1: Waiting for Deposit Proof
  totalSteps: { type: Number }, // Track total steps based on payment term
  createdAt: { type: Date, default: Date.now }
});

transactionSchema.statics.createTransaction = async function (sellerId, traderId, productId, totalAmount, paymentTerm) {
  const stepsMap = {
    2: [
      "Seller sets the required deposit for the trader.",
      "Trader uploads proof of the deposit payment.",
      "Seller confirms the deposit payment.",
      "Seller ships out the product and uploads proof of shipment.",
      "Trader confirms receiving the item.",
      "Trader uploads proof of the final payment.",
      "Seller confirms the final payment.",
      "Trader gives a review to the seller."
    ],
    3: [
      "Seller sets the required deposit for the trader.",
      "Trader uploads proof of the deposit payment.",
      "Seller confirms the deposit payment.",
      "Seller ships out the product and uploads proof of shipment.",
      "Trader uploads proof of the midway payment.",
      "Seller confirms the midway payment.",
      "Trader confirms receiving the item.",
      "Trader uploads proof of the final payment.",
      "Seller confirms the final payment.",
      "Trader gives a review to the seller."
    ],
    4: [
      "Seller sets the required deposit for the trader.",
      "Trader uploads proof of the deposit payment.",
      "Seller confirms the deposit payment.",
      "Trader uploads proof of the first partial payment.",
      "Seller confirms the first partial payment.",
      "Seller ships out the product and uploads proof of shipment.",
      "Trader uploads proof of the midway payment.",
      "Seller confirms the midway payment.",
      "Trader confirms receiving the item.",
      "Trader uploads proof of the final payment.",
      "Seller confirms the final payment.",
      "Trader gives a review to the seller."
    ]
  };

  if (!stepsMap[paymentTerm]) {
    throw new Error(`Invalid payment term: ${paymentTerm}. Allowed values: 2, 3, 4.`);
  }

  const steps = stepsMap[paymentTerm].map((desc, index) => ({ stepNumber: index + 1, description: desc, completed: false }));
  const totalSteps = steps.length;

  return this.create({ seller: sellerId, trader: traderId, product: productId, totalAmount, paymentTerm, steps, totalSteps });
};

transactionSchema.methods.getCurrentStepForSeller = function () {
  return this.steps.find(step => !step.completed && step.description.toLowerCase().includes('seller')) || null;
};

module.exports = mongoose.model('Transaction', transactionSchema);
