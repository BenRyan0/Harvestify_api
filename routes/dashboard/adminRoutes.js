const router = require("express").Router();
const { model } = require("mongoose");
const { authMiddleware } = require("../../middlewares/authMiddleware");
const AdminController = require("../../controllers/dashboard/AdminController");

// router.get('/request-seller-get',authMiddleware,sellerController.get_seller_request)

router.get('/get-traders',authMiddleware, AdminController.get_active_traders)
// router.get('/get-deactive-sellers',authMiddleware,sellerController.get_deactive_sellers)

// router.get('/get-seller/:sellerId',authMiddleware,sellerController.get_seller)
// router.post('/seller-status-update',authMiddleware,sellerController.seller_status_update)


module.exports = router;
