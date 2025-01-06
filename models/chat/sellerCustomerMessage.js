const { Schema, model } = require("mongoose");

const sellerCustomerMessageSchema = new Schema(
  {
    senderName: {
      type: String,
      required: true,
    },
    senderId: {
      type: String,
      required: true,
    },
    receiverId: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: 'unseen'
    //   required: true,
    },
  },
  { timestamps: true }
);

module.exports = model("seller_customer_messages", sellerCustomerMessageSchema);
