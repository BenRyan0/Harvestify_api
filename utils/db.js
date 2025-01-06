const mongoose = require("mongoose");
require("dotenv").config();

module.exports.dbConnect = async () => {
  try {
    if(process.env.mode === 'pro'){
      await mongoose.connect(process.env.DB_LOCAL, {});
      console.log("production database connected ...");
   }else{
    await mongoose.connect(process.env.DB_URL, {});
    console.log("local database connected ...");
   }
  } catch (error) {
    console.log(error.message);
  }
};
