// models/notification.model.js
const db = require('../config/db');

const NotificationModel = {

  /**
   * Insère une nouvelle notification en base
   */
  async create({ user_id, title, message, level }) {
    const [result] = await db.execute(
      `INSERT INTO notifications (user_id, title, message, level)
       VALUES (?, ?, ?, ?)`,
      [user_id, title, message, level]
    );
    return result.insertId;
  },

  /**
   * Récupère les notifications non lues + les 30 dernières lues (pour l'historique)
   */
  async getByUser(user_id) {
    const [rows] = await db.execute(
      `SELECT * FROM notifications
       WHERE user_id = ?
       ORDER BY is_read ASC, created_at DESC
       LIMIT 50`,
      [user_id]
    );
    return rows;
  },

  /**
   * Compte les notifications non lues d'un utilisateur
   */
  async countUnread(user_id) {
    const [[{ total }]] = await db.execute(
      `SELECT COUNT(*) AS total FROM notifications
       WHERE user_id = ? AND is_read = 0`,
      [user_id]
    );
    return total;
  },

  /**
   * Marque une notification comme lue
   */
  async markAsRead(id, user_id) {
    const [result] = await db.execute(
      `UPDATE notifications SET is_read = 1
       WHERE id = ? AND user_id = ?`,
      [id, user_id]
    );
    return result.affectedRows > 0;
  },

  /**
   * Marque TOUTES les notifications d'un user comme lues (bonus UX)
   */
  async markAllAsRead(user_id) {
    await db.execute(
      `UPDATE notifications SET is_read = 1 WHERE user_id = ?`,
      [user_id]
    );
  }
};

module.exports = NotificationModel;