const sellerModel = require('../../models/sellerModel')
const traderModel = require('../../models/traderModel')
const sellerCustomerModel = require('../../models/chat/sellerCustomerModel')
const sellerCustomerMessage= require('../../models/chat/sellerCustomerMessage')
const adminSellerMessage = require('../../models/chat/adminSellerMessage')
const {responseReturn} = require('../../utils/response')
const mongoose = require("mongoose");

class chatController{
    // add_trader_friend = async(req,res)=>{
    //     const {sellerId, userId} = req.body;
    //     console.log(req.body)
    
    //     try {
    //         if(sellerId !== ''){
    //             const seller = await sellerModel.findById(sellerId)
    //             const user = await traderModel.findById(userId)
                
    //             const checkSeller = await sellerCustomerModel.findOne({
    //                 $and : [
    //                     {
    //                         myId : {
    //                             $eq : userId
    //                         }
    //                     },
    //                     {
    //                         myPartners : {
    //                             $elemMatch :{ 
    //                                 fdId: sellerId
    //                             }
    //                         }
    //                     }
    //                 ]
    //             })

    //             if(!checkSeller){
    //                     await sellerCustomerModel.updateOne({
    //                         myId: userId
    //                     },
    //                     {
    //                         $push : {
    //                             myPartners : {
    //                                 fdId : sellerId,
    //                                 sellerName: seller.firstName + " " + seller.lastName,
    //                                 name : seller.clusterInfo?.clusterName,
    //                                 image: seller.profileImage
    //                             }
    //                         }
    //                     }
    //             )}

    //             const checkCustomer = await sellerCustomerModel.findOne({
    //                 $and : [
    //                     {
    //                         myId : {
    //                             $eq : sellerId
    //                         }
    //                     },
    //                     {
    //                         myPartners : {
    //                             $elemMatch :{ 
    //                                 fdId: userId
    //                             }
    //                         }
    //                     }
    //                 ]
    //             })
    //             if(!checkCustomer){
    //                     await sellerCustomerModel.updateOne({
    //                         myId: sellerId
    //                     },
    //                     {
    //                         $push : {
    //                             myPartners : {
    //                                 fdId : userId,
    //                                 name : user.name,
    //                                 image: ""
    //                             }
    //                         }
    //                     })
    //             }


    //             const messages = await sellerCustomerMessage.find({
    //                 $or: [
    //                     {
    //                         $and : [{
    //                             receiverId: {$eq: sellerId}
    //                         },{
    //                             senderId:{
    //                                 $eq : userId
    //                             }

    //                         }]
    //                     },
    //                     {
    //                         $and : [{
    //                             receiverId: {$eq: userId}
    //                         },{
    //                             senderId:{
    //                                 $eq : sellerId
    //                             }

    //                         }]
    //                     }
                       
    //                 ]
    //             })
    //             const MyPartners = await sellerCustomerModel.findOne({myId: userId})
             
    //             const currentConnections = MyPartners.myPartners.find(s=>s.fdId === sellerId)
           
                
    //             responseReturn(res, 200, {myPartners : MyPartners.myPartners, currentConnections, messages})
                

    //         }else{
    //             const MyPartners = await sellerCustomerModel.findOne({myId: userId})
    //             responseReturn(res, 200, {myPartners: MyPartners.myPartners})
    //         }
    //     } catch (error) {
    //         console.log(error.message)
            
    //     }
        
    // }

    // add_trader_friend = async (req, res) => {
    //     const { sellerId, userId } = req.body;
    //     console.log(req.body);
    
    //     try {
    //         if (sellerId !== '') {
    //             const seller = await sellerModel.findById(sellerId);
    //             const user = await traderModel.findById(userId);
    
    //             // Check if the user's partner entry exists in the sellerCustomer model
    //             const checkSeller = await sellerCustomerModel.findOne({
    //                 myId: userId,
    //                 "myPartners.fdId": sellerId
    //             });
    
    //             if (!checkSeller) {
    //                 await sellerCustomerModel.updateOne(
    //                     { myId: userId },
    //                     {
    //                         $push: {
    //                             myPartners: {
    //                                 fdId: sellerId,
    //                                 sellerName: seller.firstName + " " + seller.lastName,
    //                                 name: seller.clusterInfo?.clusterName,
    //                                 image: seller.profileImage
    //                             }
    //                         }
    //                     },
    //                     { upsert: true } // Ensure that a document is created if not already present
    //                 );
    //             }
    
    //             // Check if the seller's partner entry exists in the sellerCustomer model
    //             const checkCustomer = await sellerCustomerModel.findOne({
    //                 myId: sellerId,
    //                 "myPartners.fdId": userId
    //             });
    
