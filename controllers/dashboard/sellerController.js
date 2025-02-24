const { responseReturn } = require("../../utils/response")
const sellerModel = require('../../models/sellerModel') 
const traderModel = require("../../models/traderModel")
const notificationModel = require("../../models/Notification/notificationModel")

class sellerController {
    
    get_seller_request = async (req, res) => {
        const { page, searchValue, parPage } = req.query
        const skipPage = parseInt(parPage) * (parseInt(page) - 1)
        try {
            if (searchValue) {
                //const seller
            } else {
                const sellers = await sellerModel.find({ status: 'pending' }).skip(skipPage).limit(parPage).sort({ createdAt: -1 })
                const totalSeller = await sellerModel.find({ status: 'pending' }).countDocuments()
                responseReturn(res, 200, { totalSeller, sellers })
            }
        } catch (error) {
            console.log()
            responseReturn(res, 500, { error: error.message })
        }
    }

    get_trader_request = async (req, res) => {
        const { page, searchValue, parPage } = req.query
        const skipPage = parseInt(parPage) * (parseInt(page) - 1)
        try {
            if (searchValue) {
                //const seller
            } else {
                const traders = await traderModel.find({ status: 'pending' }).skip(skipPage).limit(parPage).sort({ createdAt: -1 })
                const totalTraders = await traderModel.find({ status: 'pending' }).countDocuments()
                responseReturn(res, 200, { totalTraders, traders })
            }
        } catch (error) {
            console.log()
            responseReturn(res, 500, { error: error.message })
        }
    }
    get_seller = async (req, res) => {
        const { sellerId } = req.params

        try {
            const seller = await sellerModel.findById(sellerId)
            responseReturn(res, 200, { seller })
        } catch (error) {
            responseReturn(res, 500, { error: error.message })
        }
    }
    get_trader = async (req, res) => {
        const { traderId } = req.params

        try {
            const trader = await traderModel.findById(traderId)
            responseReturn(res, 200, { trader })
        } catch (error) {
            responseReturn(res, 500, { error: error.message })
        }
    }

    // seller_status_update = async (req, res) => {
    //     const { sellerId, status } = req.body
    //     try {
    //         await sellerModel.findByIdAndUpdate(sellerId, {
    //             status
    //         })
    //         const seller = await sellerModel.findById(sellerId)
    //         responseReturn(res, 200, { seller, message: 'seller status update success' })
    //     } catch (error) {
    //         responseReturn(res, 500, { error: error.message })
    //     }
    // }
    seller_status_update = async (req, res) => {
        const { sellerId, status } = req.body;
    
        try {
            // Check if the seller exists
            const seller = await sellerModel.findById(sellerId);
            if (!seller) {
                return responseReturn(res, 404, { message: "Seller not found" });
            }
    
            // Update the seller's status
            seller.status = status;
            await seller.save();
    
            // Update listings based on the seller's new status
            if (status !== "active") {
                await Listing.updateMany({ sellerId }, { isAvailable: false });
            } else {
                await Listing.updateMany({ sellerId }, { isAvailable: true });
            }
    
            // Return the updated seller
            const updatedSeller = await sellerModel.findById(sellerId);
            responseReturn(res, 200, { seller: updatedSeller, message: "Seller status updated successfully" });
        } catch (error) {
            responseReturn(res, 500, { error: error.message });
        }
    };
    trader_status_update = async (req, res) => {
        const { traderId, status } = req.body;
    
        try {
            // Check if the seller exists
            const trader = await traderModel.findById(traderId);
            if (!trader) {
                return responseReturn(res, 404, { message: "Trader not found" });
            }
    
            // Update the seller's status
            trader.status = status;
            await trader.save();
    
            // // Update listings based on the seller's new status
            // if (status !== "active") {
            //     await Listing.updateMany({ sellerId }, { isAvailable: false });
            // } else {
            //     await Listing.updateMany({ sellerId }, { isAvailable: true });
            // }
    
            // Return the updated seller
            const updatedTrader = await traderModel.findById(traderId);
            responseReturn(res, 200, { trader: updatedTrader, message: "Trader status updated successfully" });
        } catch (error) {
            responseReturn(res, 500, { error: error.message });
        }
    };
    

