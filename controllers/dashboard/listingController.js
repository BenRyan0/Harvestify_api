const cloudinary = require("cloudinary").v2;
const formidable = require("formidable");
const { responseReturn } = require("../../utils/response");
const listingModel = require("../../models/listingModel");
const AuthorDealModel = require("../../models/authDeal");
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

  // calculateTotalPrice = (pricePerUnit, yieldAmount, priceUnit, yieldUnit) => {
  //   const priceUnitGroup = this.getUnitGroup(priceUnit);
  //   const yieldUnitGroup = this.getUnitGroup(yieldUnit);

  //   // If the unit groups don't match, throw an error
  //   if (priceUnitGroup !== yieldUnitGroup || priceUnitGroup === null) {
  //     throw new Error("Incompatible units: Price unit and yield unit do not match.");
  //   }

  //   // Convert units if necessary
  //   const priceUnitMultiplier = this.unitConversionMap[priceUnit] || 1; // Default multiplier 1 if not found
  //   const yieldUnitMultiplier = this.unitConversionMap[yieldUnit] || 1; // Default multiplier 1 if not found

  //   // Calculate the adjusted price and yield
  //   const adjustedPrice = pricePerUnit / priceUnitMultiplier;
  //   const adjustedYield = yieldAmount * yieldUnitMultiplier;

  //   // Calculate the total price
  //   const totalPrice = adjustedPrice * adjustedYield;
  //   return totalPrice;
  // };


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
  
  calculatePerYield = (unit, yieldAmount, yieldUnit) => {
    const unitMultiplier = this.unitConversionMap[unit] || 1; // Default multiplier 1 if not found
    const yieldUnitMultiplier = this.unitConversionMap[yieldUnit] || 1; // Default multiplier 1 if not found
  
    // Calculate the per yield value
    const perYield = yieldAmount * yieldUnitMultiplier / unitMultiplier;
    return perYield;
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

  get_ongoing_harvest_listings= async (req, res) => {
  const { page, searchValue, parPage } = req.query;
  const { id } = req;
  const currentDate = new Date(); // Get the current date
  const perPage = Number(parPage) || 10; // Default to 10 if undefined
  const currentPage = Number(page) || 1;
  const skipPage = perPage * (currentPage - 1);

  try {
    // Base query: Only listings with past harvestStartDate
    let query = { harvestStartDate: { $lt: currentDate }, sellerId: id };

    // If searchValue exists, apply text search or regex-based search
    if (searchValue) {
      query.$or = [
        { name: { $regex: searchValue, $options: "i" } },
        { category: { $regex: searchValue, $options: "i" } },
        { description: { $regex: searchValue, $options: "i" } },
      ];
    }

    // Fetch paginated listings & total count simultaneously
    const [listings, totalListing] = await Promise.all([
      listingModel.find(query).skip(skipPage).limit(perPage).sort({ createdAt: -1 }),
      listingModel.countDocuments(query),
    ]);

    responseReturn(res, 200, { totalListing, listings });
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

  // listing_update = async (req, res) => {
  //   let {
  //     name,
  //     harvestStartDate,
  //     harvestEndDate,
  //     expectedHarvestYield,
  //     description,
  //     price,
  //     clusterName,
  //     unit,
  //     yieldUnit,
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
  //       yieldUnit,
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

  listing_update = async (req, res) => {
    console.log("TAE")
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
  
    // Trim and generate slug
    name = name.trim();
    const slug = name.split(" ").join("-");
  
    try {
      // Check if the listing is already part of an active deal in authorDeals
      const existingDeal = await AuthorDealModel.findOne({
        listing_: listingId,
      });
  
      if (existingDeal) {
        // If the listing is part of a deal, prevent editing of harvestEndDate and expectedHarvestYield
        if (harvestEndDate) {
          return responseReturn(res, 400, {
            error: "Cannot edit harvestEndDate as this listing is part of an active deal.",
          });
        }
        if (expectedHarvestYield) {
          return responseReturn(res, 400, {
            error: "Cannot edit expectedHarvestYield as this listing is part of an active deal.",
          });
        }
      }
  
      // Proceed to update the listing (if no active deal or if harvestEndDate and expectedHarvestYield are not being edited)
      await listingModel.findByIdAndUpdate(listingId, {
        name,
        harvestStartDate,
        harvestEndDate, // This won't be updated if part of a deal
        expectedHarvestYield, // This won't be updated if part of a deal
        description,
        price,
        clusterName,
        unit,
        yieldUnit,
        sellerDelivery,
        traderPickup,
        slug,
      });
  
      // Fetch the updated listing
      const listing = await listingModel.findById(listingId);
  
      // Return success response
      responseReturn(res, 200, {
        listing,
        message: "Listing Has been Successfully Updated",
      });
    } catch (error) {
      console.log(error)
      // Handle any errors during the process
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
//  add_listing = async (req, res) => {
  
//   console.log("Processing form data...");
  
//   const { id } = req;
//   const form = new formidable.IncomingForm({ multiples: true });

//   form.parse(req, async (err, fields, files) => {
//     if (err) {
//       console.error("Form parsing error:", err);
//       return responseReturn(res, 404, { error: "Form parsing error" });
//     }

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
//       traderPickup,
//       locationInfo,
//       additionalLocationInfo,
//       discount,
//       mapsLink,
//       pricePerUnit,
//       additionalFeatures
//     } = fields;

//     const { images } = files;

//     if (!images || !Array.isArray(images)) {
//       return responseReturn(res, 400, { error: "A minimum of 2 images is required" });
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
//       for (let i = 0; i < images.length; i++) {
//         const resizedImagePath = await this.resizeImage(images[i].filepath);
//         const result = await cloudinary.uploader.upload(resizedImagePath, {
//           folder: "listings",
//         });

//         fs.unlinkSync(resizedImagePath);
//         allImageUrl.push(result.url);
//       }

//       if (allImageUrl.length === 0) {
//         return responseReturn(res, 500, { error: "Image upload failed" });
//       }

//      // Parse price and expected yield as integers
//      const parsedPrice = parseInt(price);
//      const parsedExpectedHarvestYield = parseInt(expectedHarvestYield);

//      // Calculate the total price using this.calculateTotalPrice
//      let totalPrice;
//      try {
//        totalPrice = this.calculateTotalPrice(parsedPrice, parsedExpectedHarvestYield, unit, yieldUnit);
//      } catch (calculationError) {
//        return responseReturn(res, 500, { error: calculationError.message });
//      }

//      // Calculate the per yield value using this.calculatePerYield
//      const perYield = this.calculatePerYield(unit, parsedExpectedHarvestYield, yieldUnit);

//      const listing = await listingModel.create({
//        sellerId: id,
//        name,
//        slug,
//        clusterName,
//        harvestStartDate: new Date(harvestStartDate),
//        harvestEndDate: new Date(harvestEndDate),
//        price: parsedPrice,
//        expectedHarvestYield: parsedExpectedHarvestYield,
//        category: category.trim(),
//        description: description.trim(),
//        unit,
//        yieldUnit,
//        sellerDelivery,
//        traderPickup,
//        images: allImageUrl,
//        totalPrice, // Add total price to the listing
//        perYield, // Add per yield value to the listing
//        pricePerUnit :pricePerUnit,
//        locationInfo,
//        additionalLocationInfo,
//        discount,
//        mapsLink
//      });


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
  

 add_listing = async (req, res) => {
  console.log("Processing form data...");

  const { id } = req;
  const form = new formidable.IncomingForm({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parsing error:", err);
      return responseReturn(res, 404, { error: "Form parsing error" });
    }

    try {
      // Destructure fields
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
        mapsLink,
        pricePerUnit,
        additionalFeatures, // Extract additionalFeatures field
      } = fields;

      const { images } = files;

      // Validate images
      if (!images || !Array.isArray(images)) {
        return responseReturn(res, 400, { error: "A minimum of 2 images is required" });
      }
    
      sellerDelivery = sellerDelivery === "true";
      traderPickup = traderPickup === "true";
  
      // Check if both sellerDelivery and traderPickup are false
      if (!sellerDelivery && !traderPickup) {
        return responseReturn(res, 400, {
          error: "At least one of sellerDelivery or traderPickup must be selected.",
        });
      }


          // Validate description length
    const limitDescriptionWords = (desc, maxWords) => {
      const words = desc.trim().split(/\s+/);
      if (words.length > maxWords) {
        return { isValid: false, truncated: words.slice(0, maxWords).join(" ") };
      }
      return { isValid: true, truncated: desc };
    };

    const descriptionValidation = limitDescriptionWords(description, 100);
    if (!descriptionValidation.isValid) {
      return responseReturn(res, 400, {
        error: `Description exceeds the 100-word limit. Please shorten it.`,
      });
    }
    description = descriptionValidation.truncated;

    
      name = name.trim();
      const slug = name.split(" ").join("-");

      // Cloudinary configuration
      cloudinary.config({
        cloud_name: process.env.cloud_name,
        api_key: process.env.api_key,
        api_secret: process.env.api_secret,
        secure: true,
      });

      // Upload images
      const allImageUrl = [];
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

      // Parse and validate numeric fields
      const parsedPrice = parseInt(price);
      const parsedExpectedHarvestYield = parseInt(expectedHarvestYield);

      // Handle additionalFeatures as an array
      if (typeof additionalFeatures === "string") {
        try {
          additionalFeatures = JSON.parse(additionalFeatures);
          if (!Array.isArray(additionalFeatures)) {
            throw new Error("additionalFeatures must be an array.");
          }
        } catch (e) {
          return responseReturn(res, 400, { error: "Invalid additionalFeatures format. It must be an array." });
        }
      }

      // Calculate additional values
      let totalPrice = this.calculateTotalPrice(parsedPrice, parsedExpectedHarvestYield, unit, yieldUnit);
      let perYield = this.calculatePerYield(unit, parsedExpectedHarvestYield, yieldUnit);

      // Create listing in the database
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
        perYield,
        pricePerUnit,
        locationInfo,
        additionalLocationInfo,
        discount,
        mapsLink,
        additionalFeatures, // Include additionalFeatures
      });

      // Response
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
  takedown_listing = async (req, res) => {
    console.log("TAE")
    const { listingId } = req.body;
  
    try {
      // Check if the listing is part of an active deal in authorDeals
      const existingDeal = await AuthorDealModel.findOne({
        listing_: listingId,
      });
  
      if (existingDeal) {
        // If the listing is part of a deal, prevent deletion
        return responseReturn(res, 400, {
          error: "Cannot delete this listing as it is part of an active deal.",
        });
      }
  
      // If no active deal is found, proceed to delete the listing
      const deletedListing = await listingModel.findByIdAndDelete(listingId);
  
      if (!deletedListing) {
        return responseReturn(res, 404, {
          error: "Listing not found or already deleted.",
        });
      }
  
      // Return success response
      responseReturn(res, 200, {
        message: "Listing has been successfully deleted.",
      });
    } catch (error) {
      // Handle any errors during the process
      responseReturn(res, 500, {
        error: "Listing Deletion Failed",
      });
    }
  };

  updateActualHarvestYield = async (req, res) => {
    const { listingId, actualYield } = req.body; // Get listing ID and actual yield from request
  
    try {
      // Validate input
      if (!listingId || actualYield == null) {
        return responseReturn(res, 400, { error: "Listing ID and actual yield are required." });
      }
  
      if (actualYield < 0) {
        return responseReturn(res, 400, { error: "Actual harvest yield cannot be negative." });
      }
  
      // Find and update the listing
      const updatedListing = await listingModel.findByIdAndUpdate(
        listingId,
        { actualHarvestYield: actualYield },
        { new: true } // Return the updated document
      );
  
      if (!updatedListing) {
        return responseReturn(res, 404, { error: "Listing not found." });
      }
  
      responseReturn(res, 200, { message: "Actual harvest yield updated.", listing: updatedListing });
    } catch (error) {
      console.error("Error updating actual harvest yield:", error);
      responseReturn(res, 500, { error: error.message });
    }
  };
  
  
}

module.exports = new listingController();