    //             if (!checkCustomer) {
    //                 await sellerCustomerModel.updateOne(
    //                     { myId: sellerId },
    //                     {
    //                         $push: {
    //                             myPartners: {
    //                                 fdId: userId,
    //                                 name: user.name,
    //                                 image: "" // Optional, add image if needed
    //                             }
    //                         }
    //                     },
    //                     { upsert: true }
    //                 );
    //             }
    
    //             // Check for existing messages between user and seller
    //             const messages = await sellerCustomerMessage.find({
    //                 $or: [
    //                     { receiverId: sellerId, senderId: userId },
    //                     { receiverId: userId, senderId: sellerId }
    //                 ]
    //             });
    
    //             // If no messages exist, send a greeting message 👋
    //             if (messages.length === 0) {
    //                 // Send message from user to seller
    //                 await sellerCustomerMessage.create({
    //                     senderId: userId,
    //                     receiverId: sellerId,
    //                     senderName: user.name, // Ensure senderName is populated
    //                     message: '👋',
    //                     status: 'unseen',
    //                 });
    
    //                 // Optionally, send a message from seller to user
    //                 await sellerCustomerMessage.create({
    //                     senderId: sellerId,
    //                     receiverId: userId,
    //                     senderName: seller.firstName + " " + seller.lastName, // Ensure senderName is populated
    //                     message: '👋',
    //                     status: 'unseen',
    //                 });
    //             }
    
    //             // Fetch user's partners and ensure it's not null
    //             const MyPartners = await sellerCustomerModel.findOne({ myId: userId });
    //             if (MyPartners) {
    //                 const currentConnections = MyPartners.myPartners.find(s => s.fdId === sellerId);
    //                 responseReturn(res, 200, { myPartners: MyPartners.myPartners, currentConnections, messages });
    //             } else {
    //                 // Handle case where no partners exist (empty list)
    //                 responseReturn(res, 200, { myPartners: [], currentConnections: null, messages });
    //             }
    //         } else {
    //             // Handle case where sellerId is empty
    //             const MyPartners = await sellerCustomerModel.findOne({ myId: userId });
    //             if (MyPartners) {
    //                 responseReturn(res, 200, { myPartners: MyPartners.myPartners });
    //             } else {
    //                 responseReturn(res, 200, { myPartners: [] });
    //             }
    //         }
    //     } catch (error) {
    //         console.log(error.message);
    //         return res.status(500).json({ error: 'An unexpected error occurred. Please try again later.' });
    //     }
    // };


    // add_trader_friend = async (req, res) => {
    //     const { sellerId, userId } = req.body;
    //     console.log(req.body);
    
    //     try {
    //         if (sellerId !== '') {
    //             const seller = await sellerModel.findById(sellerId);
    //             const user = await traderModel.findById(userId);
    
    //             // Check if the user's partner entry exists in the sellerCustomer model
    //             const checkSeller = await sellerCustomerModel.findOne({
    //                 myId: userId,
    //                 "myPartners.fdId": sellerId
    //             });
    
    //             if (!checkSeller) {
    //                 await sellerCustomerModel.updateOne(
    //                     { myId: userId },
    //                     {
    //                         $push: {
    //                             myPartners: {
    //                                 fdId: sellerId,
    //                                 sellerName: seller.firstName + " " + seller.lastName,
    //                                 name: seller.clusterInfo?.clusterName,
    //                                 image: seller.profileImage
    //                             }
    //                         }
    //                     },
    //                     { upsert: true } // Ensure that a document is created if not already present
    //                 );
    //             }
    
    //             // Check if the seller's partner entry exists in the sellerCustomer model
    //             const checkCustomer = await sellerCustomerModel.findOne({
    //                 myId: sellerId,
    //                 "myPartners.fdId": userId
    //             });
    
    //             if (!checkCustomer) {
    //                 await sellerCustomerModel.updateOne(
    //                     { myId: sellerId },
    //                     {
    //                         $push: {
    //                             myPartners: {
    //                                 fdId: userId,
    //                                 name: user.name,
    //                                 image: "" // Optional, add image if needed
    //                             }
    //                         }
    //                     },
    //                     { upsert: true }
    //                 );
    //             }
    
    //             // Check for existing messages between user and seller
    //             let messages = await sellerCustomerMessage.find({
    //                 $or: [
    //                     { receiverId: sellerId, senderId: userId },
    //                     { receiverId: userId, senderId: sellerId }
    //                 ]
    //             });
    
    //             // If no messages exist, send a greeting message 👋
    //             if (messages.length === 0) {
    //                 // Send message from user to seller
    //                 const userMessage = await sellerCustomerMessage.create({
    //                     senderId: userId,
    //                     receiverId: sellerId,
    //                     senderName: user.name, // Ensure senderName is populated
    //                     message: '👋',
    //                     status: 'unseen',
    //                 });
    
