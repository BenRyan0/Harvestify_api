const router = require("express").Router();
const { model } = require("mongoose");
const { passport } = require("passport");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { twoFactorAuthMiddleWare } = require("../middlewares/twoFactorAuthMiddleWare");
const authControllers = require("../controllers/authControllers");

router.post("/admin-login", authControllers.admin_login);
router.put("/admin-change-password", authControllers.change_password);
router.put("/seller-change-password", authControllers.changePassword_Seller);
router.get("/get-user", authMiddleware, authControllers.getUser);

router.post("/seller-register", authControllers.seller_register);
router.post("/seller-login", authControllers.seller_login);


router.post("/profile-image-upload",authMiddleware, authControllers.profile_image_upload);
router.post("/association-image-upload",authMiddleware, authControllers.association_image_upload);


router.get("/logout",authMiddleware, authControllers.logout);


router.post("/trader-register", authControllers.trader_register);

// AUTH STATUS ROUTE
router.get("/seller-status", authControllers.trader_register);

// authStatus
// setup2FA
// verify2FA
// reset2FA

// 2FA setup
router.post("/seller/2fa/setup", authControllers.setup2FA);
// Verify Route
router.post("/seller/2fa/verify",twoFactorAuthMiddleWare, authControllers.verify2FA);
// RESET 2FA ROUTE
router.post("/seller/2fa/reset", authControllers.reset2FA);

module.exports = router;
