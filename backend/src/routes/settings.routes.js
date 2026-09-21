const router = require('express').Router();
const ctrl = require('../controllers/settings.controller');
const { attachUser, requireAuth } = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

router.get('/payment', ctrl.getPayment);
router.patch('/payment', attachUser, requireAuth, adminOnly, ctrl.updatePayment);

module.exports = router;
