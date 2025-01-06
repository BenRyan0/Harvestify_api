const cardModel = require('../../models/cardModel');
const  wishListModel = require('../../models/wishlistModel');
const listingModel = require('../../models/listingModel');
const { responseReturn } = require('../../utils/response');
const { mongo: { ObjectId } } = require('mongoose');
const wishlistModel = require('../../models/wishlistModel');

// Conversion factors to convert units to kilograms (kg)
const unitConversionFactors = {
    t: 1000,       // Metric ton to kg
    tn: 1000,      // Short ton to kg
    lb: 0.45359237, // Pound to kg
    kg: 1,         // Kilogram to kg
    L: 1,          // Liter
    "m³": 1000,    // Cubic meter to liters
    ct: 1,         // Count (unitless)
    bx: 1          // Box (unitless)
};

// Function to normalize yield based on units
const normalizeYield = (harvestYield, yieldUnit, conversionFactors) => {
    return harvestYield * (conversionFactors[yieldUnit] || 1); // Default to 1 if unit not found
};

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

    get_card_listings = async (req, res) => {
        const { userId } = req.params;
        const COMMISSION_RATE = 0; // Example: 5% commission
        const SHIPPING_FEE_PER_KG = 2; // Example: 2 per kg (shipping fee rate)

        // Validate userId
        if (!ObjectId.isValid(userId)) {
            return responseReturn(res, 400, { error: "Invalid User ID" });
        }

        try {
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
                { $unwind: '$listings' },
                {
                    $lookup: {
                        from: 'sellers',
                        localField: 'listings.sellerId',
                        foreignField: '_id',
                        as: 'seller',
                    },
                },
                { $unwind: '$seller' },
            ]);

            const unavailableListings = [];
            const availableListings = [];
            let totalPrice = 0;
            let totalShippingFee = 0;
            let totalItemCount = 0;
            let buy_listing_item = 0

            // Separate available and unavailable listings
            cardListings.forEach(card => {
                const { listings: listing, seller } = card;

                if (listing && seller) {
                    // Normalize expected harvest yield and calculate shipping fee
                    const normalizedYield = normalizeYield(
                        listing.expectedHarvestYield,
                        listing.yieldUnit,
                        unitConversionFactors
                    );

                    // Calculate shipping fee: multiply normalized yield by the shipping fee per kg
                    if (normalizedYield > 0) {
                        listing.shippingFee = normalizedYield * SHIPPING_FEE_PER_KG; // Shipping fee = Yield * Shipping Fee per kg
                    } else {
                        listing.shippingFee = 0; // Handle invalid yield (e.g., zero or negative)
                    }

                    // Add seller details to listing
                    listing.firstName = seller.firstName;
                    listing.lastName = seller.lastName;

                    // Add the computed shipping fee to the listingInfo of that listing
                    listing.listingInfo = {
                        ...listing.listingInfo, // Preserve other listing info
                        shippingFee: listing.shippingFee, // Add the shipping fee here
                    };
                }

                if (!listing || listing.stock < card.quantity) {
                    unavailableListings.push(card);
                } else {
                    // Apply discount first before adding totalPrice
                    const discountedPrice = this.calculateDiscountedPrice(listing.totalPrice, listing.discount);
                    availableListings.push({ ...card, discountedPrice });
                    totalPrice += discountedPrice * card.quantity; // Add the discounted price to the total
                    totalShippingFee += listing.shippingFee * card.quantity; // Add the shipping fee to the total
                    totalItemCount += card.quantity;
                    buy_listing_item = buy_listing_item + card.quantity
                }
            });

            // Apply commission to total price after discount has been applied
            totalPrice -= Math.floor((totalPrice * COMMISSION_RATE) / 100); // Apply commission to the totalPrice

            // Group listings by seller and sum up the totalPrice and shipping fee for each seller
            const groupedBySeller = availableListings.reduce((acc, card) => {
                const sellerId = card.seller._id.toString();
                const listingData = {
                    _id: card._id,
                    quantity: card.quantity,
                    listingInfo: card.listings, // The listing info now includes shipping fee
                };

                const totalListingPrice = card.discountedPrice * card.quantity;
                const totalListingShippingFee = card.listings.shippingFee * card.quantity;

                if (!acc[sellerId]) {
                    acc[sellerId] = {
                        sellerId,
                        clusterName: card.listings.clusterName,
                        rating: card.seller.rating,
                        sellerName: `${card.seller.firstName} ${card.seller.lastName}`,
                        listings: [listingData],
                        totalPrice: totalListingPrice,
                        totalShippingFee: totalListingShippingFee,
                    };
                } else {
                    acc[sellerId].totalPrice += totalListingPrice;
                    acc[sellerId].totalShippingFee += totalListingShippingFee;
                    acc[sellerId].listings.push(listingData);
                }

                return acc;
            }, {});

            const groupedListings = Object.values(groupedBySeller);

            // Return the response with grouped listings, total price, and total shipping fee
            responseReturn(res, 200, {
                card_listings: groupedListings,
                price: totalPrice, // This now reflects the correct total price after discount and commission
                totalShippingFee: totalShippingFee, // This reflects the total shipping fee for all listings
                card_listings_count: totalItemCount,
                unAvailableListings: unavailableListings,
                buy_listing_item:buy_listing_item
            });
        } catch (error) {
            console.error(error.message);
            responseReturn(res, 500, { error: "Internal Server Error" });
        }
    };

    // Helper function to calculate discounted price
    calculateDiscountedPrice = (price, discount) => {
        return discount ? price - Math.floor((price * discount) / 100) : price;
    };

    delete_card_listings = async (req, res) => {
       const {card_id} = req.params;
       try {
         await cardModel.findByIdAndDelete(card_id);
         responseReturn(res, 200, {
            message: 'Listing Removed'
         })
       } catch (error) {
        
       }
    }

    add_to_wishlist = async (req, res) => {
        const {slug} = req.body

        try {
            const listing = await wishListModel.findOne({slug})
            if(listing){
                responseReturn(res, 404, {error: 'Listing Already Added'})

            }else{
                await wishListModel.create(req.body)
                responseReturn(res, 201,{message : 'Listing Successfully Added to Wishlist'})
            }
        } catch (error) {
            console.log(error.message)
        }
    };

    
    
    
    

    // get_wishlist_listings = async (req, res) => {
    //     const { userId } = req.params; // Extract the userId from the request parameters
    //     console.log(userId);
    
    //     try {
    //         // Fetch wishlists for the user and populate the listing details
    //         const wishlists = await wishlistModel
    //             .find({ userId })
    //             .populate({
    //                 path: 'listingId', // Field to populate (reference to listings)
    //                 model: 'listings', // Target model to populate from
    //             });
    
    //         // Return the response including wishlist count and detailed listings
    //         responseReturn(res, 200, {
    //             wishlistCount: wishlists.length,
    //             wishlists, // Includes populated listing details
    //         });
    //     } catch (error) {
    //         console.error(error.message);
    
    //         // Return an error response with appropriate status code and message
    //         responseReturn(res, 500, {
    //             message: "Failed to retrieve wishlists",
    //             error: error.message,
    //         });
    //     }
    // };
    



    // get_wishlist_listings = async (req, res) => {
    //     const {userId} = req.params;
    //     console.log(userId)
        
        
    //     try {
    //         // const wishlistCount = await wishlistModel.find({userId}).countDocuments()
    //         const wishlists = await wishlistModel.find({userId})
    //         responseReturn(res, 200,{wishlistCount:wishlists.length , wishlists})
            
    //     } catch (error) {
    //         console.log(error.message)          
    //     }
    // };

    get_wishlist_listings = async (req, res) => {
        const { userId } = req.params;
      
        try {
          // Fetch wishlists with full listing and seller details
          const wishlists = await wishlistModel
            .find({ userId })
            .populate({
              path: "listingId",
              model: "listings",
              populate: {
                path: "sellerId",
                model: "sellers",
              },
            });
      
            console.log(wishlists)
          // Return the response with the wishlist count and populated wishlists
          responseReturn(res, 200, { wishlistCount: wishlists.length, wishlists });
        } catch (error) {
          console.error("Error fetching wishlist listings:", error.message);
          responseReturn(res, 500, { error: "Failed to fetch wishlist listings." });
        }
      };

      
      remove_wishlist_listings = async (req, res) => {
        const {wishlist_id} = req.params;
        console.log(wishlist_id)
        try {
        //   await cardModel.findByIdAndDelete(card_id);
          await wishListModel.findByIdAndDelete(wishlist_id);
          responseReturn(res, 200, {
             message: 'Wishlist Removed',
             wishlist_id
          })
        } catch (error) {
         console.log(error.message)
        }
     }
 
}

module.exports = new cardController();
