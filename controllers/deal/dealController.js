const authorModel = require('../../models/authDeal');
const traderDeal = require('../../models/traderDeal');
const cardModel = require('../../models/cardModel');
const listingModel = require('../../models/listingModel');
const voucherModel = require('../../models/voucher');
const axios = require('axios')
require("dotenv").config();
const moment = require('moment');
const {mongo : {ObjectId}} = require('mongoose')
const { responseReturn } = require("../../utils/response");

class dealController {
    paymentCheck = async(id)=>{
        try {
            const order = await traderDeal.findById(id)

            if(order.paymentStatus === 'unpaid'){
                await traderDeal.findByIdAndUpdate(id,{
                    shipPickUpStatus: 'cancelled'
                    
                })
                await authorModel.updateMany({
                    dealIdL: id
                },{
                    shipPickUpStatus: "cancelled"
                })

            }
            return true
        } catch (error) {
            console.log(error)
            
        }

    }

    get_trader_dashboard_data = async(req, res)=>{
      const { userId} = req.params

       try {
            const recentOrders = await traderDeal.find({
                traderId: new ObjectId(userId)
            })
            // .limit(5)

            const pendingOrder = await traderDeal.find({
                traderId: new ObjectId(userId),
                shipPickUpStatus: 'pending'
                
            }).countDocuments()

            const totalOrder = await traderDeal.find({
                traderId: new ObjectId(userId)
            }).countDocuments()

            const cancelledOrder = await traderDeal.find({
                traderId: new ObjectId(userId),
                shipPickUpStatus: 'Cancelled'
                
            }).countDocuments()


        
            responseReturn(res, 200, {
                recentOrders,
                pendingOrder,
                totalOrder,
                cancelledOrder
            });
            // console.log(recentOrders)
           
       } catch (error) {
            console.log(error.message)
       }
      

    }

   


    // place_deal = async (req, res) => {
    //     console.log(req.body);
    //     const {
    //         price,
    //         listing,
    //         listing_,
    //         shipping_fee,
    //         shippingInfo,
    //         // shippingChoice,
    //         shippingMethod,
    //         userId,
    //         mapsLink
    //     } = req.body;

    //     console.log(req.body)

    //     // Normalize `listing` to ensure it's an array with one item
    //     const normalizedListing = Array.isArray(listing) ? listing : [listing];

    //     const tempDate = moment(Date.now()).format('LLL');
    //     let authorDealData = [];
    //     let cardId = [];
    //     let traderDealListing = [];

    //     try {
    //         // Process the single normalized listing
    //         normalizedListing.forEach((item) => {
    //             const { listingInfo, quantity } = item;
    //             let tempPro = { ...listingInfo, quantity }; // Add quantity to the product info
    //             traderDealListing.push(tempPro);

    //             if (item._id) {
    //                 cardId.push(item._id); // Collect card IDs for later deletion
    //             }
    //         });

    //         // Create the trader deal
    //         const order = await traderDeal.create({
    //             traderId: userId,
    //             shippingInfo,
    //             listing: traderDealListing,
    //             price: price,
    //             shipping_fee,
    //             mapsLink,
    //             // shippingChoice,
    //             paymentStatus: 'pending',
    //             shippingInfo: shippingInfo,
    //             shippingMethod,
    //             shipPickUpStatus: 'pending',
    //             date: tempDate
    //         });

    //         // Prepare author deal data
    //         authorDealData.push({
    //             dealId: order.id,
    //             sellerId: traderDealListing[0].sellerId,
    //             listing: traderDealListing,
    //             listing_:  listing_,
    //             // shippingChoice,
    //             mapsLink,
    //             price: price,
    //             shipping_fee,
    //             paymentStatus : 'unpaid',
    //             shippingInfo: shippingInfo,
    //             shippingMethod,
    //             shipPickUpStatus : 'pending',
    //             shipPickUpStatus: 'pending',
    //             date: tempDate
    //         });
           

    //         // Save author deal data
    //         await authorModel.insertMany(authorDealData);
            

    //         // Remove card items
    //         for (const id of cardId) {
    //             await cardModel.findByIdAndDelete(id);
    //         }

    //         setTimeout(()=>{
    //             this.paymentCheck(order.id)
    //         }, 15000)

