const router = require("express").Router();
const { model } = require("mongoose");
const { authMiddleware } = require("../../middlewares/authMiddleware");

const categoryController = require("../../controllers/dashboard/categoryController");

router.post("/category-add", authMiddleware, categoryController.add_category);
router.get("/category-get", authMiddleware, categoryController.get_category);


router.delete("/category-remove/:id", authMiddleware, categoryController.delete_category);
router.delete("/feature-remove/:id", authMiddleware, categoryController.deleteAdditionalFeature);

module.exports = router;
