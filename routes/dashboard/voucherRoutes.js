const router = require("express").Router();
const { model } = require("mongoose");
const { authMiddleware } = require("../../middlewares/authMiddleware");

const voucherController = require("../../controllers/dashboard/voucherController");

router.post("/voucher-add", authMiddleware, voucherController.add_voucher);
router.get("/voucher-get", authMiddleware, voucherController.get_voucher);
router.post("/submit-voucher-code", voucherController.validate_voucher);
// router.post("/submit-voucher-code", authMiddleware, voucherController.validate_and_use_voucher);

module.exports = router;
