const router = require("express").Router();
const cardController = require("../../controllers/home/cardController")


router.post('/home/listing/add-to-card', cardController.add_to_card)
router.get('/home/listing/get-card-listings/:userId', cardController.get_card_listings)
router.delete('/home/listing/delete-card-listings/:card_id', cardController.delete_card_listings)


router.post('/home/listing/add-to-wishlist', cardController.add_to_wishlist)
router.get('/home/listing/get-wishlist-listings/:userId', cardController.get_wishlist_listings)
router.delete('/home/listing/remove-wishlist-listings/:wishlist_id', cardController.remove_wishlist_listings)


// /home/listing/remove-wishlist-listings/${wishlist_id}


module.exports = router;
