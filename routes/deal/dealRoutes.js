const router = require("express").Router();
const dealController = require("../../controllers/deal/dealController")


router.post('/home/deal/place-deal',dealController.place_deal)
router.post('/home/deal/place-shipping-info',dealController.place_shipping_info)
// router.post('/home/deal/submit-voucher-code',dealController.submit_voucher_code)
router.get('/home/trader/get-dashboard-data/:userId',dealController.get_trader_dashboard_data)
router.get('/home/trader/get-deals/:traderId/:status',dealController.get_deals)
router.get('/home/trader/get-deal/:dealId',dealController.get_deal)


// router.post('/order/create-payment',dealController.create_payment)
// router.get('/order/confirm/:orderId',dealController.order_confirm)


// --- admin
router.get('/admin/orders', dealController.get_admin_orders)
router.get('/admin/order/:orderId', dealController.get_admin_order)
router.put('/admin/order-status/update/:orderId', dealController.admin_order_status_update)

// ---seller

router.get('/seller/orders/:sellerId', dealController.get_seller_orders)
router.get('/seller/order/:orderId', dealController.get_seller_order)
router.put('/seller/order-status/update/:orderId', dealController.seller_order_status_update)
module.exports = router;
