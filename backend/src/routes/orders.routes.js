const router = require('express').Router();
const ctrl = require('../controllers/orders.controller');
const { attachUser, requireAuth } = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

router.post('/', attachUser, ctrl.create); // permite invitado (attachUser no exige auth)
router.get('/mine', attachUser, requireAuth, ctrl.myOrders);
router.get('/summary', attachUser, requireAuth, adminOnly, ctrl.salesSummary);
router.get('/:id', attachUser, ctrl.getById);
router.get('/', attachUser, requireAuth, adminOnly, ctrl.listAll);
router.patch('/:id/status', attachUser, requireAuth, adminOnly, ctrl.updateStatus);

module.exports = router;