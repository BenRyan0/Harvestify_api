const router = require('express').Router()
const { authMiddleware } = require('../../middlewares/authMiddleware')
const { get_seller_dashboard_data,get_admin_dashboard_data,get_admin_dashboard_category_price_fluctuations,get_seller_dashboard_category_price_fluctuations, get_admin_dashboard_category_yield_fluctuations} = require('../../controllers/dashboard/dashboardIndexController')

router.get('/seller/get-dashboard-index-data/:id', get_seller_dashboard_data);
router.get('/admin/get-dashboard-index-data', authMiddleware, get_admin_dashboard_data)



router.get('/admin/get_admin_dashboard_category_price_fluctuations',get_admin_dashboard_category_price_fluctuations)
router.get('/seller/get_seller_dashboard_category_price_fluctuations',get_seller_dashboard_category_price_fluctuations)
router.get('/admin/get_seller_dashboard_category_yield_fluctuations',get_admin_dashboard_category_yield_fluctuations)
// router.get('/admin/get_admin_dashboard_category_price_fluctuations', authMiddleware,get_admin_dashboard_category_price_fluctuations)




// router.get('/seller/get-dashboard-index-data', authMiddleware, get_seller_dashboard_data)
// router.get('/admin/get-dashboard-index-data', authMiddleware, get_admin_dashboard_data)

module.exports = router