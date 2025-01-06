const authorModel = require('../../models/authDeal');
const traderDeal = require('../../models/traderDeal');
const cardModel = require('../../models/cardModel');
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
            }).limit(5)

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

   


    place_deal = async (req, res) => {
        console.log(req.body);
        const {
            price,
            listing,
            listing_,
            shipping_fee,
            shippingInfo,
            // shippingChoice,
            shippingMethod,
            userId,
            mapsLink
        } = req.body;

        console.log(req.body)

        // Normalize `listing` to ensure it's an array with one item
        const normalizedListing = Array.isArray(listing) ? listing : [listing];

        const tempDate = moment(Date.now()).format('LLL');
        let authorDealData = [];
        let cardId = [];
        let traderDealListing = [];

        try {
            // Process the single normalized listing
            normalizedListing.forEach((item) => {
                const { listingInfo, quantity } = item;
                let tempPro = { ...listingInfo, quantity }; // Add quantity to the product info
                traderDealListing.push(tempPro);

                if (item._id) {
                    cardId.push(item._id); // Collect card IDs for later deletion
                }
            });

            // Create the trader deal
            const order = await traderDeal.create({
                traderId: userId,
                shippingInfo,
                listing: traderDealListing,
                price: price,
                shipping_fee,
                mapsLink,
                // shippingChoice,
                paymentStatus: 'pending',
                shippingInfo: shippingInfo,
                shippingMethod,
                shipPickUpStatus: 'pending',
                date: tempDate
            });

            // Prepare author deal data
            authorDealData.push({
                dealId: order.id,
                sellerId: traderDealListing[0].sellerId,
                listing: traderDealListing,
                listing_:  listing_,
                // shippingChoice,
                mapsLink,
                price: price,
                shipping_fee,
                paymentStatus : 'unpaid',
                shippingInfo: shippingInfo,
                shippingMethod,
                shipPickUpStatus : 'pending',
                shipPickUpStatus: 'pending',
                date: tempDate
            });
            // // Prepare author deal data
            // authorDealData.push({
            //     dealId: order.id,
            //     sellerId: traderDealListing[0].sellerId,
            //     listing: traderDealListing,
            //     price: price,
            //     paymentStatus : 'unpaid',
            //     shippingInfo: 'rinco trading center mati',
            //     shippingChoice: 'seller Delivery',
            //     shipPickUpStatus : 'pending',
            //     date: tempDate
            // });

            // Save author deal data
            await authorModel.insertMany(authorDealData);

            // Remove card items
            for (const id of cardId) {
                await cardModel.findByIdAndDelete(id);
            }

            setTimeout(()=>{
                this.paymentCheck(order.id)
            }, 15000)

            responseReturn(res, 200, {
                message: "Order placed successfully",
                orderId: order.id
            });
        } catch (error) {
            console.log(error.message);
            responseReturn(res, 500, {
                message: "An error occurred while placing the order",
                error: error.message
            });
        }
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

    get_seller_orders = async (req, res) => {

        const { sellerId } = req.params
        let { page, parPage, searchValue } = req.query
        page = parseInt(page)
        parPage = parseInt(parPage)

        const skipPage = parPage * (page - 1)


        try {
            if (searchValue) {

            } else {
                const orders = await authorModel.find({
                    sellerId,
                }).skip(skipPage).limit(parPage).sort({ createdAt: -1 })
                const totalOrder = await authorModel.find({
                    sellerId,
                }).countDocuments()
                responseReturn(res, 200, { orders, totalOrder })
            }
        } catch (error) {
            console.log('get seller order error ' + error.message)
            responseReturn(res, 500, { message: 'internal server error' })
        }
    }

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
    seller_order_status_update = async (req, res) => {
        const { orderId } = req.params;
        const { status } = req.body;
        console.log(req.body);
      
        try {
          const deal = await authorModel.findById(orderId);
          deal.shipPickUpStatus = status; // Update the status
          await deal.save(); // Save the deal, which will trigger the middleware
          
          responseReturn(res, 200, { message: 'order status change success' });
        } catch (error) {
          console.log('Error updating order status: ' + error.message);
          responseReturn(res, 500, { message: 'internal server error' });
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
