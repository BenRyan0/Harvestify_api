const sellerModel = require('../../models/sellerModel')
const traderModel = require('../../models/traderModel')
const sellerCustomerModel = require('../../models/chat/sellerCustomerModel')
const sellerCustomerMessage= require('../../models/chat/sellerCustomerMessage')
const adminSellerMessage = require('../../models/chat/adminSellerMessage')
const {responseReturn} = require('../../utils/response')
const mongoose = require("mongoose");

class twoFactorAuthController{
        register2fa = async (req, res) => {
           
        };
   
}
    


module.exports = new twoFactorAuthController()