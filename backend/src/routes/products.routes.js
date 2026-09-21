const router = require('express').Router();
const ctrl = require('../controllers/products.controller');
const { attachUser, requireAuth } = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

router.get('/', (req, res, next) => {
	if (req.query.all !== 'true') return next();
	return attachUser(req, res, () => requireAuth(req, res, (error) => {
		if (error) return next(error);
		return adminOnly(req, res, next);
	}));
}, ctrl.list);
router.get('/featured', ctrl.featured);
router.get('/low-stock', attachUser, requireAuth, adminOnly, ctrl.lowStock);
router.get('/:slug', ctrl.getBySlug);
router.post('/', attachUser, requireAuth, adminOnly, ctrl.create);
router.put('/:id', attachUser, requireAuth, adminOnly, ctrl.update);
router.delete('/:id', attachUser, requireAuth, adminOnly, ctrl.remove);

module.exports = router;