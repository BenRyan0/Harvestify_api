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
const categoryModel = require('../../models/categoryModel')
const mongoose = require('mongoose');


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
//           shipPickUpStatus: 'completed',
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
//           sellerId: new ObjectId(id), // Match orders for the specific seller
//         },
//       },
//       {
//         $group: {
//           _id: { month: { $month: "$createdAt" } },
//           offers: { $sum: 1 }, // Count all offers (all deals)
//           successfulDeals: {
//             $sum: {
//               $cond: [
//                 { $and: [{ $eq: ["$shipPickUpStatus", "completed"] }, { $eq: ["$paymentStatus", "completed"] }] },
//                 1,
//                 0,
//               ],
//             },
//           },
//           revenue: { $sum: "$price" }, // Sum revenue
//         },
//       },
//       {
//         $sort: { "_id.month": 1 }, // Sort by month
//       },
//     ]);
    
//     // Fill in missing months with zeros
//     const completeMonthlyData = Array.from({ length: 12 }, (_, i) => {
//       const month = i + 1;
//       const data = monthlyData.find((d) => d._id.month === month) || { offers: 0, successfulDeals: 0, revenue: 0 };
//       return { ...data, month };
//     });
    
//     // Chart Data Preparation
//     const chartData = {
//       series: [
//         {
//           name: "Offers",
//           data: completeMonthlyData.map((data) => data.offers),
//         },
//         {
//           name: "Successful Deals",
//           data: completeMonthlyData.map((data) => data.successfulDeals),
//         },
//         {
//           name: "Revenue",
//           data: completeMonthlyData.map((data) => data.revenue),
//         },
//       ],
//     };
    
//     const successfulDealsWithListings = await authorOrder.aggregate([
//       {
//         $match: {
//           sellerId: new ObjectId(id),
//           shipPickUpStatus: 'completed',
//           paymentStatus: 'completed',
//         },
//       },
//       {
//         $unwind: "$listing_", // Unwind the listings inside the authorDeal
//       },
//       {
//         $lookup: {
//           from: "listings", // Lookup the Listing collection
//           localField: "listing_",
//           foreignField: "_id",
//           as: "listingDetails",
//         },
//       },
//       {
//         $unwind: "$listingDetails", // Unwind the array of listing details
//       },
//       {
//         $match: {
//           "listingDetails.category": { $exists: true, $ne: null }, // Ensure the category exists in the listing
//         },
//       },
//       {
//         $group: {
//           _id: { month: { $month: "$createdAt" }, category: "$listingDetails.category" }, // Group by month and category
//           count: { $sum: 1 }, // Count the total number of listings in each category
//         },
//       },
//       {
//         $sort: { "_id.month": 1, count: -1 }, // Sort by month and count in descending order
//       },
//     ]);
    
//     // Prepare the second chart data
//     const secondChartData = successfulDealsWithListings.map((data) => ({
//       name: data._id.category,
//       data: Array.from({ length: 12 }, (_, i) => {
//         const month = i + 1;
//         const categoryData = successfulDealsWithListings.find((d) => d._id.category === data._id.category && d._id.month === month);
//         return categoryData ? categoryData.count : 0;
//       }),
//     }));
    
//     console.log("Second Chart Data (Listings with Categories):", secondChartData);
    

//     // Response return with added secondChartData
//     responseReturn(res, 200, {
//       totalOrder,
//       totalPendingOrder,
//       messages: formattedMessages,
//       recentOrders,
//       totalProduct,
//       totalSales: totalSalesValue,
//       chartData,
//       secondChartData
//     })
//   } catch (error) {
//     console.log('get seller dashboard data error ' + error.message);
//   }
// };

// const { ObjectId } = require('mongoose').Types;

