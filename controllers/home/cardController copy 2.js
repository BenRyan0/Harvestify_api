const cardModel = require('../../models/cardModel');
const listingModel = require('../../models/listingModel');
const { responseReturn } = require('../../utils/response');
const { mongo: { ObjectId } } = require('mongoose');

class cardController {
    add_to_card = async (req, res) => {
        const { userId, listingId, quantity } = req.body;
        try {
            const existingListing = await cardModel.findOne({
                $and: [
                    { listingId: { $eq: listingId } },
                    { userId: { $eq: userId } },
                ],
            });

            if (existingListing) {
                responseReturn(res, 404, { error: "Listing Already Added to Card" });
            } else {
                const listing = await cardModel.create({
                    userId,
                    listingId,
                    quantity,
                });
                responseReturn(res, 201, { message: 'Listing Has Been Successfully Added', listing });
            }
        } catch (error) {
            console.error(error.message);
            responseReturn(res, 500, { error: "Internal Server Error" });
        }
    };

    // get_card_listings = async (req, res) => {
    //     const { userId } = req.params;
    //     const COMMISSION_RATE = 5; // Example: 5% commission
    //     const SHIPPING_FEE_PER_SELLER = 86; // Example: 86 units shipping fee per seller

    //     // Validate userId
    //     if (!ObjectId.isValid(userId)) {
    //         return responseReturn(res, 400, { error: "Invalid User ID" });
    //     }

    //     try {
    //         // Fetch card listings with related listing details
    //         const cardListings = await cardModel.aggregate([
    //             { $match: { userId: new ObjectId(userId) } },
    //             {
    //                 $lookup: {
    //                     from: 'listings',
    //                     localField: 'listingId',
    //                     foreignField: '_id',
    //                     as: 'listings',
    //                 },
    //             },
    //         ]);

    //         const unavailableListings = [];
    //         const availableListings = [];
    //         let totalPrice = 0;
    //         let totalItemCount = 0;

    //         // Separate available and unavailable listings
    //         cardListings.forEach(card => {
    //             const listing = card.listings[0]; // Assuming `lookup` returns a single listing
    //             if (!listing || listing.stock < card.quantity) {
    //                 unavailableListings.push(card);
    //             } else {
    //                 const discountedPrice = this.calculateDiscountedPrice(listing.totalPrice, listing.discount);
    //                 const finalPrice = discountedPrice - Math.floor((discountedPrice * COMMISSION_RATE) / 100);
    //                 availableListings.push({ ...card, finalPrice });
    //                 totalPrice += finalPrice * card.quantity;
    //                 totalItemCount += card.quantity;
    //             }
    //         });

    //         // Group listings by seller
    //         const groupedBySeller = availableListings.reduce((acc, card) => {
    //             const sellerId = card.listings[0].sellerId.toString();
    //             const listingData = {
    //                 _id: card._id,
    //                 quantity: card.quantity,
    //                 listingInfo: card.listings[0],
    //             };

    //             if (!acc[sellerId]) {
    //                 acc[sellerId] = {
    //                     sellerId,
    //                     clusterName: card.listings[0].clusterName,
    //                     totalPrice: card.finalPrice * card.quantity,
    //                     listings: [listingData],
    //                 };
    //             } else {
    //                 acc[sellerId].totalPrice += card.finalPrice * card.quantity;
    //                 acc[sellerId].listings.push(listingData);
    //             }

    //             return acc;
    //         }, {});

    //         const groupedListings = Object.values(groupedBySeller);

    //         // Return the response
    //         responseReturn(res, 200, {
    //             card_listings: groupedListings,
    //             price: totalPrice,
    //             card_listings_count: totalItemCount,
    //             shipping_fee: SHIPPING_FEE_PER_SELLER * groupedListings.length,
    //             unAvailableListings: unavailableListings,
    //         });
    //     } catch (error) {
    //         console.error(error.message);
    //         responseReturn(res, 500, { error: "Internal Server Error" });
    //     }
    // };

