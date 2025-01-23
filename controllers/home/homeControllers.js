const categoryModel = require("../../models/categoryModel");
const listingModel = require("../../models/listingModel");
const reviewModel = require("../../models/reviewModel")
const Transaction = require("../../models/Transaction/Transaction")
const { responseReturn } = require("../../utils/response");
const queryListings = require("../../utils/queryListings")
const moment = require('moment');
const sellerModel = require("../../models/sellerModel");
const {mongo: {ObjectId}} = require('mongoose')

class homeControllers {
  // formattedListings = (listings) => {
  //   const productArray = [];
  //   let i = 0;
  //   while (i < listings.length) {
  //     let temp = [];
  //     let j = i;
  //     while (j < i + 3) {
  //       if (listings[j]) {
  //         temp.push(listings[j]);
  //       }
  //       j++;
  //     }
  //     productArray.push([...temp]);
  //     i = j;
  //   }
  //   return productArray;
  // };
  // formattedListings = (listings) => {
  //   const productArray = [];
  //   let i = 0;
  
  //   // Reverse the listings array to start with the latest first
  //   listings = listings.reverse();
  
  //   while (i < listings.length) {
  //     let temp = [];
  //     let j = i;
  //     while (j < i + 3) {
  //       if (listings[j]) {
  //         temp.push(listings[j]);
  //       }
  //       j++;
  //     }
  //     productArray.push([...temp]);
  //     i = j;
  //   }
  //   return productArray;
  // };

  // formattedListings = (listings) => {
  //   const productArray = [];
  //   let i = 0;
  
  //   // Process the listings in their original order (no reverse)
  //   while (i < listings.length) {
  //     let temp = [];
  //     let j = i;
  //     while (j < i + 3) {
  //       if (listings[j]) {
  //         temp.push(listings[j]);
  //       }
  //       j++;
  //     }
  //     productArray.push([...temp]);
  //     i = j;
  //   }
  
