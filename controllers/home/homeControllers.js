const categoryModel = require("../../models/categoryModel");
const listingModel = require("../../models/listingModel");
const reviewModel = require("../../models/reviewModel")
const commodityModel = require("../../models/commodityModel")
const transactionModel = require("../../models/Transaction/Transaction")
const Transaction = require("../../models/Transaction/Transaction")
const { responseReturn } = require("../../utils/response");
const queryListings = require("../../utils/queryListings")
const moment = require('moment');
const sellerModel = require("../../models/sellerModel");
const {mongo: {ObjectId}} = require('mongoose');
const authDeal = require("../../models/authDeal");

class homeControllers {

  formattedListings = (listings) => {
    const productArray = [];
    let i = 0;
  
    while (i < listings.length) {
      let temp = [];
      let j = i;
      while (j < i + 3) {
        if (listings[j]) {
          temp.push(listings[j]);
        }
        j++;
      }
      // Reverse the current chunk before pushing
      productArray.push(temp.reverse());
      i = j;
    }
  
    // Reverse the entire productArray to keep overall orientation
    return productArray
  };
  
  
  get_categories = async (req, res) => {
    try {
      const categories = await categoryModel.find({});
      responseReturn(res, 200, { categories });
    } catch (error) {
      console.log(error.message);
    }
  };


