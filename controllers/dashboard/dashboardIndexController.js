const authorOrder = require('../../models/authDeal')
const customerOrder = require('../../models/traderDeal')
// const sellerWallet = require('../../models/sellerWallet')
// const myShopWallet = require('../../models/myShopWallet')
const sellerModel = require('../../models/sellerModel')
const traderDeal = require('../../models/traderDeal')

const adminSellerMessage = require('../../models/chat/adminSellerMessage')
const sellerCustomerMessage = require('../../models/chat/sellerCustomerMessage')
const productModel = require('../../models/listingModel')

const { mongo: { ObjectId } } = require('mongoose')
const { responseReturn } = require('../../utils/response')
const listingModel = require('../../models/listingModel')

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

// module.exports.get_seller_dashboard_data = async (req, res) => {
//     console.log(req.body);
//     const { id } = req;
  
//     try {
//       const totalProduct = await productModel
//         .find({
//           sellerId: new ObjectId(id),
//         })
//         .countDocuments();
  
//       const totalOrder = await authorOrder
//         .find({
//           sellerId: new ObjectId(id),
//         })
//         .countDocuments();
  
//       const totalPendingOrder = await authorOrder
//         .find({
//           $and: [
//             {
//               sellerId: {
//                 $eq: new ObjectId(id),
//               },
//             },
//             {
//               delivery_status: {
//                 $eq: 'pending',
//               },
//             },
//           ],
//         })
//         .countDocuments();
  
//         const messages = await sellerCustomerMessage.aggregate([
//             {
//                 $match: {
//                     $or: [
//                         { senderId: id },
//                         { receiverId: id },
//                     ],
//                 },
//             },
//             {
//                 $sort: { createdAt: -1 }, // Sort messages by most recent first
//             },
//             {
//                 $group: {
//                     _id: "$senderId", // Group by senderId
//                     latestMessage: { $first: "$$ROOT" }, // Get the most recent message per sender
//                 },
//             },
//             {
//                 $limit: 3, // Limit to 3 latest senders
//             },
//         ]);
        
//         // Extract the actual message documents
//         let formattedMessages = messages.map((group) => group.latestMessage);

//         // Reverse the order to get the oldest message first
//         formattedMessages = formattedMessages
    
  
//       const recentOrders = await authorOrder
//         .find({
//           sellerId: new ObjectId(id),
//         })
//         // .limit(5);
  
//       // Add totalSales calculation
//       const totalSales = await authorOrder.aggregate([
//         {
//           $match: {
//             sellerId: new ObjectId(id),
//             shipPickUpStatus: 'completed', // Filter only completed orders
//           },
//         },
//         {
//           $group: {
//             _id: null,
//             totalSales: { $sum: '$price' }, // Summing the totalPrice field
//           },
//         },
//       ]);
  
//       const totalSalesValue = totalSales.length > 0 ? totalSales[0].totalSales : 0;
  
//       console.log("____________________________ >");
//       console.log(messages);
//       responseReturn(res, 200, {
//         totalOrder,
//         totalPendingOrder,
//         messages :formattedMessages,
//         recentOrders,
//         totalProduct,
//         totalSales: totalSalesValue, // Add totalSales to response
//       });
//     } catch (error) {
//       console.log('get seller dashboard data error ' + error.message);
//     }
//   };

// module.exports.get_seller_dashboard_data = async (req, res) => {
//   console.log("TAE -----")
//   console.log(req.body);
//   console.log(req.params);
//   console.log(req.query);

//   const { id } = req.params;
//   console.log(id)

//   try {
//     // Count total products for the seller
//     const totalProduct = await listingModel.find({
//         sellerId: new ObjectId(id),
//       })
//       .countDocuments();

//     // Count total orders for the seller
//     const totalOrder = await authorOrder
//       .find({
//         sellerId: new ObjectId(id),
//       })
//       .countDocuments();

//     // Count total pending orders for the seller
//     const totalPendingOrder = await authorOrder
//       .find({
//         $and: [
//           {
//             sellerId: {
//               $eq: new ObjectId(id),
//             },
//           },
//           {
//             delivery_status: {
//               $eq: 'pending',
//             },
//           },
//         ],
//       })
//       .countDocuments();

//     // Fetch recent messages
//     const messages = await sellerCustomerMessage.aggregate([
//       {
//         $match: {
//           $or: [
//             { senderId: id },
//             { receiverId: id },
//           ],
//         },
//       },
//       {
//         $sort: { createdAt: -1 }, // Sort messages by most recent first
//       },
//       {
//         $group: {
//           _id: "$senderId", // Group by senderId
//           latestMessage: { $first: "$$ROOT" }, // Get the most recent message per sender
//         },
//       },
//       {
//         $limit: 3, // Limit to 3 latest senders
//       },
//     ]);

