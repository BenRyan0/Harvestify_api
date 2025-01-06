const { Schema, model } = require("mongoose");

const sellerSchema = new Schema(
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
      required: true
    },
    profileImage: {
      type: String,
      required: true
    },
    associationImage: {
      type: String,
      required: true
    },
    associationName: {
      type: String,
      required: true
    },
    associationloc_barangay: {
      type: String,
      required: true
    },
    associationloc_municipalitycity: {
      type: String,
      required: true
    },
    associationloc_province: {
      type: String,
      required: true
    },
    associationloc_street: {
      type: String,
      required: true
    },
    credential_img01:{
      type: String,
      required: true,
    },
    credential_img02:{
      type: String,
      required: true,
    },
    credential_img03:{
      type: String,
      required: true,
    },
    validId_img:{
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
      default: "pending",
    },
    payment: {
      type: String,
      default: "inactive",
    },
    rating:{
      type: Number,
      default: 0

    },
    clusterInfo: {
      type: Object,
      default: {}
  }
  },
  { timestamps: true }
);
// Define text index
// sellerSchema.index({ name: 'text', description: 'text' });

sellerSchema.index(
  {
    firstName: 'text',
    middleName: 'text',
    lastName: 'text',
    email: 'text',
    associationName: 'text',
  },
  {
    weights: {
     
      firstName: 6,
      lastName: 5,
      email: 4,
      middleName: 3,
      associationName: 2,
     
    },
  })
module.exports = model("sellers", sellerSchema);