    //         responseReturn(res, 200, {
    //             message: "Order placed successfully",
    //             orderId: order.id
    //         });
    //     } catch (error) {
    //         console.log(error.message);
    //         responseReturn(res, 500, {
    //             message: "An error occurred while placing the order",
    //             error: error.message
    //         });
    //     }
    // };


    // place_deal = async (req, res) => {
    //     console.log("TAE")
    //     console.log(req.body);
    //     const {
    //         price,
    //         listing,
    //         listing_,
    //         shipping_fee,
    //         shippingInfo,
    //         shippingMethod,
    //         userId,
    //         mapsLink,
    //         distance,
    //         voucher
    //     } = req.body;
    
    //     console.log(req.body)
    
    //     // Normalize `listing` to ensure it's an array with one item
    //     const normalizedListing = Array.isArray(listing) ? listing : [listing];
    
    //     const tempDate = moment(Date.now()).format('LLL');
    //     let authorDealData = [];
    //     let cardId = [];
    //     let traderDealListing = [];
    
    //     try {
    //         // Check if the user has already placed a deal for any of the listings
    //         for (const item of normalizedListing) {
    //             const { listingInfo } = item;
    //             const existingDeal = await traderDeal.findOne({
    //                 traderId: userId,
    //                 'listing._id': listingInfo._id, // Assuming the listing item has a unique `_id`
    //                 paymentStatus: { $ne: 'completed' } // Ensure it's not already completed
    //             });
    
    //             if (existingDeal) {
    //                 console.log("NAA NA")
    //                 return responseReturn(res, 404, {
    //                     message: `You have already placed a deal for this listing: ${listingInfo.name}.`
    //                 });
    //             }
    //         }
    
    //         // Process the single normalized listing
    //         normalizedListing.forEach((item) => {
    //             const { listingInfo, quantity } = item;
    //             let tempPro = { ...listingInfo, quantity }; // Add quantity to the product info
    //             traderDealListing.push(tempPro);
    
    //             if (item._id) {
    //                 cardId.push(item._id); // Collect card IDs for later deletion
    //             }
    //         });
    
    //         console.log(voucher)
    //         // Create the trader deal
    //         const order = await traderDeal.create({
    //             traderId: userId,
    //             shippingInfo,
    //             listing: traderDealListing,
    //             price: price,
    //             shipping_fee,
    //             mapsLink,
    //             paymentStatus: 'pending',
    //             shippingMethod,
    //             shipPickUpStatus: 'pending',
    //             date: tempDate,
    //             shipping_distance: distance,
    //             voucher: voucher
    //         });
    //         console.log("asdasdasd----------------->")
    
    //         console.log(voucher)
    //         // Prepare author deal data
    //         authorDealData.push({
    //             dealId: order.id,
    //             sellerId: traderDealListing[0].sellerId,
    //             listing: traderDealListing,
    //             listing_: listing_,
    //             mapsLink,
    //             price: price,
    //             shipping_fee,
    //             paymentStatus: 'unpaid',
    //             shippingInfo: shippingInfo,
    //             shippingMethod,
    //             shipPickUpStatus: 'pending',
    //             date: tempDate,
    //             shipping_distance: distance,
    //             voucher: voucher
    //         });
    
    //         // Save author deal data
    //         await authorModel.insertMany(authorDealData);
    
    //         // Remove card items
    //         for (const id of cardId) {
    //             await cardModel.findByIdAndDelete(id);
    //         }
    
    //         setTimeout(() => {
    //             this.paymentCheck(order.id);
    //         }, 15000);
    
    //         responseReturn(res, 200, {
    //             message: "Order placed successfully",
    //             orderId: order.id
    //         });
    //     } catch (error) {
    //         console.log(error.message);
    //         responseReturn(res, 500, {
    //             message: "An error occurred while placing the order",
    //             error: error.message
    //         });
    //     }
    // };

