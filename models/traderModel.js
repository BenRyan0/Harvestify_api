const { Schema, model } = require("mongoose");

// Define the schema
const traderSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    middleName: {
      type: String,
      required: false,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    sex: {
      type: String,
      required: true,
    },
    birthDate: {
      type: Date,
      required: true,
    },
    profileImage: {
      type: String,
      required: true,
    },
    associationImage: {
      type: String,
      required: true,
    },
    associationName: {
      type: String,
      required: true,
    },
    associationloc_barangay: {
      type: String,
      required: true,
    },
    associationloc_municipalitycity: {
      type: String,
      required: true,
    },
    associationloc_province: {
      type: String,
      required: true,
    },
    associationloc_street: {
      type: String,
      required: true,
    },
    credential_img01: {
      type: String,
      required: true,
    },
    credential_img02: {
      type: String,
      required: true,
    },
    validId_img: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      default: "seller",
    },
    status: {
      type: String,
      default: "pending", // Possible values: "active", "inactive", "pending"
    },
    payment: {
      type: String,
      default: "inactive",
    },
    rating: {
      type: Number,
      default: 0,
    },
    clusterInfo: {
      type: Object,
      default: {},
    },
   
  },
  { timestamps: true }
);

// Add text index for search functionality
traderSchema.index({
  firstName: "text",
  lastName: "text",
  middleName: "text",
  email: "text",
  phone: "text",
});

// Export the model
module.exports = model("traders", traderSchema);
