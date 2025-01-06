const categoryModel = require("../../models/categoryModel");
const listingModel = require("../../models/listingModel");
const { responseReturn } = require("../../utils/response");
const queryListings = require("../../utils/queryListings")

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
        .find({})
        .populate({
          path: 'sellerId', // Adjust based on your actual field name
          select: 'profileImage phoneNumber rating associationloc_barangay associationloc_municipalitycity associationloc_province associationloc_street associationName' // Only get the image and rating fields from the seller
        })
        // .limit(16)
        .sort({ createdAt: -1 });

      // Fetch the latest 9 listings and format them
      const allListings1 = await listingModel
        .find({})
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
          .find({ harvestStartDate: { $gte: currentDate } }) // Only listings with harvestStartDate >= current date
          .sort({ createdAt: -1 });

      // Fetch the top 9 listings based on seller's rating
      const topRatedListings = await listingModel
      .find({})
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
        .find({})
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
    console.log(req.query);
    console.log("_________")
    const parPage = 12;
    req.query.parPage = parPage;  // Corrected from "parPage" to "perPage"

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
        // Send the response with the result and total listing count
        responseReturn(res, 200, { listings: result, totalListing,parPage });
    } catch (error) {
        console.log(error);
        responseReturn(res, 500, { message: "An error occurred while querying listings." });
    }
};


  // query_listings = async (req, res) => {
  //   console.log(req.query)
  //   const perPage = 12
  //   req.query.parPage = perPage

  //    try {
  //     const listings = await listingModel.find({}).sort({createdAt: -1}).populate("sellerId", "profileImage phoneNumber rating firstName middleName lastName") 
  //     const totalListing = new queryListings(listings, req.query).categoryQuery().ratingQuery().sortByPrice().countListings;
  //     // console.log(listings)
  //     const result = new queryListings(listings, req.query).categoryQuery().ratingQuery().priceQuery().sortByPrice().skip(2).limit().getListings().populate("sellerId", "profileImage phoneNumber rating firstName middleName lastName ssociationloc_barangay associationloc_municipalitycity associationloc_province associationloc_street") ;
  //     // const result = new queryListings(listings, req.query).categoryQuery().ratingQuery().priceQuery().sortByPrice().skip(2).limit().yieldQuery().sortByYield().getListings();
  //     console.log(result)
  //     console.log(totalListing)

  //     responseReturn(res, 200,{listings: result, totalListing})
  //    } catch (error) {
  //     console.log(error)
      
  //    }

  // }
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
   console.log(slug)
   try {
    const listing = await listingModel.findOne({slug})
    const relatedListings = await listingModel.find({
      $and : [
        {
            _id : {
              $ne: listing.id
            }
        },
        {
            category : {
              $eq : listing.category
            }
        }
      ]
    })
    .populate("sellerId", "profileImage phoneNumber rating firstName middleName lastName")
    .limit(20)

    const moreListings = await listingModel.find({

      $and : [
        {
            _id : {
              $ne: listing.id
            }
        },
        {
            sellerId : {
              $eq : listing.sellerId
            }
        }
      ]

    }).limit(3)

    responseReturn(res, 200,{
      listing,
      relatedListings,
      moreListings
    } )
     console.log(listing)
    
   } catch (error) {
    console.log(error.message)
   }
  };
}

module.exports = new homeControllers();