    place_deal = async (req, res) => {
        console.log("Placing Deal");
        console.log(req.body);
        const {
            price,
            listing,
            listing_,
            shipping_fee,
            shippingInfo,
            shippingMethod,
            userId,
            mapsLink,
            distance,
            voucher,
        } = req.body;
    
        const normalizedListing = Array.isArray(listing) ? listing : [listing];
        const tempDate = moment(Date.now()).format('LLL');
        let authorDealData = [];
        let cardId = [];
        let traderDealListing = [];
    
        try {
            // Check if the user has already placed a deal for any of the listings
            for (const item of normalizedListing) {
                const { listingInfo } = item;
                const existingDeal = await traderDeal.findOne({
                    traderId: userId,
                    'listing._id': listingInfo._id, // Assuming the listing item has a unique `_id`
                    paymentStatus: { $ne: 'completed' }, // Ensure it's not already completed
                });
    
                if (existingDeal) {
                    console.log("Existing deal found");
                    return responseReturn(res, 404, {
                        message: `You have already placed a deal for this listing: ${listingInfo.name}.`,
                    });
                }
            }
    
            // Process the listings
            normalizedListing.forEach((item) => {
                const { listingInfo, quantity } = item;
                let tempPro = { ...listingInfo, quantity }; // Add quantity to the product info
                traderDealListing.push(tempPro);
    
                if (item._id) {
                    cardId.push(item._id); // Collect card IDs for later deletion
                }
            });
    
            // Check if the voucher exists and is not already redeemed
            if (voucher && voucher.code) {
                const existingVoucher = await voucherModel.findOne({
                    code: voucher.code,
                    isRedeemed: false,
                });
    
                if (!existingVoucher) {
                    return responseReturn(res, 400, {
                        message: "Invalid or already redeemed voucher.",
                    });
                }
            }
    
            // Create the trader deal
            const order = new traderDeal({
                traderId: userId,
                shippingInfo,
                listing: traderDealListing,
                price: price,
                shipping_fee,
                mapsLink,
                paymentStatus: 'pending',
                shippingMethod,
                shipPickUpStatus: 'pending',
                date: tempDate,
                shipping_distance: distance,
                voucher: voucher,
            });
    
            await order.save(); // This triggers the `pre('save')` middleware in the traderDeal schema
    
            // Prepare author deal data
            authorDealData.push({
                dealId: order.id,
                sellerId: traderDealListing[0].sellerId,
                listing: traderDealListing,
                listing_: listing_,
                mapsLink,
                price: price,
                shipping_fee,
                paymentStatus: 'unpaid',
                shippingInfo: shippingInfo,
                shippingMethod,
                shipPickUpStatus: 'pending',
                date: tempDate,
                shipping_distance: distance,
                voucher: voucher,
            });
    
            // Save author deal data (this will also trigger the `pre('save')` middleware in the authorModel schema)
            await authorModel.insertMany(authorDealData);
    
            // Remove card items
            for (const id of cardId) {
                await cardModel.findByIdAndDelete(id);
            }
    
            // Payment check (asynchronous, simulated with a timeout)
            setTimeout(() => {
                this.paymentCheck(order.id);
            }, 15000);
    
            responseReturn(res, 200, {
                message: "Order placed successfully",
                orderId: order.id,
            });
        } catch (error) {
            console.error(error.message);
            responseReturn(res, 500, {
                message: "An error occurred while placing the order",
                error: error.message,
            });
        }
    };
    
    
    // place_shipping_info = async (req, res) => { 
    //     console.log("ASdalskdnalsdn__________ >")
    //         const apiKey = process.env.GOOGLE_MAP_API_KEY;
    //          const origin = 'Governor Generoso, Davao Oriental, Philippines'; 
    //          const destination = 'Mati, Davao Oriental, Philippines'; 
    //          const url = `https://maps.googleapis.com/maps/api/distancematrix/json?destinations=${encodeURIComponent(destination)}&origins=${encodeURIComponent(origin)}&units=imperial&key=${apiKey}`; 
    //          // 
    //          try { const response = await axios.get(url); 
    //             const data = response.data; 
    //             console.log('Distance Matrix Data:', data);
    //             //  res.json(data); 
    //             responseReturn(res, 200, {
    //                 data
    //             }); 
    //             } catch (error) { 
    //                 console.error('Error fetching data from Google Distance Matrix API:', error);
    //                  res.status(500).json({ error: 'Failed to fetch data' }); 
    //         }};
    
    // place_shipping_info = async (req, res) => {
    //     const apiKey = process.env.GOOGLE_MAP_API_KEY;
    //     if (!apiKey) {
    //       return res.status(500).json({ error: 'Google Maps API key is missing' });
    //     }
      