module.exports.get_seller_dashboard_data = async (req, res) => {
  console.log(req.body);
  const { id } = req.params;

  try {
    const totalProduct = await productModel
      .find({ sellerId: new ObjectId(id) })
      .countDocuments();

    const totalOrder = await authorOrder
      .find({ sellerId: new ObjectId(id) })
      .countDocuments();

    const totalPendingOrder = await authorOrder
      .find({
        sellerId: new ObjectId(id),
        delivery_status: 'pending',
      })
      .countDocuments();

    const messages = await sellerCustomerMessage.aggregate([
      {
        $match: {
          $or: [{ senderId: id }, { receiverId: id }],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$senderId",
          latestMessage: { $first: "$$ROOT" },
        },
      },
      { $limit: 3 },
    ]);

    const formattedMessages = messages.map((group) => group.latestMessage);

    const recentOrders = await authorOrder
      .find({ sellerId: new ObjectId(id) })
      .limit(5);

    const totalSales = await authorOrder.aggregate([
      {
        $match: {
          sellerId: new ObjectId(id),
          shipPickUpStatus: 'completed',
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

    const monthlyData = await authorOrder.aggregate([
      {
        $match: { sellerId: new ObjectId(id) },
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          offers: { $sum: 1 },
          successfulDeals: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ["$shipPickUpStatus", "completed"] },
                  { $eq: ["$paymentStatus", "completed"] }
                ] },
                1,
                0,
              ],
            },
          },
          revenue: { $sum: "$price" },
          preCancelled: {
            $sum: {
              $cond: [{ $eq: ["$shipPickUpStatus", "pre-canceled"] }, 1, 0],
            },
          },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    const completeMonthlyData = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const data = monthlyData.find((d) => d._id.month === month) || {
        offers: 0, successfulDeals: 0, revenue: 0, preCancelled: 0,
      };
      return { ...data, month };
    });

    const chartData = {
      series: [
        { name: "Offers", data: completeMonthlyData.map((data) => data.offers) },
        { name: "Successful Deals", data: completeMonthlyData.map((data) => data.successfulDeals) },
        { name: "Revenue", data: completeMonthlyData.map((data) => data.revenue) },
        { name: "Pre-Cancelled Orders", data: completeMonthlyData.map((data) => data.preCancelled) },
      ],
    };

    responseReturn(res, 200, {
      totalOrder,
      totalPendingOrder,
      messages: formattedMessages,
      recentOrders,
      totalProduct,
      totalSales: totalSalesValue,
      chartData,
    });
  } catch (error) {
    console.error('get seller dashboard data error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};



module.exports.get_admin_dashboard_data = async (req, res) => {
  console.log(req.body);
  

  try {
    // Get total products for all sellers
    const totalProduct = await productModel
      .find({})
      .countDocuments();

    // Get total orders for all sellers
    const totalOrder = await authorOrder
      .find({})
      .countDocuments();

    // Get total pending orders for all sellers
    const totalPendingOrder = await authorOrder
      .find({
        delivery_status: 'pending',
      })
      .countDocuments();

      const totalSeller = await sellerModel.find({status: "active"}).countDocuments()


    // Get messages for all sellers
    const messages = await adminSellerMessage.aggregate([
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: "$senderId",
          latestMessage: { $first: "$$ROOT" },
        },
      },
      {
        $limit: 3,
      },
    ]);

    // Format the messages
    let formattedMessages = messages.map((group) => group.latestMessage);

    // Get recent orders for all sellers
    const recentOrders = await authorOrder
      .find({});

    // Get total sales for all sellers
    const totalSales = await authorOrder.aggregate([
      {
        $match: {
          shipPickUpStatus: 'completed',
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

    // Get monthly data for the chart (for all sellers)
    const monthlyData = await authorOrder.aggregate([
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          offers: { $sum: 1 },
          successfulDeals: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$shipPickUpStatus", "completed"] }, { $eq: ["$paymentStatus", "completed"] }] },
                1,
                0,
              ],
            },
          },
          preCancelledOrders: { 
            $sum: { 
              $cond: [{ $eq: ["$shipPickUpStatus", "pre-canceled"] }, 1, 0] 
            } 
          },
          CancelledOrders: { 
            $sum: { 
              $cond: [{ $eq: ["$shipPickUpStatus", "Cancelled"] }, 1, 0] 
            } 
          },
          inDisputeOrders: { 
            $sum: { 
              $cond: [{ $eq: ["$shipPickUpStatus", "In-dispute"] }, 1, 0] 
            } 
          },
          revenue: { $sum: "$price" },
        },
      },
      {
        $sort: { "_id.month": 1 },
      },
    ]);
    
    // Ensure all 12 months are included
    const completeMonthlyData = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const data = monthlyData.find((d) => d._id.month === month) || { offers: 0, successfulDeals: 0, preCancelledOrders: 0, revenue: 0 ,CancelledOrders : 0, inDisputeOrders : 0};
      return { ...data, month };
    });
    
    const chartData = {
      series: [
        {
          name: "Offers",
          data: completeMonthlyData.map((data) => data.offers),
        },
        {
          name: "Successful Deals",
          data: completeMonthlyData.map((data) => data.successfulDeals),
        },
        {
          name: "Pre-Cancelled Orders",
          data: completeMonthlyData.map((data) => data.preCancelledOrders),
        },
        {
          name: "Cancelled Orders",
          data: completeMonthlyData.map((data) => data.CancelledOrders),
        },
        {
          name: "In-Dispute Orders",
          data: completeMonthlyData.map((data) => data.inDisputeOrders),
        },
        {
          name: "Revenue",
          data: completeMonthlyData.map((data) => data.revenue),
        },
      ],
    };
    
    // Get successful deals with listings
    const successfulDealsWithListings = await authorOrder.aggregate([
      {
        $match: {
          shipPickUpStatus: 'completed',
          paymentStatus: 'completed',
        },
      },
      {
        $unwind: "$listing_",
      },
      {
        $lookup: {
          from: "listings",
          localField: "listing_",
          foreignField: "_id",
          as: "listingDetails",
        },
      },
      {
        $unwind: "$listingDetails",
      },
      {
        $match: {
          "listingDetails.category": { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" }, category: "$listingDetails.category" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.month": 1, count: -1 },
      },
    ]);

    // Prepare the second chart data
    const secondChartData = successfulDealsWithListings.map((data) => ({
      name: data._id.category,
      data: Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const categoryData = successfulDealsWithListings.find((d) => d._id.category === data._id.category && d._id.month === month);
        return categoryData ? categoryData.count : 0;
      }),
    }));

    console.log("Second Chart Data (Listings with Categories):", secondChartData);

    // Send the response with data
    responseReturn(res, 200, {
      totalOrder,
      totalPendingOrder,
      messages: formattedMessages,
      recentOrders,
      totalProduct,
      totalSeller,
      totalSales: totalSalesValue,
      chartData,
      secondChartData
    });
  } catch (error) {
    console.log('get admin dashboard data error ' + error.message);
    res.status(500).json({ error: error.message });
  }
};