    //                 // Optionally, send a message from seller to user
    //                 const sellerMessage = await sellerCustomerMessage.create({
    //                     senderId: sellerId,
    //                     receiverId: userId,
    //                     senderName: seller.firstName + " " + seller.lastName, // Ensure senderName is populated
    //                     message: '👋',
    //                     status: 'unseen',
    //                 });
    
    //                 // Add the automatically created messages to the messages array
    //                 messages = [userMessage, sellerMessage, ...messages];
    //             }
    
    //             // Fetch user's partners and ensure it's not null
    //             const MyPartners = await sellerCustomerModel.findOne({ myId: userId });
    //             if (MyPartners) {
    //                 const currentConnections = MyPartners.myPartners.find(s => s.fdId === sellerId);
    //                 responseReturn(res, 200, { myPartners: MyPartners.myPartners, currentConnections, messages });
    //             } else {
    //                 // Handle case where no partners exist (empty list)
    //                 responseReturn(res, 200, { myPartners: [], currentConnections: null, messages });
    //             }
    //         } else {
    //             // Handle case where sellerId is empty
    //             const MyPartners = await sellerCustomerModel.findOne({ myId: userId });
    //             if (MyPartners) {
    //                 responseReturn(res, 200, { myPartners: MyPartners.myPartners });
    //             } else {
    //                 responseReturn(res, 200, { myPartners: [] });
    //             }
    //         }
    //     } catch (error) {
    //         console.log(error.message);
    //         return res.status(500).json({ error: 'An unexpected error occurred. Please try again later.' });
    //     }
    // };

    // add_trader_friend = async (req, res) => {
    //     const { sellerId, userId } = req.body;
    //     console.log(req.body);
    
    //     try {
    //         if (sellerId !== '') {
    //             const seller = await sellerModel.findById(sellerId);
    //             const user = await traderModel.findById(userId);
    
    //             // Check if the user's partner entry exists in the sellerCustomer model
    //             const checkSeller = await sellerCustomerModel.findOne({
    //                 myId: userId,
    //                 "myPartners.fdId": sellerId
    //             });
    
    //             if (!checkSeller) {
    //                 await sellerCustomerModel.updateOne(
    //                     { myId: userId },
    //                     {
    //                         $push: {
    //                             myPartners: {
    //                                 fdId: sellerId,
    //                                 sellerName: seller.firstName + " " + seller.lastName,
    //                                 name: seller.clusterInfo?.clusterName,
    //                                 image: ""
    //                                 // image: seller.profileImage
    //                             }
    //                         }
    //                     },
    //                     { upsert: true } // Ensure that a document is created if not already present
    //                 );
    //             }
    
    //             // Check if the seller's partner entry exists in the sellerCustomer model
    //             const checkCustomer = await sellerCustomerModel.findOne({
    //                 myId: sellerId,
    //                 "myPartners.fdId": userId
    //             });
    
    //             if (!checkCustomer) {
    //                 await sellerCustomerModel.updateOne(
    //                     { myId: sellerId },
    //                     {
    //                         $push: {
    //                             myPartners: {
    //                                 fdId: userId,
    //                                 name: user.name,
    //                                 image: "" // Optional, add image if needed
    //                             }
    //                         }
    //                     },
    //                     { upsert: true }
    //                 );
    //             }
    
    //             // Check for existing messages between user and seller
    //             let messages = await sellerCustomerMessage.find({
    //                 $or: [
    //                     { receiverId: sellerId, senderId: userId },
    //                     { receiverId: userId, senderId: sellerId }
    //                 ]
    //             });
    
    //             // If no messages exist, only send a message from user to seller
    //             if (messages.length === 0) {
    //                 // Send message from user to seller (greeting 👋)
    //                 const userMessage = await sellerCustomerMessage.create({
    //                     senderId: userId,
    //                     receiverId: sellerId,
    //                     senderName: user.name, // Ensure senderName is populated
    //                     message: '👋',
    //                     status: 'unseen',
    //                 });
    
    //                 // Add the automatically created message to the messages array
    //                 messages = [userMessage, ...messages];
    //             }
    