    //     const origin = 'Governor Generoso, Davao Oriental, Philippines';
    //     const destination = 'Mati, Davao Oriental, Philippines';
    //     const url = `https://maps.googleapis.com/maps/api/distancematrix/json?destinations=${encodeURIComponent(destination)}&origins=${encodeURIComponent(origin)}&units=imperial&key=${apiKey}`;
      
    //     console.log('Fetching data from Google Distance Matrix API...');
        
    //     try {
    //       const response = await axios.get(url);
      
    //       // Validate the API response
    //       if (response.status !== 200 || !response.data) {
    //         console.error('Invalid response from Google Distance Matrix API', response.data);
    //         return res.status(500).json({ error: 'Invalid response from the API' });
    //       }
      
    //       const { destination_addresses, origin_addresses, rows, status } = response.data;
      
    //       if (status !== 'OK') {
    //         console.error('API returned an error:', status);
    //         return res.status(500).json({ error: `API Error: ${status}` });
    //       }
      
    //       // Extract distances and durations as single numbers
    //       const distances = rows.map(row => {
    //         const distanceElement = row.elements[0]?.distance?.value; // Distance in meters
    //         return distanceElement ? distanceElement / 1609.34 : 0; // Convert meters to miles
    //       });
      
    //       const durations = rows.map(row => {
    //         const durationElement = row.elements[0]?.duration?.value; // Duration in seconds
    //         return durationElement ? durationElement / 60 : 0; // Convert seconds to minutes
    //       });
      
    //       console.log('Distance Matrix Data:', { destination_addresses, origin_addresses, distances, durations });
      
    //       // Return the response
    //       return res.status(200).json({
    //         destination_addresses,
    //         origin_addresses,
    //         distances, // Distances in miles (single numbers)
    //         durations, // Durations in minutes (single numbers)
    //         status,
    //       });
    //     } catch (error) {
    //       console.error('Error fetching data from Google Distance Matrix API:', error.message);
    //       return res.status(500).json({ error: 'Failed to fetch data from the API' });
    //     }
    //   };
      



    place_shipping_info = async (req, res) => {
        console.log("--------------------------->")
        console.log(req.body)
        const {
            myLocation,listingLocation,pricePerUnit,perYield
        } = req.body;

        const apiKey = process.env.GOOGLE_MAP_API_KEY;
        if (!apiKey) {
          return res.status(500).json({ error: 'Google Maps API key is missing' });
        }
      
        let origin = myLocation;
        let destination = listingLocation;
        const url = `https://maps.googleapis.com/maps/api/distancematrix/json?destinations=${encodeURIComponent(destination)}&origins=${encodeURIComponent(origin)}&units=imperial&key=${apiKey}`;
      
        console.log('Fetching data from Google Distance Matrix API...');
        
        try {
          const response = await axios.get(url);
      
          // Validate the API response
          if (response.status !== 200 || !response.data) {
            console.error('Invalid response from Google Distance Matrix API', response.data);
            return res.status(500).json({ error: 'Invalid response from the API' });
          }
      
          const { destination_addresses, origin_addresses, rows, status } = response.data;
      
          if (status !== 'OK') {
            console.error('API returned an error:', status);
            return res.status(500).json({ error: `API Error: ${status}` });
          }
      
          // Extract a single distance value (in kilometers, rounded)
          const distanceElement = rows[0]?.elements[0]?.distance?.value; // Distance in meters
          const distance = distanceElement ? Math.round(distanceElement / 1000) : 0; // Convert to kilometers and round
      
          // Extract a single duration value (in minutes, rounded)
          const durationElement = rows[0]?.elements[0]?.duration?.value; // Duration in seconds
          const duration = durationElement ? Math.round(durationElement / 60) : 0; // Convert to minutes and round
      
          console.log('Distance Matrix Data:', { destination_addresses, origin_addresses, distance, duration });



        //   const 

                let shippingPrice = perYield * pricePerUnit * distance;
            

          // Return the response
        //   return res.status(200).json({
        //     destination_addresses,
        //     origin_addresses,
        //     distance, // Single value in kilometers
        //     duration, // Single value in minutes
        //     status,
        //   });

        responseReturn(res, 200, {
            shippingPrice,
            distance
        });
        } catch (error) {
          console.error('Error fetching data from Google Distance Matrix API:', error.message);
          return res.status(500).json({ error: 'Failed to fetch data from the API' });
        }
      };

