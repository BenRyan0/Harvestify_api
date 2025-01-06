const { Schema, model } = require("mongoose");

const additionalFeatureSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    }
  },
  { timestamps: true }
);

additionalFeatureSchema.index({
  name: "text",
  description: "text",
});

module.exports = model("additionalFeatures", additionalFeatureSchema);
