const passport = require("passport");
const { Strategy: LocalStrategy } = require("passport-local");
const bcrypt = require("bcrypt");
const sellerModel = require("../models/sellerModel");

// Local Strategy for authenticating sellers
passport.use(
  new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
    try {
      console.log("🔍 Authenticating email:", email);

      // Find user in database
      const user = await sellerModel.findOne({ email }).select("+password");
      if (!user) {
        console.log("❌ User not found in database");
        return done(null, false, { message: "User not found" });
      }

      console.log("✅ User found:", user.email);
      console.log("🔑 Stored Hashed Password:", user.password);

      // Compare passwords
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.log("❌ Password does not match");
        return done(null, false, { message: "Invalid Credentials" });
      }

      console.log("✅ Authentication successful!");
      return done(null, user); // Passport attaches this user to req.user
    } catch (err) {
      console.error("🚨 Error during authentication:", err);
      return done(err);
    }
  })
);

// 🔹 Serialize User (Store user ID in session)
passport.serializeUser((user, done) => {
  console.log("🗂️ Serializing User:", user.id);
  done(null, user.id);
});

// 🔹 Deserialize User (Retrieve user from session using ID)
passport.deserializeUser(async (id, done) => {
  try {
    const user = await sellerModel.findById(id);
    if (!user) {
      return done(null, false);
    }
    console.log("🔄 Deserialized User:", user.email);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
