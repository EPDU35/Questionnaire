// controllers/notification.controller.js
const NotificationModel   = require('../models/notification.model');
const NotificationService = require('../services/notification.service');

const NotificationController = {

  /**
   * GET /api/notifications
   * Récupère les notifications de l'utilisateur connecté + compteur non lus
   */
  async getNotifications(req, res) {
    try {
      const user_id = req.user.id; // injecté par auth.middleware.js (JWT)

      const [notifications, unreadCount] = await Promise.all([
        NotificationModel.getByUser(user_id),
        NotificationModel.countUnread(user_id)
      ]);

      // Ajout de la couleur à chaque notification pour le frontend
      const COLOR_MAP = {
        info:     '#2196F3',
        warning:  '#FF9800',
        critical: '#F44336'
      };

      const enriched = notifications.map(n => ({
        ...n,
        color:   COLOR_MAP[n.level] || '#9E9E9E',
        is_read: Boolean(n.is_read) // convertit 0/1 MySQL en true/false
      }));

      return res.status(200).json({
        success:      true,
        unread_count: unreadCount,        // 🔔 badge compteur
        notifications: enriched
      });

    } catch (error) {
      console.error('[NotificationController.getNotifications]', error);
      return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  },

  /**
   * PUT /api/notifications/:id/read
   * Marque une notification comme lue
   */
  async markAsRead(req, res) {
    try {
      const user_id = req.user.id;
      const { id }  = req.params;

      const updated = await NotificationModel.markAsRead(id, user_id);

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Notification introuvable ou accès non autorisé'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Notification marquée comme lue'
      });

    } catch (error) {
      console.error('[NotificationController.markAsRead]', error);
      return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  },

  /**
   * PUT /api/notifications/read-all
   * Marque toutes les notifications comme lues (bonus UX)
   */
  async markAllAsRead(req, res) {
    try {
      await NotificationModel.markAllAsRead(req.user.id);
      return res.status(200).json({ success: true, message: 'Toutes les notifications lues' });
    } catch (error) {
      console.error('[NotificationController.markAllAsRead]', error);
      return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }
};

module.exports = NotificationController;