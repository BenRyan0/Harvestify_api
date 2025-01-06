const authorOrder = require('../../models/authDeal')
const customerOrder = require('../../models/traderDeal')
// const sellerWallet = require('../../models/sellerWallet')
// const myShopWallet = require('../../models/myShopWallet')
const sellerModel = require('../../models/sellerModel')

const adminSellerMessage = require('../../models/chat/adminSellerMessage')
const sellerCustomerMessage = require('../../models/chat/sellerCustomerMessage')
const productModel = require('../../models/listingModel')

const { mongo: { ObjectId } } = require('mongoose')
const { responseReturn } = require('../../utils/response')

// module.exports.get_seller_dashboard_data = async (req, res) => {
//     console.log(req.body    )
//     const { id } = req;

//     try {
//         // const totalSele = await sellerWallet.aggregate([
//         //     {
//         //         $match: {
//         //             sellerId: {
//         //                 $eq: id
//         //             }
//         //         }
//         //     }, {
//         //         $group: {
//         //             _id: null,
//         //             totalAmount: { $sum: '$amount' }
//         //         }
//         //     }
//         // ])

//         const totalProduct = await productModel.find({
//             sellerId: new ObjectId(id)
//         }).countDocuments()

//         const totalOrder = await authorOrder.find({
//             sellerId: new ObjectId(id)
//         }).countDocuments()

//         const totalPendingOrder = await authorOrder.find({
//             $and: [
//                 {
//                     sellerId: {
//                         $eq: new ObjectId(id)
//                     }
//                 },
//                 {
//                     delivery_status: {
//                         $eq: 'pending'
//                     }
//                 }
//             ]
//         }).countDocuments()

//         const messages = await sellerCustomerMessage.find({
//             $or: [
//                 {
//                     senderId: {
//                         $eq: id
//                     }
//                 },
//                 {
//                     receverId: {
//                         $eq: id
//                     }
//                 }
//             ]
//         }).limit(3)

//         const recentOrders = await authorOrder.find({
//             sellerId: new ObjectId(id)
//         }).limit(5)

//         console.log("____________________________ >")
//         console.log(messages)
//         responseReturn(res, 200, {
//             totalOrder,
//             totalPendingOrder,
//             messages,
//             recentOrders,
//             totalProduct
//         })
//     } catch (error) {
//         console.log('get seller dashboard data error ' + error.messages)
//     }
// }

module.exports.get_seller_dashboard_data = async (req, res) => {
    console.log(req.body);
    const { id } = req;
  
    try {
      const totalProduct = await productModel
        .find({
          sellerId: new ObjectId(id),
        })
        .countDocuments();
  
      const totalOrder = await authorOrder
        .find({
          sellerId: new ObjectId(id),
        })
        .countDocuments();
  
      const totalPendingOrder = await authorOrder
        .find({
          $and: [
            {
              sellerId: {
                $eq: new ObjectId(id),
              },
            },
            {
              delivery_status: {
                $eq: 'pending',
              },
            },
          ],
        })
        .countDocuments();
  
        const messages = await sellerCustomerMessage.aggregate([
            {
                $match: {
                    $or: [
                        { senderId: id },
                        { receiverId: id },
                    ],
                },
            },
            {
                $sort: { createdAt: -1 }, // Sort messages by most recent first
            },
            {
                $group: {
                    _id: "$senderId", // Group by senderId
                    latestMessage: { $first: "$$ROOT" }, // Get the most recent message per sender
                },
            },
            {
                $limit: 3, // Limit to 3 latest senders
            },
        ]);
        
        // Extract the actual message documents
        let formattedMessages = messages.map((group) => group.latestMessage);

        // Reverse the order to get the oldest message first
        formattedMessages = formattedMessages
    
  
      const recentOrders = await authorOrder
        .find({
          sellerId: new ObjectId(id),
        })
        .limit(5);
  
      // Add totalSales calculation
      const totalSales = await authorOrder.aggregate([
        {
          $match: {
            sellerId: new ObjectId(id),
            shipPickUpStatus: 'completed', // Filter only completed orders
          },
        },
        {
          $group: {
            _id: null,
            totalSales: { $sum: '$price' }, // Summing the totalPrice field
          },
        },
      ]);
  
      const totalSalesValue = totalSales.length > 0 ? totalSales[0].totalSales : 0;
  
      console.log("____________________________ >");
      console.log(messages);
      responseReturn(res, 200, {
        totalOrder,
        totalPendingOrder,
        messages :formattedMessages,
        recentOrders,
        totalProduct,
        totalSales: totalSalesValue, // Add totalSales to response
      });
    } catch (error) {
      console.log('get seller dashboard data error ' + error.message);
    }
  };

module.exports.get_admin_dashboard_data = async (req, res) => {
    const { id } = req
    try {
        const result = await authorOrder.aggregate([
            {
                $match: {
                    shipPickUpStatus: 'completed', // Filter only completed orders
                },
            },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: '$price' }, // Summing the price field
                },
            },
        ]);
        
        // Extract the totalSales value or default to 0 if no matches
        const totalSales = result.length > 0 ? result[0].totalSales : 0;
        
        console.log(totalSales); // Outputs the totalSales as a plain number
        
        


        const totalProduct = await productModel.find({}).countDocuments()

        const totalOrder = await customerOrder.find({}).countDocuments()

        const totalSeller = await sellerModel.find({}).countDocuments()

        const messages = await adminSellerMessage.find({}).limit(3)

        const recentOrders = await customerOrder.find({}).limit(5)

        responseReturn(res, 200, {
          
            totalOrder,
            totalSales,
            totalSeller,
            messages,
            recentOrders,
            totalProduct
        })

    } catch (error) {
        console.log('get admin dashboard data error ' + error.messages)
    }

}