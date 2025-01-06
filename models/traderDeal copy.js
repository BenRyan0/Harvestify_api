const { Schema, model } = require("mongoose");

const traderDeal = new Schema({
    traderId: {
        type: Schema.ObjectId,
        required: true
    },
    listing: {
        type: Array,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    shipping_fee: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        required: true
    },
    shippingInfo: {
        type: Object,
        required: true
    },
    // shippingChoice: {
    //     type: String,
    //     required: true
    // },
    shipPickUpStatus: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    shippingMethod: {
        type: String,
        required: true
    },
    mapsLink: {
        type: String,
    },
    shipping_distance: { type: Number },
  
  
    
},{timestamps: true});

module.exports = model("traderDeals", traderDeal);