  //   return productArray;
  // };
  
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
          select: 'profileImage phoneNumber rating associationloc_barangay associationloc_municipalitycity associationloc_province associationloc_street associationName' // Only get the image and rating fields from the seller
        })
        // .limit(16)
        .sort({ createdAt: -1 });

      // Fetch the latest 9 listings and format them
      const allListings1 = await listingModel
      .find({ isAvailable: true })
        .limit(9)
        .populate({
          path: 'sellerId', // Adjust based on your actual field name
          select: 'profileImage phoneNumber rating associationloc_barangay associationloc_municipalitycity associationloc_province associationloc_street associationName' // Only get the image and rating fields from the seller
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
  // expected_yield_range_listing = async (req, res) => {
  //   try {
  //     const yieldRange = {
  //       low: 0,
  //       high: 0
  //     };
  
  //     // Fetch the latest 9 listings sorted by creation date
  //     const listings = await listingModel
  //       .find({})
  //       .limit(9)
  //       .sort({ createdAt: -1 });
  
  //     // Format the listings
  //     const latestListings = this.formattedListings(listings);
  
  //     // Get listings sorted by expectedHarvestYield to determine the yield range
  //     const getForYield = await listingModel.find({}).sort({ 'expectedHarvestYield': 1 });
      
  //     if (getForYield.length > 0) {
  //       yieldRange.low = getForYield[0].expectedHarvestYield;
  //       yieldRange.high = getForYield[getForYield.length - 1].expectedHarvestYield;
  //     }
  
  //     // Log the calculated yield range for debugging
  //     console.log(yieldRange);
  
  //     // Return the response with the formatted listings and yield range
  //     responseReturn(res, 200, { latestListings, yieldRange });
  //   } catch (error) {
  //     console.log(error.message);
  //     responseReturn(res, 500, { message: "An error occurred while fetching yield range." });
  //   }
  // };
  
  query_listings = async (req, res) => {
    console.log("asdasdasdasd")
    console.log(req.query);
    console.log("_________")
    const parPage = 6;
    // const parPage = req.query.parPage
    req.query.parPage = parPage; 
    try {
        const listings = await listingModel
            .find({})
            .sort({ createdAt: -1 })
            .populate("sellerId", "profileImage phoneNumber rating firstName middleName lastName");

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
            select: "profileImage phoneNumber rating firstName middleName lastName associationloc_barangay associationloc_municipalitycity associationloc_province associationloc_street"
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



  // get_listing = async (req, res) => {
  //  const {slug} = req.params;
  //  console.log(slug)
  //  try {
  //   const listing = await listingModel.findOne({slug}).populate("sellerId", "profileImage phoneNumber rating firstName middleName lastName")
  //   const relatedListings = await listingModel.find({
  //     $and : [
  //       {
  //           _id : {
  //             $ne: listing.id
  //           }
  //       },
  //       {
  //           category : {
  //             $eq : listing.category
  //           }
  //       }
  //     ]
  //   })
  //   .populate("sellerId", "profileImage phoneNumber rating firstName middleName lastName")
  //   .limit(20)

  //   const moreListings = await listingModel.find({

  //     $and : [
  //       {
  //           _id : {
  //             $ne: listing.id
  //           }
  //       },
  //       {
  //           sellerId : {
  //             $eq : listing.sellerId
  //           }
  //       }
  //     ]

  //   }).limit(3)

  //   responseReturn(res, 200,{
  //     listing,
  //     relatedListings,
  //     moreListings
  //   } )
  //    console.log(listing)
    
  //  } catch (error) {
  //   console.log(error.message)
  //  }
  // };

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


//  submit_review = async(req, res) =>{
//   console.log(req.body)
//   const {name, rating, review, listingId, sellerId} =req.body


//   try {
//     await reviewModel.create({
//       listingId,
//       sellerId,
//       name,
//       rating,
//       review,
//       date: moment(Date.now()).format('LL') // Fix incorrect moment usage
//     })

//     let rate = 0;
//     const reviews = await reviewModel.find({sellerId});


//     for(let i = 0; i<review.length; i++){
//       rate = rate + reviews[i].rating
//     }

//     let listingRating = 0;

//     if(reviews.length !== 0){
//       listingRating = (rate/reviews.length).toFixed(1)
//     }

//     await sellerModel.findByIdAndUpdate(sellerId, {
//       rating: listingRating
//     });
//     // await listingModel.findByIdAndUpdate(listingId, {
//     //   rating: listingRating
//     // })

//     responseReturn(res, 201, {message: "Review Submitted"})
//   } catch (error) {
//     console.log(error.message)
//   }
//  }
//  submit_review = async(req, res) =>{
//   const {name, rating, review, listingId, sellerId} =req.body


//   try {
//     await reviewModel.create({
//       listingId,
//       sellerId,
//       name,
//       rating,
//       review,
//       date: moment(Date.now().format('LL'))
//     })

//     let rate = 0;
//     const reviews = await reviewModel.find({listingId});


//     for(let i = 0; i<review.length; i++){
//       rate = rate + reviews[i].rating
//     }

//     let listingRating = 0;

//     if(reviews.length !== 0){
//       listingRating = (rate/reviews.length).toFixed(1)
//     }

//     await listingModel.findByIdAndUpdate(listingId, {
//       rating: listingRating
//     })

//     responseReturn(res, 201, {message: "Review Submitted"})
//   } catch (error) {
    
//   }
//  }
 

// submit_review = async (req, res) => {
//   const { name, rating, review, listingId, sellerId } = req.body;

//   try {
//     // Create a new review
//     await reviewModel.create({
//       listingId,
//       sellerId,
//       name,
//       rating,
//       review,
//       date: moment(Date.now()).format('LL'), // Corrected moment usage
//     });

//     let rate = 0;

//     // Fetch all reviews for the seller
//     const reviews = await reviewModel.find({ sellerId });

//     // Debugging: Check if reviews array is valid
//     if (!reviews || reviews.length === 0) {
//       throw new Error("No reviews found for the seller");
//     }

//     // Calculate total rating with validation
//     for (let i = 0; i < reviews.length; i++) {
//       if (reviews[i] && typeof reviews[i].rating === "number") {
//         rate += reviews[i].rating;
//       } else {
//         console.warn(`Invalid review object at index ${i}:`, reviews[i]);
//       }
//     }

//     let listingRating = 0;

//     // Avoid division by zero
//     if (reviews.length > 0) {
//       listingRating = parseFloat((rate / reviews.length).toFixed(1)); // Ensure it's a number
//     }

//     // Update seller's rating
//     await sellerModel.findByIdAndUpdate(sellerId, {
//       rating: listingRating,
//     });

//     // Uncomment if you need to update the listing's rating
//     await listingModel.findByIdAndUpdate(listingId, {
//       rating: listingRating,
//     });

//     // Send success response
//     responseReturn(res, 201, { message: "Review Submitted" });
//   } catch (error) {
//     console.error("Error submitting review:", error.message);

//     // Send error response
//     res.status(500).json({ error: "An error occurred while submitting the review" });
//   }
// };


// submit_review = async (req, res) => {
//   const { name, rating, review, listingId, sellerId, transactionId } = req.body;
//   console.log(req.body)

//   try {
//     // Validate input
//     if (!name || !rating || !review || !listingId || !sellerId || !transactionId) {
//       return res.status(400).json({ error: "All fields are required." });
//     }

//     // Ensure rating is between 1 and 5
//     if (rating < 1 || rating > 5) {
//       return res.status(400).json({ error: "Rating must be between 1 and 5." });
//     }

//     // Check if the transaction is completed
//     const transaction = await Transaction.findById(transactionId);
//     console.log("03")
//     if (!transaction) {
//       return res.status(404).json({ error: "Transaction not found." });
//     }

//     if (transaction.fullPaymentStatus !== "Confirmed") {
//       return res.status(400).json({ error: "Transaction is not completed." });
//     }

//     // Ensure transaction matches the provided listing and seller
//     if (
//       transaction.sellerId.toString() !== sellerId ||
//       transaction.listingId.toString() !== listingId
//     ) {
//       return res.status(400).json({
//         error: "Transaction details do not match the provided seller or listing.",
//       });
//     }

//     // Create a new review
//     await reviewModel.create({
//       transactionId,
//       listingId,
//       sellerId,
//       name,
//       rating,
//       review,
//       date: moment(Date.now()).format('LL'), // Corrected moment usage
//     });

//     // Calculate total rating for the seller
//     let rate = 0;
//     const reviews = await reviewModel.find({ sellerId });

//     // Validate reviews array
//     if (!reviews || reviews.length === 0) {
//       throw new Error("No reviews found for the seller.");
//     }

//     for (let i = 0; i < reviews.length; i++) {
//       if (reviews[i] && typeof reviews[i].rating === "number") {
//         rate += reviews[i].rating;
//       } else {
//         console.warn(`Invalid review object at index ${i}:`, reviews[i]);
//       }
//     }

//     // Calculate the average rating
//     let listingRating = 0;
//     if (reviews.length > 0) {
//       listingRating = parseFloat((rate / reviews.length).toFixed(1));
//     }

//     // Update the seller's rating
//     await sellerModel.findByIdAndUpdate(sellerId, {
//       rating: listingRating,
//     });

//     // Optionally update the listing's rating (if needed)
//     await listingModel.findByIdAndUpdate(listingId, {
//       rating: listingRating,
//     });

//     // Send success response
//     return res.status(201).json({ message: "Review Submitted" });
//   } catch (error) {
//     console.error("Error submitting review:", error.message);
//     // Send error response
//     return res.status(500).json({ error: "An error occurred while submitting the review" });
//   }
// };

// submit_review = async (req, res) => {
//   const { name, rating, review, listingId, sellerId, transactionId } = req.body;
//   console.log(req.body);

//   try {
//     // Validate input
//     console.log("01")
//     if (!name || !rating || !review || !listingId || !sellerId || !transactionId) {
//       return res.status(400).json({ error: "All fields are required." });
//     }

//     console.log("02")
//     // Ensure rating is between 1 and 5
//     if (rating < 1 || rating > 5) {
//       return res.status(400).json({ error: "Rating must be between 1 and 5." });
//     }

//     console.log("03")
//     // Check if the transaction exists and is completed
//     const transaction = await Transaction.findById(transactionId);
//     if (!transaction) {
//       return res.status(404).json({ error: "Transaction not found." });
//     }

//     console.log("04")
//     if (transaction.fullPaymentStatus !== "Confirmed") {
//       return res.status(400).json({ error: "Transaction is not completed." });
//     }

//     console.log("05")
//     // Ensure the transaction matches the provided listing and seller
//     if (
//       transaction.sellerId.toString() !== sellerId ||
//       transaction.listingId.toString() !== listingId
//     ) {
//       return res.status(400).json({
//         error: "Transaction details do not match the provided seller or listing.",
//       });

//       console.log("06")
//     }

//     console.log("07")
//     // Check if a review already exists for this transaction
//     const existingReview = await reviewModel.findOne({ transactionId :transactionId });
//     if (existingReview) {
//       console.log("7.5")
//       return res.status(400).json({ error: "You have already submitted a review for this transaction." });
//     }

//     console.log("08")
//     // Create a new review
//     await reviewModel.create({
//       transactionId,
//       listingId,
//       sellerId,
//       name,
//       rating,
//       review,
//       date: moment(Date.now()).format('LL'), // Corrected moment usage
//     });

//     // Calculate total rating for the seller
//     let rate = 0;
//     const reviews = await reviewModel.find({ sellerId });

//     // Validate reviews array
//     if (!reviews || reviews.length === 0) {
//       throw new Error("No reviews found for the seller.");
//     }

//     for (let i = 0; i < reviews.length; i++) {
//       if (reviews[i] && typeof reviews[i].rating === "number") {
//         rate += reviews[i].rating;
//       } else {
//         console.warn(`Invalid review object at index ${i}:`, reviews[i]);
//       }
//     }

//     // Calculate the average rating
//     let listingRating = 0;
//     if (reviews.length > 0) {
//       listingRating = parseFloat((rate / reviews.length).toFixed(1));
//     }

//     // Update the seller's rating
//     await sellerModel.findByIdAndUpdate(sellerId, {
//       rating: listingRating,
//     });

//     // Optionally update the listing's rating (if needed)
//     await listingModel.findByIdAndUpdate(listingId, {
//       rating: listingRating,
//     });

//     // Send success response
//     return res.status(201).json({ message: "Review Submitted" });
//   } catch (error) {
//     console.error("Error submitting review:", error.message);
//     // Send error response
//     return responseReturn(res, 400, { error: "Invalid listingId or sellerId." });
//     // return res.status(500).json({ error: "An error occurred while submitting the review" });
//   }
// };


// submit_review = async (req, res) => {
//   const { name, rating, review, listingId, sellerId, transactionId } = req.body;
//   console.log(req.body);

//   try {
//     // Validate input
//     if (!name || !rating || !review || !listingId || !sellerId || !transactionId) {
//       return responseReturn(res, 400, { error: "All fields are required." });
//     }

//     // Ensure rating is between 1 and 5
//     if (rating < 1 || rating > 5) {
//       return responseReturn(res, 400, { error: "Rating must be between 1 and 5." });
//     }

//     // Check if the transaction exists and is completed
//     const transaction = await Transaction.findById(transactionId);
//     if (!transaction) {
//       return responseReturn(res, 404, { error: "Transaction not found." });
//     }

//     if (transaction.fullPaymentStatus !== "Confirmed") {
//       return responseReturn(res, 400, { error: "Transaction is not completed." });
//     }

//     // Ensure the transaction matches the provided listing and seller
//     if (
//       transaction.sellerId.toString() !== sellerId ||
//       transaction.listingId.toString() !== listingId
//     ) {
//       return responseReturn(res, 400, { error: "Transaction details do not match the provided seller or listing." });
//     }

//     // Check if a review already exists for this transaction
//     const existingReview = await reviewModel.findOne({ transactionId });
//     if (existingReview) {
//       console.log("01")
//       return responseReturn(res, 400, { error: "You have already submitted a review for this transaction." });
      
//     }

//     // Create a new review
//     await reviewModel.create({
//       transactionId,
//       listingId,
//       sellerId,
//       name,
//       rating,
//       review,
//       date: moment(Date.now()).format('LL'), // Corrected moment usage
//     });

//     // Calculate total rating for the seller
//     let rate = 0;
//     const reviews = await reviewModel.find({ sellerId });

//     // Validate reviews array
//     if (!reviews || reviews.length === 0) {
//       return responseReturn(res, 400, { error: "No reviews found for the seller." });
//     }

//     for (let i = 0; i < reviews.length; i++) {
//       if (reviews[i] && typeof reviews[i].rating === "number") {
//         rate += reviews[i].rating;
//       } else {
//         console.warn(`Invalid review object at index ${i}:`, reviews[i]);
//       }
//     }

//     // Calculate the average rating
//     let listingRating = 0;
//     if (reviews.length > 0) {
//       listingRating = parseFloat((rate / reviews.length).toFixed(1));
//     }

//     // Update the seller's rating
//     await sellerModel.findByIdAndUpdate(sellerId, {
//       rating: listingRating,
//     });

//     // Optionally update the listing's rating (if needed)
//     await listingModel.findByIdAndUpdate(listingId, {
//       rating: listingRating,
//     });

//     // Send success response
//     return responseReturn(res, 201, { message: "Review Submitted" });
//   } catch (error) {
//     console.error("Error submitting review:", error.message);
//     // Send error response
//     return responseReturn(res, 500, { error: "An error occurred while submitting the review" });
//   }
// };

submit_review = async (req, res) => {
  const { name, rating, review, listingId, sellerId, transactionId } = req.body;
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
    if (!transaction) {
      return responseReturn(res, 404, { error: "Transaction not found." });
    }

    if (transaction.fullPaymentStatus !== "Confirmed") {
      return responseReturn(res, 400, { error: "Transaction is not completed." });
    }

    // Ensure the transaction matches the provided listing and seller
    if (
      transaction.sellerId.toString() !== sellerId ||
      transaction.listingId.toString() !== listingId
    ) {
      return responseReturn(res, 400, { error: "Transaction details do not match the provided seller or listing." });
    }

    // Check if a review already exists for this transaction
    const existingReview = await reviewModel.findOne({ transactionId });
    if (existingReview) {
      return responseReturn(res, 400, { error: "You have already submitted a review for this transaction." });
    }

    // Create a new review
    await reviewModel.create({
      transactionId,
      listingId,
      sellerId,
      name,
      rating,
      review,
      date: moment(Date.now()).format('LL'), // Corrected moment usage
    });

    // Update the transaction's buyerStep and sellerStep
    await Transaction.findByIdAndUpdate(transactionId, {
      buyerStep: 8,
      sellerStep: 7,
    });

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
    console.error("Error submitting review:", error.message);
    // Send error response
    return responseReturn(res, 500, { error: "An error occurred while submitting the review" });
  }
};


// get_reviews = async (req, res) => {
//   const {listingId, sellerId} = req.params;
//   let {pageNumber} = req.query;


//   pageNumber= parseInt(pageNumber)
//   const limit = 5;
//   const skipPage = limit * (pageNumber - 1)

//   try {
//     let getRating = await reviewModel.aggregate([
//         {
//           $match:{
//             listingId: {
//               $eq : new ObjectId(listingId)
//             },
//             sellerId: {
//               $eq : new ObjectId(sellerId)
//             },
//             rating : {
//               $not : {
//                 $size: 0
//               }
//             }
//           }
//         },
//         {
//           $unwind : "$rating"
//         },
//         {
//           $group: {
//             _id : "$rating",
//             count : {
//               $sum: 1
//             }
//           }
//         }
//     ])    
//     let rating_review =[
//       {
//         rating : 5,
//         sum : 0
//       },
//       {
//         rating : 4,
//         sum : 0
//       },
//       {
//         rating : 3,
//         sum : 0
//       },
//       {
//         rating : 2,
//         sum : 0
//       },
//       {
//         rating : 1,
//         sum : 0
//       },
//     ]

//     for(let i = 0; i < rating_review.length; i++){
//       for(let j = 0; j<rating_review.length; j++){
//         if(rating_review[i].rating === getRating[j]._id){
//             rating_review[i].sum = getRating[j].count
//             break
//         }
//       }
//     }
//     const getAll = await reviewModel.find({
//       listingId
//     })

//     const reviews_ = await reviewModel.find({listingId}).skip(skipPage).limit(limit).sort({
//       createdAt: -1
//     })

//     // Send success response
//     responseReturn(res, 201, { reviews_, totalReview: getAll.length, rating_review ,message: "Review Submitted" });
//   } catch (error) {
//     console.log(error.message)
    
//   }


// }

// get_reviews = async (req, res) => {
//   const { listingId, sellerId } = req.params;
//   let { pageNumber } = req.query;

//   // Validate and parse inputs
//   pageNumber = parseInt(pageNumber) || 1;
//   const limit = 5;
//   const skipPage = limit * (pageNumber - 1);

//   // Validate MongoDB ObjectIds
//   if (!ObjectId.isValid(listingId) || !ObjectId.isValid(sellerId)) {
//     return responseReturn(res, 400, { error: "Invalid listingId or sellerId." });
//   }

//   try {
//     // Fetch aggregated rating data
//     const getRating = await reviewModel.aggregate([
//       {
//         $match: {
//           listingId: new ObjectId(listingId),
//           sellerId: new ObjectId(sellerId),
//           rating: { $not: { $size: 0 } },
//         },
//       },
//       { $unwind: "$rating" },
//       {
//         $group: {
//           _id: "$rating",
//           count: { $sum: 1 },
//         },
//       },
//     ]);

//     // Initialize rating review array
//     const rating_review = [
//       { rating: 5, sum: 0 },
//       { rating: 4, sum: 0 },
//       { rating: 3, sum: 0 },
//       { rating: 2, sum: 0 },
//       { rating: 1, sum: 0 },
//     ];

//     // Map ratings to counts
//     if (Array.isArray(getRating) && getRating.length > 0) {
//       const ratingMap = new Map(getRating.map((r) => [r._id, r.count]));
//       rating_review.forEach((r) => {
//         r.sum = ratingMap.get(r.rating) || 0;
//       });
//     }

//     // Fetch all reviews for the total count
//     const getAll = await reviewModel.find({ listingId });

//     // Fetch paginated reviews
//     const reviews = await reviewModel
//       .find({ listingId })
//       .skip(skipPage)
//       .limit(limit)
//       .sort({ createdAt: -1 });
      

//       console.log(reviews)
//       console.log(getAll.length)
//       console.log(rating_review)


//     // Send success response
//     responseReturn(res, 200, {
//       reviews,
//       totalReview: getAll.length,
//       rating_review,
//     });
//   } catch (error) {
//     console.error("Error fetching reviews:", error.message);

//     // Send error response
//     responseReturn(res, 500, {
//       error: "Internal Server Error",
//       message: error.message,
//     });
//   }
// };


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



// get_all_Sellers = async (req, res) => {
//   try {
//     // Query to find sellers with the status 'active'
//     const activeSellers = await sellerModel.find({ status: "active" });
//     console.log({sellers: activeSellers})

//     responseReturn(res, 200, {sellers: activeSellers})

//     // responseReturn(res, 200,activeSellers);
//     // return activeSellers;
//   } catch (error) {
//     // Handle errors
//     console.error("Error retrieving active sellers:", error);

//   }
// };

// get_all_Sellers = async (req, res) => {
//   try {
//     // Query to find active sellers
//     const activeSellers = await sellerModel.find({ status: "active" });

//     // Populate each seller with their listings
//     const sellersWithListings = await Promise.all(
//       activeSellers.map(async (seller) => {
//         // Fetch all listings of this seller and extract categories
//         const listings = await listingModel.find({ sellerId: seller._id });

//         // Extract unique categories
//         const categories = [...new Set(listings.map(listing => listing.category))];

//         // Add categories to seller object
//         seller.categories = categories;

//         console.log(categories)

//         return seller;
//       })
//     );

//     console.log({ sellers: sellersWithListings });

//     // Send response with sellers and their unique categories
//     responseReturn(res, 200, { sellers: sellersWithListings });
//   } catch (error) {
//     // Handle errors
//     console.error("Error retrieving active sellers:", error);
//     responseReturn(res, 500, { message: "Error retrieving active sellers" });
//   }
// };

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



}

module.exports = new homeControllers();