//     let formattedMessages = messages.map((group) => group.latestMessage);
//     formattedMessages = formattedMessages;

//     // Fetch recent orders
//     const recentOrders = await authorOrder
//       .find({
//         sellerId: new ObjectId(id),
//       });

//     // Calculate total sales
//     const totalSales = await authorOrder.aggregate([
//       {
//         $match: {
//           sellerId: new ObjectId(id),
//           shipPickUpStatus: 'completed', // Filter only completed orders
//         },
//       },
//       {
//         $group: {
//           _id: null,
//           totalSales: { $sum: '$price' }, // Summing the price field
//         },
//       },
//     ]);
//     const totalSalesValue = totalSales.length > 0 ? totalSales[0].totalSales : 0;

//     // NEW: Calculate monthly sales data for the chart
//     const monthlySalesData = await authorOrder.aggregate([
//       {
//         $match: {
//           sellerId: new ObjectId(id),
//           shipPickUpStatus: 'completed', // Filter completed orders
//         },
//       },
//       {
//         $group: {
//           _id: {
//             year: { $year: '$createdAt' },
//             month: { $month: '$createdAt' },
//           },
//           totalSales: { $sum: '$price' }, // Sum the price for each month
//           totalOrders: { $sum: 1 }, // Count the orders for each month
//         },
//       },
//       {
//         $sort: {
//           '_id.year': 1,
//           '_id.month': 1,
//         },
//       },
//     ]);

//     // Format the monthly sales data for the chart
//     const chartData = {
//       categories: [],
//       series: [
//         { name: 'Sales', data: [] },
//         { name: 'Orders', data: [] },
//       ],
//     };

//     monthlySalesData.forEach((item) => {
//       const monthYear = `${item._id.month}-${item._id.year}`;
//       chartData.categories.push(monthYear);
//       chartData.series[0].data.push(item.totalSales); // Sales data
//       chartData.series[1].data.push(item.totalOrders); // Order data
//     });

//     console.log("____________________________ >");
//     console.log(messages);
//     responseReturn(res, 200, {
//       totalOrder,
//       totalPendingOrder,
//       messages: formattedMessages,
//       recentOrders,
//       totalProduct,
//       totalSales: totalSalesValue, // Add totalSales to response
//       chartData, // Include the chart data in the response
//     });
//   } catch (error) {
//     console.log('get seller dashboard data error ' + error.message);
//   }
// };


// module.exports.get_seller_dashboard_data = async (req, res) => {
//   console.log("TAE___________")
//   console.log(req.body);
//   const { id } = req.params;

//   try {
//       // Fetch total product count for the seller
//       const totalProduct = await productModel
//           .find({ sellerId: new ObjectId(id) })
//           .countDocuments();

//       // Fetch total order count for the seller
//       const totalOrder = await authorOrder
//           .find({ sellerId: new ObjectId(id) })
//           .countDocuments();

//       // Fetch total pending order count for the seller
//       const totalPendingOrder = await authorOrder
//           .find({
//               $and: [
//                   { sellerId: { $eq: new ObjectId(id) } },
//                   { delivery_status: { $eq: 'pending' } }
//               ]
//           })
//           .countDocuments();

//       // Fetch the most recent messages exchanged between the seller and the customer
//       const messages = await sellerCustomerMessage.aggregate([
//           { $match: { $or: [{ senderId: id }, { receiverId: id }] } },
//           { $sort: { createdAt: -1 } },
//           { $group: { _id: "$senderId", latestMessage: { $first: "$$ROOT" } } },
//           { $limit: 3 }
//       ]);

//       // Format messages and reverse the order
//       let formattedMessages = messages.map(group => group.latestMessage);
//       formattedMessages = formattedMessages.reverse();

//       // Fetch recent orders for the seller
//       const recentOrders = await authorOrder
//           .find({ sellerId: new ObjectId(id) });

//       // Fetch total sales from customerOrder (traderDeals) where shipPickUpStatus is 'confirmed'
//       const totalSales = await customerOrder.aggregate([
//           {
//               $match: {
//                   traderId: new ObjectId(id),
//                   shipPickUpStatus: 'confirmed' // Consider only confirmed deals
//               }
//           },
//           {
//               $group: {
//                   _id: null,
//                   totalSales: { $sum: '$price' } // Sum up the 'price' field
//               }
//           }
//       ]);

//       // Calculate total sales value
//       const totalSalesValue = totalSales.length > 0 ? totalSales[0].totalSales : 0;

