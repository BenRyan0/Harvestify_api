const router = require("express").Router();
const transactionController = require("../../controllers/transaction/transactionController")


// router.post('/transaction-add',transactionController.createTransaction)
// router.post('/trader/payment-add',transactionController.proof_submit)




// router.get('/trader/cancellation-rate',transactionController.Trader_Cancellation_Rate)
router.get('/trader/cancellation-rate',transactionController.Trader_Cancellation_Rate)




// /home/listing/remove-wishlist-listings/${wishlist_id}


module.exports = router;
