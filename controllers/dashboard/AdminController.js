const { responseReturn } = require("../../utils/response")
const sellerModel = require('../../models/sellerModel') 
const tradersModel = require('../../models/traderModel') 


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
    get_seller = async (req, res) => {
        const { sellerId } = req.params

        try {
            const seller = await sellerModel.findById(sellerId)
            responseReturn(res, 200, { seller })
        } catch (error) {
            responseReturn(res, 500, { error: error.message })
        }
    }

 
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
    

    get_active_traders = async (req, res) => {
        let { page, searchValue, parPage } = req.query;
    
        // Validate query params
        page = parseInt(page) || 1;
        parPage = parseInt(parPage) || 10;
    
        const skipPage = parPage * (page - 1);
    
        try {
            // Build dynamic query
            const query = { status: 'active' }; // Filter for active traders
    
            if (searchValue) {
                query.$or = [
                    { name: { $regex: searchValue, $options: "i" } },
                    { email: { $regex: searchValue, $options: "i" } },
                    { phone: { $regex: searchValue, $options: "i" } },
                ];
            }
    
            // Fetch data with pagination and sorting
            const traders = await tradersModel.find(query)
                .skip(skipPage)
                .limit(parPage)
                .sort({ createdAt: -1 });
    
            // Count total traders matching the query
            const totalTraders = await tradersModel.countDocuments(query);
    
            // Return response with metadata
            responseReturn(res, 200, {
                currentPage: page,
                totalPages: Math.ceil(totalTraders / parPage),
                totalTraders,
                traders,
            });
        } catch (error) {
            console.error("Error fetching active traders:", error.message);
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
}

module.exports = new sellerController()