      submit_voucher_code = async (req, res) => {
        console.log("--------------------------->")
        console.log(req.body)
        
      };
    
    
    get_deals = async(req, res)=>{
        const {traderId, status} = req.params

        try {
            let orders = []
            if(status !== 'all'){
                orders = await traderDeal.find({
                   traderId : new ObjectId(traderId),
                   shipPickUpStatus : status

                })
            }else{
                orders = await traderDeal.find({
                    traderId : new ObjectId(traderId)
                })
            }
            responseReturn(res, 200, {
                orders
            });
        } catch (error) {
            console.log(error.message)
            
        }
    }



    get_deal = async(req, res)=>{
        const {dealId} = req.params

        try {
            const order = await traderDeal.findById(dealId)
            console.log(order)
           
            responseReturn(res, 200, {
                order
            });
        } catch (error) {
            console.log(error.message)
            
        }
    }


    get_admin_orders = async (req, res) => {
        let { page, parPage, searchValue } = req.query
        console.log(req.query)
        page = parseInt(page)
        parPage = parseInt(parPage)

        const skipPage = parPage * (page - 1)

        try {
            if (searchValue) {

            } else {
                const orders = await traderDeal.aggregate([
                    {
                        $lookup: {
                            from: 'authorDeals',
                            localField: "_id",
                            foreignField: 'dealId',
                            as: 'suborder'
                        }
                    }
                ]).skip(skipPage).limit(parPage).sort({ createdAt: -1 })

                const totalOrder = await traderDeal.aggregate([
                    {
                        $lookup: {
                            from: 'authorDeals',
                            localField: "_id",
                            foreignField: 'dealId',
                            as: 'suborder'
                        }
                    }
                ])
                console.log(totalOrder.length)
                console.log(orders)

                responseReturn(res, 200, { orders, totalOrder: totalOrder.length })
            }
        } catch (error) {
            console.log(error.message)
        }
    }
    // get_admin_orders = async (req, res) => {
    //     let { page, parPage, searchValue } = req.query
    //     console.log(req.query)
    //     page = parseInt(page)
    //     parPage = parseInt(parPage)

    //     const skipPage = parPage * (page - 1)

    //     try {
    //         if (searchValue) {

    //         } else {
    //             const orders = await traderDeal.aggregate([
    //                 {
    //                     $lookup: {
    //                         from: 'authororders',
    //                         localField: "_id",
    //                         foreignField: 'orderId',
    //                         as: 'suborder'
    //                     }
    //                 }
    //             ]).skip(skipPage).limit(parPage).sort({ createdAt: -1 })

    //             const totalOrder = await traderDeal.aggregate([
    //                 {
    //                     $lookup: {
    //                         from: 'authororders',
    //                         localField: "_id",
    //                         foreignField: 'orderId',
    //                         as: 'suborder'
    //                     }
    //                 }
    //             ])

    //             responseReturn(res, 200, { orders, totalOrder: totalOrder.length })
    //         }
    //     } catch (error) {
    //         console.log(error.message)
    //     }
    // }

    get_admin_order = async (req, res) => {

        const { orderId } = req.params

        try {
            const order = await traderDeal.aggregate([
                {
                    $match: { _id: new ObjectId(orderId) }
                }, {
                    $lookup: {
                        from: 'authorDeals',
                        localField: '_id',
                        foreignField: 'dealId',
                        as: 'suborder'
                    }
                }
            ])
            // console.log()
            console.log(order[0])
            responseReturn(res, 200, { order: order[0] })
        } catch (error) {
            console.log('get admin order ' + error.message)
        }
    }

    admin_order_status_update = async (req, res) => {
        const { orderId } = req.params
        const { status } = req.body
        console.log("REQ BODY")
        console.log(req.body)
        console.log("REQ PARAMS")
        console.log(req.params)

        try {
            await traderDeal.findByIdAndUpdate(orderId, {
                shipPickUpStatus: status
            })
            responseReturn(res, 200, { message: 'order status change success' })
        } catch (error) {
            console.log('get admin order status error ' + error.message)
            responseReturn(res, 500, { message: 'internal server error' })
        }
    }

    // get_seller_orders = async (req, res) => {

    //     const { sellerId } = req.params
    //     let { page, parPage, searchValue } = req.query
    //     page = parseInt(page)
    //     parPage = parseInt(parPage)