    //             // Fetch user's partners and ensure it's not null
    //             const MyPartners = await sellerCustomerModel.findOne({ myId: userId });
    //             if (MyPartners) {
    //                 const currentConnections = MyPartners.myPartners.find(s => s.fdId === sellerId);
    //                 responseReturn(res, 200, { myPartners: MyPartners.myPartners, currentConnections, messages });
    //             } else {
    //                 // Handle case where no partners exist (empty list)
    //                 responseReturn(res, 200, { myPartners: [], currentConnections: null, messages });
    //             }
    //         } else {
    //             // Handle case where sellerId is empty
    //             const MyPartners = await sellerCustomerModel.findOne({ myId: userId });
    //             if (MyPartners) {
    //                 responseReturn(res, 200, { myPartners: MyPartners.myPartners });
    //             } else {
    //                 responseReturn(res, 200, { myPartners: [] });
    //             }
    //         }
    //     } catch (error) {
    //         console.log(error.message);
    //         return res.status(500).json({ error: 'An unexpected error occurred. Please try again later.' });
    //     }
    // };
    add_trader_friend = async (req, res) => {
        console.log(req.body)
        const { sellerId, userId, text, name, customerId } = req.body;
        console.log(req.body);
    
        try {
            if (sellerId !== '') {
                
                const seller = await sellerModel.findById(sellerId);
                const user = await traderModel.findById(userId);
    
                // Check if the user's partner entry exists in the sellerCustomer model
                const checkSeller = await sellerCustomerModel.findOne({
                    myId: userId,
                    "myPartners.fdId": sellerId
                });
    
                if (!checkSeller) {
                    await sellerCustomerModel.updateOne(
                        { myId: userId },
                        {
                            $push: {
                                myPartners: {
                                    fdId: sellerId,
                                    sellerName: seller.firstName + " " + seller.lastName,
                                    name: seller.clusterInfo?.clusterName,
                                    image: seller.profileImage
                                }
                            }
                        },
                        { upsert: true }
                    );
                }
    
                // Check if the seller's partner entry exists in the sellerCustomer model
                const checkCustomer = await sellerCustomerModel.findOne({
                    myId: sellerId,
                    "myPartners.fdId": userId
                });
    
                if (!checkCustomer) {
                    await sellerCustomerModel.updateOne(
                        { myId: sellerId },
                        {
                            $push: {
                                myPartners: {
                                    fdId: userId,
                                    name: user.firstName + user.lastName,
                                    image: user.profileImage // Optional, add image if needed
                                }
                            }
                        },
                        { upsert: true }
                    );
                }
    
                // Check for existing messages between user and seller
                let messages = await sellerCustomerMessage.find({
                    $or: [
                        { receiverId: sellerId, senderId: userId },
                        { receiverId: userId, senderId: sellerId }
                    ]
                });
    
                // If no messages exist, only send a message from user to seller
                if (messages.length === 0) {
                    // Send message from user to seller (greeting 👋)
                    const userMessage = await sellerCustomerMessage.create({
                        senderId: userId,
                        receiverId: sellerId,
                        senderName:user.firstName + user.lastName, // Ensure senderName is populated
                        message: '👋',
                        status: 'unseen',
                    });
    
                    // Add the automatically created message to the messages array
                    messages = [userMessage, ...messages];
                }
    
                // If a message is provided in the request body, save it
                if (text && text.trim()) {
                    const messageData = {
                        senderId: userId,
                        receiverId: sellerId,
                        senderName: name || user.firstName + user.lastName, // use name from frontend request
                        message: text,
                        status: 'unseen',
                    };
    
                    await sellerCustomerMessage.create(messageData);
    
                    // Also add the message to the messages array for response
                    messages.push({
                        ...messageData,
                        message: text, // New message content
                    });
                }
    
                // Fetch user's partners and ensure it's not null
                const MyPartners = await sellerCustomerModel.findOne({ myId: userId });
                if (MyPartners) {
                    const currentConnections = MyPartners.myPartners.find(s => s.fdId === sellerId);
                    responseReturn(res, 200, { myPartners: MyPartners.myPartners, currentConnections, messages });
                } else {
                    // Handle case where no partners exist (empty list)
                    responseReturn(res, 200, { myPartners: [], currentConnections: null, messages });
                }
            } else {
                // Handle case where sellerId is empty
                const MyPartners = await sellerCustomerModel.findOne({ myId: userId });
                if (MyPartners) {
                    responseReturn(res, 200, { myPartners: MyPartners.myPartners });
                } else {
                    
                    responseReturn(res, 200, { myPartners: [] });
                }
            }
        } catch (error) {
            console.log(error.message);
            return res.status(500).json({ error: 'An unexpected error occurred. Please try again later.' });
        }
    };
    
    
    
    
    


