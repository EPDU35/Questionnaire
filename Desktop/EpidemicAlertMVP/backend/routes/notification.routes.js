// routes/notification.routes.js
const express                  = require('express');
const router                   = express.Router();
const NotificationController   = require('../controllers/notification.controller');
const authMiddleware           = require('../middlewares/auth.middleware');

// Toutes les routes nécessitent un JWT valide
router.use(authMiddleware);

router.get ('/',            NotificationController.getNotifications);
router.put ('/read-all',    NotificationController.markAllAsRead);      // avant /:id pour éviter le conflit
router.put ('/:id/read',    NotificationController.markAsRead);

module.exports = router;