    //     const skipPage = parPage * (page - 1)
    //     try {
    //         if (searchValue) {

    //         } else {
    //             const orders = await authorModel.find({
    //                 sellerId,
    //             }).skip(skipPage).limit(parPage).sort({ createdAt: -1 })
    //             const totalOrder = await authorModel.find({
    //                 sellerId,
    //             }).countDocuments()
    //             responseReturn(res, 200, { orders, totalOrder })
    //         }
    //     } catch (error) {
    //         console.log('get seller order error ' + error.message)
    //         responseReturn(res, 500, { message: 'internal server error' })
    //     }
    // }

    // get_seller_orders = async (req, res) => {
    //     const { sellerId } = req.params
    //     let { page, parPage, searchValue } = req.query
    //     page = parseInt(page)
    //     parPage = parseInt(parPage)
    
    //     const skipPage = parPage * (page - 1)
    
    //     try {
    //         if (searchValue) {
    //             // Implement search logic here if needed
    //             // For example, you can filter orders based on searchValue
    //         } else {
    //             // Find all orders for the given sellerId
    //             const orders = await authorModel.find({ sellerId })
    //                 .skip(skipPage)
    //                 .limit(parPage)
    //                 .sort({ createdAt: -1 })
    //                 .populate({
    //                     path: 'listing_', // Reference to the Listing model
    //                     select: 'name price stock locationInfo' // Select fields you want from Listing
    //                 });
    
    //                 console.log(orders)
    //             // Group orders by listing (in case multiple orders refer to the same listing)
    //             const groupedOrders = orders.reduce((acc, order) => {
    //                 const listingId = order.listing_._id.toString(); // Assuming listing_ is populated correctly
    //                 if (!acc[listingId]) {
    //                     acc[listingId] = {
    //                         listing: order.listing_,  // The Listing object
    //                         orders: []               // Orders for this specific listing
    //                     };
    //                 }
    //                 acc[listingId].orders.push(order); // Add order to the corresponding listing
    //                 return acc;
    //             }, {});
    
    //             // Convert the grouped orders into an array of listings with their associated orders
    //             const result = Object.values(groupedOrders);
    
    //             // Get total number of orders for pagination
    //             const totalOrder = await authorModel.countDocuments({ sellerId });
    
    //             responseReturn(res, 200, { orders: result, totalOrder });
    //         }
    //     } catch (error) {
    //         console.log('get seller order error ' + error.message);
    //         responseReturn(res, 500, { message: 'internal server error' });
    //     }
    // };

    get_seller_orders = async (req, res) => {
        const { sellerId } = req.params;
        let { page, parPage, searchValue } = req.query;
        page = parseInt(page);
        parPage = parseInt(parPage);
    
        const skipPage = parPage * (page - 1);
    
        try {
            if (searchValue) {
                // Implement search logic here if needed
            } else {
                // Find all orders for the given sellerId and populate the listing_
                const orders = await authorModel.find({ sellerId })
                    .skip(skipPage)
                    .limit(parPage)
                    .sort({ createdAt: -1 })
                    .populate({
                        path: 'listing_', // Reference to the Listing model
                        select: 'name price unit expectedHarvestYield yieldUnit locationInfo totalPrice harvestEndDate  harvestStartDate isAvailable' // Select fields you want from Listing
                    });
    
                // Debugging: Log the orders to verify the structure
                console.log('Fetched Orders:', orders);
    
                // Group orders by listing._id (assuming it's always one listing per order)
                const groupedOrders = orders.reduce((acc, order) => {
                    // Check if listing_ array is populated and contains one item
                    if (order.listing_ && order.listing_.length > 0 && order.listing_[0]._id) {
                        const listingId = order.listing_[0]._id.toString(); // Get the listing ID from the first item in the array
    
                        // Log the listing ID and order to check structure
                        console.log('Listing ID:', listingId);
                        console.log('Order:', order);
    
                        if (!acc[listingId]) {
                            acc[listingId] = {
                                listing: order.listing_[0],  // The Listing object (first element)
                                orders: []                  // Orders for this specific listing
                            };
                        }
                        acc[listingId].orders.push(order); // Add order to the corresponding listing
                    } else {
                        // Handle case where listing_ array is not populated or empty
                        console.log('Order has no populated listing_:', order);
                    }
                    return acc;
                }, {});
    
                // Convert the grouped orders into an array of listings with their associated orders
                const result = Object.values(groupedOrders);
    
                // Debugging: Log the grouped results
                console.log('Grouped Orders:', result);
    
                // Get total number of orders for pagination
                const totalOrder = await authorModel.countDocuments({ sellerId });
    
                responseReturn(res, 200, { orders: result, totalOrder });
            }
        } catch (error) {
            console.log('get seller order error ' + error.message);
            responseReturn(res, 500, { message: 'internal server error' });
        }
    };
    
    
    
    
    

