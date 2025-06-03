const router = require("express").Router();
// const dealController = require("../../controllers/deal/dealController")
const { authMiddleware } = require("../../middlewares/authMiddleware");
// const { authMiddleware } = require("../../../../middlewares/authMiddleware");
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



router.put('/transactions/:id/deposit',transactionController.updateDepositPayment)


router.get('/transactions/:transactionId',transactionController.getTransactionById)


router.post('/submit-seller-dispute',transactionController.submitSellerDispute)
router.post('/cancel-transaction',transactionController.submitSellerDispute)



router.post('/cancel-by-trader/:transactionId/:traderId',transactionController.cancelTransactionByTrader )
router.post('/undo-cancel-by-trader',transactionController.undoCancelTransactionByTrader )



router.post('/resend-payment-proof/:transactionId', transactionController.resendDepositProof);




router.post('/resend-payment-confirm/:transactionId', transactionController.confirmDepositReceived);
router.post('/resend-payment-reject/:transactionId', transactionController.rejectDepositProofAfterResend);


router.get('/escalated-transactions/detailed', transactionController.getAllEscalatedTransactionsWithDetails);


router.post('/accept-trader-proof', transactionController.acceptTraderProof);
// router.post('/cancel-by-trader',transactionController.cancelTransactionByTrader )
router.post('/resolve-dispute/:transactionId', authMiddleware, transactionController.adminResolveDispute);






module.exports = router;
