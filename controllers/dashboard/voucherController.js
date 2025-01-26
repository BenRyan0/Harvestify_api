const categoryModel = require("../../models/categoryModel");
const voucherModel = require("../../models/voucher");
const { responseReturn } = require("../../utils/response");
const cloudinary = require("cloudinary").v2;
const formidable = require("formidable");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const { mongo: { ObjectId } } = require('mongoose');
const mongoose = require("mongoose"); // Import mongoose at the top

require("dotenv").config();

class categoryController {
  resizeImage = async (imagePath) => {
    const outputDir = path.join(__dirname, "../../uploads");
    const outputFilePath = path.join(
      outputDir,
      "resized_" + path.basename(imagePath)
    );

    // Ensure the output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    await sharp(imagePath)
      .resize(800, 800) // Adjust the width and height as needed
      .toFile(outputFilePath);
    return outputFilePath;
  };

  add_voucher = async (req, res) => {
    console.log(req.body)
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return responseReturn(res, 404, { error: "Form parsing error" });
      } else {
        console.log("Form parsed successfully");
        console.log(fields)
        let { code } = fields;
        let { discount } = fields;
        let { discountType } = fields;
        let { voucherEndDate } = fields;
        let { voucherStartDate } = fields;
        let { sellerId } = fields;
        if (!code || !discount || !discountType || !voucherEndDate || !voucherStartDate) {
          return responseReturn(res, 400, {
            error: "All inputs must be filled",
          });
        }
        
        // Check if the category already exists
        const existingVoucher = await voucherModel.findOne({ code });
        if (existingVoucher) {
          return responseReturn(res, 409, { error: "Voucher Code already exists" });
        }
  
        try {
            const voucher = await voucherModel.create({
              code,
              value: discount,
              discountType,
              expirationDate: voucherEndDate,
              startDate: voucherStartDate,
              sellerId
            });

            console.log(voucher)
            return responseReturn(res, 201, {
              voucher,
              message: "Voucher added successfully",
            });
         
        } catch (error) {
          console.error("Error Here", error);
          return responseReturn(res, 500, { error: "Internal server error" });
        }
      }
    });
  };

  validate_and_use_voucher = async (req, res) => {
    const { code, sellerId } = req.body;
  
    try {
      // Find the voucher by code and sellerId
      const voucher = await voucherModel.findOne({ code, sellerId: sellerId });
  
      if (!voucher) {
        console.log('Voucher not found');
        return responseReturn(res, 404, { error: 'Voucher not found' });
      }
  
      console.log('Voucher found:', voucher);
  
      // Check if the voucher is expired
      const currentDate = new Date();
      console.log('Current Date:', currentDate);
      console.log('Voucher Start Date:', voucher.startDate);
      console.log('Voucher Expiration Date:', voucher.expirationDate);
  
      // Convert dates to ISO strings for comparison
      const currentDateISO = currentDate.toISOString();
      const startDateISO = voucher.startDate.toISOString();
      const expirationDateISO = voucher.expirationDate.toISOString();
  
      console.log('Current Date ISO:', currentDateISO);
      console.log('Voucher Start Date ISO:', startDateISO);
      console.log('Voucher Expiration Date ISO:', expirationDateISO);
  
      if (currentDateISO < startDateISO || currentDateISO > expirationDateISO) {
        console.log('Voucher is expired or not yet valid');
        return responseReturn(res, 400, { error: 'Voucher is expired or not yet valid' });
      }
  
      // Check if the voucher is already redeemed
      if (voucher.isRedeemed) {
        console.log('Voucher has already been redeemed');
        return responseReturn(res, 400, { error: 'Voucher has already been redeemed' });
      }
  
      // Mark the voucher as redeemed
      voucher.isRedeemed = true;
      await voucher.save();
  
      console.log('Voucher successfully redeemed');
      return responseReturn(res, 200, {
        message: 'Voucher successfully redeemed',
        discountType: voucher.discountType,
        value: voucher.value
      });
    } catch (error) {
      console.error('Error validating and using voucher:', error);
      return responseReturn(res, 500, { error: 'An error occurred while processing the voucher' });
    }
  };
  validate_voucher = async (req, res) => {
    const { code, sellerId } = req.body;
  
    try {
      // Find the voucher by code and sellerId
      const voucher = await voucherModel.findOne({ code, sellerId: sellerId });
  
      if (!voucher) {
        console.log('Voucher not found');
        return responseReturn(res, 404, { error: 'Voucher not found' });
      }
  
      console.log('Voucher found:', voucher);
  
      // Check if the voucher is expired
      const currentDate = new Date();
      console.log('Current Date:', currentDate);
      console.log('Voucher Start Date:', voucher.startDate);
      console.log('Voucher Expiration Date:', voucher.expirationDate);
  
      // Convert dates to ISO strings for comparison
      const currentDateISO = currentDate.toISOString();
      const startDateISO = voucher.startDate.toISOString();
      const expirationDateISO = voucher.expirationDate.toISOString();
  
      console.log('Current Date ISO:', currentDateISO);
      console.log('Voucher Start Date ISO:', startDateISO);
      console.log('Voucher Expiration Date ISO:', expirationDateISO);
  
      if (currentDateISO < startDateISO || currentDateISO > expirationDateISO) {
        console.log('Voucher is expired or not yet valid');
        return responseReturn(res, 400, { error: 'Voucher is expired or not yet valid' });
      }
  
      // Check if the voucher is already redeemed
      if (voucher.isRedeemed) {
        console.log('Voucher has already been redeemed');
        return responseReturn(res, 400, { error: 'Voucher has already been redeemed' });
      }
  
      console.log('Voucher is valid');
      return responseReturn(res, 200, {
        v_id: voucher._id,
        message: 'Voucher is valid',
        valid : true,
        discountType: voucher.discountType,
        value: voucher.value,
        code: voucher.code
      });
    } catch (error) {
      console.error('Error validating voucher:', error);
      return responseReturn(res, 500, { error: 'An error occurred while processing the voucher' });
    }
  };


  deactivate_voucher = async (req, res) => {
    const { code, sellerId } = req.body;
    console.log(req.body)
   

    if (!code || !sellerId) {
      console.log("01")
      return responseReturn(res, 400, { error: "Code and Seller ID are required" });
    }

    try {
      console.log("02")
      const voucher = await voucherModel.findOne({ code, sellerId });

      if (!voucher) {
        console.log("03")
        return responseReturn(res, 404, { error: "Voucher not found" });
      }

      console.log("04")
      voucher.isRedeemed = true; // Mark it as expired immediately
      voucher.expirationDate = new Date(); // Mark it as expired immediately
      await voucher.save();

      console.log("05")
      return responseReturn(res, 200, { message: "Voucher deactivated successfully", voucher });
    } catch (error) {
      console.log("06")
      console.error("Error deactivating voucher:", error);
      return responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  delete_voucher = async (req, res) => {
    const { code, sellerId } = req.body;
    console.log(req.body);
  
    if (!code || !sellerId) {
      console.log("01");
      return responseReturn(res, 400, { error: "Code and Seller ID are required" });
    }
  
    try {
      console.log("02");
      // Find the voucher by code and sellerId
      const voucher = await voucherModel.findOne({ code, sellerId });
  
      if (!voucher) {
        console.log("03");
        return responseReturn(res, 404, { error: "Voucher not found" });
      }
  
      // Delete the voucher from the database
      await voucherModel.deleteOne({ _id: voucher._id });
  
      console.log("04");
      return responseReturn(res, 200, { message: "Voucher deleted successfully" });
    } catch (error) {
      console.log("06");
      console.error("Error deleting voucher:", error);
      return responseReturn(res, 500, { error: "Internal server error" });
    }
  };
  

  get_voucher = async (req, res) => {
    const { page, searchValue, parPage, sellerId } = req.query;
  
    try {
      // Validate and add sellerId to the filter
      const filter = {};
  
      // If sellerId is provided, convert it to ObjectId using new
      if (sellerId) {
        if (!mongoose.Types.ObjectId.isValid(sellerId)) {
          return responseReturn(res, 400, { error: "Invalid sellerId" });
        }
        filter.sellerId = new mongoose.Types.ObjectId(sellerId); // Use 'new' here
      }
  
      // Add text search filter if necessary
      if (searchValue) {
        filter.$text = { $search: searchValue };
      }
  
      // Pagination logic
      let skipPage = 0;
      if (parPage && page) {
        skipPage = parseInt(parPage) * (parseInt(page) - 1);
      }
  
      // Fetch the vouchers
      const vouchers = await voucherModel
        .find(filter)
        .skip(skipPage)
        .limit(parPage ? parseInt(parPage) : 0)
        .sort({ createdAt: -1 });
  
      // Count the total vouchers matching the filter
      const totalVouchers = await voucherModel.countDocuments(filter);
  
      // Send the response with vouchers
      responseReturn(res, 200, { totalVouchers, vouchers });
    } catch (error) {
      console.error(error.message);
      responseReturn(res, 500, { error: "Internal server error" });
    }
  };
  
}

module.exports = new categoryController();
