const router = require("express").Router();
const { model } = require("mongoose");
const { authMiddleware } = require("../../middlewares/authMiddleware");
const listingController = require("../../controllers/dashboard/listingController");

router.post("/listing-add", authMiddleware, listingController.add_listing);
router.get("/listings-get", authMiddleware, listingController.listings_get);
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


module.exports = router;
