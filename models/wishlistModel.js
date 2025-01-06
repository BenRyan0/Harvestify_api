const { Schema, model } = require("mongoose");

const wishListSchema = new Schema({
    // userId: {
    //     type: Schema.ObjectId,
    //     required: true
    // },
    // listingId: {
    //     type: Schema.ObjectId,
    //     required: true
    // },
    userId: {
        type: String,
        required: true
    },
    listingId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        required: true
    },
 
    
},{timestamps: true});

module.exports = model("wishLists", wishListSchema);
