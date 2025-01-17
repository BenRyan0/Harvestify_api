const router = require("express").Router();
const transactionController = require("../../controllers/transaction/transactionController")


router.post('/transaction-add',transactionController.createTransaction)
router.post('/trader/payment-add',transactionController.proof_submit)




// /home/listing/remove-wishlist-listings/${wishlist_id}


module.exports = router;