    // get_active_sellers = async (req, res) => {
    //     console.log(req.query)
    //     let { page, searchValue, parPage } = req.query
    //     page = parseInt(page)
    //     parPage = parseInt(parPage)

    //     const skipPage = parPage * (page - 1)

    //     try {
    //         if (searchValue) {
    //             const sellers = await sellerModel.find({
    //                 $text: { $search: searchValue },
    //                 status: 'active'
    //             }).skip(skipPage).limit(parPage).sort({ createdAt: -1 })

    //             const totalSeller = await sellerModel.find({
    //                 $text: { $search: searchValue },
    //                 status: 'active'
    //             }).countDocuments()

    //             responseReturn(res, 200, { totalSeller, sellers })
    //         } else {
    //             console.log("AJJJJ")
    //             const sellers = await sellerModel.find({ status: 'active' }).skip(skipPage).limit(parPage).sort({ createdAt: -1 })
    //             const totalSeller = await sellerModel.find({ status: 'active' }).countDocuments()
    //             console.log(sellers)
    //             responseReturn(res, 200, { totalSeller, sellers })
    //         }

    //     } catch (error) {
    //         console.log('active seller get ' + error.message)
    //     }
    // }

    get_active_sellers = async (req, res) => {
        let { page, searchValue, parPage } = req.query;
    
        // Validate query params
        page = parseInt(page) || 1;
        parPage = parseInt(parPage) || 10;
    
        const skipPage = parPage * (page - 1);
    
        try {
            // Build dynamic query
            const query = { status: 'active' };
    
            if (searchValue) {
                query.$or = [
                    { firstName: { $regex: searchValue, $options: "i" } },
                    { middleName: { $regex: searchValue, $options: "i" } },
                    { lastName: { $regex: searchValue, $options: "i" } },
                    { associationName: { $regex: searchValue, $options: "i" } },
                ];
            }
    
            // Fetch data with pagination and sorting
            const sellers = await sellerModel.find(query)
                .skip(skipPage)
                .limit(parPage)
                .sort({ createdAt: -1 });
    
            // Count total sellers matching the query
            const totalSeller = await sellerModel.countDocuments(query);
    
            // Return response
            responseReturn(res, 200, { totalSeller, sellers });
        } catch (error) {
            console.error("Error fetching active sellers:", error.message);
            responseReturn(res, 500, { message: "Server Error" });
        }
    };
    




    get_deactive_sellers = async (req, res) => {
        let { page, searchValue, parPage } = req.query
        page = parseInt(page)
        parPage = parseInt(parPage)

        const skipPage = parPage * (page - 1)

        try {
            if (searchValue) {
                const sellers = await sellerModel.find({
                    $text: { $search: searchValue },
                    status: 'deactive'
                }).skip(skipPage).limit(parPage).sort({ createdAt: -1 })

                const totalSeller = await sellerModel.find({
                    $text: { $search: searchValue },
                    status: 'deactive'
                }).countDocuments()

                responseReturn(res, 200, { totalSeller, sellers })
            } else {
                const sellers = await sellerModel.find({ status: 'deactive' }).skip(skipPage).limit(parPage).sort({ createdAt: -1 })
                const totalSeller = await sellerModel.find({ status: 'deactive' }).countDocuments()
                responseReturn(res, 200, { totalSeller, sellers })
            }

        } catch (error) {
            console.log('active seller get ' + error.message)
        }
    }




    getSellerNotifications = async (req, res) => {
        const { sellerId } = req.params// Assume seller ID is retrieved from authentication
      console.log("notifs")
        try {
          // Fetch all notifications for the seller
          const notifications = await notificationModel.find({ sellerId }).sort({ createdAt: -1 });
      
          // Count total notifications
          const totalNotifications = await notificationModel.countDocuments({ sellerId });
      
          responseReturn(res, 200, { totalNotifications, notifications });
        } catch (error) {
          console.error("Error fetching notifications:", error);
          responseReturn(res, 500, { error: error.message });
        }
      };
      
}

module.exports = new sellerController()