// module.exports.get_admin_dashboard_category_price_fluctuations = async (req, res) => {
//   console.log(req.query);
//   try {
//     const { unit } = req.query;
//     console.log("UNIT --------------------------")
//     console.log(unit)

//     if (!unit) return res.status(400).json({ error: "Unit is required" });

//     // Aggregate price trends per category and per day
//     const categoryData = await listingModel.aggregate([
//       { $match: { unit } }, // Filter by unit
//       {
//         $group: {
//           _id: {
//             category: "$category",
//             date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, // Group by day
//           },
//           avgPrice: { $avg: "$price" },
//         },
//       },
//       {
//         $group: {
//           _id: "$_id.category",
//           priceTrends: {
//             $push: { date: "$_id.date", avgPrice: "$avgPrice" },
//           },
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           category: "$_id",
//           priceTrends: 1,
//         },
//       },
//     ]);

//     // Extract unique dates as labels
//     const allDates = new Set();
//     categoryData.forEach(({ priceTrends }) => {
//       priceTrends.forEach(({ date }) => allDates.add(date));
//     });

//     const sortedLabels = Array.from(allDates).sort(); // Sorted dates (X-axis)

//     // Format dataset
//     const datasets = categoryData.map(({ category, priceTrends }) => {
//       // Create a dictionary to map date → price
//       const priceMap = Object.fromEntries(priceTrends.map(({ date, avgPrice }) => [date, avgPrice]));

//       // Populate data for each date (default to null if missing)
//       const data = sortedLabels.map((date) => priceMap[date] || null);

//       return {
//         label: category,
//         data,
//       };
//     });

//     res.json({
//       labels: sortedLabels, // X-axis labels (dates)
//       datasets,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };



