const router = require("express").Router();
const { model } = require("mongoose");
const { authMiddleware } = require("../../middlewares/authMiddleware");
const listingController = require("../../controllers/dashboard/listingController");

router.post("/listing-add", authMiddleware, listingController.add_listing);
router.post("/listing-set-actual-yield", authMiddleware, listingController.updateActualHarvestYield);

router.get("/listings-get", authMiddleware, listingController.listings_get);
router.get("/listings-get-ongoing-harvest", authMiddleware, listingController.get_ongoing_harvest_listings);
router.get(
  "/listing-get/:listingId",
  authMiddleware,
  listingController.listing_get
);
router.post(
  "/listing-update",
  authMiddleware,
  listingController.listing_update
);
// Backend Route
router.post(
  "/listing-takedown",
  authMiddleware,
  listingController.takedown_listing
);
router.post(
  "/add-actual-harvest-yield",
  authMiddleware,
  listingController.updateActualHarvestYield
);


module.exports = router;
