const router = require('express').Router()
const activateController = require('./controllers/activate-controller')
const authController = require('./controllers/auth-controller')
const roomsController = require('./controllers/rooms-controller')
const userController = require('./controllers/user-controller')
const authMiddleware = require('./middlewares/auth-middleware')

router.post('/send-otp', authController.sendOtp)
router.post('/verify-otp', authController.verifyOtp)

router.post('/activate', authMiddleware, activateController.activate)

// new routes of part-5
router.get('/refresh', authController.refresh);
router.post('/logout', authMiddleware, authController.logout);
router.post('/rooms', authMiddleware, roomsController.create);
router.get('/rooms', authMiddleware, roomsController.index);
router.get('/rooms/:roomId', authMiddleware, roomsController.show);
router.post('/rooms/:roomId/invite', authMiddleware, roomsController.invite);
router.post('/rooms/:roomId/remove', authMiddleware, roomsController.removeUser);
router.post('/rooms/:roomId/leave', authMiddleware, roomsController.leave);
router.delete('/rooms/:roomId', authMiddleware, roomsController.delete);
router.post('/profile/update', authMiddleware, userController.updateProfile);
router.post('/profile/send-otp', authMiddleware, userController.sendUpdateOtp);
router.post('/profile/verify-otp', authMiddleware, userController.verifyUpdateOtp);

router.get('/users/search', authMiddleware, userController.search);

router.get('/test', (req, res) => res.json({ msg: 'OK' }));

module.exports = router