const { Schema, model } = require("mongoose");
const Listing = require("../models/listingModel"); // Import your Listing model

const sellerSchema = new Schema(
  {
    name: {
      type: String,
      // required: true,
    },
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
    // credential_img03: {
    //   type: String,
    //   required: true,
    // },
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
    sellerType: {
      type: String,
      enum: ["cluster", "association", "individual"],
      required: true,
    },
    memberCount:{
      type: Number,
      default: 1
    }
   
  },
  { timestamps: true }
);

// Middleware to handle listings availability when seller status changes
sellerSchema.pre("save", async function (next) {
  // Check if the status has been modified
  if (this.isModified("status")) {
    const newStatus = this.status;

    // If the seller's status is not active, update their listings
    if (newStatus !== "active") {
      await Listing.updateMany(
        { sellerId: this._id }, // Find listings by this seller
        { isAvailable: false }  // Set isAvailable to false
      );
    } else {
      // Optionally, re-activate listings if the seller is re-activated
      await Listing.updateMany(
        { sellerId: this._id },
        { isAvailable: true }
      );
    }
  }

  next();
});

sellerSchema.index(
  {
    firstName: "text",
    middleName: "text",
    lastName: "text",
    email: "text",
    associationName: "text",
    name: "text",
  },
  {
    weights: {
      name: 7,
      firstName: 6,
      lastName: 5,
      email: 4,
      middleName: 3,
      associationName: 2,
    },
  }
);

module.exports = model("sellers", sellerSchema);
