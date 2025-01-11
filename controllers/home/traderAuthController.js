const traderModel = require('../../models/traderModel')
const { responseReturn } = require('../../utils/response')
const sellerCustomerModel = require("../../models/chat/sellerCustomerModel");
const bcrypt = require('bcrypt');
const { createToken } = require('../../utils/tokenCreate');

class traderAuthController{
    trader_register = async(req, res)=>{
       const { name,email,password} = req.body
       
       try {
        const trader = await traderModel.findOne({email})
            if(trader){
                responseReturn(res, 404,{error : 'Email Already Exists'})
            }else{
                const createTrader = await traderModel.create({
                    name: name.trim(),
                    email : email.trim(),
                    password: await bcrypt.hash(password, 10),
                    method : 'manually'
                })
                await sellerCustomerModel.create({
                    myId: createTrader.id
                })

                const token = await createToken({
                    id: createTrader.id,
                    name: createTrader.name,
                    email: createTrader.email,
                    method: createTrader.method
                })

                res.cookie('traderToken', token,{
                    expires : new Date(Date.now() + 7*24*60*60*1000)
                    
                })
                responseReturn(res, 201,{message : 'Registration Success', token})
            }
       } catch (error) {
        console.log(error.message)
        
       }
    }
    // trader_login = async (req, res) => {
    //     console.log("login");
    //     console.log(req.body);
    
    //     const { email, password } = req.body;
    
    //     try {
    //         const trader = await traderModel.findOne({ email }).select('+password');
            
    //         if (trader) {
    //             const match = await bcrypt.compare(password, trader.password);
    
    //             if (match) {
    //                 const token = await createToken({
    //                     id: trader.id,  // Corrected from createTrader.id to trader.id
    //                     name: trader.name,
    //                     email: trader.email,
    //                     method: trader.method
    //                 });
    
    //                 res.cookie('traderToken', token, {
    //                     expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),  // 7 days expiration
    //                     httpOnly: true,  // For added security
    //                     // secure: process.env.NODE_ENV === "production" // Set secure only in production
    //                 });
    
    //                 responseReturn(res, 200, { token, message: "Login Success" });
    //             } else {
    //                 responseReturn(res, 401, { error: "Invalid Credentials, Please try Again" });
    //             }
    //         } else {
    //             responseReturn(res, 404, { error: "Credential not found" });
    //         }
    //     } catch (error) {
    //         console.error("Login Error:", error); // Log the error for debugging
    //         responseReturn(res, 500, { error: "Server error, please try again later." });
    //     }
    // };


    // trader_login = async (req, res) => {
    //     console.log("login");
    //     console.log(req.body);
    
    //     const { email, password } = req.body;
    
    //     try {
    //         const trader = await traderModel.findOne({ email }).select('+password');
    
    //         if (trader) {
    //             // Check if the trader's status is "active"
    //             if (trader.status !== 'active') {
    //                 return responseReturn(res, 403, { redirect: 1 ,error: "Account is not active. Please contact support." });
    //             }
    
    //             // Password match check
    //             const match = await bcrypt.compare(password, trader.password);

    //             console.log(trader)
    
    //             if (match) {
    //                 const token = await createToken({
    //                     id: trader.id,
    //                     name: `${trader.firstName} ${trader.lastName}`,
    //                     email: trader.email,
    //                     role: trader.role
    //                 });

    //                 console.log(token)
    
    //                 res.cookie('traderToken', token, {
    //                     expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),  // 7 days expiration
    //                     httpOnly: true,  // For added security
    //                     // secure: process.env.NODE_ENV === "production" // Set secure only in production
    //                 });
    
    //                 responseReturn(res, 200, { redirect: 0,token, message: "Login Success" });
    //             } else {
    //                 responseReturn(res, 401, { redirect: 0,error: "Invalid Credentials, Please try Again" });
    //             }
    //         } else {
    //             responseReturn(res, 404, { redirect: 0,error: "Credential not found" });
    //         }
    //     } catch (error) {
    //         console.error("Login Error:", error); // Log the error for debugging
    //         responseReturn(res, 500, { redirect: 0,error: "Server error, please try again later." });
    //     }
    // };
    trader_login = async (req, res) => {
        // console.log("login");
        // console.log(req.body);
    
        const { email, password } = req.body;
    
        try {
            const trader = await traderModel.findOne({ email }).select('+password');
    
            if (trader) {
                if (trader.status !== 'active') {
                    return responseReturn(res, 403, { redirect: 1, error: "Account is not active. Please contact support." });
                }
    
                const match = await bcrypt.compare(password, trader.password);
    
                if (match) {
                    const payload = {
                        id: trader.id,
                        name: `${trader.firstName} ${trader.lastName}`,
                        email: trader.email,
                        phone: trader.phoneNumber,
                        role: trader.role,
                    };
                    // console.log("Token Payload:", payload);
    
                    const token = await createToken(payload);
                    console.log("Generated Token:", token);
    
                    res.cookie('traderToken', token, {
                        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                        httpOnly: true,
                        secure: process.env.NODE_ENV === "production",
                    });
    
                    responseReturn(res, 200, { redirect: 0, token, message: "Login Success" });
                } else {
                    responseReturn(res, 401, { redirect: 0, error: "Invalid Credentials, Please try Again" });
                }
            } else {
                responseReturn(res, 404, { redirect: 0, error: "Credential not found" });
            }
        } catch (error) {
            console.error("Login Error:", error);
            responseReturn(res, 500, { redirect: 0, error: "Server error, please try again later." });
        }
    };
    
    


    trader_logout = async(req,res)=>{
        try {
            res.cookie('traderToken', null,{
              expires : new Date(Date.now()),
              httpOnly: true
            })
      
            responseReturn(res,200,{
              message: "Logged out Successfully"
            })
          } catch (error) {
            responseReturn(res, 500, {
              error: error.message,
            });
            
          }
        }
       
    

    

 

}


module.exports = new traderAuthController()