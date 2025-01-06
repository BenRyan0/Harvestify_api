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
      const listings = await listingModel
        .find({})
        .limit(16)
        .sort({ createdAt: -1 });

     
      // Get current date
      const currentDate = new Date();

      // Fetch featured listings where harvestStartDate is equal to or before the current date
      const featuredListings = await listingModel
        .find({ harvestStartDate: { $lte: currentDate } }) // Only listings with harvestStartDate <= current date
        .limit(16)
        .sort({ createdAt: -1 });



      // Fetch the latest 9 listings and format them
      const allListings1 = await listingModel
        .find({})
        .limit(9)
        .sort({ createdAt: -1 });

      const latestListings = this.formattedListings(allListings1);

      // Fetch the top 9 listings, sorted by the seller's rating (descending)
      const allListings2 = await listingModel
        .find({})
        .populate("seller") // Assuming the seller field references the seller's model
        .sort({ "seller.rating": -1 }) // Sorting by seller's rating
        .limit(9);

     const topRatedListings = this.formattedListings(allListings2)
     

     const allListings3 = await listingModel
        .find({})
        .limit(9)
        .sort({ discount: -1 });
     
     const discounted_listings = this.formattedListings(allListings3)



     console.log(featuredListings)

      // Return all the required data
      responseReturn(res, 200, {
          listings,
          featuredListings,
          latestListings,
          topRatedListings,
          discounted_listings
      });
    } catch (error) {
      console.log(error.message);
    }
  };
}

module.exports = new homeControllers();
