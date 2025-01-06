// Cloudinary
const cloudinary = require("cloudinary").v2;
const formidable = require("formidable");


const { response } = require("express");
const adminModel = require("../models/adminModel");
const sellerModel = require("../models/sellerModel");
const { responseReturn } = require("../utils/response");
const { createToken } = require("../utils/tokenCreate");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sellerCustomerModel = require("../models/chat/sellerCustomerModel");




require("dotenv").config();


const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const { error } = require("console");
const traderModel = require("../models/traderModel");


class authControllers {
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
      .resize(1000, 1000) // Adjust the width and height as needed
      .toFile(outputFilePath);
    return outputFilePath;
  };







  admin_login = async (req, res) => {
    const { email, password } = req.body;
    try {
      const admin = await adminModel.findOne({ email }).select("+password");
      if (admin) {
        const match = await bcrypt.compare(password, admin.password);
        if (match) {
          const token = await createToken({
            id: admin._id,
            role: admin.role,
          });

          res.cookie("accessToken", token, {
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          });
          responseReturn(res, 200, { token, message: "Login Success" });
        } else {
          responseReturn(res, 404, {
            error: "Invalid Credentials, Please try Again",
          });
        }
      } else {
        responseReturn(res, 404, {
          error: "Invalid Credentials, Please try Again",
        });
      }
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };

  seller_login = async (req, res) => {
    const { email, password } = req.body;
    try {
      const seller = await sellerModel.findOne({ email }).select("+password");

      console.log(seller);
      if (seller) {
        const match = await bcrypt.compare(password, seller.password);
        if (match) {
          const token = await createToken({
            id: seller._id,
            role: seller.role,
          });

          res.cookie("accessToken", token, {
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          });
          responseReturn(res, 200, { token, message: "Login Success" });
        } else {
          responseReturn(res, 404, {
            error: "Invalid Credentials, Please try Again",
          });
        }
      } else {
        responseReturn(res, 404, {
          error: "Invalid Credentials, Please try Again",
        });
      }
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };

  seller_register = async (req, res) => {
    try {
      const { email } = req.body;
      // Check if the email already exists
      const getSeller = await sellerModel.findOne({ email });
      if (getSeller) {
        return responseReturn(res, 404, {
          error: "Email is already used. Please login instead.",
        });
      }
  
      const form = new formidable.IncomingForm({ multiples: true });
      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error("Form parsing error:", err);
          return responseReturn(res, 400, { error: "Form parsing error" });
        }
  
        // Destructure fields and files
        let {
          firstName,
          middleName,
          lastName,
          birthDate,
          sex,
          email,
          phoneNumber,
          associationName,
          associationloc_street,
          associationloc_barangay,
          associationloc_province,
          associationloc_municipalitycity,
          password,
        } = fields;
  
        const {
          associationImage,
          profileImage,
          validId_img,
          credential_img01,
          credential_img02,
          credential_img03,
        } = files;
  
        // Configure Cloudinary
        cloudinary.config({
          cloud_name: process.env.cloud_name,
          api_key: process.env.api_key,
          api_secret: process.env.api_secret,
          secure: true,
        });
  
        try {
          // Helper function to resize and upload images
          const resizeAndUploadImage = async (imageFile, folder) => {
            const resizedImage = await this.resizeImage(imageFile.filepath || imageFile.path);
            return cloudinary.uploader.upload(resizedImage, { folder });
          };
  
          // Upload all images in parallel
          const [
            associationImageURL,
            profileImageURL,
            validIdURL,
            credential1URL,
            credential2URL,
            credential3URL
          ] = await Promise.all([
            resizeAndUploadImage(associationImage, "sellersCredentials"),
            resizeAndUploadImage(profileImage, "sellersCredentials"),
            resizeAndUploadImage(validId_img, "sellersCredentials"),
            resizeAndUploadImage(credential_img01, "sellersCredentials"),
            resizeAndUploadImage(credential_img02, "sellersCredentials"),
            resizeAndUploadImage(credential_img03, "sellersCredentials")
          ]);
  
          // Create seller
          const hashedPassword = await bcrypt.hash(password, 10);
          const seller = await sellerModel.create({
            firstName,
            middleName,
            lastName,
            birthDate: new Date(birthDate),
            sex,
            phoneNumber,
            email,
            password: hashedPassword, // Hash password before storing
            associationName,
            associationloc_street,
            associationloc_barangay,
            associationloc_province,
            associationloc_municipalitycity,
            associationImage: associationImageURL.url,
            profileImage: profileImageURL.url,
            validId_img: validIdURL.url,
            credential_img01: credential1URL.url,
            credential_img02: credential2URL.url,
            credential_img03: credential3URL.url,
            method: "manually",
            clusterInfo:{
              clusterName: associationName
            }
          });
  
          // Create associated chat model
          await sellerCustomerModel.create({ myId: seller.id });
  
          // Create token and send it in the cookie
          const token = await createToken({ id: seller.id, role: seller.role });
          res.cookie("accessToken", token, {
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days expiry
          });
  
          // Return success response
          responseReturn(res, 201, {
            token,
            message: "Request Recorded.",
          });
        } catch (error) {
          console.error("Image upload or seller creation error:", error);
          return responseReturn(res, 500, { error: "Internal server error." });
        }
      });
    } catch (error) {
      console.error("Registration error:", error);
      return responseReturn(res, 500, { error: "Internal server error." });
    }
  };
  
  
  
  // seller_register = async (req, res) => {
  //   console.log(req.body)
  //   try {
  //     const getSeller = await sellerModel.findOne({ email });
  //     if (getUser) {
  //       responseReturn(res, 404, {
  //         error: "Email was already used. Consider logging in",
  //       });
  //     } else {
  //       try {
  //         const form = new formidable.IncomingForm({ multiples: true });
  //         // console.log(AssociationInfo.associationName)
  //          console.log("01")
  //          form.parse(req, async (err, fields, files) => {
  //           console.log(files)
  //           console.log("02")
  //           if (err) {
  //                console.error("Form parsing error:", err);
  //                return responseReturn(res, 400, { error: "Form parsing error" });
  //            }
  //            let {
  //             firstName,
  //             middleName,
  //             lastName,
  //             birthDate,
  //             sex,
  //             phoneNumber,
  //             email,
  //             password,
  //             associationName,
  //             associationloc_street,
  //             associationloc_barangay,
  //             associationloc_province,
  //             associationloc_municipalitycity
  //           } = fields;
      
  //           const { 
  //           associationImage,
  //           profileImage,
  //           validId_img,
  //           credential_img02,
  //           credential_img01,
  //           credential_img03 
  //           } = files;
      
  //            cloudinary.config({
  //             cloud_name: process.env.cloud_name,
  //             api_key: process.env.api_key,
  //             api_secret: process.env.api_secret,
  //             secure: true,
  //           });
  //           console.log("04")
            
  //           try {
  //             // Association Image
  //             const resizedAssociationImage = await this.resizeImage(
  //               associationImage.filepath || associationImage.path
  //             );
  //             console.log("image resized")
  //             const associationImageURL = await cloudinary.uploader.upload(resizedAssociationImage, {
  //               folder: "sellersCredentials",
  //             });
  //             console.log("image uploaded")
      
  //             // Profile Image
  //             const resizedProfileImage = await this.resizeImage(
  //               profileImage.filepath || profileImage.path
  //             );
  //             console.log("image resized")
  //             const profileImageImageURL = await cloudinary.uploader.upload(resizedProfileImage, {
  //               folder: "sellersCredentials",
  //             });
  //             console.log("image uploaded")
      
  //             // Valid ID image
  //             const resizedValidId_img = await this.resizeImage(
  //               validId_img.filepath || validId_img.path
  //             );
  //             console.log("image resized")
  //             const validId_imgURL = await cloudinary.uploader.upload(resizedValidId_img, {
  //               folder: "sellersCredentials",
  //             });
  //             console.log("image uploaded")
      
  //             // Credential 01
  //             const resizedCredential1 = await this.resizeImage(
  //                credential_img01.filepath ||  credential_img01.path
  //             );
  //             console.log("image resized")
  //             const Credential1URL = await cloudinary.uploader.upload(resizedCredential1, {
  //               folder: "sellersCredentials",
  //             });
  //             console.log("image uploaded")
      
  //             // Credential 02
  //             const resizedCredential2 = await this.resizeImage(
  //                credential_img02.filepath ||  credential_img02.path
  //             );
  //             console.log("image resized")
  //             const Credential2URL = await cloudinary.uploader.upload(resizedCredential2, {
  //               folder: "sellersCredentials",
  //             });
  //             console.log("image uploaded")
      
  //             // Credential 03
  //             const resizedCredential3 = await this.resizeImage(
  //                credential_img03.filepath ||  credential_img03.path
  //             );
  //             console.log("image resized")
  //             const Credential3URL = await cloudinary.uploader.upload(resizedCredential3, {
  //               folder: "sellersCredentials",
  //             });
  //             console.log("image uploaded")





  //             try {
  //                  // Adding the user to the database
  //                   const seller = await sellerModel.create({
  //                     firstName,
  //                     middleName,
  //                     lastName,
  //                     birthDate: new Date(birthDate),
  //                     sex,
  //                     phoneNumber,
  //                     email,
  //                     password,
  //                     associationName,
  //                     associationloc_street,
  //                     associationloc_barangay,
  //                     associationloc_province,
  //                     associationloc_municipalitycity,
  //                     associationImage:associationImageURL,
  //                     profileImage:profileImageImageURL,
  //                     validId_img:validId_imgURL,
  //                     credential_img02:Credential2URL,
  //                     credential_img01:Credential1URL,
  //                     credential_img03:Credential3URL,
  //                     password: await bcrypt.hash(password, 10),
  //                     method: "manually"
  //                   });
  //                   await sellerCustomerModel.create({
  //                     myId: seller.id,
  //                   });
  //                   const token = await createToken({ id: seller.id, role: seller.role });
  //                   res.cookie("accessToken", token, {
  //                     expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  //                   });

  //                   responseReturn(res, 201, {
  //                     token,
  //                     message: "Seller Registration Successfully filled in",
  //                   });
                
  //             } catch (error) {
                
  //             }
              
  //           } catch (error) {
  //             console.log(error)
              
  //           }
      
      
  //         })
          
  //       } catch (error) {
          
  //       }

  //     }
      
      
  //   } catch (error) {
  //     responseReturn(res, 500, {
  //       error: "Internal Server Error",
  //     });
      
  //   }

     

  // };

  


  getUser = async (req, res) => {
    const { id, role } = req;
    try {
      if (role === "admin") {
        const user = await adminModel.findById(id);
        responseReturn(res, 200, { userInfo: user });
        console.log(user);
      } else {
        const seller = await sellerModel.findById(id);
        // console.log("SELLER __________________________")
        // console.log(seller)
        responseReturn(res, 200, { userInfo: seller });
        // console.log(seller);
      }
    } catch (error) {
      responseReturn(res, 500, {
        error: "Internal Server Error",
      });
    }
  };

  // profile_image_upload = async (req, res) => {
  //   const { id } = req;
  //   const form = new formidable.IncomingForm({ multiples: true });
    
  //   console.log("01");
  
  //   form.parse(req, async (err, fields, files) => {
  //     if (err) {
  //       console.error("Form parsing error:", err);
  //       return responseReturn(res, 400, { error: "Form parsing error" });
  //     }
  
  //     cloudinary.config({
  //       cloud_name: process.env.cloud_name,
  //       api_key: process.env.api_key,
  //       api_secret: process.env.api_secret,
  //       secure: true,
  //     });
  
  //     const { image } = files; // Accessing the uploaded file
  //     console.log(image)
  
  //     if (!image || !image.filepath) {
  //       return responseReturn(res, 400, { error: "No image file provided." });
  //     }
  
  //     try {
  //       console.log("02");
  //       const result = await cloudinary.uploader.upload(image.filepath, {
  //         folder: "profile",
  //       });
  //       console.log("03");
  
  //       if (result) {
  //         await sellerModel.findByIdAndUpdate(id, {
  //           image: result.url,
  //         });
  //         console.log("04");
  //         responseReturn(res, 201, {
  //           message: "Image Uploaded Successfully",
  //         });
  //       } else {
  //         console.log("05");
  //         responseReturn(res, 404, {
  //           error: "Image upload failed",
  //         });
  //       }
  //     } catch (error) {
  //       console.error("Upload error:", error);
  //       responseReturn(res, 500, {
  //         error: error.message,
  //       });
  //     }
  //   });
  // };
  

  profile_image_upload = async (req, res) => {
    const { id } = req;
    const form = new formidable.IncomingForm({ multiples: true });
  
    console.log("01");
  
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Form parsing error:", err);
        return responseReturn(res, 400, { error: "Form parsing error" });
      }
  
      cloudinary.config({
        cloud_name: process.env.cloud_name,
        api_key: process.env.api_key,
        api_secret: process.env.api_secret,
        secure: true,
      });
  
      const { image } = files; // Accessing the uploaded file
      console.log(image);
  
      if (!image || !image.filepath) {
        return responseReturn(res, 400, { error: "No image file provided." });
      }
  
      try {
        // Resize the image
        const resizedImagePath = await this.resizeImage(image.filepath);
        console.log("Resized image path:", resizedImagePath);
  
        console.log("02");
        const result = await cloudinary.uploader.upload(resizedImagePath, {
          folder: "profile",
        });
        console.log("03");
  
        // Clean up the resized image from the server after upload
        fs.unlinkSync(resizedImagePath);
  
        if (result) {
          await sellerModel.findByIdAndUpdate(id, {
            profileImage: result.url,
          });
          const userInfo = await sellerModel.findById(id)
          console.log("04");
          responseReturn(res, 201, {
            message: "Image Uploaded Successfully", userInfo
          });
        } else {
          console.log("05");
          responseReturn(res, 404, {
            error: "Image upload failed",
          });
        }
      } catch (error) {
        console.error("Upload error:", error);
        responseReturn(res, 500, {
          error: error.message,
        });
      }
    });
  };

  association_image_upload = async (req, res) => {
    const { id } = req;
    const form = new formidable.IncomingForm({ multiples: true });
  
    console.log("01");
  
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Form parsing error:", err);
        return responseReturn(res, 400, { error: "Form parsing error" });
      }
  
      cloudinary.config({
        cloud_name: process.env.cloud_name,
        api_key: process.env.api_key,
        api_secret: process.env.api_secret,
        secure: true,
      });
  
      const { image } = files; // Accessing the uploaded file
      console.log(image);
  
      if (!image || !image.filepath) {
        return responseReturn(res, 400, { error: "No image file provided." });
      }
  
      try {
        // Resize the image
        const resizedImagePath = await this.resizeImage(image.filepath);
        console.log("Resized image path:", resizedImagePath);
  
        console.log("02");
        const result = await cloudinary.uploader.upload(resizedImagePath, {
          folder: "profile",
        });
        console.log("03");
  
        // Clean up the resized image from the server after upload
        fs.unlinkSync(resizedImagePath);
  
        if (result) {
          await sellerModel.findByIdAndUpdate(id, {
            profileImage: result.url,
          });
          const userInfo = await sellerModel.findById(id)
          console.log("04");
          responseReturn(res, 201, {
            message: "Image Uploaded Successfully", userInfo
          });
        } else {
          console.log("05");
          responseReturn(res, 404, {
            error: "Image upload failed",
          });
        }
      } catch (error) {
        console.error("Upload error:", error);
        responseReturn(res, 500, {
          error: error.message,
        });
      }
    });
  };

  logout = async (req, res) => {
    try {
      res.cookie('accessToken', null,{
        expires : new Date(Date.now()),
        httpOnly: true
      })

      responseReturn(res,200,{
        message: "Logged out Successfully"
      })
    } catch (error) {
      responseReturn(res, 500, {
        error: error.message,
      });
      
    }
  }

  // trader_register = async (req, res) => {
  //   console.log(req.body)
  //   try {
  //     const { email } = req.body;
  //     // Check if the email already exists
  //     const getTrader = await traderModel.findOne({ email });
  //     if (getTrader) {
  //       return responseReturn(res, 404, {
  //         error: "Email is already used. Please login instead.",
  //       });
  //     }
  
  //     const form = new formidable.IncomingForm({ multiples: true });
  //     form.parse(req, async (err, fields, files) => {
  //       if (err) {
  //         console.error("Form parsing error:", err);
  //         return responseReturn(res, 400, { error: "Form parsing error" });
  //       }
  
  //       // Destructure fields and files
  //       let {
  //         firstName,
  //         middleName,
  //         lastName,
  //         birthDate,
  //         sex,
  //         email,
  //         phoneNumber,
  //         associationName,
  //         associationloc_street,
  //         associationloc_barangay,
  //         associationloc_province,
  //         associationloc_municipalitycity,
  //         password,
  //       } = fields;
  
  //       const {
  //         associationImage,
  //         profileImage,
  //         validId_img,
  //         credential_img01,
  //         credential_img02,
  //         credential_img03,
  //       } = files;
  
  //       // Configure Cloudinary
  //       cloudinary.config({
  //         cloud_name: process.env.cloud_name,
  //         api_key: process.env.api_key,
  //         api_secret: process.env.api_secret,
  //         secure: true,
  //       });
  
  //       try {
  //         // Helper function to resize and upload images
  //         const resizeAndUploadImage = async (imageFile, folder) => {
  //           const resizedImage = await this.resizeImage(imageFile.filepath || imageFile.path);
  //           return cloudinary.uploader.upload(resizedImage, { folder });
  //         };
  
  //         // Upload all images in parallel
  //         const [
  //           associationImageURL,
  //           profileImageURL,
  //           validIdURL,
  //           credential1URL,
  //           credential2URL,
  //           credential3URL
  //         ] = await Promise.all([
  //           resizeAndUploadImage(associationImage, "tradersCredentials"),
  //           resizeAndUploadImage(profileImage, "tradersCredentials"),
  //           resizeAndUploadImage(validId_img, "tradersCredentials"),
  //           resizeAndUploadImage(credential_img01, "tradersCredentials"),
  //           resizeAndUploadImage(credential_img02, "tradersCredentials"),
  //           resizeAndUploadImage(credential_img03, "tradersCredentials")
  //         ]);
  
  //         // Create seller
  //         const hashedPassword = await bcrypt.hash(password, 10);
  //         const seller = await traderModel.create({
  //           firstName,
  //           middleName,
  //           lastName,
  //           birthDate: new Date(birthDate),
  //           sex,
  //           phoneNumber,
  //           email,
  //           password: hashedPassword, // Hash password before storing
  //           associationName,
  //           associationloc_street,
  //           associationloc_barangay,
  //           associationloc_province,
  //           associationloc_municipalitycity,
  //           associationImage: associationImageURL.url,
  //           profileImage: profileImageURL.url,
  //           validId_img: validIdURL.url,
  //           credential_img01: credential1URL.url,
  //           credential_img02: credential2URL.url,
  //           credential_img03: credential3URL.url,
  //           method: "manually",
  //           clusterInfo:{
  //             clusterName: associationName
  //           }
  //         });
  
  //         // Create associated chat model
  //         await sellerCustomerModel.create({ myId: seller.id });
  
  //         // Create token and send it in the cookie
  //         const token = await createToken({ id: seller.id, role: seller.role });
  //         res.cookie("accessToken", token, {
  //           expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days expiry
  //         });
  
  //         // Return success response
  //         responseReturn(res, 201, {
  //           token,
  //           message: "Trader Application Request Recorded.",
  //         });
  //       } catch (error) {
  //         console.error("Image upload or seller creation error:", error);
  //         return responseReturn(res, 500, { error: "Internal server error." });
  //       }
  //     });
  //   } catch (error) {
  //     console.error("Registration error:", error);
  //     return responseReturn(res, 500, { error: "Internal server error." });
  //   }
  // };
  





