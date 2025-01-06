const { Schema, model } = require("mongoose");

const traderSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    method: {
        type: String,
        default: "manual",
      },
    status: {
        type: String,
        default: "pending",
      },

  },
  { timestamps: true }
);

module.exports = model("traders", traderSchema);
