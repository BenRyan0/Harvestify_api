const { Schema, model } = require("mongoose");
const Transaction = require("../models/Transaction/Transaction"); // Import the Transaction model

const reviewSchema = new Schema(
  {
    transactionId: {
      type: Schema.ObjectId,
      ref: "Transaction",
      required: true,
      unique: true, // Ensure one review per transaction
    },
    listingId: {
      type: Schema.ObjectId,
      ref: "Listing",
      required: true,
    },
    sellerId: {
      type: Schema.ObjectId,
      ref: "User", // Refers to the seller's User model
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5, // Ensure ratings are between 1 and 5
    },
    review: {
      type: String,
      required: true,
    },
  },
  { timestamps: true } // Automatically handle createdAt and updatedAt
);

// Middleware to validate transaction before saving the review
reviewSchema.pre("save", async function (next) {
  try {
    // Fetch the transaction details
    const transaction = await Transaction.findById(this.transactionId);

    // Ensure the transaction exists and is fully paid
    if (!transaction || transaction.finalPayment.finalPaymentCompleted !== "Completed") {
      throw new Error(
        "Review cannot be submitted. The transaction is not completed."
      );
    }

    // Check that the transaction is associated with the correct seller and listing
    if (
      transaction.seller.toString() !== this.sellerId.toString() ||
      transaction.listingId.toString() !== this.listingId.toString()
    ) {
      throw new Error("Transaction details do not match the review.");
    }

    next(); // Proceed with saving the review
  } catch (err) {
    next(err); // Pass error to the next middleware
  }
});

module.exports = model("Review", reviewSchema);
