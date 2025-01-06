const { Schema, model } = require("mongoose");

// Define the schema
const traderSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true, // Remove leading/trailing whitespace
    },
    email: {
      type: String,
      required: true,
      unique: true, // Ensure unique email for each trader
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"], // Validate email format
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      match: [/^\d{10,15}$/, "Please enter a valid phone number"], // Validate phone format
    },
    password: {
      type: String,
      required: true,
      select: false, // Exclude password by default in queries
    },
    method: {
      type: String,
      enum: ["manual", "oauth"], // Restrict to predefined methods
      default: "manual",
    },
    status: {
      type: String,
      enum: ["pending", "active", "inactive"], // Restrict status values
      default: "pending",
    },
  },
  { timestamps: true } // Automatically add createdAt and updatedAt fields
);

// Add text index for search functionality
traderSchema.index({
  name: "text",
  email: "text",
  phone: "text",
});

// Export the model
module.exports = model("traders", traderSchema);
