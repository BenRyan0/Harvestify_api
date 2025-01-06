const categoryModel = require("../../models/categoryModel");
const additionalFeatureModel = require("../../models/additionalFeatureModel");
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


  add_category = async (req, res) => {
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return responseReturn(res, 404, { error: "Form parsing error" });
      } else {
        console.log("Form parsed successfully");
        let { name } = fields;
        let { image } = files;
        if (!name || !image) {
          return responseReturn(res, 400, {
            error: "Name or image not provided",
          });
        }
        name = name.trim();
        const slug = name.split(" ").join("-");
  
        // Check if the category already exists
        const existingCategory = await categoryModel.findOne({ name });
        if (existingCategory) {
          return responseReturn(res, 409, { error: "Category already exists" });
        }
  
        cloudinary.config({
          cloud_name: process.env.cloud_name,
          api_key: process.env.api_key,
          api_secret: process.env.api_secret,
          secure: true,
        });
  
        try {
          const resizedImagePath = await this.resizeImage(
            image.filepath || image.path
          );
          console.log(`Uploading resized image: ${resizedImagePath}`);
          const result = await cloudinary.uploader.upload(resizedImagePath, {
            folder: "categories",
            timeout: 60000,
          });
          console.log("Image upload result: ", result);
  
          // Delete the resized image after upload to Cloudinary
          fs.unlinkSync(resizedImagePath);
  
          if (result) {
            const category = await categoryModel.create({
              name,
              slug,
              image: result.url,
            });
            return responseReturn(res, 201, {
              category,
              message: "Category added successfully",
            });
          } else {
            return responseReturn(res, 500, { error: "Image upload failed" });
          }
        } catch (error) {
          console.error("Error Here", error);
          return responseReturn(res, 500, { error: "Internal server error" });
        }
      }
    });
  };

  additional_feature_add = async (req, res) => {
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return responseReturn(res, 404, { error: "Form parsing error" });
      } else {
        console.log("Form parsed successfully");
        let { name } = fields;
        let { description } = fields;
        let { image } = files;
        if (!name || !image) {
          return responseReturn(res, 400, {
            error: "Name or image not provided",
          });
        }
        name = name.trim();
        const slug = name.split(" ").join("-");
  
        // Check if the category already exists
        const existingAdditionalFeature = await additionalFeatureModel.findOne({ name });
        if (existingAdditionalFeature) {
          return responseReturn(res, 409, { error: "Additional Features is already added" });
        }
  
        cloudinary.config({
          cloud_name: process.env.cloud_name,
          api_key: process.env.api_key,
          api_secret: process.env.api_secret,
          secure: true,
        });
  
        try {
          const resizedImagePath = await this.resizeImage(
            image.filepath || image.path
          );
          console.log(`Uploading resized image: ${resizedImagePath}`);
          const result = await cloudinary.uploader.upload(resizedImagePath, {
            folder: "additionalFeatures",
            timeout: 60000,
          });
          console.log("Image upload result: ", result);
  
          // Delete the resized image after upload to Cloudinary
          fs.unlinkSync(resizedImagePath);
  
          if (result) {
            const additionalFeature = await additionalFeatureModel.create({
              name,
              slug,
              description,
              image: result.url,
            });
            return responseReturn(res, 201, {
              additionalFeature,
              message: "Additional Feature added successfully",
            });
          } else {
            return responseReturn(res, 500, { error: "Image upload failed" });
          }
        } catch (error) {
          console.error("Error Here", error);
          return responseReturn(res, 500, { error: "Internal server error" });
        }
      }
    });
  };
  
  get_category = async (req, res) => {
    const { page, searchValue, parPage } = req.query;

    try {
      let skipPage = "";
      if (parPage && page) {
        skipPage = parseInt(parPage) * (parseInt(page) - 1);
      }
      if (searchValue && page && parPage) {
        const categories = await categoryModel
          .find({
            $text: { $search: searchValue },
          })
          .skip(skipPage)
          .limit(parPage)
          .sort({ createdAt: -1 });
        const totalCategory = await categoryModel
          .find({
            $text: { $search: searchValue },
          })
          .countDocuments();
        responseReturn(res, 200, { totalCategory, categories });
      } else if (searchValue === "" && page && parPage) {
        const categories = await categoryModel
          .find({})
          .skip(skipPage)
          .limit(parPage)
          .sort({ createdAt: -1 });
        const totalCategory = await categoryModel.find({}).countDocuments();
        responseReturn(res, 200, { totalCategory, categories });
      } else {
        const categories = await categoryModel.find({}).sort({ createdAt: -1 });
        const totalCategory = await categoryModel.find({}).countDocuments();
        responseReturn(res, 200, { totalCategory, categories });
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  get_additional_feature = async (req, res) => {
    const { page, searchValue, parPage } = req.query;

    try {
      let skipPage = "";
      if (parPage && page) {
        skipPage = parseInt(parPage) * (parseInt(page) - 1);
      }
      if (searchValue && page && parPage) {
        const additionalFeatures = await additionalFeatureModel
          .find({
            $text: { $search: searchValue },
          })
          .skip(skipPage)
          .limit(parPage)
          .sort({ createdAt: -1 });
        const totalAdditionalFeatures = await additionalFeatureModel
          .find({
            $text: { $search: searchValue },
          })
          .countDocuments();
        responseReturn(res, 200, { totalAdditionalFeaturesy, additionalFeatures });
      } else if (searchValue === "" && page && parPage) {
        const additionalFeatures = await additionalFeatureModel
          .find({})
          .skip(skipPage)
          .limit(parPage)
          .sort({ createdAt: -1 });
        const totalAdditionalFeatures = await additionalFeatureModel.find({}).countDocuments();
        responseReturn(res, 200, { totalAdditionalFeatures, additionalFeatures });
      } else {
        const additionalFeatures = await additionalFeatureModel.find({}).sort({ createdAt: -1 });
        const totalAdditionalFeatures = await additionalFeatureModel.find({}).countDocuments();
        responseReturn(res, 200, { totalAdditionalFeatures, additionalFeatures });
      }
    } catch (error) {
      console.log(error.message);
    }
  };
}

module.exports = new categoryController();
