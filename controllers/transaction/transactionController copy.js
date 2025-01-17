const authorModel = require('../../models/authDeal');
const traderDeal = require('../../models/traderDeal');
const cardModel = require('../../models/cardModel');
const listingModel = require('../../models/listingModel');
const voucherModel = require('../../models/voucher');
const Proof = require('../../models/Transaction/Proof');
const DeliveryHandoffProof = require('../../models/Transaction/DeliveryHandoffProof');
const Transaction = require('../../models/Transaction/Transaction');
const axios = require('axios')
require("dotenv").config();
const moment = require('moment');
const {mongo : {ObjectId}} = require('mongoose')
const { responseReturn } = require("../../utils/response");
const formidable = require('formidable');
const fs = require('fs');
const categoryModel = require('../../models/categoryModel');
// const { cloudinary } = require('../dashboard/categoryController');
const cloudinary = require("cloudinary").v2;
const sharp = require("sharp");
const path = require("path");
const mongoose = require("mongoose"); 





class transactionController {
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
  


    createTransaction = async (req, res) => {
        try {
            const { traderId,traderDealId, sellerId, listingId, listingName, listingPrice, depositAmount, dealId,sellerStep,buyerStep } = req.body;
        
            // Check if a transaction with the same traderId, sellerId, listingId, and dealId already exists
            const existingTransaction = await Transaction.findOne({ traderId, sellerId, listingId, dealId });
        
            if (existingTransaction) {
              return res.status(400).json({
                success: false,
                error: "Transaction already exists."
              });
            }
        
            // Create the transaction if no existing transaction was found
            const transaction = await Transaction.create({
              traderId,
              sellerId,
              listingId,
              listingName,
              listingPrice,
              depositAmount,
              dealId,
              traderDealId,
              buyerStep: buyerStep || 1, // Waiting for Deposit Payment
              sellerStep: sellerStep || 1, // Waiting for Deposit Proof
            });
        
            // res.status(201).json({ success: true, transaction });
            responseReturn(res, 200, {
                            message: "Transaction Initialized successfully",
                            transaction
                        });
          } catch (error) {
            if (error.code === 11000) {
              // Unique index violation error
              responseReturn(res, 400, {
                            error: "An error occurred while placing the order",
                            // error: error.message
                        });
            //   return res.status(400).json({
            //     success: false,
            //     message: "Transaction with the same combination already exists."
            //   });
            }
            responseReturn(res, 500, {
                error:error.message,
                // error: error.message
            });
            // res.status(500).json({ success: false, error: error.message });
          }
        }
    proof_submit = async (req, res) => {
          const form = new formidable.IncomingForm();
      
          form.parse(req, async (err, fields, files) => {
              if (err) {
                  return res.status(400).json({ error: "Form parsing error" });
              }
      
              const { transactionId, message, paymentType } = fields;
              const { image } = files;
      
              // Validate required fields
              if (!transactionId || !paymentType || !image) {
                  return res.status(400).json({
                      error: "Transaction ID, payment type, or image not provided",
                  });
              }
      
              // Validate payment type (either Deposit or FullPayment)
              if (!["Deposit", "FullPayment"].includes(paymentType)) {
                  return res.status(400).json({ error: "Invalid payment type" });
              }
      
              // Check if a Deposit or FullPayment already exists for this transactionId
              const existingProof = await Proof.findOne({ transactionId, paymentType });
      
              if (existingProof) {
                  return responseReturn(res, 400, { error: "Proof already exists for this transaction" });
              }
      
              // Configure Cloudinary inside the method
              cloudinary.config({
                  cloud_name: process.env.CLOUD_NAME,
                  api_key: process.env.API_KEY,
                  api_secret: process.env.API_SECRET,
                  secure: true,
              });
      
              try {
                  // Resize and upload the image to Cloudinary
                  const resizedImagePath = await this.resizeImage(image.filepath || image.path); // Use `this` to call the method
                  const uploadResult = await cloudinary.uploader.upload(resizedImagePath, {
                      folder: "proofs",
                  });
      
                  // Clean up local file
                  fs.unlinkSync(resizedImagePath);
      
                  // Save proof to the database
                  const proof = await Proof.create({
                      transactionId,
                      paymentType,
                      imageUrl: uploadResult.url,
                      message,
                  });
      
                  // Update the transaction with new step values based on the payment type
                  const updatedTransaction = await Transaction.findOneAndUpdate(
                      { _id: transactionId },
                      {
                          $set: {
                              buyerStep: paymentType === "Deposit" ? 3 : 2, // Example: 2 -> Deposit Confirmed, 3 -> Full Payment Confirmed
                              sellerStep: paymentType === "Deposit" ? 3 : 2, // Adjust seller step similarly
                          },
                      },
                      { new: true }
                  );
      
                  return res.status(201).json({
                      proof,
                      message: `${paymentType} proof submitted successfully`,
                      updatedTransaction,
                  });
              } catch (error) {
                  console.error("Error submitting proof:", error);
                  return res.status(500).json({ error: "Internal server error" });
              }
          });
      };
    
