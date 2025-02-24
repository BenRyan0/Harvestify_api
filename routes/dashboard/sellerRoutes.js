const router = require("express").Router();
const { model } = require("mongoose");
const { authMiddleware } = require("../../middlewares/authMiddleware");
const sellerController = require("../../controllers/dashboard/sellerController");

router.get('/request-seller-get',authMiddleware,sellerController.get_seller_request)

router.get('/get-sellers',authMiddleware,sellerController.get_active_sellers)
router.get('/get-deactive-sellers',authMiddleware,sellerController.get_deactive_sellers)

router.get('/get-seller/:sellerId',authMiddleware,sellerController.get_seller)
router.post('/seller-status-update',authMiddleware,sellerController.seller_status_update)




router.get('/request-trader-get',authMiddleware,sellerController.get_trader_request)

router.get('/get-trader/:traderId',authMiddleware,sellerController.get_trader)
router.post('/trader-status-update',authMiddleware,sellerController.trader_status_update)

router.get('/get-seller-notification/:sellerId',authMiddleware,sellerController.getSellerNotifications)


module.exports = router;
