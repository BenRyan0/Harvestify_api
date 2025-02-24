const { Schema, model } = require("mongoose");

const notificationSchema = new Schema(
  {
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "sellers",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    listingId: {
      type: Schema.Types.ObjectId,
      ref: "listings",
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false, // New notifications are unread by default
    },
  },
  { timestamps: true }
);

module.exports = model("notifications", notificationSchema);
