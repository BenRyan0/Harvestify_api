const { Schema, model } = require("mongoose");

const commoditySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    durationValue: {
      type: Number,
      required: true,
    },
    durationUnit: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

commoditySchema.index({
  name: "text",
});

module.exports = model("commodities", commoditySchema);
