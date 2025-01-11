const categoryModel = require("../../models/categoryModel");
const voucherModel = require("../../models/voucher");
const { responseReturn } = require("../../utils/response");
const cloudinary = require("cloudinary").v2;
const formidable = require("formidable");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

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
  

  // validate_and_use_voucher = async (req, res) => {
  //   console.log("Asdasdasd")
  //   const { code, sellerId } = req.body;

  //   try {
  //     // Find the voucher by code and sellerId
  //     const voucher = await voucherModel.findOne({ code: code, sellerId: sellerId });

  //     if (!voucher) {
  //       return responseReturn(res, 404, { error: 'Voucher not found' });
  //     }

  //     // Check if the voucher is expired
  //     const currentDate = new Date();
  //     if (currentDate < voucher.startDate || currentDate > voucher.expirationDate) {
  //       return responseReturn(res, 400, { error: 'Voucher is expired or not yet valid' });
  //     }

  //     // Check if the voucher is already redeemed
  //     if (voucher.isRedeemed) {
  //       return responseReturn(res, 400, { error: 'Voucher has already been redeemed' });
  //     }

  //     // Mark the voucher as redeemed
  //     voucher.isRedeemed = true;
  //     await voucher.save();

  //     return responseReturn(res, 200, {
  //       message: 'Voucher successfully redeemed',
  //       discountType: voucher.discountType,
  //       value: voucher.value
  //     });
  //   } catch (error) {
  //     console.error('Error validating and using voucher:', error);
  //     return responseReturn(res, 500, { error: 'An error occurred while processing the voucher' });
  //   }
  // };

  get_voucher = async (req, res) => {
    const { page, searchValue, parPage } = req.query;

    try {
      let skipPage = "";
      if (parPage && page) {
        skipPage = parseInt(parPage) * (parseInt(page) - 1);
      }
      if (searchValue && page && parPage) {
        const vouchers = await voucherModel
          .find({
            $text: { $search: searchValue },
          })
          .skip(skipPage)
          .limit(parPage)
          .sort({ createdAt: -1 });
        const totalVouchers = await voucherModel
          .find({
            $text: { $search: searchValue },
          })
          .countDocuments();
        responseReturn(res, 200, { totalVouchers, vouchers });
      } else if (searchValue === "" && page && parPage) {
        const vouchers = await voucherModel
          .find({})
          .skip(skipPage)
          .limit(parPage)
          .sort({ createdAt: -1 });
        const totalVouchers = await voucherModel.find({}).countDocuments();
        responseReturn(res, 200, { totalVouchers, vouchers });
      } else {
        const vouchers = await voucherModel.find({}).sort({ createdAt: -1 });
        const totalVouchers = await voucherModel.find({}).countDocuments();
        responseReturn(res, 200, { totalVouchers, vouchers });
      }
    } catch (error) {
      console.log(error.message);
    }
  };
}

module.exports = new categoryController();
