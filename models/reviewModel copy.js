const { Schema, model } = require("mongoose");

const reviewSchema = new Schema(
  {
    listingId: {
      type: Schema.ObjectId,
      required: true,
    },
    sellerId: {
      type: Schema.ObjectId,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
      required: true,
    },
    review: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
   
  },
  { timestamps: true }
);

module.exports = model("reviews", reviewSchema);
