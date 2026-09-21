const router = require('express').Router();

router.use('/auth', require('./auth.routes'));
router.use('/products', require('./products.routes'));
router.use('/categories', require('./categories.routes'));
router.use('/orders', require('./orders.routes'));
router.use('/settings', require('./settings.routes'));

module.exports = router;