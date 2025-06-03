const authorModel = require('../../models/authDeal');
const traderDeal = require('../../models/traderDeal');
const TraderDeal = require('../../models/traderDeal');
const traderModel = require('../../models/traderModel');
const sellerModel = require('../../models/sellerModel');
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
// const traderDeal = require('../../models/traderDeal');





class transactionController {
  //  resizeImage = async (imagePath) => {
  //     const outputDir = path.join(__dirname, "../../uploads");
  //     const outputFilePath = path.join(
  //       outputDir,
  //       "resized_" + path.basename(imagePath)
  //     );
  
  //     // Ensure the output directory exists
  //     if (!fs.existsSync(outputDir)) {
  //       fs.mkdirSync(outputDir, { recursive: true });
  //     }
  
  //     await sharp(imagePath)
  //       .resize(1000, 1000) // Adjust the width and height as needed
  //       .toFile(outputFilePath);
  //     return outputFilePath;
  //   };
  

  resizeImage = async (imagePath) => {
  const outputDir = path.join(__dirname, "../../uploads");
  const outputFilePath = path.join(
    outputDir,
    "resized_" + path.basename(imagePath)
  );

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  await sharp(imagePath)
    .resize({
      width: 1000,
      height: 1000,
      fit: 'inside', // Maintain aspect ratio, no cropping
      withoutEnlargement: true // Prevent upscaling if image is smaller
    })
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
        console.log(fields)
        const { image } = files;

        // Validate required fields
        if (!transactionId || !paymentType || !image || !message) {
            return res.status(400).json({ error: "Please include an image proof and message" });
        }

        // Validate payment type
        const validPaymentTypes = ["Deposit", "Midway", "Partial", "Final"];
        if (!validPaymentTypes.includes(paymentType)) {
            return res.status(400).json({ error: "Invalid payment type" });
        }

        // Configure Cloudinary inside the method
        cloudinary.config({
            cloud_name: process.env.cloud_name,
            api_key: process.env.api_key,
            api_secret: process.env.api_secret,
            secure: true,
        });

        try {
            // Resize and upload the image to Cloudinary
            const resizedImagePath = await this.resizeImage(image.filepath || image.path);
            const uploadResult = await cloudinary.uploader.upload(resizedImagePath, {
                folder: "proofs",
            });

            // Clean up local file safely
            if (fs.existsSync(resizedImagePath)) {
                fs.unlinkSync(resizedImagePath);
            }

            // Determine which payment field to update dynamically
            // const paymentField = {
            //     Deposit: "deposit",
            //     Midway: "midwayPayment",
            //     Partial: "partialPayment",
            //     Final: "finalPayment",
            // }[paymentType];
            const paymentField = "deposit"

            const updateQuery = {
                $set: {
                    [`${paymentField}.${paymentField}PaymentAmountProofUrl`]: uploadResult.url,
                    [`${paymentField}.${paymentField}PaymentAmountProofMessage`]: message,
                    [`${paymentField}.${paymentField}PaymentCompleted`]: "Pending",
                    "deposit.date": new Date() // Ensures a valid date is set
                },
                $inc: {
                    buyerStep: 1, // Increment step for buyer
                    // sellerStep: 1, // Increment step for seller
                },
            };

            // Update the transaction
            const updatedTransaction = await Transaction.findOneAndUpdate(
                { _id: transactionId },
                updateQuery,
                { new: true }
            );

            console.log("updatedTransaction ---------------------- ??")
            console.log(updatedTransaction)
            if (!updatedTransaction) {
                return res.status(404).json({ error: "Transaction not found" });
            }

            return res.status(201).json({
                message: `${paymentType} proof submitted successfully`,
                updatedTransaction,
            });
        } catch (error) {
            console.error("Error submitting proof:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    });
};
Trader_Cancellation_Rate = async (req, res) => {
  console.log("CANCELLATION RATE")
  try {
    // Get all traders
    const traders = await traderModel.find();
    console.log(traders)

    if (!traders.length) {
      return res.status(404).json({ message: "No traders found." });
    }

    // Process each trader
    const updates = await Promise.all(
      traders.map(async (trader) => {
        // Get total deals for this trader
        const totalDeals = await traderDeal.countDocuments({ traderId: trader._id });

        // Get cancelled deals for this trader
        const cancelledDeals = await traderDeal.countDocuments({
          traderId: trader._id,
          shipPickUpStatus: "cancelled",
        });

        // Calculate cancellation rate (avoid division by zero)
        const cancellationRate = totalDeals > 0 ? (cancelledDeals / totalDeals) * 100 : 0;

        // Update trader's cancellation rate
        await traderModel.findByIdAndUpdate(trader._id, {
          cancellationRate: cancellationRate.toFixed(2), // Store as a fixed decimal
        });

        return {
          traderId: trader._id,
          totalDeals,
          cancelledDeals,
          cancellationRate: cancellationRate.toFixed(2) + "%",
        };
      })
    );

    return res.status(200).json({
      message: "Cancellation rates updated for all traders.",
      updatedTraders: updates,
    });
  } catch (error) {
    console.error("Error updating cancellation rates:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
    
};
    getTransactionByDealId = async (req, res) => {
        console.log("Fetching transactions for dealId...");
        try {
          const { dealId } = req.params;
          console.log(dealId)
      
          // Validate dealId
          if (!ObjectId.isValid(dealId)) {
            return responseReturn(res, 400, { error: "Invalid dealId." });
          }
      
          // Find transactions by dealId
          const transactions = await Transaction.find({ deal:dealId });
      
          if (!transactions || transactions.length === 0) {
            console.log("No transactions found for the given dealId.");
            return responseReturn(res, 404, { message: "No transactions found for the provided dealId." });
          }
      
          // Fetch proofs for each transaction
          const proofs = await Proof.find({
            transactionId: { $in: transactions.map((transaction) => transaction._id) },
            paymentType: "Deposit",
          });
      
          // Find a second proof with paymentType "FullPayment"
          const proof2 = await Proof.findOne({
            transactionId: { $in: transactions.map((transaction) => transaction._id) },
            paymentType: "FullPayment",
          });
          console.log("TRANSACTION")
          console.log("TRANSACTION");
          console.log(JSON.stringify(transactions, null, 2));
          
      
          // Return the response with transactions, proofs, and proof2
          return responseReturn(res, 200, {
            message: "Transactions with proofs retrieved successfully.",
            transaction : transactions,
            proofs,
            proof2: proof2 || null, // Include proof2 or null if not found
          });
        } catch (error) {
          console.error("Error occurred while fetching transactions:", error);
          return responseReturn(res, 500, { error: error.message });
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
      transaction.sellerStep = 3; // Example step: 3 - Waiting for Full Payment

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

  setFullPaymentStatusConfirmed = async (req, res) => {
    try {
      console.log(req.body);
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
  
      // Update the fullPaymentStatus to "Confirmed"
      transaction.fullPaymentStatus = "Confirmed";
      transaction.status = "Completed";
  
      // Optionally, you can update the buyer and seller steps based on your workflow
      transaction.buyerStep = 6; // Example step: 7 - Full Payment Confirmed
      transaction.sellerStep = 6; // Example step: 7 - Full Payment Confirmed
      transaction.finalPayment.finalPaymentCompleted = "Completed"
  
      // Save the updated transaction
      await transaction.save();
  
      // Find the associated traderDeal using the traderDealId from the transaction
      const traderDeal_ = await traderDeal.findById(transaction.traderDeal);
  
      if (!traderDeal_) {
        return responseReturn(res, 404, {
          error: "Trader Deal not found.",
        });
      }
  
      // Update shipPickUpStatus to "completed" and shippingInfo to "completed" in the traderDeal
      traderDeal_.shipPickUpStatus = "completed";
      traderDeal_.shippingInfo = "completed";
      traderDeal_.paymentStatus = "completed";
      await traderDeal_.save();
  
      console.log("traderDeal_.dealId: " + traderDeal_);
  
      // Find the associated authorDeal using the dealId from the traderDeal
      const authorDeal_ = await authorModel.findOne({ dealId: traderDeal_._id });
  
      if (!authorDeal_) {
        return responseReturn(res, 404, {
          error: "Author Deal not found.",
        });
      }
  
      // Update shipPickUpStatus to "completed" and shippingInfo to "completed" in the authorDeal
      authorDeal_.shipPickUpStatus = "completed";
      authorDeal_.shippingInfo = "completed";
      authorDeal_.paymentStatus = "completed";
      await authorDeal_.save();
  
      // Send response with the updated transaction, traderDeal, and authorDeal
      responseReturn(res, 200, {
        message: "Full payment status confirmed and shipping information updated to 'completed'.",
        transaction,
        traderDeal_,
        authorDeal_
      });
  
    } catch (error) {
      console.error("Error updating full payment status:", error);
      responseReturn(res, 500, {
        error: error.message,
      });
    }
  };
  
  getTransactionByDealIdTrader = async (req, res) => {
    console.log("get------------------ 0-0");
    try {
        const { traderDealId } = req.params;
        console.log("traderDealId");
        console.log(traderDealId);

        // Validate traderDealId
        if (!ObjectId.isValid(traderDealId)) {
            console.log("Invalid traderDealId");
            return responseReturn(res, 400, {
                error: "Invalid traderDealId.",
            });
        }

          // Fetch the traderDeal by traderDealId
          const deal = await traderDeal.findById(traderDealId);
          if (!deal) {
              console.log("TraderDeal not found");
              return responseReturn(res, 404, {
                  message: "TraderDeal not found for the provided traderDealId.",
              });
          }

        // Find transactions by traderDealId
        const transactions = await Transaction.find({ traderDeal : traderDealId });

        if (!transactions || transactions.length === 0) {
            console.log("No transactions found");
            return responseReturn(res, 404, {
                message: "No transactions found for the provided traderDealId.",
            });
        }

        // Fetch DeliveryHandoffProof for all transaction IDs
        const transactionIds = transactions.map(transaction => transaction._id);
        // const DeliveryHandoffProofs = await DeliveryHandoffProof.find({
        //     transactionId: { $in: transactionIds },
        // });

        // Response with transactions and DeliveryHandoffProofs
        console.log("Transactions and DeliveryHandoffProofs retrieved successfully");
        responseReturn(res, 200, {
            transactions,
            deal
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

      const { transactionId } = fields;  // Added authDealId and traderDealId
      const { image } = files;

      console.log("transactionId")
      console.log(transactionId)

      // Validate required fields
      if (!transactionId || !image) {
        console.log("01")
          return res.status(400).json({
              error: "Transaction ID, image, authDealId, or traderDealId not provided",
          });
      }

      // Check if a DeliveryHandoffProof already exists for this transactionId
      const existingProof = await DeliveryHandoffProof.findOne({ transactionId });

      if (existingProof) {
          return res.status(400).json({ error: "Proof already exists for this transaction" });
      }

      // Configure Cloudinary
      cloudinary.config({
          cloud_name: process.env.cloud_name,
          api_key: process.env.api_key,
          api_secret: process.env.api_secret,
          secure: true,
      });

      try {
          // Resize and upload the image to Cloudinary
          const resizedImagePath = await this.resizeImage(image.filepath || image.path);
          const uploadResult = await cloudinary.uploader.upload(resizedImagePath, {
              folder: "DeliveryHandoffProofs",
          });

          // Clean up local file
          fs.unlinkSync(resizedImagePath);

          // Save proof to the database
          // const deliveryHandoffProof = await DeliveryHandoffProof.create({
          //     transactionId,
          //     imageUrl: uploadResult.url,
          // });

          // Update the Transaction steps and include authDealId and traderDealId
          const updatedTransaction = await Transaction.findOneAndUpdate(
            { _id: transactionId },
            {
                $set: {
                    buyerStep: 3,
                    sellerStep: 4,
                    "handoffProof.handoffProofUrl": uploadResult.url,
                    "handoffProof.date": new Date()
                }
            },
            { new: true } // Returns the updated document
        );

        
        console.log("updatedTransaction----------------")
        console.log(updatedTransaction)
        

          // Now, update the associated traderDeal based on the transactionId
          const traderDealToUpdate = await traderDeal.findOne({ _id: updatedTransaction.traderDealId });

          if (traderDealToUpdate) {
              // Update shippingInfo and shipPickUpStatus on the traderDeal
              traderDealToUpdate.shippingInfo = "delivered";
              traderDealToUpdate.shipPickUpStatus = "delivered";

              await traderDealToUpdate.save();
          }

          // Now update the associated authDeal
          const authDealToUpdate = await authorModel.findOne({ _id: updatedTransaction.dealId });

          if (authDealToUpdate) {
              // Update shippingInfo and shipPickUpStatus on the authDeal
              authDealToUpdate.shippingInfo = "delivered";
              authDealToUpdate.shipPickUpStatus = "delivered";

              await authDealToUpdate.save();
          }

          console.log()
          return res.status(201).json({
              // DeliveryHandoffProof: deliveryHandoffProof,
              message: `Delivery/Handoff proof submitted successfully`,
              updatedTransaction,
          });
      } catch (error) {
          console.error("Error submitting proof:", error);
          return res.status(500).json({ error: "Internal server error" });
      }
  });
};

trader_handoff_confirm = async (req, res) => {
  console.log("TAE");
  console.log(req.body);

  try {
      const { transactionId } = req.body;

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

      console.log("transaction.traderDealId: " + transaction.traderDeal);

      // Find the associated traderDeal using the traderDealId from the transaction
      const traderDeal_ = await traderDeal.findById(transaction.traderDeal);

      if (!traderDeal_) {
          return responseReturn(res, 404, {
              error: "Trader Deal not found.",
          });
      }

      // Update shipPickUpStatus to "received" and shippingInfo to "delivered" in the traderDeal
      traderDeal_.shipPickUpStatus = "received";
      traderDeal_.shippingInfo = "received";
      await traderDeal_.save();

      console.log("traderDeal_.dealId: " + traderDeal_);

      // Find the associated authorDeal using the dealId from the traderDeal
      const authorDeal_ = await authorModel.findOne({ dealId: traderDeal_._id });

      if (!authorDeal_) {
          return responseReturn(res, 404, {
              error: "Author Deal not found.",
          });
      }

      // Update shipPickUpStatus to "received" and shippingInfo to "delivered" in the authorDeal
      authorDeal_.shipPickUpStatus = "received";
      authorDeal_.shippingInfo = "received";
      await authorDeal_.save();

        // Update the sellerStep and buyerStep in the transaction
      transaction.sellerStep = 5;  // You can adjust this value based on your flow
      transaction.buyerStep = 4;  // Adjust accordingly
      transaction.handoffProof.handoffProofCompleted = "Completed";  // Adjust accordingly

      // Save the updated transaction
      await transaction.save();

      console.log("TRADER HANDOFF CONFIRM")

      // Respond with the updated transaction, traderDeal, and authorDeal
      return responseReturn(res, 200, {
          message: "Handoff confirmed successfully. Ship pick-up status updated to 'received' and shippingInfo to 'delivered'.",
          transaction,
          traderDeal_,
          authorDeal_
      });

  } catch (error) {
      console.error("Error confirming handoff:", error);
      return responseReturn(res, 500, {
          error: error.message,
      });
  }
};

proof_submit2 = async (req, res) => {
  console.log("NGIIIIIIIIIIIIIIIIIIIIIIIII")
  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
      if (err) {
        console.log("01")
          return res.status(400).json({ error: "Form parsing error" });
      }

      console.log("02")
      const { transactionId, message, paymentType } = fields;
      const { image } = files;

      // Validate required fields

      console.log("03")
      if (!transactionId || !paymentType || !image) {
        console.log("3.1")
          return res.status(400).json({
              error: "Transaction ID, payment type, or image not provided",
          });
      }

      console.log("04")
      // Validate payment type (either Deposit or FullPayment)
      if (!["Deposit", "FullPayment"].includes(paymentType)) {
          return res.status(400).json({ error: "Invalid payment type" });
      }

      // console.log("01")
      // // Check if a Deposit or FullPayment already exists for this transactionId
      // const existingProof = await Proof.findOne({ transactionId, paymentType });

      // if (existingProof) {
      //     return responseReturn(res, 400, { error: "Proof already exists for this transaction" });
      // }

      // Configure Cloudinary inside the method
      cloudinary.config({
        cloud_name: process.env.cloud_name,
        api_key: process.env.api_key,
        api_secret: process.env.api_secret,
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
          // const proof = await Proof.create({
          //     transactionId,
          //     paymentType,
          //     imageUrl: uploadResult.url,
          //     message,
          // });

          // Update the transaction with new step values based on the payment type
          const updatedTransaction = await Transaction.findOneAndUpdate(
            { _id: transactionId },
            {
                $set: {
                    buyerStep: 5,
                    sellerStep: 5,
                    "finalPayment.finalPaymentAmountProofUrl": uploadResult.url,  // ✅ Corrected dot notation
                    "finalPayment.finalPaymentAmountProofMessage": message,       // ✅ Corrected dot notation
                }
            },
            { new: true }
        );
        

          return res.status(201).json({
              message: `${paymentType} proof submitted successfully`,
              updatedTransaction,
          });
      } catch (error) {
          console.error("Error submitting proof:", error);
          return res.status(500).json({ error: "Internal server error" });
      }
  });
};

deleteTraderDeal = async (req, res) => {
  const { traderDealId } = req.params;
  console.log(req.params);

  try {
    // Validate traderDealId as a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(traderDealId)) {
      return responseReturn(res, 400, "Invalid traderDeal ID");
    }

    // Find the traderDeal by its ID
    const traderDealData = await traderDeal.findById(traderDealId);

    if (!traderDealData) {
      return responseReturn(res, 404, "TraderDeal not found");
    }

    console.log("traderDeal")
    console.log(traderDealData)

    // Extract the dealId from the traderDeal
    const dealId = traderDealData._id;

    console.log("dealIDDDD" + dealId)

    // Update traderDeal instead of deleting it
    await traderDeal.findByIdAndUpdate(
      dealId,  // ✅ Correct: Pass the _id directly
      {
        $set: {
          shipPickUpStatus: "pre-canceled",
          "shippingInfo.status": "pre-canceled", // ✅ Ensure this path exists in the schema
        },
      },
      { new: true }
    );
    
    // Update the associated authorDeal with the same dealId
    const updatedAuthorDeal = await authorModel.updateOne(
      { dealId },
      { $set: { paymentStatus: "pre-canceled",shipPickUpStatus : "pre-canceled" } } // Assuming there's a "status" field in authorDeal
    );

    console.log(updatedAuthorDeal)
    if (updatedAuthorDeal.modifiedCount === 0) {
      console.warn(`No associated AuthorDeal found or updated for dealId: ${dealId}`);
    }

    responseReturn(res, 200, {message: "TraderDeal and associated AuthorDeal updated successfully to prematurecancel"});
  } catch (error) {
    console.error("Error updating traderDeal and associated authorDeal:", error);
    responseReturn(res, 500, "An error occurred while updating the records", { error });
  }
};

  updateDepositPayment = async (req, res) => {
    try {
      let { depositPaymentAmount } = req.body;
      const { id } = req.params;
  
      console.log("ID:", id);
      console.log("Deposit Amount (Before Conversion):", depositPaymentAmount);
  
      depositPaymentAmount = Number(depositPaymentAmount); // Convert to number
      console.log("Deposit Amount (After Conversion):", depositPaymentAmount);
  
      if (isNaN(depositPaymentAmount) || depositPaymentAmount <= 0) {
        console.log("01"); // Invalid amount
        return res.status(400).json({ message: "Invalid depositPaymentAmount" });
      }
  
      if (!mongoose.Types.ObjectId.isValid(id)) {
        console.log("02"); // Invalid ObjectId
        return res.status(400).json({ message: "Invalid transaction ID" });
      }
  
      const transaction = await Transaction.findById(id);
      if (!transaction) {
        console.log("03"); // Transaction not found
        return res.status(404).json({ message: "Transaction not found" });
      }
  
      transaction.deposit.depositPaymentAmount = depositPaymentAmount;
      transaction.buyerStep = 1;
      transaction.sellerStep = 2;

      console.log(transaction)
      // buyerStep: { type: Number },
      // sellerStep: { type: Number },
      await transaction.save();
  
      res.status(200).json({ message: "Deposit payment amount updated successfully", transaction });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  

getTransactionById = async (req, res) => {
  try {
      const { transactionId } = req.params;

      // Validate transactionId
      if (!mongoose.Types.ObjectId.isValid(transactionId)) {
          return res.status(400).json({ error: "Invalid transaction ID." });
      }

      // Find the transaction by ID
      const transaction = await Transaction.findById(transactionId)
          // .populate("trader") // Populate buyer details if applicable
          // .populate("seller") // Populate seller details if applicable
          // .populate("traderDeal") // Populate traderDeal details
          // .populate("dealId"); // Populate deal details

        const seller = await sellerModel.findById({_id: transaction.seller})
        const trader = await traderModel.findById({_id: transaction.trader})

          console.log(transaction)
      if (!transaction) {
          return res.status(404).json({ error: "Transaction not found." });
      }

      // Return the transaction data
      return res.status(200).json({ transaction, seller,trader });
  } catch (error) {
      console.error("Error fetching transaction:", error);
      return res.status(500).json({ error: "Internal server error" });
  }
};


submitSellerDispute = async (req, res) => {
  const form = new formidable.IncomingForm({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parse error:", err);
      return res.status(400).json({ error: "Error parsing form data" });
    }

    const { transactionId, reason, details = "", issue } = fields;
    const { images } = files;

    const imageArray = Array.isArray(images) ? images : images ? [images] : [];

    if (!transactionId || !reason || !issue) {
      return res.status(400).json({ error: "Transaction ID, reason, and issue are required." });
    }

    if (imageArray.length < 2) {
      return res.status(400).json({ error: "At least 2 images are required." });
    }

    try {
      cloudinary.config({
        cloud_name: process.env.cloud_name,
        api_key: process.env.api_key,
        api_secret: process.env.api_secret,
        secure: true,
      });

      // Upload all images and wait for them
      const uploadPromises = imageArray.map(async (img) => {
        const resizedPath = await this.resizeImage(img.filepath);
        const result = await cloudinary.uploader.upload(resizedPath, { folder: "listings" });
        fs.unlinkSync(resizedPath); // cleanup
        return result.secure_url;
      });

      const allImageUrls = await Promise.all(uploadPromises); // Wait here

      if (allImageUrls.length === 0) {
        return res.status(500).json({ error: "Image upload failed." });
      }

      const transaction = await Transaction.findById(transactionId);
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found." });
      }

      if (transaction.dispute?.reason) {
        return res.status(400).json({ error: "A dispute has already been submitted." });
      }


      console.log(allImageUrls)
      console.log("allImageUrls")

      transaction.dispute = {
        reason,
        details,
       proofUrl: allImageUrls,
        issue,
        status: "In-Dispute",
        createdAt: new Date(),
      };

      await transaction.save();

      return res.status(201).json({
        message: "Dispute submitted successfully.",
        dispute: transaction.dispute,
      });
    } catch (error) {
      console.error("Dispute submission error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
};



setDepositStatusCancelled = async (req, res) => {
 
  try {
    console.log(req.body);
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

    // Update the depositStatus to "Cancelled"
    transaction.depositStatus = "Cancelled";

    // Optionally, update buyer and seller steps based on your workflow
    transaction.buyerStep = 0; // Example step: Reset or indicate cancellation
    transaction.sellerStep = 0; // Example step: Reset or indicate cancellation

    // Save the updated transaction
    await transaction.save();

    // Send response with the updated transaction
    responseReturn(res, 200, {
      message: "Deposit status updated to cancelled successfully.",
      transaction,
    });

  } catch (error) {
    console.error("Error updating deposit status:", error);
    responseReturn(res, 500, {
      error: error.message,
    });
  }
};

  cancelTransactionByTrader = async (req, res) => {
  const { transactionId, traderId } = req.params;

  try {
    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found.' });
    }

    if (transaction.trader.toString() !== traderId.toString()) {
      return res.status(403).json({ message: 'Only the assigned trader can cancel this transaction.' });
    }

    const activeDispute = transaction.dispute.find(d =>
      d.status === 'Pending' || d.status === 'In-Dispute'
    );

    if (!activeDispute) {
      return res.status(400).json({ message: 'No active dispute found. Cannot cancel due to dispute.' });
    }

    if (transaction.status === 'Cancelled by Trader' || transaction.status === 'Cancelled due to Dispute by Trader') {
      return res.status(400).json({ message: 'Transaction already cancelled.' });
    }

    // Step 1: Update dispute and transaction
    activeDispute.status = 'Resolved';
    transaction.status = 'Cancelled';

    // Step 2: Also update the related traderDeal (e.g., mark it as cancelled)
    const traderDeal = await TraderDeal.findById(transaction.traderDeal);
    const listing = await listingModel.findById(transaction.listingId);
    const deal = await authorModel.findById(transaction.deal);

    if (traderDeal) {
      traderDeal.paymentStatus = 'Cancelled';
      traderDeal.shipPickUpStatus = 'Cancelled';
      traderDeal.cancelNote = 'Cancelled due to dispute'; // You can add this field to the schema if you want
      await traderDeal.save();
    }
    if (listing) {
       listing.isAvailable = true;
      await listing.save();
    }
    if (deal) {
       deal.shipPickUpStatus = "Cancelled";
       deal.paymentStatus = "Cancelled";
      await deal.save();
    }

    // Save transaction after updates
    await transaction.save();

    return res.status(200).json({
      message: 'Transaction and trader deal updated successfully due to dispute.',
      transaction
    });

  } catch (error) {
    console.error('Error during trader dispute cancellation:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

  undoCancelTransactionByTrader = async (req, res) => {
  const { transactionId, traderId } = req.query;

  try {
    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found.' });
    }

    if (transaction.trader.toString() !== traderId.toString()) {
      return res.status(403).json({ message: 'Only the assigned trader can undo this cancellation.' });
    }

    if (transaction.status !== 'Cancelled due to Dispute by Trader') {
      return res.status(400).json({ message: 'This transaction was not cancelled due to a dispute.' });
    }

    // Find the resolved dispute that was previously set
    const resolvedDispute = transaction.dispute.find(d => d.status === 'Resolved');

    if (!resolvedDispute) {
      return res.status(400).json({ message: 'No resolved dispute found to restore.' });
    }

    // Restore dispute status to "In-Dispute"
    resolvedDispute.status = 'In-Dispute';

    // Restore transaction status (you might need to track the previous one elsewhere — assuming "Ongoing" here)
    transaction.status = 'Ongoing';

    await transaction.save();

    return res.status(200).json({
      message: 'Transaction cancellation undone. Dispute reopened.',
      transaction
    });

  } catch (error) {
    console.error('Error during undoing cancellation:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

resendDepositProof = async (req, res) => {
  console.log("RESEND")
  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ error: 'Form parsing error' });
    }

    const { transactionId, message } = fields;
    const { image } = files;
    console.log(files)
    console.log(fields)
    console.log("asdadasdasd")

    if (!transactionId || !image || !message) {
      return res.status(400).json({ error: 'Please include an image proof and message' });
    }

    // Cloudinary config
    cloudinary.config({
      cloud_name: process.env.cloud_name,
      api_key: process.env.api_key,
      api_secret: process.env.api_secret,
      secure: true,
    });

    try {
      // Upload to Cloudinary
      const filePath = image.filepath || image.path;
      const uploadResult = await cloudinary.uploader.upload(filePath, {
        folder: 'resubmitted_proofs',
      });

      // Optional: remove the local file
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

      // Update transaction: push to deposit.resubmittedProofs
     const updatedTransaction = await Transaction.findOneAndUpdate(
        { _id: transactionId },
        {
          $push: {
            'deposit.resubmittedProofs': {
              proofUrl: uploadResult.secure_url,
              message,
              date: new Date(),
            },
          },
          // $inc: {
          //   buyerStep: 1, // Increment buyer step
          // },
        },
        { new: true }
      );


      if (!updatedTransaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      return res.status(200).json({
        message: 'Deposit proof resent successfully',
        updatedTransaction,
      });
    } catch (error) {
      console.error('Error in resendDepositProof:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
};
confirmDepositReceived = async (req, res) => {
  const { transactionId } = req.params;

  try {
    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found." });
    }

    // Mark the deposit as completed
    transaction.deposit.depositPaymentCompleted = 'Completed';
    transaction.deposit.date = new Date();

    // Explicitly set step numbers
    transaction.buyerStep = 3;  // e.g., Step 4: Deposit Confirmed
    transaction.sellerStep = 3; // e.g., Step 3: Waiting for Full Payment

    // Resolve any related deposit dispute
    const depositDispute = transaction.dispute.find(
      d => d.issue === "Deposit Not Received" && d.status !== "Resolved-continue"
    );

    if (depositDispute) {
      depositDispute.status = "Resolved-continue";
    }

      // Update the depositStatus to "Confirmed"
      transaction.depositStatus = "Confirmed";

      // Optionally, you can update the buyer and seller steps based on your workflow
      transaction.buyerStep = 3; // Example step: 4 - Deposit Confirmed
      transaction.sellerStep = 3; // Example step: 3 - Waiting for Full Payment

      // Save the updated transaction

    await transaction.save();

    return res.status(200).json({
      message: "Deposit confirmed, steps updated, and dispute resolved.",
      transaction
    });
  } catch (error) {
    console.error("Error confirming deposit received:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}

rejectDepositProofAfterResend = async (req, res) => {
  console.log("asdasdasd")
  const { transactionId } = req.params;
  const { reason } = req.body;

  try {
    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found." });
    }

    // Create or update dispute with escalation flag
    const existingDispute = transaction.dispute.find(
      d => d.issue === "Deposit Not Received" && d.status !== "Resolved-continue"
    );

    if (existingDispute) {
      existingDispute.status = "Escalated-to-Admin";
      existingDispute.updatedAt = new Date();
      existingDispute.notes = reason || "Seller still claims no deposit received after second proof.";
    } else {
      transaction.dispute.push({
        issue: "Deposit Not Received",
        status: "Escalated-to-Admin",
        notes: reason || "Seller still claims no deposit received after second proof.",
        createdAt: new Date()
      });
    }

    // Set transaction to waiting state
    transaction.status = "Admin Review";
    transaction.sellerStep = 2;
    transaction.buyerStep = 2;

    await transaction.save();

    return res.status(200).json({
      message: "Deposit proof rejected. Dispute escalated to admin.",
      transaction
    });
  } catch (error) {
    console.error("Error rejecting deposit proof:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}

getAllEscalatedTransactionsWithDetails = async (req, res) => {
  try {
    const transactions = await Transaction.find({ status: "Admin Review" })
      .populate("listingId")
      .populate("deal")
      .populate("trader")
      .populate("traderDeal")
      .populate("seller");

    if (!transactions || transactions.length === 0) {
      return res.status(404).json({ message: "No transactions escalated to admin." });
    }

    return res.status(200).json({
      message: "Escalated transactions retrieved successfully.",
      transactions,
    });
  } catch (error) {
    console.error("Error fetching escalated transactions:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};


acceptTraderProof = async (req, res) => {
  try {
    const { transactionId } = req.query;
console.log(transactionId)
console.log("transactionId")
    const transaction = await Transaction.findByIdAndUpdate(
      transactionId,
      {
        $set: {
          status: 'Completed',
          'dispute.resolvedBy': 'admin',
          'dispute.adminDecision': 'Accepted Trader Proof',
        },
        $push: {
          history: {
            action: 'Accepted Trader Proof',
            by: 'admin',
            date: new Date(),
          },
        },
      },
      { new: true }
    );

    res.json({ success: true, message: 'Trader proof accepted', transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error resolving dispute', error });
  }
};

adminResolveDispute = async (req, res) => {
  const { transactionId } = req.params;
  const { action, adminId } = req.body; // 'accept', 'reject', 'cancel'

  try {
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found.' });

    const dispute = transaction.dispute.find(d =>
      d.status === 'Pending' || d.status === 'In-Dispute' || d.status === 'Escalated-to-Admin'
    );

    if (!dispute) return res.status(400).json({ message: 'No active dispute found.' });

    let message = '';

    switch (action) {
      case 'accept':
        dispute.status = 'Resolved';
        dispute.adminDecision = 'Accepted Seller Claim';
        dispute.resolvedBy = adminId;
        transaction.status = 'Resolved in favor of Seller';
        message = 'Seller claim accepted.';
        break;

      case 'reject':
        dispute.status = 'Resolved';
        dispute.adminDecision = 'Accepted Trader Proof';
        dispute.resolvedBy = adminId;
        transaction.status = 'Resolved in favor of Trader';
         transaction.buyerStep = 3;
         transaction.sellerStep=3;
        message = 'Trader proof accepted.';
        break;

      case 'cancel':
        dispute.status = 'Resolved';
        dispute.adminDecision = 'Cancelled Transaction';
        dispute.resolvedBy = adminId;
        transaction.status = 'Cancelled by Admin';

        const traderDeal = await TraderDeal.findById(transaction.traderDeal);
        const listing = await listingModel.findById(transaction.listingId);
        const deal = await authorModel.findById(transaction.deal);

        if (traderDeal) {
          traderDeal.paymentStatus = 'Cancelled by Admin';
          traderDeal.shipPickUpStatus = 'Cancelled by Admin';
          traderDeal.cancelNote = 'Cancelled by Admin due to dispute';
          await traderDeal.save();
        }

        if (listing) {
          listing.isAvailable = true;
          await listing.save();
        }

        if (deal) {
          deal.shipPickUpStatus = 'Cancelled by Admin';
          deal.paymentStatus = 'Cancelled by Admin';
          await deal.save();
        }

        message = 'Transaction and related entities cancelled by admin.';
        break;

      default:
        return res.status(400).json({ message: 'Invalid action type.' });
    }

    await transaction.save();
    return res.status(200).json({ message, transaction });

  } catch (err) {
    console.error('Admin resolution error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};


}

module.exports = new transactionController();
