const cloudinary = require("cloudinary").v2;
const formidable = require("formidable");
const { responseReturn } = require("../../utils/response");
const listingModel = require("../../models/listingModel");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const { error } = require("console");

require("dotenv").config();

class listingController {
  unitConversionMap = {
    'kl': 1, // Kiloliter
    'L': 1 / 1000, // Liter
    't': 1, // Metric Ton
    'tn': 1, // Short Ton
    'kg': 1 / 1000, // Kilogram
    'm³': 1, // Cubic Meter
    'lb': 1 / 2204.62, // Pound (approx)
    'ct': 1, // Count (assumed to be a unit itself)
    'bx': 1, // Box (assumed to be a unit itself)
    // Add more unit conversions as necessary
  };

  getUnitGroup = (unit) => {
    if (['kl', 'L', 'm³'].includes(unit)) return 'liquid';
    if (['t', 'tn', 'kg', 'lb'].includes(unit)) return 'weight';
    if (['ct', 'bx'].includes(unit)) return 'count';
    return null; // Return null for unsupported units
  };

  calculateTotalPrice = (pricePerUnit, yieldAmount, priceUnit, yieldUnit) => {
    const priceUnitGroup = this.getUnitGroup(priceUnit);
    const yieldUnitGroup = this.getUnitGroup(yieldUnit);

    // If the unit groups don't match, throw an error
    if (priceUnitGroup !== yieldUnitGroup || priceUnitGroup === null) {
      throw new Error("Incompatible units: Price unit and yield unit do not match.");
    }

    // Convert units if necessary
    const priceUnitMultiplier = this.unitConversionMap[priceUnit] || 1; // Default multiplier 1 if not found
    const yieldUnitMultiplier = this.unitConversionMap[yieldUnit] || 1; // Default multiplier 1 if not found

    // Calculate the adjusted price and yield
    const adjustedPrice = pricePerUnit / priceUnitMultiplier;
    const adjustedYield = yieldAmount * yieldUnitMultiplier;

    // Calculate the total price
    const totalPrice = adjustedPrice * adjustedYield;
    return totalPrice;
  };

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

  // add_listing = async (req, res) => {
  //   console.log("asdasdasd")
  //   console.log(req.body)

  //   const { id } = req;
    
  //   const form = new formidable.IncomingForm({ multiples: true });

  //   form.parse(req, async (err, fields, files) => {
  //     console.log(files)
  //     if (err) {
  //       console.error("Form parsing error:", err);
  //       return responseReturn(res, 404, { error: "Form parsing error" });
  //     }

  //     // console.log("Parsed fields:", fields);
  //     // console.log("Parsed files:", files);

  //     let {
  //       name,
  //       harvestStartDate,
  //       harvestEndDate,
  //       expectedHarvestYield,
  //       description,
  //       price,
  //       unit,
  //       yieldUnit,
  //       category,
  //       clusterName,
  //       sellerDelivery,
  //       traderPickup
  //     } = fields;

  //     const { images } = files;

  //     if (!images || !Array.isArray(images)) {
  //       console.error("No Images Were provided");
  //       return responseReturn(res, 400, {
  //         error: "A minimum of 2 images is required",
  //       });
  //     }

  //     name = name.trim();
  //     const slug = name.split(" ").join("-");

  //     cloudinary.config({
  //       cloud_name: process.env.cloud_name,
  //       api_key: process.env.api_key,
  //       api_secret: process.env.api_secret,
  //       secure: true,
  //     });

  //     try {
  //       let allImageUrl = [];
  //       console.log("Initial allImageUrl:", allImageUrl);

  //       for (let i = 0; i < images.length; i++) {
  //         try {
  //           console.log(`Resizing image: ${images[i].filepath}`);
  //           const resizedImagePath = await this.resizeImage(images[i].filepath);
  //           console.log(`Uploading resized image: ${resizedImagePath}`);
  //           const result = await cloudinary.uploader.upload(resizedImagePath, {
  //             folder: "listings",
  //           });
  //           console.log("Image upload result:", result);

  //           // Delete the resized image after upload to Cloudinary
  //           fs.unlinkSync(resizedImagePath);

  //           allImageUrl.push(result.url);
  //         } catch (uploadError) {
  //           console.error(
  //             `Error uploading image ${images[i].filepath}:`,
  //             uploadError
  //           );
  //         }
  //       }
  //       console.log("Final allImageUrl:", allImageUrl);

  //       if (allImageUrl.length === 0) {
  //         console.error("No images were successfully uploaded");
  //         return responseReturn(res, 500, { error: "Image upload failed" });
  //       }