    // calculateDiscountedPrice = (price, discount) =>
    //     discount ? price - Math.floor((price * discount) / 100) : price;
// }


get_card_listings = async (req, res) => {
    
    const { userId } = req.params;
    const COMMISSION_RATE = 5; // Example: 5% commission
    const SHIPPING_FEE_PER_SELLER = 86; // Example: 86 units shipping fee per seller
    

    // Validate userId
    if (!ObjectId.isValid(userId)) {
        return responseReturn(res, 400, { error: "Invalid User ID" });
    }

    try {
        // Fetch card listings with related listing and seller details
        const cardListings = await cardModel.aggregate([
            { $match: { userId: new ObjectId(userId) } },
            {
                $lookup: {
                    from: 'listings',
                    localField: 'listingId',
                    foreignField: '_id',
                    as: 'listings',
                },
            },
            { $unwind: '$listings' }, // Unwind listings for easier processing
            {
                $lookup: {
                    from: 'sellers',
                    localField: 'listings.sellerId',
                    foreignField: '_id',
                    as: 'seller',
                },
            },
            { $unwind: '$seller' }, // Unwind seller to get direct fields
        ]);

        const unavailableListings = [];
        const availableListings = [];
        let totalPrice = 0;
        let totalItemCount = 0;

        // non GPT
        let buy_listing_item = 0;

        

        // Separate available and unavailable listings
        cardListings.forEach(card => {
            const { listings: listing, seller } = card;
            // Add seller details to the listing object
            if (listing && seller) {
                // Normalize expected harvest yield
                const normalizedYield = normalizeYield(
                    listing.expectedHarvestYield,
                    listing.yieldUnit,
                    unitConversionFactors
                );
        
                // Calculate shipping fee if normalizedYield is valid
                if (normalizedYield > 0) {
                    listing.shippingFee = listing.price / normalizedYield;
                } else {
                    listing.shippingFee = 0; // Handle division by zero or invalid yield
                }
        
                // Add seller details to listing
                listing.firstName = seller.firstName;
                listing.lastName = seller.lastName;
            }
        
            if (!listing || listing.stock < card.quantity) {
                unavailableListings.push(card);
            } else {
                // Calculate discounted price and add to available listings
                const discountedPrice = this.calculateDiscountedPrice(listing.totalPrice, listing.discount);
                const finalPrice = discountedPrice - Math.floor((discountedPrice * COMMISSION_RATE) / 100);
                availableListings.push({ ...card, finalPrice });
                totalPrice += finalPrice * card.quantity;
                totalItemCount += card.quantity;
                buy_listing_item = buy_listing_item + card.quantity
            }
            });
        // Group listings by seller
        const groupedBySeller = availableListings.reduce((acc, card) => {
            const sellerId = card.seller._id.toString();
            const listingData = {
                _id: card._id,
                quantity: card.quantity,
                listingInfo: card.listings,
            };

            if (!acc[sellerId]) {
                acc[sellerId] = {
                    sellerId,
                    clusterName: card.listings.clusterName,
                    rating: card.seller.rating, // Add seller's rating
                    sellerName: card.seller.firstName + " " + card.seller.lastName, // Add seller's rating
                    totalPrice: card.finalPrice * card.quantity,
                    listings: [listingData],
                };
            } else {
                acc[sellerId].totalPrice += card.finalPrice * card.quantity;
                acc[sellerId].listings.push(listingData);
            }

            return acc;
        }, {});

        const groupedListings = Object.values(groupedBySeller);

        console.log(unavailableListings)
        // Return the response
        responseReturn(res, 200, {
            card_listings: groupedListings,
            price: totalPrice,
            card_listings_count: totalItemCount,
            shipping_fee: SHIPPING_FEE_PER_SELLER * groupedListings.length,
            unAvailableListings: unavailableListings,
            buy_listing_item:buy_listing_item
        });
    } catch (error) {
        console.error(error.message);
        responseReturn(res, 500, { error: "Internal Server Error" });
    }
};

calculateDiscountedPrice = (price, discount) =>
    discount ? price - Math.floor((price * discount) / 100) : price;
}

module.exports = new cardController();
