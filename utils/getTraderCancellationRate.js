const traderDeal = require("../models/traderDeal");
const traderModel = require("../models/traderModel");
const notificationModel = require("../models/Notification/notificationModel");

const getTraderCancellationRates = async () => {
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
  
      // return res.status(200).json({
      //   message: "Cancellation rates updated for all traders.",
      //   updatedTraders: updates,
      // });
    } catch (error) {
      console.error("Error updating cancellation rates:", error);
      // return res.status(500).json({ error: "Internal server error" });
    }
};

// Make sure to export the function
module.exports = getTraderCancellationRates;