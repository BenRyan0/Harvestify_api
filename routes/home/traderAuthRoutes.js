const router = require("express").Router();
const traderAuthController = require('../../controllers/home/traderAuthController')

router.post('/trader/trader-register', traderAuthController.trader_register)
router.post('/trader/trader-login', traderAuthController.trader_login)
router.get('/customer/logout', traderAuthController.trader_logout)


router.post('/trader/change-password', traderAuthController.trader_changePassword)
module.exports = router;