    get_seller_order = async (req, res) => {

        const { orderId } = req.params
        let dealId = orderId

        try {
            const order = await authorModel.findById(dealId)
            console.log(order)

            responseReturn(res, 200, { order })
        } catch (error) {
            console.log('get admin order ' + error.message)
        }
    }

    // seller_order_status_update = async (req, res) => {
    //     const { orderId } = req.params
    //     const { status } = req.body
    //     console.log(req.body)
    //     // console.log(status)
      
    //     let dealId = orderId;
    //     try {
    //         await authorModel.findByIdAndUpdate(dealId, {
    //             shipPickUpStatus: status
    //         })
            
    //         responseReturn(res, 200, { message: 'order status change success' })
    //     } catch (error) {
    //         console.log('get admin order status error ' + error.message)
    //         responseReturn(res, 500, { message: 'internal server error' })
    //     }
    // }


    // seller_order_status_update = async (req, res) => {
    //     const { orderId } = req.params;
    //     let dealId = orderId
    //     const { status } = req.body;
    //     console.log(req.body);
      
    //     try {
    //       const deal = await authorModel.findById(orderId);
    //       deal.shipPickUpStatus = status; // Update the status
    //       await deal.save(); // Save the deal, which will trigger the middleware

    //       const dealID = deal.dealId

    //       try {
    //         await traderDeal.findByIdAndUpdate(dealID, { payment_status: 'pending', shipPickUpStatus: status });

    //       } catch (error) {
    //         console.log(error.message)
            
    //       }

          
    //       responseReturn(res, 200, { message: 'order status change success' });
    //     } catch (error) {
    //       console.log('Error updating order status: ' + error.message);
    //       responseReturn(res, 500, { message: 'internal server error' });
    //     }
    //   };
      

    // seller_order_status_update = async (req, res) => {
    //     const { orderId } = req.params;
    //     const { status } = req.body;
    
    //     try {
    //         // Find the specific author deal using the orderId
    //         const deal = await authorModel.findById(orderId);
            
    //         if (!deal) {
    //             return responseReturn(res, 404, { message: 'Order not found' });
    //         }
    
    //         // Update the status of the current author deal
    //         deal.shipPickUpStatus = status;
    //         await deal.save(); // Save the deal, triggering the middleware
    
    //         // If the shipPickUpStatus is confirmed, find similar orders and set their status to "rejected"
    //         if (status === 'confirmed') {
    //             // Update all author deals with the same listing_ and different orderId to "rejected"
    //             await authorModel.updateMany(
    //                 {
    //                     listing_: deal.listing_, // Same listing
    //                     _id: { $ne: orderId },  // Exclude the current order
    //                     shipPickUpStatus: { $ne: 'confirmed' }  // Avoid updating already confirmed orders
    //                 },
    //                 { $set: { shipPickUpStatus: 'rejected' } }
    //             );
    
    //             // Update all trader deals with the same listing_ and different orderId to "rejected"
    //             await traderDeal.updateMany(
    //                 {
    //                     dealId: deal.dealId, // Same dealId
    //                     shipPickUpStatus: { $ne: 'confirmed' } // Avoid updating already confirmed trader deals
    //                 },
    //                 { $set: { shipPickUpStatus: 'rejected' } }
    //             );
    //         }
    
    //         // Update the trader deal status as well
    //         const dealID = deal.dealId;
    //         try {
    //             await traderDeal.findByIdAndUpdate(dealID, { 
    //                 payment_status: 'pending', 
    //                 shipPickUpStatus: status 
    //             });
    //         } catch (error) {
    //             console.log(error.message);
    //         }
    
