const router = require("express").Router();
const { model } = require("mongoose");

const { authMiddleware } = require("../middlewares/authMiddleware");
const chatController = require('../controllers/chat/ChatController')


router.post('/chat/trader/add-trader-friend', chatController.add_trader_friend)
router.post('/chat/trader/send-message-to-seller', chatController.trader_message_add)


router.get('/chat/seller/get-customers/:sellerId', chatController.get_customers)
router.get('/chat/seller/get-customer-message/:customerId', authMiddleware, chatController.get_customer_seller_message)

router.post('/chat/seller/send-message-to-customer', authMiddleware, chatController.seller_message_add)

router.get('/chat/admin/get-sellers', authMiddleware, chatController.get_sellers)
// message-send-seller-admin

router.post('/chat/message-send-seller-admin', authMiddleware, chatController.seller_admin_message_insert)

router.get('/chat/get-admin-messages/:receiverId', authMiddleware, chatController.get_admin_messages)

router.get('/chat/get-seller-messages', authMiddleware, chatController.get_seller_messages)







module.exports = router;