//  trader_register = async (req, res) => {
//     console.log("Request Body:", req.body);
  
//     try {
//       const form = new formidable.IncomingForm({ multiples: true });
  
//       form.parse(req, (err, fields, files) => {
//         if (err) {
//           console.error("Form parsing error:", err);
//           return res.status(400).json({ error: "Form parsing error" });
//         }
  
//         // Log the fields from the form data
//         console.log("Fields:", fields);
  
//         // Respond with a success message
//         res.status(200).json({
//           message: "Form data received successfully",
//           fields, // Include fields in the response if needed
//         });
//       });
//     } catch (error) {
//       console.error("Registration error:", error);
//       res.status(500).json({ error: "Internal server error." });
//     }
//   };


trader_register = async (req, res) => {
  try {
    const form = new formidable.IncomingForm({ multiples: true });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Form parsing error:", err);
        return responseReturn(res, 400, { error: "Form parsing error" });
      }

      // Extract email from fields
      const { email } = fields;

      if (!email) {
        return responseReturn(res, 400, { error: "Email is required." });
      }

      try {
        // Check if the email already exists in the database
        const getTrader = await traderModel.findOne({ email });
        if (getTrader) {
          return responseReturn(res, 409, {
            error: "Email is already used. Please login instead.",
          });
        }

        // Proceed with the rest of the logic
        let {
          firstName,
          middleName,
          lastName,
          birthDate,
          sex,
          phoneNumber,
          associationName,
          associationloc_street,
          associationloc_barangay,
          associationloc_province,
          associationloc_municipalitycity,
          password,
        } = fields;

        const {
          associationImage,
          profileImage,
          validId_img,
          credential_img01,
          credential_img02,
          credential_img03,
        } = files;

        // Configure Cloudinary
        cloudinary.config({
          cloud_name: process.env.cloud_name,
          api_key: process.env.api_key,
          api_secret: process.env.api_secret,
          secure: true,
        });

        // Helper function to resize and upload images
        const resizeAndUploadImage = async (imageFile, folder) => {
          const resizedImage = await this.resizeImage(
            imageFile.filepath || imageFile.path
          );
          return cloudinary.uploader.upload(resizedImage, { folder });
        };

        // Upload all images in parallel
        const [
          associationImageURL,
          profileImageURL,
          validIdURL,
          credential1URL,
          credential2URL,
          credential3URL,
        ] = await Promise.all([
          resizeAndUploadImage(associationImage, "tradersCredentials"),
          resizeAndUploadImage(profileImage, "tradersCredentials"),
          resizeAndUploadImage(validId_img, "tradersCredentials"),
          resizeAndUploadImage(credential_img01, "tradersCredentials"),
          resizeAndUploadImage(credential_img02, "tradersCredentials"),
          resizeAndUploadImage(credential_img03, "tradersCredentials"),
        ]);

        // Create seller
        const hashedPassword = await bcrypt.hash(password, 10);
        const seller = await traderModel.create({
          firstName,
          middleName,
          lastName,
          birthDate: new Date(birthDate),
          sex,
          phoneNumber,
          email,
          password: hashedPassword,
          associationName,
          associationloc_street,
          associationloc_barangay,
          associationloc_province,
          associationloc_municipalitycity,
          associationImage: associationImageURL.url,
          profileImage: profileImageURL.url,
          validId_img: validIdURL.url,
          credential_img01: credential1URL.url,
          credential_img02: credential2URL.url,
          credential_img03: credential3URL.url,
          method: "manually",
          clusterInfo: {
            clusterName: associationName,
          },
        });

        // Create associated chat model
        await sellerCustomerModel.create({ myId: seller.id });

        // Create token and send it in the cookie
        const token = await createToken({ id: seller.id, role: "trader" });
        res.cookie("accessToken", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        // Return success response
        responseReturn(res, 201, {
          token,
          message: "Trader Application Request Recorded.",
        });
      } catch (error) {
        console.error("Registration error:", error);
        return responseReturn(res, 500, { error: "Internal server error." });
      }
    });
  } catch (error) {
    console.error("Outer registration error:", error);
    return responseReturn(res, 500, { error: "Internal server error." });
  }
};

}



module.exports = new authControllers();
