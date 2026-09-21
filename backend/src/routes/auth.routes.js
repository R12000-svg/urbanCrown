const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');
const { attachUser, requireAuth } = require('../middleware/auth');

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.get('/me', attachUser, requireAuth, ctrl.me);
router.get('/profile', attachUser, requireAuth, ctrl.profile);
router.patch('/profile', attachUser, requireAuth, ctrl.updateProfile);

module.exports = router;