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

  // add_category = async (req, res) => {
  //   const form = new formidable.IncomingForm();
  //   form.parse(req, async (err, fields, files) => {
  //     if (err) {
  //       return responseReturn(res, 404, { error: "Form parsing error" });
  //     } else {
  //       console.log("Form parsed successfully");
  //       let { name } = fields;
  //       let { image } = files;
  //       if (!name || !image) {
  //         return responseReturn(res, 400, {
  //           error: "Name or image not provided",
  //         });
  //       }
  //       name = name.trim();
  //       const slug = name.split(" ").join("-");

  //       cloudinary.config({
  //         cloud_name: process.env.cloud_name,
  //         api_key: process.env.api_key,
  //         api_secret: process.env.api_secret,
  //         secure: true,
  //       });

  //       try {
  //         const resizedImagePath = await this.resizeImage(
  //           image.filepath || image.path
  //         );
  //         console.log(`Uploading resized image: ${resizedImagePath}`);
  //         const result = await cloudinary.uploader.upload(resizedImagePath, {
  //           folder: "categories",
  //           timeout: 60000,
  //         });
  //         console.log("Image upload result: ", result);

  //         // Delete the resized image after upload to Cloudinary
  //         fs.unlinkSync(resizedImagePath);

  //         if (result) {
  //           const category = await categoryModel.create({
  //             name,
  //             slug,
  //             image: result.url,
  //           });
  //           return responseReturn(res, 201, {
  //             category,
  //             message: "Category added successfully",
  //           });
  //         } else {
  //           return responseReturn(res, 500, { error: "Image upload failed" });
  //         }
  //       } catch (error) {
  //         console.error("Error Here", error);
  //         return responseReturn(res, 500, { error: "Internal server error" });
  //       }
  //     }
  //   });
  // };


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
            startDate : voucherStartDate,
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
        }
  //   console.log("asdasdasd")
  //   try { 
  //     const vouchers = await voucherModel.find({ isRedeemed: false }); 
  //     if (vouchers.length === 0) {
  //       return responseReturn(res, 409, { error: "No Vouchers Yet" });
  //       }

  //       console.log(vouchers)
  //       return responseReturn(res, 201, {
  //         vouchers
  //       });
  //     } catch (error) { res.status(500).json({ message: error.message }); }
  // };
}

// get_category = async (req, res) => {
//     const { page, searchValue, parPage } = req.query;

//     try {
//       let skipPage = "";
//       if (parPage && page) {
//         skipPage = parseInt(parPage) * (parseInt(page) - 1);
//       }
//       if (searchValue && page && parPage) {
//         const categories = await categoryModel
//           .find({
//             $text: { $search: searchValue },
//           })
//           .skip(skipPage)
//           .limit(parPage)
//           .sort({ createdAt: -1 });
//         const totalCategory = await categoryModel
//           .find({
//             $text: { $search: searchValue },
//           })
//           .countDocuments();
//         responseReturn(res, 200, { totalCategory, categories });
//       } else if (searchValue === "" && page && parPage) {
//         const categories = await categoryModel
//           .find({})
//           .skip(skipPage)
//           .limit(parPage)
//           .sort({ createdAt: -1 });
//         const totalCategory = await categoryModel.find({}).countDocuments();
//         responseReturn(res, 200, { totalCategory, categories });
//       } else {
//         const categories = await categoryModel.find({}).sort({ createdAt: -1 });
//         const totalCategory = await categoryModel.find({}).countDocuments();
//         responseReturn(res, 200, { totalCategory, categories });
//       }
//     } catch (error) {
//       console.log(error.message);
//     }
//   };

module.exports = new categoryController();