  getTransactionByDealId = async (req, res) => {
    console.log("get------------------ 0-0");
    try {
      const { dealId } = req.params;
      console.log(dealId);
  
      // Validate dealId
      if (!ObjectId.isValid(dealId)) {
        return responseReturn(res, 400, {
          error: "Invalid dealId.",
        });
      }
  
      // Find transactions by dealId
      const transactions = await Transaction.find({ dealId });
  
      if (!transactions || transactions.length === 0) {
        console.log("NO SHIT");
        return responseReturn(res, 404, {
          message: "No transactions found for the provided dealId.",
        });
      }
  
      // Fetch proofs for each transaction
      const proofs = await Proof.find({
        transactionId: { $in: transactions.map(transaction => transaction._id) },
      });
  
      // Return the response with both transactions and the corresponding proofs
      responseReturn(res, 200, {
        message: "Transactions with proofs retrieved successfully.",
        transactions,
        proofs,
      });
    } catch (error) {
      console.log("HIT");
      console.log(error.message);
      responseReturn(res, 500, {
        error: error.message,
      });
    }
  };
 

  // Method to set deposit status to confirmed
  setDepositStatusConfirmed = async (req, res) => {
    try {
      console.log(req.body)
      const { transactionId } = req.body; // Transaction ID passed in the body of the request

      // Validate if the transactionId is provided
      if (!transactionId) {
        return responseReturn(res, 400, {
          error: "Transaction ID is required.",
        });
      }

      // Validate if the transactionId is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(transactionId)) {
        return responseReturn(res, 400, {
          error: "Invalid transactionId.",
        });
      }

      // Find the transaction by ID
      const transaction = await Transaction.findById(transactionId);

      if (!transaction) {
        return responseReturn(res, 404, {
          error: "Transaction not found.",
        });
      }

      // Update the depositStatus to "Confirmed"
      transaction.depositStatus = "Confirmed";

      // Optionally, you can update the buyer and seller steps based on your workflow
      transaction.buyerStep = 3; // Example step: 4 - Deposit Confirmed
      transaction.sellerStep = 4; // Example step: 3 - Waiting for Full Payment

      // Save the updated transaction
      await transaction.save();

      // Send response with the updated transaction
      responseReturn(res, 200, {
        message: "Deposit status updated to confirmed successfully.",
        transaction,
      });
      
    } catch (error) {
      console.error("Error updating deposit status:", error);
      responseReturn(res, 500, {
        error: error.message,
      });
    }
  };
  
  // getTransactionByDealIdTrader = async (req, res) => {
  //     console.log("get------------------ 0-0")
  //     try {
  //         const { traderDealId } = req.params;
  //         console.log(traderDealId)
          

  //         // Validate dealId
  //         if (!ObjectId.isValid(traderDealId)) {
  //           console.log("SHIT1")
  //             return responseReturn(res, 400, {
  //                 error: "Invalid dealId.",
  //             });
  //         }

  //         // Find transactions by dealId
  //         const transactions = await Transaction.find({ traderDealId });

  //         if (!transactions || transactions.length === 0) {
  //           console.log("NO SHIT")
  //             return responseReturn(res, 404, {
  //                 message: "No transactions found for the provided dealId.",
  //             });
  //         }

  //         console.log("-------------------------")
  //         console.log(transactions)
  //         console.log("------------------------- 0 0")

  //         responseReturn(res, 200, {
  //             message: "Transactions retrieved successfully.",
  //             transactions,
  //         });
  //     } catch (error) {
  //       console.log("HIT")
  //       console.log(error.message)
  //         responseReturn(res, 500, {
  //             error: error.message,
  //         });
  //     }
  // };

  getTransactionByDealIdTrader = async (req, res) => {
    console.log("get------------------ 0-0");
    try {
        const { traderDealId } = req.params;
        console.log(traderDealId);

        // Validate traderDealId
        if (!ObjectId.isValid(traderDealId)) {
            console.log("Invalid traderDealId");
            return responseReturn(res, 400, {
                error: "Invalid traderDealId.",
            });
        }

        // Find transactions by traderDealId
        const transactions = await Transaction.find({ traderDealId });

        if (!transactions || transactions.length === 0) {
            console.log("No transactions found");
            return responseReturn(res, 404, {
                message: "No transactions found for the provided traderDealId.",
            });
        }

        // Fetch DeliveryHandoffProof for all transaction IDs
        const transactionIds = transactions.map(transaction => transaction._id);
        const DeliveryHandoffProofs = await DeliveryHandoffProof.find({
            transactionId: { $in: transactionIds },
        });

        // Response with transactions and DeliveryHandoffProofs
        console.log("Transactions and DeliveryHandoffProofs retrieved successfully");
        responseReturn(res, 200, {
            // message: "Transactions retrieved successfully.",
            transactions,
            DeliveryHandoffProofs,
        });
    } catch (error) {
        console.error("Error fetching transactions:", error);
        responseReturn(res, 500, {
            error: error.message,
        });
    }
};


  delivery_handoff_proof_submit = async (req, res) => {

    const form = new formidable.IncomingForm();

    form.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(400).json({ error: "Form parsing error" });
        }

        const { transactionId } = fields;
        console.log("---------------------------------- >")
        console.log(transactionId)
        const { image } = files;

        // Validate required fields
        if (!transactionId || !image) {
          console.log("01")
            return res.status(400).json({
                error: "Transaction ID, or image not provided",
            });
        }

        console.log("02")
        // Check if a Deposit or FullPayment already exists for this transactionId
        const existingProof = await DeliveryHandoffProof.findOne({ transactionId });

        console.log("03")

        if (existingProof) {
          console.log("NAA NA")
            return responseReturn(res, 400, { error: "Proof already exists for this transaction" });
        }

        console.log("04")
        // Configure Cloudinary inside the method
        cloudinary.config({
            cloud_name: process.env.CLOUD_NAME,
            api_key: process.env.API_KEY,
            api_secret: process.env.API_SECRET,
            secure: true,
        });

        console.log("05")
        try {
            // Resize and upload the image to Cloudinary
            const resizedImagePath = await this.resizeImage(image.filepath || image.path); // Use `this` to call the method
            const uploadResult = await cloudinary.uploader.upload(resizedImagePath, {
                folder: "DeliveryHandoffProofs",
            });

            
        console.log("06")
            // Clean up local file
            fs.unlinkSync(resizedImagePath);

            // Save proof to the database
            const DeliveryHandoffProof_ = await DeliveryHandoffProof.create({
                transactionId,
                imageUrl: uploadResult.url,
            });

            // Update the transaction with new step values based on the payment type
            const updatedTransaction = await Transaction.findOneAndUpdate(
                { _id: transactionId },
                {
                    $set: {
                        buyerStep: 3 , // Example: 2 -> Deposit Confirmed, 3 -> Full Payment Confirmed
                        sellerStep: 5 , // Adjust seller step similarly
                    },
                },
                { new: true }
            );

            return res.status(201).json({
               DeliveryHandoffProof: DeliveryHandoffProof_ ,
                message: `Delivery/Handoff proof submitted successfully`,
                updatedTransaction,
            });
        } catch (error) {
            console.error("Error submitting proof:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    });
};
}

module.exports = new transactionController();
