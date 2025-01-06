const categoryModel = require("../../models/categoryModel");
const listingModel = require("../../models/listingModel");
const { responseReturn } = require("../../utils/response");

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
      productArray.push([...temp]);
      i = j;
    }
    return productArray;
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
          select: 'profileImage phoneNumber rating' // Only get the image and rating fields from the seller
        })
        .limit(16)
        .sort({ createdAt: -1 });

      // Fetch the latest 9 listings and format them
      const allListings1 = await listingModel
        .find({})
        .limit(9)
        .sort({ createdAt: -1 });

        const currentDate = new Date();

        // Fetch featured listings where harvestStartDate has not passed the current date (today or future)
        const featuredListings = await listingModel
          .find({ harvestStartDate: { $gte: currentDate } }) // Only listings with harvestStartDate >= current date
          .sort({ createdAt: -1 });
  

      const latestListings = this.formattedListings(allListings1);


      // // Fetch the top 9 listings, sorted by the seller's rating (descending)
      // const allListings2 = await listingModel
      //   .find({})
      //   .populate("sellerId") // Assuming the seller field references the seller's model
      //   .sort({ "sellerId.rating": -1 }) // Sorting by seller's rating
      //   .limit(9);

    //  const topRatedListings_ = this.formattedListings(allListings2)

    // Fetch the top 9 listings based on seller's rating
    const topRatedListings = await listingModel
    .find({})
    .populate("sellerId", "profileImage phoneNumber rating") // Populate seller info
    .sort({ "sellerId.rating": -1 }) // Sort by seller's rating
    .limit(9);

// Format the top-rated listings
const formattedTopRatedListings = this.formattedListings(topRatedListings);
    //  const topRatedListings = this.formattedListings(topRatedListings_)
     

     const allListings3 = await listingModel
        .find({})
        .limit(9)
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

      // const listings = 
    } catch (error) {
      
    }

  }
}

module.exports = new homeControllers();