    trader_message_add = async(req,res)=>{
        const {userId, text, sellerId, name} = req.body;
        console.log(req.body)
        try {
            const message = await sellerCustomerMessage.create({
                senderId: userId,
                senderName: name,
                receiverId: sellerId,
                message: text
            })
            


            const data = await sellerCustomerModel.findOne({
                myId: userId
            })
            console.log(data)

            let myPartners = data.myPartners
            console.log("____________________________ 1")
            let index = myPartners.findIndex(f=>f.fdId === sellerId)
            console.log("____________________________ 2")

            while(index > 0){
                let temp = myPartners[index]
                myPartners[index] = myPartners[index - 1]
                myPartners[index - 1] = temp
                index--
            }
            console.log("____________________________ 3")
            await sellerCustomerModel.updateOne(
                {
                myId: userId
                },
                {
                myPartners
                }
        )
        console.log("____________________________ 4")
        const data1 = await sellerCustomerModel.findOne({
            myId: sellerId
        })

        console.log(data1)
        let myPartners1 = data1.myPartners
        console.log("____________________________ 5")
        let index1 = myPartners1.findIndex(f=>f.fdId === userId) 
        
        while(index1 > 0){
            let temp1 = myPartners1[index1]
            myPartners1[index1] = myPartners[index1 - 1]
            myPartners1[index1 - 1] = temp1
            index1--
        }


        await sellerCustomerModel.updateOne(
            {
                myId: sellerId
            },
            {
                myPartners1
            }
        )


        console.log("ASdasdasd")

        console.log(message)



        responseReturn(res, 200,{message})
        } catch (error) {
            console.log(error.message)
            
        }
    }

    // add_trader_friend = async (req, res) => {
    //     const {
    //         sellerId,
    //         userId
    //     } = req.body;
    //     //console.log(req.body)
    //     try {
    //         if (sellerId !== '') {
    //             const seller = await sellerModel.findById(sellerId)
    //             const user = await traderModel.findById(userId)
              

    //             const checkSeller = await sellerCustomerModel.findOne({
    //                 $and: [{
    //                     myId: {
    //                         $eq: userId
    //                     }
    //                 }, {
    //                     myPartners: {
    //                         $elemMatch: {
    //                             fdId: sellerId
    //                         }
    //                     }
    //                 }]
    //             })
    //             if (!checkSeller) {
    //                 await sellerCustomerModel.updateOne({
    //                     myId: userId
    //                 }, {
    //                     $push: {
    //                         myPartners: {
    //                             fdId: sellerId,
    //                             name: seller.shopInfo?.shopName,
    //                             image: seller.image
    //                         }
    //                     }
    //                 })
    //             }

    //             const checkCustomer = await sellerCustomerModel.findOne({
    //                 $and: [{
    //                     myId: {
    //                         $eq: sellerId
    //                     }
    //                 }, {
    //                     myPartners: {
    //                         $elemMatch: {
    //                             fdId: userId
    //                         }
    //                     }
    //                 }]
    //             })
    //             if (!checkCustomer) {
    //                 await sellerCustomerModel.updateOne({
    //                     myId: sellerId
    //                 }, {
    //                     $push: {
    //                         myPartners: {
    //                             fdId: userId,
    //                             name: user.name,
    //                             image: ""
    //                         }
    //                     }
    //                 })
    //             }
    //             const messages = await sellerCustomerMessage.find({
    //                 $or: [
    //                     {
    //                         $and: [{
    //                             receiverId: { $eq: sellerId }
    //                         }, {
    //                             senderId: {
    //                                 $eq: userId
    //                             }
    //                         }]
    //                     },
    //                     {
    //                         $and: [{
    //                             receiverId: { $eq: userId }
    //                         }, {
    //                             senderId: {
    //                                 $eq: sellerId
    //                             }
    //                         }]
    //                     }
    //                 ]
    //             })
    //             const MyFriends = await sellerCustomerModel.findOne({
    //                 myId: userId
    //             })
    //             console.log("_______________________________________ >")
    //             console.log(MyFriends)

    //             const currentFd = MyFriends.myFriends.find(s => s.fdId === sellerId)
    //             responseReturn(res, 200, {
    //                 myFriends: MyFriends.myFriends,
    //                 currentFd,
    //                 messages
    //             })
    //         } else {
    //             const MyFriends = await sellerCustomerModel.findOne({
    //                 myId: userId
    //             })
    //             responseReturn(res, 200, {
    //                 myFriends: MyFriends.myFriends
    //             })
    //         }
    //     } catch (error) {
    //         console.log(error)
    //     }
    // }

    
    // const mongoose = require("mongoose");

    // add_trader_friend = async (req, res) => {
    //     const { sellerId, userId } = req.body;
    
    //     // Input validation
    //     if (!sellerId || !userId) {
    //         return res.status(400).json({ success: false, error: "sellerId and userId are required." });
    //     }
    
    //     const session = await mongoose.startSession();
    //     let transactionCommitted = false; // Track transaction state
    
    //     try {
    //         session.startTransaction();
    