module.exports.get_admin_dashboard_category_price_fluctuations = async (req, res) => {
  console.log(req.query);
  try {
    const { unit } = req.query;
    const year = req.query.year ? parseInt(req.query.year, 10) : 2025;
    


    console.log("UNIT --------------------------", unit);
    console.log("YEAR --------------------------", year);

    if (!unit) return res.status(400).json({ error: "Unit is required" });
    if (!year) return res.status(400).json({ error: "Year is required" });

    const yearInt = parseInt(year, 10);
    if (isNaN(yearInt)) return res.status(400).json({ error: "Invalid year format" });

    // Aggregate price trends per category grouped by month
    const categoryData = await listingModel.aggregate([
      { 
        $match: { 
          unit, 
          createdAt: { 
            $gte: new Date(`${yearInt}-01-01T00:00:00.000Z`), 
            $lt: new Date(`${yearInt + 1}-01-01T00:00:00.000Z`)
          }
        } 
      }, // Filter by unit and year
      {
        $group: {
          _id: {
            category: "$category",
            month: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, // Group by month
          },
          avgPrice: { $avg: "$price" }, // Average price for the month
        },
      },
      {
        $group: {
          _id: "$_id.category",
          priceTrends: {
            $push: { month: "$_id.month", avgPrice: "$avgPrice" },
          },
        },
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          priceTrends: 1,
        },
      },
    ]);

    // Define fixed labels (months) for X-axis
    const labels = [
      "January", "February", "March", "April", "May", "June", "July",
      "August", "September", "October", "November", "December"
    ];

    // Convert YYYY-MM to a zero-based month index
    const getMonthIndex = (dateString) => parseInt(dateString.split("-")[1], 10) - 1;

    // Format dataset for Chart.js
    const datasets = categoryData.map(({ category, priceTrends }) => {
      const priceMap = Object.fromEntries(
        priceTrends.map(({ month, avgPrice }) => [getMonthIndex(month), avgPrice])
      );

      // Populate data array with values for each month, defaulting to null if missing
      const data = labels.map((_, index) => priceMap[index] || null);

      return {
        label: category,
        data,
        borderColor: `hsl(${Math.random() * 360}, 70%, 50%)`, // Random color
        backgroundColor: `hsla(${Math.random() * 360}, 70%, 50%, 0.5)`,
      };
    });

    res.json({
      labels, // X-axis labels (months)
      datasets, // Data for each category
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports.get_admin_dashboard_category_yield_fluctuations = async (req, res) => {
  console.log(req.query);
  try {
    const { yieldUnit, year } = req.query;

    if (!yieldUnit) return res.status(400).json({ error: "Yield Unit is required" });
    if (!year) return res.status(400).json({ error: "Year is required" });

    // Convert the year into a date range
    const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

    // Aggregate expectedHarvestYield per category, grouped by month
    const categoryData = await listingModel.aggregate([
      {
        $match: {
          yieldUnit,
          expectedHarvestYield: { $exists: true, $ne: null }, // Ensure valid values
          createdAt: { $exists: true, $gte: startDate, $lte: endDate } // Filter by year
        }
      },
      {
        $group: {
          _id: {
            category: "$category",
            month: { $dateToString: { format: "%Y-%m", date: "$createdAt" } } // Extract YYYY-MM
          },
          avgExpectedHarvestYield: { $avg: "$expectedHarvestYield" }
        }
      },
      {
        $group: {
          _id: "$_id.category",
          monthlyData: {
            $push: {
              month: "$_id.month",
              avgExpectedHarvestYield: "$avgExpectedHarvestYield"
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          monthlyData: 1
        }
      }
    ]);

    // Define fixed labels for months
    const labels = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    // Map MongoDB months (YYYY-MM) to numerical months
    const getMonthIndex = (dateString) => {
      const month = parseInt(dateString.split("-")[1], 10);
      return month - 1; // Convert to zero-based index
    };

    // Format dataset for Chart.js
    const datasets = categoryData.map(({ category, monthlyData }) => {
      const yieldMap = Object.fromEntries(
        monthlyData.map(({ month, avgExpectedHarvestYield }) => [getMonthIndex(month), avgExpectedHarvestYield])
      );

      // Populate data array with values for each month, defaulting to null if missing
      const data = labels.map((_, index) => yieldMap[index] || null);

      return {
        label: category,
        data,
        borderColor: `hsl(${Math.random() * 360}, 70%, 50%)`, // Generate random color
        backgroundColor: `hsla(${Math.random() * 360}, 70%, 50%, 0.5)`,
      };
    });

    res.json({
      labels, // Months as X-axis labels
      datasets // Data for each category
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// module.exports.get_admin_dashboard_category_yield_fluctuations = async (req, res) => {
//   console.log(req.query);
//   try {
//     const { yieldUnit } = req.query;

//     if (!yieldUnit) return res.status(400).json({ error: "Yield Unit is required" });

//     // Aggregate expectedHarvestYield per category, grouped by month
//     const categoryData = await listingModel.aggregate([
//       {
//         $match: {
//           yieldUnit,
//           expectedHarvestYield: { $exists: true, $ne: null }, // Ensure valid values
//           createdAt: { $exists: true } // Ensure createdAt exists
//         }
//       },
//       {
//         $group: {
//           _id: {
//             category: "$category",
//             month: { $dateToString: { format: "%Y-%m", date: "$createdAt" } } // Extract YYYY-MM
//           },
//           avgExpectedHarvestYield: { $avg: "$expectedHarvestYield" }
//         }
//       },
//       {
//         $group: {
//           _id: "$_id.category",
//           monthlyData: {
//             $push: {
//               month: "$_id.month",
//               avgExpectedHarvestYield: "$avgExpectedHarvestYield"
//             }
//           }
//         }
//       },
//       {
//         $project: {
//           _id: 0,
//           category: "$_id",
//           monthlyData: 1
//         }
//       }
//     ]);

//     // Define fixed labels for months
//     const labels = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
//     // Map MongoDB months (YYYY-MM) to numerical months
//     const getMonthIndex = (dateString) => {
//       const month = parseInt(dateString.split("-")[1], 10);
//       return month - 1; // Convert to zero-based index
//     };

//     // Format dataset for Chart.js
//     const datasets = categoryData.map(({ category, monthlyData }) => {
//       const yieldMap = Object.fromEntries(
//         monthlyData.map(({ month, avgExpectedHarvestYield }) => [getMonthIndex(month), avgExpectedHarvestYield])
//       );

//       // Populate data array with values for each month, defaulting to null if missing
//       const data = labels.map((_, index) => yieldMap[index] || null);

//       return {
//         label: category,
//         data,
//         borderColor: `hsl(${Math.random() * 360}, 70%, 50%)`, // Generate random color
//         backgroundColor: `hsla(${Math.random() * 360}, 70%, 50%, 0.5)`,
//       };
//     });

//     res.json({
//       labels, // Months as X-axis labels
//       datasets // Data for each category
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

module.exports.get_seller_dashboard_category_price_fluctuations = async (req, res) => {
  console.log(req.body);
  try {
    const { unit, sellerId } = req.body;

    if (!unit) return res.status(400).json({ error: "Unit is required" });
    if (!sellerId) return res.status(400).json({ error: "Seller ID is required" });

    // Convert sellerId to ObjectId if it's a valid MongoDB ObjectId
    const sellerObjectId = mongoose.Types.ObjectId.isValid(sellerId)
      ? new mongoose.Types.ObjectId(sellerId)
      : null;

    if (!sellerObjectId) return res.status(400).json({ error: "Invalid Seller ID" });

    // Aggregate price trends per category and per day for a specific seller
    const categoryData = await listingModel.aggregate([
      { $match: { unit, sellerId: sellerObjectId } }, // Ensure sellerId is an ObjectId
      {
        $group: {
          _id: {
            category: "$category",
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, // Group by day
          },
          avgPrice: { $avg: "$price" },
        },
      },
      {
        $group: {
          _id: "$_id.category",
          priceTrends: {
            $push: { date: "$_id.date", avgPrice: "$avgPrice" },
          },
        },
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          priceTrends: 1,
        },
      },
    ]);

    // Extract unique dates as labels
    const allDates = new Set();
    categoryData.forEach(({ priceTrends }) => {
      priceTrends.forEach(({ date }) => allDates.add(date));
    });

    const sortedLabels = Array.from(allDates).sort(); // Sorted dates (X-axis)

    // Format dataset
    const datasets = categoryData.map(({ category, priceTrends }) => {
      // Create a dictionary to map date → price
      const priceMap = Object.fromEntries(priceTrends.map(({ date, avgPrice }) => [date, avgPrice]));

      // Populate data for each date (default to null if missing)
      const data = sortedLabels.map((date) => priceMap[date] || null);

      return {
        label: category,
        data,
      };
    });

    res.json({
      labels: sortedLabels, // X-axis labels (dates)
      datasets,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// module.exports.get_seller_dashboard_category_price_fluctuations = async (req, res) => {
//   console.log(req.body);
//   try {
//     const { unit, sellerId } = req.body;

//     if (!unit) return res.status(400).json({ error: "Unit is required" });
//     if (!sellerId) return res.status(400).json({ error: "Seller ID is required" });

//     const seller = await sellerModel.findById(sellerId)
//     console.log(seller)

//     // Aggregate price trends per category and per day for a specific seller
//     const categoryData = await listingModel.aggregate([
//       { $match: { unit, sellerId } }, // Filter by unit and sellerId
//       {
//         $group: {
//           _id: {
//             category: "$category",
//             date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, // Group by day
//           },
//           avgPrice: { $avg: "$price" },
//         },
//       },
//       {
//         $group: {
//           _id: "$_id.category",
//           priceTrends: {
//             $push: { date: "$_id.date", avgPrice: "$avgPrice" },
//           },
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           category: "$_id",
//           priceTrends: 1,
//         },
//       },
//     ]);

//     // Extract unique dates as labels
//     const allDates = new Set();
//     categoryData.forEach(({ priceTrends }) => {
//       priceTrends.forEach(({ date }) => allDates.add(date));
//     });

//     const sortedLabels = Array.from(allDates).sort(); // Sorted dates (X-axis)

//     // Format dataset
//     const datasets = categoryData.map(({ category, priceTrends }) => {
//       // Create a dictionary to map date → price
//       const priceMap = Object.fromEntries(priceTrends.map(({ date, avgPrice }) => [date, avgPrice]));

//       // Populate data for each date (default to null if missing)
//       const data = sortedLabels.map((date) => priceMap[date] || null);

//       return {
//         label: category,
//         data,
//       };
//     });

//     res.json({
//       labels: sortedLabels, // X-axis labels (dates)
//       datasets,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// module.exports.get_admin_dashboard_category_price_fluctuations = async (req, res) => {
//   console.log(req.body);
//   try {
//     const { unit } = req.body;

//     if (!unit) return res.status(400).json({ error: "Unit is required" });

//     // Aggregate price trends per category and per day
//     const categoryData = await listingModel.aggregate([
//       { $match: { unit } }, // Filter by unit
//       {
//         $group: {
//           _id: {
//             category: "$category",
//             date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, // Group by day
//           },
//           avgPrice: { $avg: "$price" },
//         },
//       },
//       {
//         $group: {
//           _id: "$_id.category",
//           priceTrends: {
//             $push: { date: "$_id.date", avgPrice: "$avgPrice" },
//           },
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           category: "$_id",
//           priceTrends: 1,
//         },
//       },
//     ]);

//     // Extract unique dates as labels
//     const allDates = new Set();
//     categoryData.forEach(({ priceTrends }) => {
//       priceTrends.forEach(({ date }) => allDates.add(date));
//     });

//     const sortedLabels = Array.from(allDates).sort(); // Sorted dates (X-axis)

//     // Format dataset
//     const datasets = categoryData.map(({ category, priceTrends }) => {
//       // Create a dictionary to map date → price
//       const priceMap = Object.fromEntries(priceTrends.map(({ date, avgPrice }) => [date, avgPrice]));

//       // Populate data for each date (default to null if missing)
//       const data = sortedLabels.map((date) => priceMap[date] || null);

//       return {
//         label: category,
//         data,
//       };
//     });

//     res.json({
//       labels: sortedLabels, // X-axis labels (dates)
//       datasets,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

