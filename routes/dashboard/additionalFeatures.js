const router = require("express").Router();
const { model } = require("mongoose");
const { authMiddleware } = require("../../middlewares/authMiddleware");

const categoryController = require("../../controllers/dashboard/categoryController");

router.post("/additional-features-add", authMiddleware, categoryController.additional_feature_add );
router.get("/additional-features-get", authMiddleware, categoryController.get_additional_feature);

module.exports = router;