    //         // Fetch seller and user records
    //         const [seller, user] = await Promise.all([
    //             sellerModel.findById(sellerId),
    //             traderModel.findById(userId),
    //         ]);
    
    //         if (!seller || !user) {
    //             throw new Error("Either seller or user does not exist.");
    //         }
    
    //         // Ensure a document for userId exists in sellerCustomerModel
    //         const userRecord = await sellerCustomerModel.findOneAndUpdate(
    //             { myId: userId },
    //             { $setOnInsert: { myId: userId, myPartners: [] } },
    //             { upsert: true, new: true, session }
    //         );
    
    //         // Ensure a document for sellerId exists in sellerCustomerModel
    //         const sellerRecord = await sellerCustomerModel.findOneAndUpdate(
    //             { myId: sellerId },
    //             { $setOnInsert: { myId: sellerId, myPartners: [] } },
    //             { upsert: true, new: true, session }
    //         );
    
    //         // Add the seller to the user's partners if not already present
    //         const userPartnerExists = userRecord.myPartners.some((partner) => partner.fdId === sellerId);
    //         if (!userPartnerExists) {
    //             await sellerCustomerModel.updateOne(
    //                 { myId: userId },
    //                 {
    //                     $push: {
    //                         myPartners: {
    //                             fdId: sellerId,
    //                             name: seller.clusterInfo.clusterName || "Unknown Shop",
    //                             image: seller.profileImage || "",
    //                         },
    //                     },
    //                 },
    //                 { session }
    //             );
    //         }
    
    //         // Add the user to the seller's partners if not already present
    //         const sellerPartnerExists = sellerRecord.myPartners.some((partner) => partner.fdId === userId);
    //         if (!sellerPartnerExists) {
    //             await sellerCustomerModel.updateOne(
    //                 { myId: sellerId },
    //                 {
    //                     $push: {
    //                         myPartners: {
    //                             fdId: userId,
    //                             name: user.name || "Unknown User",
    //                             image: "",
    //                         },
    //                     },
    //                 },
    //                 { session }
    //             );
    //         }
    
    //         // Fetch messages between seller and user
    //         const messages = await sellerCustomerMessage.find({
    //             $or: [
    //                 { receiverId: sellerId, senderId: userId },
    //                 { receiverId: userId, senderId: sellerId },
    //             ],
    //         });
    
    //         // Fetch updated user partners to return
    //         const updatedUserRecord = await sellerCustomerModel.findOne({ myId: userId }, null, { session });
    
    //         // Find current connection details for userId
    //         const currentConnection = updatedUserRecord.myPartners.find((partner) => partner.fdId === sellerId);
    
    //         await session.commitTransaction(); // Commit the transaction
    //         transactionCommitted = true;

    //         console.log( messages)

    //         responseReturn(res, 200, {myPartners: updatedUserRecord.myPartners,
    //             currentConnection,
    //             messages,})
    
       
          
    //     } catch (error) {
    //         // Rollback transaction only if not already committed
    //         if (!transactionCommitted) {
    //             await session.abortTransaction();
    //         }
    //         console.error(error.message);
    //         return res.status(500).json({ success: false, error: error.message });
    //     } finally {
    //         session.endSession(); // Ensure session is always closed
    //     }
    // };

    // add_trader_friend = async (req, res) => {
    //     const { sellerId, userId } = req.body;
    
    //     // Input validation
    //     if (!sellerId || !userId) {
    //         return res.status(400).json({ success: false, error: "sellerId and userId are required." });
    //     }
    
    //     const session = await mongoose.startSession();
    //     let transactionCommitted = false; // Track transaction state
    
    //     try {
    //         session.startTransaction();
    
    //         // Fetch seller and user records
    //         const [seller, user] = await Promise.all([
    //             sellerModel.findById(sellerId),
    //             traderModel.findById(userId),
    //         ]);
    
    //         if (!seller || !user) {
    //             throw new Error("Either seller or user does not exist.");
    //         }
    
    //         // Ensure a document for userId exists in sellerCustomerModel
    //         const userRecord = await sellerCustomerModel.findOneAndUpdate(
    //             { myId: userId },
    //             { $setOnInsert: { myId: userId, myPartners: [] } },
    //             { upsert: true, new: true, session }
    //         );
    
    //         // Ensure a document for sellerId exists in sellerCustomerModel
    //         const sellerRecord = await sellerCustomerModel.findOneAndUpdate(
    //             { myId: sellerId },
    //             { $setOnInsert: { myId: sellerId, myPartners: [] } },
    //             { upsert: true, new: true, session }
    //         );
    