    //         // Send success response
    //         responseReturn(res, 200, { message: 'Order status change success' });
    //     } catch (error) {
    //         console.log('Error updating order status: ' + error.message);
    //         responseReturn(res, 500, { message: 'Internal server error' });
    //     }
    // };
    
    seller_order_status_update = async (req, res) => {
        console.log("ALLALALLALA")
        const { orderId } = req.params; // ID of the authorDeal
        const { status } = req.body;   // New shipPickUpStatus (e.g., "confirmed")
        const { transaction } = req.body;   // New shipPickUpStatus (e.g., "confirmed")
        console.log("REQ BODY")
        console.log(req.body)
        console.log("REQ PARAMS")
        console.log(req.params)

        
    
        try {
            // Find the specific authorDeal using the orderId
            const deal = await authorModel.findById(orderId);
            if (!deal) {
                return responseReturn(res, 404, { message: 'Order not found' });
            }
    
            // Update the shipPickUpStatus of the specific deal
            deal.shipPickUpStatus = status;
            await deal.save(); // Save the deal to trigger middleware
    
            if (status === 'confirmed') {
                // Update all other authorDeals with the same listing_ to "rejected"
                await authorModel.updateMany(
                    {
                        listing_: deal.listing_, // Same listing
                        _id: { $ne: orderId },  // Exclude the current deal
                        shipPickUpStatus: { $ne: 'confirmed' } // Exclude already confirmed orders
                    },
                    { $set: { shipPickUpStatus: 'rejected' } }
                );
    
                // Find all related traderDeals for the same listing_
                const relatedAuthorDeals = await authorModel.find({
                    listing_: deal.listing_, // Same listing
                });
    
                const relatedDealIds = relatedAuthorDeals.map((d) => d.dealId);
    
                // Update all traderDeals linked to the above authorDeals
                await traderDeal.updateMany(
                    {
                        _id: { $in: relatedDealIds }, // TraderDeals with matching dealIds
                        shipPickUpStatus: { $ne: 'confirmed' } // Exclude already confirmed traderDeals
                    },
                    { $set: { shipPickUpStatus: 'rejected' } }
                );
            }
    
            // Update the specific traderDeal matching the current authorDeal
            await traderDeal.findByIdAndUpdate(
                deal.dealId,
                { shipPickUpStatus: status }, // Sync the traderDeal's status with the authorDeal
                { new: true } // Return the updated document
            );
    
            // Send success response
            responseReturn(res, 200, { message: 'Order status updated successfully' });
        } catch (error) {
            console.log('Error updating order status: ' + error.message);
            responseReturn(res, 500, { message: 'Internal server error' });
        }
    };
    





    // create_payment = async (req, res) => {
    //     const { price } = req.body

    //     try {
    //         const payment = await stripe.paymentIntents.create({
    //             amount: price * 100,
    //             currency: 'usd',
    //             automatic_payment_methods: {
    //                 enabled: true
    //             }
    //         })
    //         responseReturn(res, 200, { clientSecret: payment.client_secret })
    //     } catch (error) {
    //         console.log(error.message)
    //     }
    // }

    // order_confirm = async (req, res) => {
    //     const { orderId } = req.params
    //     try {
    //         await customerOrder.findByIdAndUpdate(orderId, { payment_status: 'paid', delivery_status: 'pending' })
    //         await authOrderModel.updateMany({ orderId: new ObjectId(orderId) }, {
    //             payment_status: 'paid', delivery_status: 'pending'
    //         })
    //         const cuOrder = await customerOrder.findById(orderId)

    //         const auOrder = await authOrderModel.find({
    //             orderId: new ObjectId(orderId)
    //         })

    //         const time = moment(Date.now()).format('l')

    //         const splitTime = time.split('/')

    //         await myShopWallet.create({
    //             amount: cuOrder.price,
    //             manth: splitTime[0],
    //             year: splitTime[2],
    //         })

    //         for (let i = 0; i < auOrder.length; i++) {
    //             await sellerWallet.create({
    //                 sellerId: auOrder[i].sellerId.toString(),
    //                 amount: auOrder[i].price,
    //                 manth: splitTime[0],
    //                 year: splitTime[2],
    //             })
    //         }

    //         responseReturn(res, 200, { message: 'success' })

    //     } catch (error) {
    //         console.log(error.message)
    //     }
    // }

}

module.exports = new dealController();
