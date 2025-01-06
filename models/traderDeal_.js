const { Schema, model } = require("mongoose");

const traderDealSchema = new Schema(
  {
    traderId: { type: Schema.ObjectId, required: true },
    dealId: { type: Schema.ObjectId, ref: "authorDeals", required: true }, // Links to AuthorDeals
    listing: [
      {
        type: Schema.ObjectId,
        ref: "listings", // References the listings collection
        required: true,
      },
    ],
    price: { type: Number, required: true },
    shippingFee: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"], // Restrict valid values
      required: true,
    },
    shippingInfo: { type: Object, required: true }, // Can be further structured if needed
    shipPickUpStatus: {
      type: String,
      enum: ["pending", "confirmed", "shipped"],
      required: true,
    },
    date: { type: String, required: true },
    shippingMethod: { type: String, required: true },
    mapsLink: { type: String, required: true },
  },
  { timestamps: true }
);

// Middleware to sync shipPickUpStatus with AuthorDeals
traderDealSchema.post("save", async function (doc, next) {
  try {
    const AuthorDealModel = require("./authorDeals");

    // Update the related authorDeal's shipPickUpStatus
    await AuthorDealModel.findOneAndUpdate(
      { _id: doc.dealId }, // Find the related author deal
      { shipPickUpStatus: doc.shipPickUpStatus }
    );
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = model("traderDeals", traderDealSchema);