  //       const listing = await listingModel.create({
  //         sellerId: id,
  //         name,
  //         slug,
  //         clusterName,
  //         harvestStartDate: new Date(harvestStartDate),
  //         harvestEndDate: new Date(harvestEndDate),
  //         price: parseInt(price),
  //         expectedHarvestYield: parseInt(expectedHarvestYield),
  //         category: category.trim(),
  //         description: description.trim(),
  //         unit,
  //         yieldUnit,
  //         sellerDelivery,
  //         traderPickup,
  //         images: allImageUrl,
  //       });

  //       responseReturn(res, 201, {
  //         message: "Listing added successfully",
  //         listing,
  //       });
  //     } catch (error) {
  //       console.error("Error creating listing:", error);
  //       responseReturn(res, 500, { error: error.message });
  //     }
  //   });
  // };

  // listing_get = async (req, res) => {
  //   const { page, searchValue, parPage } = req.query;
  //   const { id } = req;
  //   const skipPage = parseInt(parPage) * (parseInt(page) - 1);

  //   try {
  //     if (searchValue && page && parPage) {
  //       await listingModel
  //         .find({
  //           $text: { $search: searchValue },
  //           sellerId: id,
  //         })
  //         .skip(skipPage)
  //         .limit(parPage)
  //         .sort({ createdAt: -1 });
  //       const totalListing = await listingModel
  //         .find({
  //           $text: { $search: searchValue },
  //           sellerId: id,
  //         })
  //         .countDocuments();
  //       responseReturn(res, 200, { totalListing, listings });
  //     } else {
  //       const listings = await listingModel
  //         .find({ sellerId: id })
  //         .skip(skipPage)
  //         .limit(parPage)
  //         .sort({ createdAt: -1 });
  //       const totalListing = await listingModel
  //         .find({ sellerId: id })
  //         .countDocuments();
  //       responseReturn(res, 200, { totalListing, listings });
  //     }
  //   } catch (error) {
  //     console.error("Error fetching listings:", error);
  //     responseReturn(res, 500, { error: error.message });
  //   }
  // };


  
  listings_get = async (req, res) => {
    const { page, searchValue, parPage } = req.query;
    const { id } = req;
    const skipPage = parseInt(parPage) * (parseInt(page) - 1);

    try {
      if (searchValue && page && parPage) {
        const listings = await listingModel
          .find({
            $text: { $search: searchValue },
            sellerId: id,
          })
          .skip(skipPage)
          .limit(parPage)
          .sort({ createdAt: -1 });
        const totalListing = await listingModel
          .find({
            $text: { $search: searchValue },
            sellerId: id,
          })
          .countDocuments();
        responseReturn(res, 200, { totalListing, listings });
      } else {
        const listings = await listingModel
          .find({ sellerId: id })
          .skip(skipPage)
          .limit(parPage)
          .sort({ createdAt: -1 });
        const totalListing = await listingModel
          .find({ sellerId: id })
          .countDocuments();
        responseReturn(res, 200, { totalListing, listings });
      }
    } catch (error) {
      console.error("Error fetching listings:", error);
      responseReturn(res, 500, { error: error.message });
    }
  };

