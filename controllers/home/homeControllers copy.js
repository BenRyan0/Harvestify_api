const categoryModel = require("../../models/categoryModel")
const listingModel = require("../../models/listingModel")
const {responseReturn} = require("../../utils/response")
class homeControllers{

    formattedListings = (listings)=>{
     const productArray = [];
     let i = 0
     while(i<listings.length){
          let temp = []
          let j = i
          while(j < i + 3){
               if(listings[j]){
                    temp.push(listings[j])
               }
               j++
          }
          productArray.push([...temp])
          i = j
     }
     return productArray

    }
    get_categories = async(req, res) =>{
       try {
            const categories = await categoryModel.find({})
            responseReturn(res, 200, {categories})
       } catch (error) {
            console.log(error.message)
       }
    }
    get_listings = async(req, res) =>{
       try {
            const listings = await listingModel.find({}).limit(16).sort({createdAt : -1})
            const allListings1 = await listingModel.find({}).limit(9).sort({createdAt : -1})
            const latestListings = this.formattedListings(allListings1)
          //   console.log(latestListings)
          const topRated = await listingModel.find({}).limit(9).sort({rating : -1})

            responseReturn(res, 200, {listings})
       } catch (error) {
            console.log(error.message)
       }
    }
}

module.exports = new homeControllers()