  get_listings = async (req, res) => {
    try {
      // Fetch listings, limit to 16, and sort by the creation date (most recent first)
      const allListings = await listingModel
        .find({ isAvailable: true })
        .limit(9)
        .populate({
          path: 'sellerId', // Adjust based on your actual field name
          select: 'profileImage phoneNumber rating associationloc_barangay associationloc_municipalitycity associationloc_province associationloc_street associationName memberCount sellerType' // Only get the image and rating fields from the seller
        })
        // .limit(16)
        .sort({ createdAt: -1 });

      // Fetch the latest 9 listings and format them
      const allListings1 = await listingModel
      .find({ isAvailable: true })
        .limit(9)
        .populate({
          path: 'sellerId', // Adjust based on your actual field name
          select: 'profileImage phoneNumber rating associationloc_barangay associationloc_municipalitycity associationloc_province associationloc_street associationName memberCount sellerType' // Only get the image and rating fields from the seller
        })
        .sort({ createdAt: -1 });

        const latestListings = this.formattedListings(allListings1);

        const currentDate = new Date();

        // Fetch featured listings where harvestStartDate has not passed the current date (today or future)
        const featuredListings = await listingModel
          .find({ harvestStartDate: { $gte: currentDate }, isAvailable: true  }) // Only listings with harvestStartDate >= current date
          .sort({ createdAt: -1 });

      // Fetch the top 9 listings based on seller's rating
      const topRatedListings = await listingModel
      .find({ isAvailable: true })
      .populate({
        path: 'sellerId', // Adjust based on your actual field name
        select: 'profileImage phoneNumber rating associationloc_barangay associationloc_municipalitycity associationloc_province associationloc_street associationName' // Only get the image and rating fields from the seller
      }) // Populate seller info
      .sort({ "sellerId.rating": -1 }) // Sort by seller's rating
      .limit(9);

      // Format the top-rated listings
      const formattedTopRatedListings = this.formattedListings(topRatedListings);
    //  const topRatedListings = this.formattedListings(topRatedListings_)
     

     const allListings3 = await listingModel
     .find({ isAvailable: true })
        .limit(9)
        .populate({
          path: 'sellerId', // Adjust based on your actual field name
          select: 'profileImage phoneNumber rating associationloc_barangay associationloc_municipalitycity associationloc_province associationloc_street associationName' // Only get the image and rating fields from the seller
        })
        .sort({ discount: -1 });
     
     const discounted_listings = this.formattedListings(allListings3)


      // Return all the required data
      responseReturn(res, 200, {
          allListings,
          featuredListings,
          latestListings,
          topRatedListings: formattedTopRatedListings,
          discounted_listings
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  price_range_listing = async (req, res) => {
    try {
      const priceRange = {
        low : 0,
        high : 0
      }

      const listings = await listingModel
        .find({})
        .limit(9)
        .sort({ createdAt: -1 });

        const latestListings = this.formattedListings(listings);
        const getForPrice = await listingModel.find({}).sort({'price' : 1})
        if(getForPrice.length > 0){
          priceRange.high = getForPrice[getForPrice.length - 1].price
          priceRange.low = getForPrice[0].price
        }

        responseReturn(res, 200, {latestListings, priceRange})
        // console.log(priceRange)
    } catch (error) {
      console.log(error.message)
      
    }

  }
  expected_yield_range_listing = async (req, res) => {
    try {
      const yieldRange = {
        low : 0,
        high : 0
      }

      const listings = await listingModel
        .find({})
        .limit(9)
        .sort({ createdAt: -1 });

        const latestListings = this.formattedListings(listings);
        const getForYield = await listingModel.find({}).sort({'expectedHarvestYield' : 1})
        if(getForYield .length > 0){
          yieldRange.high = getForYield[getForYield.length - 1].expectedHarvestYield
          yieldRange.low = getForYield[0].expectedHarvestYield
        }
        
        console.log(yieldRange)

        responseReturn(res, 200, {latestListings, yieldRange})
       
        // console.log(yieldRange)
    } catch (error) {
      console.log(error.message)
      
    }

  }

  query_listings = async (req, res) => {
    console.log("asdasdasdasd")
    console.log(req.query);
    console.log("_________")
    const parPage = 6;
    // const parPage = req.query.parPage
    req.query.parPage = parPage; 
    try {
        const listings = await listingModel
        .find({ isAvailable: true })
            // .find({})
            .sort({ createdAt: -1 })
            .populate("sellerId", "profileImage phoneNumber rating firstName middleName lastName memberCount sellerType");

        // Instantiate the queryListings with initial listings and query params
        const queryInstance = new queryListings(listings, req.query);
        
        // Process the queries to get the total count
        const totalListing = queryInstance.categoryQuery().searchQuery().ratingQuery().sortByPrice().countListings();

        // Process the queries to get the paginated, sorted, and filtered listings
        const resultListings = queryInstance
            .categoryQuery()
            .searchQuery()
            .ratingQuery()
            .priceQuery()
            .yieldQuery()
            .sortByPrice()
            .sortByYield()
            .skip()
            .limit()
            .getListings();

        // Populate the seller information in the result
        const result = await listingModel.populate(resultListings, {
            path: "sellerId",
            select: "profileImage phoneNumber rating firstName middleName lastName associationloc_barangay associationloc_municipalitycity associationloc_province associationloc_street memberCount sellerType"
        });

        console.log(totalListing)
        console.log(result)
        // Send the response with the result and total listing count
        responseReturn(res, 200, { listings: result, totalListing, parPage });
    } catch (error) {
        console.log(error);
        responseReturn(res, 500, { message: "An error occurred while querying listings." });
    }
};
  expected_yield_listing = async (req, res) => {
    try {
      // Fetch distinct yieldUnit values from the listings
      const yieldUnits = await listingModel.distinct("yieldUnit");
  
      // Return the yieldUnits
      responseReturn(res, 200, { yieldUnits });
    } catch (error) {
      console.log(error.message);
      responseReturn(res, 500, { message: "Error fetching yield units." });
    }
  };

  get_listing = async (req, res) => {
    const {slug} = req.params;
    console.log(slug);
    
    try {
     const listing = await listingModel.findOne({slug})
       .populate("sellerId", "profileImage phoneNumber rating firstName middleName lastName");
 
     if (!listing) {
       return responseReturn(res, 404, { error: "Listing not found" });
     }
 
     // Calculate the shipping fee for the listing
     const SHIPPING_FEE_PER_KG = 2; // Example shipping fee rate per kg
     let totalShippingFee = 0;
 
     if (listing.expectedHarvestYield > 0) {
       totalShippingFee = listing.expectedHarvestYield * SHIPPING_FEE_PER_KG;
     }
 
     // Get related listings
     const relatedListings = await listingModel.find({
       $and: [
         { _id: { $ne: listing.id } },
         { category: { $eq: listing.category } },
       ],
     })
     .populate("sellerId", "profileImage phoneNumber rating firstName middleName lastName")
     .limit(20);
 
     // Calculate the total shipping fee for related listings
     relatedListings.forEach(relatedListing => {
       if (relatedListing.expectedHarvestYield > 0) {
         relatedListing.shippingFee = relatedListing.expectedHarvestYield * SHIPPING_FEE_PER_KG;
       } else {
         relatedListing.shippingFee = 0;
       }
     });
 
     // Get more listings by the same seller
     const moreListings = await listingModel.find({
       $and: [
         { _id: { $ne: listing.id } },
         { sellerId: { $eq: listing.sellerId } },
       ],
     })
     .limit(3);
 
     // Calculate the total shipping fee for more listings
     moreListings.forEach(moreListing => {
       if (moreListing.expectedHarvestYield > 0) {
         moreListing.shippingFee = moreListing.expectedHarvestYield * SHIPPING_FEE_PER_KG;
       } else {
         moreListing.shippingFee = 0;
       }
     });
 
     // Return the response with the listing, related listings, more listings, and total shipping fee
     responseReturn(res, 200, {
       listing,
       relatedListings,
       moreListings,
       totalShippingFee, // Include total shipping fee for the listing
     });
 
     console.log(listing);
 
    } catch (error) {
     console.log(error.message);
     responseReturn(res, 500, { error: "Internal Server Error" });
    }
 };
submit_review = async (req, res) => {
  const { name, rating, review, listingId, sellerId, transactionId } = req.body;
  console.log("------------------------req.body");
  console.log(req.body);

  try {
    // Validate input
    if (!name || !rating || !review || !listingId || !sellerId || !transactionId) {
      return responseReturn(res, 400, { error: "All fields are required." });
    }

    // Ensure rating is between 1 and 5
    if (rating < 1 || rating > 5) {
      return responseReturn(res, 400, { error: "Rating must be between 1 and 5." });
    }

    // Check if the transaction exists and is completed
    const transaction = await Transaction.findById(transactionId);
    console.log("transaction")
    console.log(transaction)
    if (!transaction) {
      return responseReturn(res, 404, { error: "Transaction not found." });
    }

    console.log("01")
    // if (transaction.fullPaymentStatus !== "Confirmed") {
    //   return responseReturn(res, 400, { error: "Transaction is not completed." });
    // }

    // Ensure the transaction matches the provided listing and seller
    if (
      transaction.seller.toString() !== sellerId ||
      transaction.listingId.toString() !== listingId
    ) {
      return responseReturn(res, 400, { error: " Transaction details do not match the provided seller or listing." });
    }

    console.log("02")
    // Check if a review already exists for this transaction
    const existingReview = await reviewModel.findOne({ transactionId });
    if (existingReview) {
      return responseReturn(res, 400, { error: "You have already submitted a review for this transaction." });
    }

    console.log(transactionId)
    console.log(listingId)
    console.log(name)
    console.log(rating)
    console.log(review)
    console.log("0.3")
    // Create a new review
    const reviewId = await reviewModel.create({
      transactionId,
      listingId,
      sellerId,
      name,
      rating,
      review,
      date: moment(Date.now()).format('LL'), // Corrected moment usage
    });
    console.log("1.1")
    console.log(reviewId)

    console.log("1.0")

    // Update the transaction's buyerStep and sellerStep
    await Transaction.findByIdAndUpdate(
      transactionId,
      {
          buyerStep: 7,
          sellerStep: 7,
          reviewId : reviewId,
          review: {
              name: name,   // ✅ Corrected inside the "review" object
              rating: rating,
              review: review // Use a different variable name to avoid conflicts
          }
      },
      { new: true } // Returns the updated document
  );
  

  console.log("Transaction--------------------------------")
  console.log(Transaction)
    // Calculate total rating for the seller
    let rate = 0;
    const reviews = await reviewModel.find({ sellerId });

    // Validate reviews array
    if (!reviews || reviews.length === 0) {
      return responseReturn(res, 400, { error: "No reviews found for the seller." });
    }

    for (let i = 0; i < reviews.length; i++) {
      if (reviews[i] && typeof reviews[i].rating === "number") {
        rate += reviews[i].rating;
      } else {
        console.warn(`Invalid review object at index ${i}:`, reviews[i]);
      }
    }

    // Calculate the average rating
    let listingRating = 0;
    if (reviews.length > 0) {
      listingRating = parseFloat((rate / reviews.length).toFixed(1));
    }

    // Update the seller's rating
    await sellerModel.findByIdAndUpdate(sellerId, {
      rating: listingRating,
    });

    // Optionally update the listing's rating (if needed)
    await listingModel.findByIdAndUpdate(listingId, {
      rating: listingRating,
    });

    // Send success response
    return responseReturn(res, 201, { message: "Review Submitted" });
  } catch (error) {
    console.error("Error submitting review:", error);
    // Send error response
    return responseReturn(res, 500, { error: "An error occurred while submitting the review" });
  }
};


get_reviews = async (req, res) => {
  const { sellerId } = req.params; // Now only sellerId is needed
  let { pageNumber } = req.query;

  // Validate and parse inputs
  pageNumber = parseInt(pageNumber) || 1;
  const limit = 5;
  const skipPage = limit * (pageNumber - 1);

  // Validate MongoDB ObjectId
  if (!ObjectId.isValid(sellerId)) {
    return responseReturn(res, 400, { error: "Invalid sellerId." });
  }

  try {
    // Fetch aggregated rating data by sellerId
    const getRating = await reviewModel.aggregate([
      {
        $match: {
          sellerId: new ObjectId(sellerId),
        },
      },
      { $unwind: "$rating" },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
    ]);

    // Initialize rating review array
    const rating_review = [
      { rating: 5, sum: 0 },
      { rating: 4, sum: 0 },
      { rating: 3, sum: 0 },
      { rating: 2, sum: 0 },
      { rating: 1, sum: 0 },
    ];

    // Map ratings to counts
    if (Array.isArray(getRating) && getRating.length > 0) {
      const ratingMap = new Map(getRating.map((r) => [r._id, r.count]));
      rating_review.forEach((r) => {
        r.sum = ratingMap.get(r.rating) || 0;
      });
    }

    // Fetch all reviews for the seller
    const getAll = await reviewModel.find({ sellerId });

    // Fetch paginated reviews for the seller
    const reviews = await reviewModel
      .find({ sellerId })
      .skip(skipPage)
      .limit(limit)
      .sort({ createdAt: -1 });

    console.log(reviews);
    console.log(getAll.length);
    console.log(rating_review);

    // Send success response
    responseReturn(res, 200, {
      reviews,
      totalReview: getAll.length,
      rating_review,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error.message);

    // Send error response
    responseReturn(res, 500, {
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

get_all_Sellers = async (req, res) => {
  try {
    // Query to find active sellers
    const activeSellers = await sellerModel.find({ status: "active" }).lean();

    // Populate each seller with their listings and categories
    const sellersWithCategories = await Promise.all(
      activeSellers.map(async (seller) => {
        // Fetch all listings of this seller and extract categories
        const listings = await listingModel.find({ sellerId: seller._id }).lean();

        // Extract unique categories from the listings
        const categories = [...new Set(listings.map(listing => listing.category))];

        // Attach categories to the seller object
        seller.categories = categories;

        return seller;
      })
    );

    // Log the sellers with their categories to check if categories are included
    console.log({ sellers: sellersWithCategories });

    // Send response with sellers and their unique categories
    responseReturn(res, 200, { sellers: sellersWithCategories });
  } catch (error) {
    // Handle errors
    console.error("Error retrieving active sellers:", error);
    responseReturn(res, 500, { message: "Error retrieving active sellers" });
  }
};

get_cluster_details = async (req, res) => {
  console.log(req.params)
  let {clusterId} = req.params
  try {
    // Query to find the seller by ID
    const seller = await sellerModel.findById(clusterId).find({ status: "active" });

    // Check if seller exists
    if (!seller) {
      throw new Error("Seller not found");
    }
    const listings = await listingModel.find({ sellerId: clusterId, isAvailable: true }).sort({ createdAt: -1 });



    console.log(seller)
    responseReturn(res, 200, {seller,listings})
    // responseReturn(res, 200, {
    //   reviews,
    //   totalReview: getAll.length,
    //   rating_review,
    // });

    // return seller;
  } catch (error) {
    console.error("Error retrieving seller:", error);
    // throw error; // This will propagate the error to the calling function
  }
};



unitConversionMap = {
  'kl': 1,
  'L': 1 / 1000,
  't': 1,
  'tn': 1,
  'kg': 1 / 1000,
  'm³': 1,
  'lb': 1 / 2204.62,
  'ct': 1,
  'bx': 1
};

getUnitGroup = (unit) => {
  if (['kl', 'L', 'm³'].includes(unit)) return 'liquid';
  if (['t', 'tn', 'kg', 'lb'].includes(unit)) return 'weight';
  if (['ct', 'bx'].includes(unit)) return 'count';
  return null;
};

normalizeYield = (value, unit) => {
  return value * (this.unitConversionMap[unit] || 0);
};

convertYieldUnit = (value, fromUnit, toUnit) => {
  if (!(fromUnit in this.unitConversionMap) || !(toUnit in this.unitConversionMap)) return 0;
  return value * (this.unitConversionMap[fromUnit] / this.unitConversionMap[toUnit]);
};

calculateTotals = (listings) => {
  const result = {
    byGroup: {},
    totalPrice: 0,
  };

  for (const l of listings) {
    const { expectedHarvestYield: value, yieldUnit, price, unit: priceUnit } = l;
    if (!yieldUnit || value == null || price == null || !priceUnit) continue;

    const group = this.getUnitGroup(yieldUnit);
    if (!group) continue;

    if (!result.byGroup[group]) {
      result.byGroup[group] = {
        totalNormalized: { value: 0, unit: 't' }, // default normalized to 't'
        originalUnitTotals: {},
        totalPrice: 0,
      };
    }

    const normalized = this.normalizeYield(value, yieldUnit);
    result.byGroup[group].totalNormalized.value += normalized;

    result.byGroup[group].originalUnitTotals[yieldUnit] =
      (result.byGroup[group].originalUnitTotals[yieldUnit] || 0) + value;

    const yieldInPriceUnit = this.convertYieldUnit(value, yieldUnit, priceUnit);
    const listingTotalPrice = yieldInPriceUnit * price;

    result.byGroup[group].totalPrice += listingTotalPrice;
    result.totalPrice += listingTotalPrice;
  }

  return result;
};

getFutureDate = (baseDate, durationValue, durationUnit) => {
  const newDate = new Date(baseDate);
  switch (durationUnit) {
    case 'd': newDate.setDate(newDate.getDate() + durationValue); break;
    case 'w': newDate.setDate(newDate.getDate() + durationValue * 7); break;
    case 'm': newDate.setMonth(newDate.getMonth() + durationValue); break;
    case 'y': newDate.setFullYear(newDate.getFullYear() + durationValue); break;
    default: throw new Error(`Unknown duration unit: ${durationUnit}`);
  }
  return newDate;
};

get_seller_loss = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sellerListings = await listingModel.find({ sellerId });
    const commodityIds = [...new Set(sellerListings.map(l => l.commodityId?.toString()).filter(Boolean))];
    const commodities = await commodityModel.find({ _id: { $in: commodityIds } });

    const commodityMap = {};
    commodities.forEach(c => {
      commodityMap[c._id.toString()] = c;
    });

    const allDeals = await authDeal.find({ sellerId });
    const allDealIds = allDeals.map(deal => deal._id);
    const allTransactions = await transactionModel.find({ deal: { $in: allDealIds } });

    const expiredListings = [];
    const lossListings = [];

    for (const listing of sellerListings) {
      const { harvestEndDate, commodityId } = listing;
      if (!harvestEndDate || !commodityId) continue;

      const commodity = commodityMap[commodityId.toString()];
      if (!commodity) continue;

      const effectiveExpirationDate = this.getFutureDate(harvestEndDate, commodity.durationValue, commodity.durationUnit);
      const isExpired = today > effectiveExpirationDate;

      if (isExpired) {
        const expiredDays = Math.floor((today - effectiveExpirationDate) / (1000 * 60 * 60 * 24));
        const supposedDuration = `${commodity.durationValue}${commodity.durationUnit}`;

        const baseInfo = {
          ...listing.toObject(),
          effectiveExpirationDate,
          expiredDays,
          supposedDuration,
        };

        expiredListings.push(baseInfo);

        const dealsForListing = allDeals.filter(deal => deal.listing_?.toString() === listing._id.toString());

        if (dealsForListing.length === 0) {
          lossListings.push(baseInfo);
        } else {
          const relatedDealIds = dealsForListing.map(d => d._id.toString());
          const hasCompletedTransaction = allTransactions.some(tx =>
            relatedDealIds.includes(tx.deal.toString()) && tx.status === "Completed"
          );

          if (!hasCompletedTransaction) {
            lossListings.push(baseInfo);
          }
        }
      }
    }

    const completedTransactionDealIds = allTransactions
      .filter(tx => tx.status === "Completed")
      .map(tx => tx.deal.toString());

    const completedDeals = allDeals.filter(d => completedTransactionDealIds.includes(d._id.toString()));
    const completedListingIds = completedDeals.map(d => d.listing_);
    const soldListingsRaw = await listingModel.find({ _id: { $in: completedListingIds } });

    const soldListings = soldListingsRaw.map(l => l.toObject());

    const totalExpired = this.calculateTotals(expiredListings);
    const totalLoss = this.calculateTotals(lossListings);
    const totalSold = this.calculateTotals(soldListings);

    return res.status(200).json({
      expiredListings,
      lossListings,
      soldListings,
      totalExpectedHarvestYieldByGroupExpired: totalExpired.byGroup,
      totalPriceExpired: totalExpired.totalPrice,
      totalExpectedHarvestYieldByGroupLoss: totalLoss.byGroup,
      totalPriceLoss: totalLoss.totalPrice,
      totalExpectedHarvestYieldByGroupSold: totalSold.byGroup,
      totalPriceSold: totalSold.totalPrice,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error });
  }
};






// get_seller_loss = async (req, res) => {
//   try {
//     const { sellerId } = req.params;
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     // Fetch all listings by seller
//     const sellerListings = await listingModel.find({ sellerId });

//     // Extract unique commodityIds from listings
//     const commodityIds = [
//       ...new Set(
//         sellerListings.map((l) => l.commodityId?.toString()).filter(Boolean)
//       ),
//     ];

//     // Fetch the commodities referenced by listings
//     const commodities = await commodityModel.find({
//       _id: { $in: commodityIds },
//     });

//     // Build a map for quick commodity lookup
//     const commodityMap = {};
//     for (const commodity of commodities) {
//       commodityMap[commodity._id.toString()] = commodity;
//     }

//     // Helper: add duration to date
//     function getFutureDate(baseDate, durationValue, durationUnit) {
//       const newDate = new Date(baseDate);
//       switch (durationUnit) {
//         case "d":
//           newDate.setDate(newDate.getDate() + durationValue);
//           break;
//         case "w":
//           newDate.setDate(newDate.getDate() + durationValue * 7);
//           break;
//         case "m":
//           newDate.setMonth(newDate.getMonth() + durationValue);
//           break;
//         case "y":
//           newDate.setFullYear(newDate.getFullYear() + durationValue);
//           break;
//         default:
//           throw new Error(`Unknown duration unit: ${durationUnit}`);
//       }
//       return newDate;
//     }

//     // Fetch deals and related transactions
//     const allDeals = await authDeal.find({ sellerId });
//     const allDealIds = allDeals.map((deal) => deal._id);
//     const allTransactions = await transactionModel.find({
//       deal: { $in: allDealIds },
//     });

//     const expiredListings = [];
//     const lossListings = [];

//     for (const listing of sellerListings) {
//       const { harvestEndDate, commodityId } = listing;
//       if (!harvestEndDate || !commodityId) continue;

//       const commodity = commodityMap[commodityId.toString()];
//       if (!commodity) continue;

//       const { durationValue, durationUnit } = commodity;
//       if (typeof durationValue !== "number" || !durationUnit) continue;

//       const effectiveExpirationDate = getFutureDate(
//         harvestEndDate,
//         durationValue,
//         durationUnit
//       );
//       const isExpired = today > effectiveExpirationDate;

//       if (isExpired) {
//         const expiredDays = Math.floor(
//           (today - effectiveExpirationDate) / (1000 * 60 * 60 * 24)
//         );
//         const supposedDuration = `${durationValue}${durationUnit}`;

//         const baseInfo = {
//           ...listing.toObject(),
//           effectiveExpirationDate,
//           expiredDays,
//           supposedDuration,
//         };

//         expiredListings.push(baseInfo);

//         // Check for deals for this listing
//         const dealsForListing = allDeals.filter(
//           (deal) => deal.listing_?.toString() === listing._id.toString()
//         );

//         // If no deals at all, it's a loss
//         if (dealsForListing.length === 0) {
//           lossListings.push(baseInfo);
//           continue;
//         }

//         // If there are deals, check for completed transactions
//         const dealIds = dealsForListing.map((d) => d._id.toString());
//         const hasCompleted = allTransactions.some(
//           (tx) =>
//             dealIds.includes(tx.deal.toString()) && tx.status === "Completed"
//         );

//         if (!hasCompleted) {
//           lossListings.push(baseInfo);
//         }
//       }
//     }

//     // Get sold listings (based on completed transactions)
//     const completedDealIds = allTransactions
//       .filter((tx) => tx.status === "Completed")
//       .map((tx) => tx.deal.toString());

//     const completedDeals = allDeals.filter((deal) =>
//       completedDealIds.includes(deal._id.toString())
//     );

//     const soldListingIds = completedDeals.map((deal) => deal.listing_);
//     const soldListings = await listingModel.find({
//       _id: { $in: soldListingIds },
//     });

//     return res.status(200).json({
//       expiredListings,
//       lossListings,
//       soldListings,
//     });
//   } catch (error) {
//     console.error("Error in get_seller_loss:", error);
//     return res.status(500).json({ message: "Server error", error });
//   }
// };






// get_seller_loss = async (req, res) => {
//   try {
//     const { sellerId } = req.params;
//     const today = new Date();
//     today.setHours(0, 0, 0, 0); // Normalize to midnight

//     // Fetch all listings of seller
//     const sellerListings = await listingModel.find({ sellerId });

//     // Log any listings missing commodityId or _id early on
//     sellerListings.forEach(listing => {
//       if (!listing.commodityId) {
//         console.warn(`Listing ${listing._id ?? "(no _id)"} missing commodityId`);
//       }
//       if (!listing._id) {
//         console.warn(`Listing missing _id field`);
//       }
//     });

//     // Get unique commodity IDs safely, skip listings missing commodityId
//     const commodityIds = [...new Set(
//       sellerListings
//         .filter(l => l.commodityId)
//         .map(l => l.commodityId.toString())
//     )];

//     // Fetch commodity details for those IDs
//     const commodities = await commodityModel.find({ _id: { $in: commodityIds } });

//     // Map commodityId => commodity document for quick lookup
//     const commodityMap = {};
//     commodities.forEach(c => {
//       if (c._id) {
//         commodityMap[c._id.toString()] = c;
//       }
//     });

//     // Helper to calculate date in past by durationValue + durationUnit
//     function getPastDate(durationValue, durationUnit) {
//       const date = new Date(today);
//       switch (durationUnit) {
//         case 'd':
//           date.setDate(date.getDate() - durationValue);
//           break;
//         case 'w':
//           date.setDate(date.getDate() - durationValue * 7);
//           break;
//         case 'm':
//           date.setMonth(date.getMonth() - durationValue);
//           break;
//         case 'y':
//           date.setFullYear(date.getFullYear() - durationValue);
//           break;
//         default:
//           throw new Error(`Unknown duration unit: ${durationUnit}`);
//       }
//       return date;
//     }

//     // Fetch all deals for the seller (optimization)
//     const allDeals = await authDeal.find({ sellerId });

//     // Log deals missing listing_ or _id
//     allDeals.forEach(deal => {
//       if (!deal.listing_) {
//         console.warn(`Deal ${deal._id ?? "(no _id)"} missing listing_ field`);
//       }
//     });

//     let expiredListings = [];
//     let lossListings = [];

//     for (const listing of sellerListings) {
//       if (!listing.commodityId) continue; // Skip if no commodityId

//       const commodity = commodityMap[listing.commodityId.toString()];
//       if (!commodity) {
//         console.warn(`Commodity not found for listing ${listing._id}`);
//         continue;
//       }

//       if (!listing.harvestEndDate) {
//         console.warn(`Listing ${listing._id} missing harvestEndDate`);
//         continue;
//       }

//       const expirationThreshold = getPastDate(commodity.durationValue, commodity.durationUnit);

//       // Check if listing is expired relative to its commodity duration
//       if (listing.harvestEndDate <= expirationThreshold) {
//         expiredListings.push(listing);

//         // Find deals related to this listing safely
//         const dealsForListing = allDeals.filter(deal => {
//           if (!deal.listing_ || !listing._id) return false;
//           return deal.listing_.toString() === listing._id.toString();
//         });

//         // If no deals or no completed deals, mark as loss
//         if (dealsForListing.length === 0) {
//           lossListings.push(listing);
//         } else {
//           const hasCompleted = dealsForListing.some(d => d.shipPickUpStatus === "completed");
//           if (!hasCompleted) {
//             lossListings.push(listing);
//           }
//         }
//       }
//     }

//     // Sold listings: listings with completed deals
//     const soldListingsDeals = allDeals.filter(deal => deal.shipPickUpStatus === "completed");
//     const soldListingsIds = soldListingsDeals.map(deal => deal.listing_);
//     const soldListings = await listingModel.find({ _id: { $in: soldListingsIds } });

//     return res.status(200).json({
//       expiredListings,
//       lossListings,
//       soldListings,
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Server error", error });
//   }
// };













}

module.exports = new homeControllers();