//       // Respond with the aggregated data
//       responseReturn(res, 200, {
//           totalOrder,
//           totalPendingOrder,
//           messages: formattedMessages,
//           recentOrders,
//           totalProduct,
//           totalSales: totalSalesValue, // Include total sales value
//       });
//   } catch (error) {
//       console.log('get seller dashboard data error ' + error.message);
//   }
// };

// module.exports.get_seller_dashboard_data = async (req, res) => {
//   console.log(req.body);
//   const { id } = req.params;

//   try {
//     const totalProduct = await productModel
//       .find({
//         sellerId: new ObjectId(id),
//       })
//       .countDocuments();

//     const totalOrder = await authorOrder
//       .find({
//         sellerId: new ObjectId(id),
//       })
//       .countDocuments();

//     const totalPendingOrder = await authorOrder
//       .find({
//         $and: [
//           {
//             sellerId: {
//               $eq: new ObjectId(id),
//             },
//           },
//           {
//             delivery_status: {
//               $eq: 'pending',
//             },
//           },
//         ],
//       })
//       .countDocuments();

//     const messages = await sellerCustomerMessage.aggregate([
//       {
//         $match: {
//           $or: [
//             { senderId: id },
//             { receiverId: id },
//           ],
//         },
//       },
//       {
//         $sort: { createdAt: -1 }, // Sort messages by most recent first
//       },
//       {
//         $group: {
//           _id: "$senderId", // Group by senderId
//           latestMessage: { $first: "$$ROOT" }, // Get the most recent message per sender
//         },
//       },
//       {
//         $limit: 3, // Limit to 3 latest senders
//       },
//     ]);

//     // Extract the actual message documents
//     let formattedMessages = messages.map((group) => group.latestMessage);

//     // Reverse the order to get the oldest message first
//     formattedMessages = formattedMessages;

//     const recentOrders = await authorOrder
//       .find({
//         sellerId: new ObjectId(id),
//       })
//       // .limit(5);

//     // Calculate the sum of all authordeals price with shipPickUpStatus "confirmed"
//     const totalSales = await authorOrder.aggregate([
//       {
//         $match: {
//           sellerId: new ObjectId(id),
//           shipPickUpStatus: 'confirmed',
//         },
//       },
//       {
//         $group: {
//           _id: null,
//           totalSales: { $sum: '$price' },
//         },
//       },
//     ]);

//     const totalSalesValue = totalSales.length > 0 ? totalSales[0].totalSales : 0;

//     // Add monthly data for the chart
//     const monthlyData = await authorOrder.aggregate([
//       {
//         $match: {
//           sellerId: new ObjectId(id),
//           shipPickUpStatus: 'completed', // Filter only completed orders
//         },
//       },
//       {
//         $group: {
//           _id: { month: { $month: "$createdAt" } },
//           offers: { $sum: 1 }, // Count of offers
//           successfulDeals: { $sum: 1 }, // Count of successful deals
//           revenue: { $sum: '$price' }, // Sum of revenue
//         },
//       },
//       {
//         $sort: { "_id.month": 1 }, // Sort by month
//       },
//     ]);

//     const chartData = {
//       series: [
//         {
//           name: "Offers",
//           data: monthlyData.map((data) => data.offers),
//         },
//         {
//           name: "Successful Deals",
//           data: monthlyData.map((data) => data.successfulDeals),
//         },
//         {
//           name: "Revenue",
//           data: monthlyData.map((data) => data.revenue),
//         },
//       ],
//       options: {
//         xaxis: {
//           categories: [
//             "Jan", "Feb", "Mar", "Apr", "May", "Jun",
//             "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
//           ],
//         },
//       },
//     };

//     console.log("____________________________ >");
//     console.log(messages);
//     responseReturn(res, 200, {
//       totalOrder,
//       totalPendingOrder,
//       messages: formattedMessages,
//       recentOrders,
//       totalProduct,
//       totalSales: totalSalesValue, // Use totalSalesValue for totalSales
//       chartData, // Add chart data to response
//     });
//   } catch (error) {
//     console.log('get seller dashboard data error ' + error.message);
//   }
// };