    //         // Add the seller to the user's partners if not already present
    //         const userPartnerExists = userRecord.myPartners.some((partner) => partner.fdId === sellerId);
    //         if (!userPartnerExists) {
    //             await sellerCustomerModel.updateOne(
    //                 { myId: userId },
    //                 {
    //                     $push: {
    //                         myPartners: {
    //                             fdId: sellerId,
    //                             name: seller.shopInfo?.shopName || "Unknown Shop",
    //                             image: seller.image || "",
    //                         },
    //                     },
    //                 },
    //                 { session }
    //             );
    //         }
    
    //         // Add the user to the seller's partners if not already present
    //         const sellerPartnerExists = sellerRecord.myPartners.some((partner) => partner.fdId === userId);
    //         if (!sellerPartnerExists) {
    //             await sellerCustomerModel.updateOne(
    //                 { myId: sellerId },
    //                 {
    //                     $push: {
    //                         myPartners: {
    //                             fdId: userId,
    //                             name: user.name || "Unknown User",
    //                             image: "",
    //                         },
    //                     },
    //                 },
    //                 { session }
    //             );
    //         }
    
    //         // Fetch messages between seller and user
    //         const messages = await sellerCustomerMessage.find({
    //             $or: [
    //                 { receiverId: sellerId, senderId: userId },
    //                 { receiverId: userId, senderId: sellerId },
    //             ],
    //         });
    
    //         // If no messages exist, send a default "👋" message
    //         if (messages.length === 0) {
    //             const welcomeMessage = await sellerCustomerMessage.create(
    //                 {
    //                     senderId: userId,
    //                     senderName: user.name || "Unknown User",
    //                     receiverId: sellerId,
    //                     message: "👋",
    //                     status: "unseen",
    //                 },
    //                 { session }
    //             );
    
    //             // Add the new message to the messages array
    //             messages.push(welcomeMessage);
    //         }
    
    //         // Fetch updated user partners to return
    //         const updatedUserRecord = await sellerCustomerModel.findOne({ myId: userId }, null, { session });
    
    //         // Find current connection details for userId
    //         const currentConnection = updatedUserRecord.myPartners.find((partner) => partner.fdId === sellerId);
    
    //         await session.commitTransaction(); // Commit the transaction
    //         transactionCommitted = true;

    //         console.log( messages)

    //         responseReturn(res, 200, {
    //             myPartners: updatedUserRecord.myPartners,
    //                     currentConnection,
    //                     messages
    //         })

    //     } catch (error) {
    //         // Rollback transaction only if not already committed
    //         if (!transactionCommitted) {
    //             await session.abortTransaction();
    //         }
    //         console.error(error.message);
    //         return res.status(500).json({ success: false, error: error.message });
    //     } finally {
    //         session.endSession(); // Ensure session is always closed
    //     }
    // };



    trader_message_add = async (req, res) => {
        const { userId, text, sellerId, name } = req.body;
    
        if (!userId || !text || !sellerId || !name) {
            console.log("Missing Request BODY")
            // return res.status(400).json({ error: "Missing required fields" });
        }
    
        try {
            // Step 1: Create a message
            const message = await sellerCustomerMessage.create({
                senderId: userId,
                senderName: name,
                receiverId: sellerId,
                message: text,
            });
    
            // Step 2: Update sender's partners
            const data = await sellerCustomerModel.findOne({ myId: userId });
            if (!data) {
                console.log("Sender not found in sellerCustomerModel")
                // return res.status(404).json({ error: "Sender not found in sellerCustomerModel" });
            }
    
            let myPartners = data.myPartners || [];
            let index = myPartners.findIndex((f) => f.fdId === sellerId);
            if (index > -1) {
                const [partner] = myPartners.splice(index, 1);
                myPartners.unshift(partner);
            }
            await sellerCustomerModel.updateOne({ myId: userId }, { myPartners });
    
            // Step 3: Update receiver's partners
            let data1 = await sellerCustomerModel.findOne({ myId: sellerId });
    
            if (!data1) {
                // Create a new document for the receiver if it doesn't exist
                data1 = await sellerCustomerModel.create({
                    myId: sellerId,
                    myPartners: [],
                });
            }
    
            let myPartners1 = data1.myPartners || [];
            let index1 = myPartners1.findIndex((f) => f.fdId === userId);
            if (index1 > -1) {
                const [partner] = myPartners1.splice(index1, 1);
                myPartners1.unshift(partner);
            }
    
            await sellerCustomerModel.updateOne({ myId: sellerId }, { myPartners: myPartners1 });
    
            responseReturn(res, 200, {message})
            // return res.status(200).json({ message });
        } catch (error) {
            console.error(error.message);
            responseReturn(res, 500, {error: error.message})
            // return res.status(500).json({ error: "Internal Server Error" });
        }
    };


