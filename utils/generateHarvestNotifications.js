const listingModel = require("../models/listingModel");
const notificationModel = require("../models/Notification/notificationModel");

const generateHarvestNotifications = async () => {
  try {
    const currentDate = new Date();

    // Find all listings where harvestStartDate has passed
    const pastHarvestListings = await listingModel.find({ harvestStartDate: { $lt: currentDate } });

    for (const listing of pastHarvestListings) {
      const { sellerId, _id: listingId, name } = listing;

      // Check if a notification already exists for this listing
      const existingNotification = await notificationModel.findOne({ sellerId, listingId });

      if (!existingNotification) {
        // Create a new notification
        await notificationModel.create({
          sellerId,
          listingId,
          message: `Your listing "${name}" has reached its harvest date.`,
        });

        console.log(`Notification created for seller ${sellerId} regarding listing "${name}".`);
      }
    }
  } catch (error) {
    console.error("Error generating harvest notifications:", error);
  }
};

// Make sure to export the function
module.exports = generateHarvestNotifications;