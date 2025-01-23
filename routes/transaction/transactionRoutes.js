const router = require("express").Router();
// const dealController = require("../../controllers/deal/dealController")
const transactionController = require("../../controllers/transaction/transactionController")


router.post('/transaction-add',transactionController.createTransaction)
router.get('/transaction-get/:dealId',transactionController.getTransactionByDealId)
router.get('/trader/transaction-get/:traderDealId',transactionController.getTransactionByDealIdTrader)
router.post('/trader/payment-add',transactionController.proof_submit)
router.put('/transaction-confirm-deposit',transactionController.setDepositStatusConfirmed)
router.put('/transaction-confirm-full-payment',transactionController.setFullPaymentStatusConfirmed)



router.post('/delivery-handoff-proof-add',transactionController.delivery_handoff_proof_submit)
router.post('/trader/trader-handoff-confirm',transactionController.trader_handoff_confirm)


router.post('/trader/final-payment-add',transactionController.proof_submit2)


router.delete('/trader/traderDeal-delete/:traderDealId',transactionController.deleteTraderDeal)


module.exports = router;