    // LET THE GAMES BEGIN

    get_customers = async (req, res) => {
        const { sellerId } = req.params

        try {
            const data = await sellerCustomerModel.findOne({ myId: sellerId })
            // console.log(data)

            responseReturn(res, 200, {
                customers: data.myPartners
            })
        } catch (error) {
            console.log(error)
        }
    }


    get_customer_seller_message = async (req, res) => {
        const { customerId } = req.params
        const { id } = req

        try {
            const messages = await sellerCustomerMessage.find({
                $or: [
                    {
                        $and: [{
                            receiverId: { $eq: customerId }
                        }, {
                            senderId: {
                                $eq: id
                            }
                        }]
                    },
                    {
                        $and: [{
                            receiverId: { $eq: id }
                        }, {
                            senderId: {
                                $eq: customerId
                            }
                        }]
                    }
                ]
            })
            const currentCustomer = await traderModel.findById(customerId)

            // console.log("___________________________________________ >")
            // console.log(messages)
            // console.log(currentCustomer)
            // console.log("___________________________________________ >")

            responseReturn(res, 200, { messages, currentCustomer })


        } catch (error) {
            console.log(error)
        }

    }

    seller_message_add = async (req, res) => {
        const { senderId, text, receiverId, name } = req.body
        try {
            const message = await sellerCustomerMessage.create({
                senderId: senderId,
                senderName: name,
                receiverId: receiverId,
                message: text
            })

            const data = await sellerCustomerModel.findOne({ myId: senderId })
            let myPartners = data.myPartners
            let index = myPartners.findIndex(f => f.fdId === receiverId)
            while (index > 0) {
                let temp = myPartners[index]
                myPartners[index] = myPartners[index - 1]
                myPartners[index - 1] = temp
                index--
            }
            await sellerCustomerModel.updateOne(
                {
                    myId: senderId
                },
                {
                    myPartners
                }
            )
            const data1 = await sellerCustomerModel.findOne({ myId: receiverId })
            let myPartners1 = data1.myPartners
            let index1 = myPartners1.findIndex(f => f.fdId === senderId)

            while (index1 > 0) {
                let temp1 = myPartners1[index1]
                myPartners1[index1] = myPartners[index1 - 1]
                myPartners1[index1 - 1] = temp1
                index1--
            }

            await sellerCustomerModel.updateOne(
                {
                    myId: receiverId
                },
                {
                    myPartners1
                }
            )


            responseReturn(res, 201, { message })

        } catch (error) {
            console.log(error)
        }
    }

    get_sellers = async (req, res) => {
        try {
            const sellers = await sellerModel.find({})
            responseReturn(res, 200, { sellers })
        } catch (error) {
            console.log(error)
        }
    }

    seller_admin_message_insert = async (req, res) => {
        console.log(req.body)
        const { senderId, receiverId, message, senderName } = req.body
        try {
            const messageData = await adminSellerMessage.create({
                senderId,
                receiverId,
                senderName,
                message
            })
            console.log(messageData)
            responseReturn(res, 200, { message: messageData })

        } catch (error) {
            console.log(error)
        }
    }

    get_admin_messages = async (req, res) => {

        const { receiverId } = req.params;
        const id = ""
        try {
            const messages = await adminSellerMessage.find({
                $or: [
                    {
                        $and: [{
                            receiverId: { $eq: receiverId }
                        }, {
                            senderId: {
                                $eq: id
                            }
                        }]
                    },
                    {
                        $and: [{
                            receiverId: { $eq: id }
                        }, {
                            senderId: {
                                $eq: receiverId
                            }
                        }]
                    }
                ]
            })
            let currentSeller = {}
            if (receiverId) {
                currentSeller = await sellerModel.findById(receiverId)

            }
            console.log(messages)
            responseReturn(res, 200, { messages, currentSeller })
        } catch (error) {
            console.log(error)
        }
    }

    get_seller_messages = async (req, res) => {
        console.log(req.body)
        const receiverId = ""
        const { id } = req
        try {
            const messages = await adminSellerMessage.find({
                $or: [
                    {
                        $and: [{
                            receiverId: { $eq: receiverId }
                        }, {
                            senderId: {
                                $eq: id
                            }
                        }]
                    },
                    {
                        $and: [{
                            receiverId: { $eq: id }
                        }, {
                            senderId: {
                                $eq: receiverId
                            }
                        }]
                    }
                ]
            })
            console.log("_____________________________________________ >")
            console.log(messages)
            console.log("_____________________________________________ >")
            
            responseReturn(res, 200, { messages })
        } catch (error) {
            console.log(error)
        }
    }
}
    


module.exports = new chatController()