module.exports.get_seller_dashboard_data = async (req, res) => {
  console.log(req.body);
  const { id } = req.params;

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
    formattedMessages = formattedMessages;

    const recentOrders = await authorOrder
      .find({
        sellerId: new ObjectId(id),
      })
      // .limit(5);

    // Calculate the sum of all authordeals price with shipPickUpStatus "confirmed"
    const totalSales = await authorOrder.aggregate([
      {
        $match: {
          sellerId: new ObjectId(id),
          shipPickUpStatus: 'confirmed',
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$price' },
        },
      },
    ]);

    const totalSalesValue = totalSales.length > 0 ? totalSales[0].totalSales : 0;

    // Add monthly data for the chart
    const monthlyData = await authorOrder.aggregate([
      {
        $match: {
          sellerId: new ObjectId(id),
        },
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          offers: { $sum: 1 }, // Count of offers
          successfulDeals: { $sum: 1 }, // Count of successful deals
          revenue: { $sum: '$price' }, // Sum of revenue
        },
      },
      {
        $sort: { "_id.month": 1 }, // Sort by month
      },
    ]);

    const chartData = {
      series: [
        {
          name: "Offers",
          data: monthlyData.map((data) => data.offers),
        },
        {
          name: "Successful Deals",
          data: monthlyData.map((data) => data.successfulDeals),
        },
        {
          name: "Revenue",
          data: monthlyData.map((data) => data.revenue),
        },
      ],
      options: {
        xaxis: {
          categories: [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
          ],
        },
      },
    };

    console.log("____________________________ >");
    console.log(messages);
    responseReturn(res, 200, {
      totalOrder,
      totalPendingOrder,
      messages: formattedMessages,
      recentOrders,
      totalProduct,
      totalSales: totalSalesValue, // Use totalSalesValue for totalSales
      chartData, // Add chart data to response
    });
  } catch (error) {
    console.log('get seller dashboard data error ' + error.message);
  }
};
module.exports.get_admin_dashboard_data = async (req, res) => {
  try {
    // Seller-specific data
    const totalProduct = await productModel.countDocuments();
    const totalOrder = await authorOrder.countDocuments();
    const totalPendingOrder = await authorOrder
      .find({
        delivery_status: 'pending',
      })
      .countDocuments();

    const messages = await sellerCustomerMessage.aggregate([
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
    formattedMessages = formattedMessages;

    const recentOrders = await authorOrder.find();

    // Calculate the sum of all authordeals price with shipPickUpStatus "confirmed"
    const totalSales = await authorOrder.aggregate([
      {
        $match: {
          shipPickUpStatus: 'confirmed',
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$price' },
        },
      },
    ]);

    const totalSalesValue = totalSales.length > 0 ? totalSales[0].totalSales : 0;

    // Add monthly data for the chart
    const monthlyData = await authorOrder.aggregate([
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          offers: { $sum: 1 }, // Count of offers
          successfulDeals: { $sum: 1 }, // Count of successful deals
          revenue: { $sum: '$price' }, // Sum of revenue
        },
      },
      {
        $sort: { "_id.month": 1 }, // Sort by month
      },
    ]);

    const chartData = {
      series: [
        {
          name: "Offers",
          data: monthlyData.map((data) => data.offers),
        },
        {
          name: "Successful Deals",
          data: monthlyData.map((data) => data.successfulDeals),
        },
        {
          name: "Revenue",
          data: monthlyData.map((data) => data.revenue),
        },
      ],
      options: {
        xaxis: {
          categories: [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
          ],
        },
      },
    };

    // Admin-specific data
    const totalSeller = await sellerModel.find({}).countDocuments();
    const adminMessages = await adminSellerMessage.find({}).limit(3);
    const adminRecentOrders = await customerOrder.find({}).limit(5);

    console.log("____________________________ >");
    console.log(messages);
    responseReturn(res, 200, {
      totalOrder,
      totalPendingOrder,
      messages: formattedMessages,
      recentOrders,
      totalProduct,
      totalSales: totalSalesValue, // Use totalSalesValue for totalSales
      chartData, // Add chart data to response
      totalSeller,
      adminMessages,
      adminRecentOrders,
    });
  } catch (error) {
    console.log('get dashboard data error ' + error.message);
  }

}
// module.exports.get_admin_dashboard_data = async (req, res) => {
//     const { id } = req
//     try {
//         const result = await authorOrder.aggregate([
//             {
//                 $match: {
//                     shipPickUpStatus: 'completed', // Filter only completed orders
//                 },
//             },
//             {
//                 $group: {
//                     _id: null,
//                     totalSales: { $sum: '$price' }, // Summing the price field
//                 },
//             },
//         ]);
        
//         // Extract the totalSales value or default to 0 if no matches
//         const totalSales = result.length > 0 ? result[0].totalSales : 0;
        
//         console.log(totalSales); // Outputs the totalSales as a plain number
        
        


//         const totalProduct = await productModel.find({}).countDocuments()

//         const totalOrder = await customerOrder.find({}).countDocuments()

//         const totalSeller = await sellerModel.find({}).countDocuments()

//         const messages = await adminSellerMessage.find({}).limit(3)

//         const recentOrders = await customerOrder.find({}).limit(5)

//         responseReturn(res, 200, {
          
//             totalOrder,
//             totalSales,
//             totalSeller,
//             messages,
//             recentOrders,
//             totalProduct
//         })

//     } catch (error) {
//         console.log('get admin dashboard data error ' + error.messages)
//     }

// }