const passport = require("passport");
const { Strategy: LocalStrategy } = require("passport-local");
const bcrypt = require("bcrypt");
const sellerModel = require("../models/sellerModel");

passport.use(
  new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
    try {
      console.log("🔍 Authenticating email:", email);

      const user = await sellerModel.findOne({ email }).select("+password");
      if (!user) {
        console.log("❌ User not found in database");
        return done(null, false, { message: "User not found" });
      }

      console.log("✅ User found:", user.email);
      console.log("🔑 Stored Hashed Password:", user.password);

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.log("❌ Password does not match");
        return done(null, false, { message: "Invalid Credentials" });
      }

      console.log("✅ Authentication successful!");
      return done(null, user); // Passport will attach this user to req.user
    } catch (err) {
      console.error("🚨 Error during authentication:", err);
      return done(err);
    }
  })
);