  listing_get = async (req, res) => {
    const { listingId } = req.params;
    try {
      const listing = await listingModel.findById(listingId);
      responseReturn(res, 200, { listing });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };

  listing_update = async (req, res) => {
    let {
      name,
      harvestStartDate,
      harvestEndDate,
      expectedHarvestYield,
      description,
      price,
      clusterName,
      unit,
      yieldUnit,
      sellerDelivery,
      traderPickup,
      listingId,
    } = req.body;
    console.log(req.body);

    name = name.trim();
    const slug = name.split(" ").join("-");

    try {
      await listingModel.findByIdAndUpdate(listingId, {
        name,
        harvestStartDate,
        harvestEndDate,
        expectedHarvestYield,
        description,
        price,
        clusterName,
        unit,
        yieldUnit,
        sellerDelivery,
        traderPickup,
        slug,
      });

      const listing = await listingModel.findById(listingId);
      responseReturn(res, 200, {
        listing,
        message: "Listing Has been Successfully Updated",
      });
    } catch (error) {
      responseReturn(res, 500, {
        error: "Listing Update Has failed",
      });
    }
  };


  listing_image_update = async(req, res)=>{
    // const form = formidable.IncomingForm({multiples: true})
    console.log('01')
    const form = new formidable.IncomingForm({ multiples: true });

    form.parse(req, async(err,field,files) => {
      const {listingId, oldImage} = field;
      const {newImage} = files
      console.log('02')

      if(err){
        console.log('03')
        responseReturn(res, 500, {
          error: error.message,
        });
      }else{
        try {
          cloudinary.config({
            cloud_name: process.env.cloud_name,
            api_key: process.env.api_key,
            api_secret: process.env.api_secret,
            secure: true,
          });
  
          const result = await cloudinary.uploader.upload(newImage.filepath, {
            folder: "listings",
          });
  
          if(result){
             let {images} = await listingModel.findById(listingId)
             const index = images.findIndex(img=>img === oldImage)
             images[index] = result.url;
  
             await listingModel.findByIdAndUpdate(listingId,{
              images
             })
  
             const listing = await listingModel.findById(listingId);
             responseReturn(res, 200, {
               listing,
               message: "Listing Image Has been Successfully Updated",
             });
          }else{
            responseReturn(res, 500, {
              error: "New Listing Image Upload Failed",
            });
          }
        } catch (error) {
          responseReturn(res, 500, {
            error: error.message
          });
          
        }
      }

    })
  }

  


 // Modify add_listing method to use this.calculateTotalPrice
 add_listing = async (req, res) => {
  
  console.log("Processing form data...");
  
  const { id } = req;
  const form = new formidable.IncomingForm({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parsing error:", err);
      return responseReturn(res, 404, { error: "Form parsing error" });
    }

    let {
      name,
      harvestStartDate,
      harvestEndDate,
      expectedHarvestYield,
      description,
      price,
      unit,
      yieldUnit,
      category,
      clusterName,
      sellerDelivery,
      traderPickup,
      locationInfo,
      additionalLocationInfo,
      discount,
      mapsLink
    } = fields;

    const { images } = files;

    if (!images || !Array.isArray(images)) {
      return responseReturn(res, 400, { error: "A minimum of 2 images is required" });
    }

    name = name.trim();
    const slug = name.split(" ").join("-");

    cloudinary.config({
      cloud_name: process.env.cloud_name,
      api_key: process.env.api_key,
      api_secret: process.env.api_secret,
      secure: true,
    });

    try {
      let allImageUrl = [];
      for (let i = 0; i < images.length; i++) {
        const resizedImagePath = await this.resizeImage(images[i].filepath);
        const result = await cloudinary.uploader.upload(resizedImagePath, {
          folder: "listings",
        });

        fs.unlinkSync(resizedImagePath);
        allImageUrl.push(result.url);
      }

      if (allImageUrl.length === 0) {
        return responseReturn(res, 500, { error: "Image upload failed" });
      }

      // Parse price and expected yield as integers
      const parsedPrice = parseInt(price);
      const parsedExpectedHarvestYield = parseInt(expectedHarvestYield);

      // Calculate the total price using this.calculateTotalPrice
      let totalPrice;
      try {
        totalPrice = this.calculateTotalPrice( // Use `this` here
          parsedPrice,
          parsedExpectedHarvestYield,
          unit,
          yieldUnit
        );
      } catch (calculationError) {
        return responseReturn(res, 500, { error: calculationError.message });
      }

      const listing = await listingModel.create({
        sellerId: id,
        name,
        slug,
        clusterName,
        harvestStartDate: new Date(harvestStartDate),
        harvestEndDate: new Date(harvestEndDate),
        price: parsedPrice,
        expectedHarvestYield: parsedExpectedHarvestYield,
        category: category.trim(),
        description: description.trim(),
        unit,
        yieldUnit,
        sellerDelivery,
        traderPickup,
        images: allImageUrl,
        totalPrice,
        locationInfo, // Add total price to the listing
        additionalLocationInfo,
        discount,
        mapsLink
      });

      responseReturn(res, 201, {
        message: "Listing added successfully",
        listing,
      });
    } catch (error) {
      console.error("Error creating listing:", error);
      responseReturn(res, 500, { error: error.message });
    }
  });
};
  




  // listing_update = async (req, res) => {
  //   const {
  //     name,
  //     harvestStartDate,
  //     harvestEndDate,
  //     expectedHarvestYield,
  //     description,
  //     price,
  //     clusterName,
  //     unit,
  //     sellerDelivery,
  //     traderPickup,
  //     listingId,
  //   } = req.body;
  //   console.log(req.body);
  //   name = name.trim();
  //   const slug = name.split(" ").join("-");

  //   try {
  //     await listingModel.findByIdAndUpdate(listingId, {
  //       name,
  //       harvestStartDate,
  //       harvestEndDate,
  //       expectedHarvestYield,
  //       description,
  //       price,
  //       clusterName,
  //       unit,
  //       sellerDelivery,
  //       traderPickup,
  //       slug,
  //     });

  //     const listing = await listingModel.findById(listingId);
  //     responseReturn(res, 200, {
  //       listing,
  //       message: "Listing Has been Successfully Updated",
  //     });
  //   } catch (error) {
  //     responseReturn(res, 500, {
  //       error: "Listing Update Has failed",
  //     });
  //   }
  // };
}

module.exports = new listingController();
