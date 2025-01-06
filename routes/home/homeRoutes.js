const router = require("express").Router();
const homeControllers = require("../../controllers/home/homeControllers")
router.get('/get-categories', homeControllers.get_categories)
router.get('/get-listings', homeControllers.get_listings)
router.get('/get-listing/:slug', homeControllers.get_listing)
// router.get('/price-range-latest-listings', homeControllers.expected_yield_range_listing)
router.get('/price-range-latest-listings', homeControllers.price_range_listing)
router.get('/yield-range-latest-listings', homeControllers.expected_yield_range_listing)
router.get('/query-listings', homeControllers.query_listings)
router.get('/expected-yield-listing', homeControllers.expected_yield_listing)



router.post('/trader/submit-review', homeControllers.submit_review)
router.get('/trader/get-reviews/:listingId/:sellerId', homeControllers.get_reviews)
// get-reviews/${listingId}?sellerId=${sellerId}?pageNo=${pageNumber}


router.get('/get-all-sellers', homeControllers.get_all_Sellers)
router.get('/get-cluster-details/:clusterId', homeControllers.get_cluster_details)
// /home/get-cluster-details/${clusterId}

module.exports = router;
