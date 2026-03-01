// services/notification.service.js
const NotificationModel = require('../models/notification.model');

/**
 * Mapping statut IA → contenu + niveau de la notification
 * Facilement extensible pour de nouveaux statuts
 */
const STATUS_CONFIG = {
  stable: {
    level:   'info',
    title:   '✅ Situation stable',
    message: 'L\'analyse IA indique une situation stable. Aucune action urgente requise.',
    color:   '#2196F3'   // bleu — informatif
  },
  aggravation: {
    level:   'warning',
    title:   '⚠️ Aggravation détectée',
    message: 'L\'IA a détecté une aggravation des signalements. Une surveillance renforcée est recommandée.',
    color:   '#FF9800'   // orange — vigilance
  },
  critique: {
    level:   'critical',
    title:   '🚨 Situation critique',
    message: 'Niveau critique atteint. Une intervention immédiate est nécessaire. Activez le protocole d\'urgence.',
    color:   '#F44336'   // rouge — urgence
  }
};

const NotificationService = {

  /**
   * Crée une notification à partir du statut renvoyé par l'IA
   * @param {string} status     - 'stable' | 'aggravation' | 'critique'
   * @param {number} user_id    - Destinataire (agent, admin, autorité)
   * @param {object} context    - Infos supplémentaires optionnelles (zone, maladie...)
   * @returns {object}          - Notification créée
   */
  async createFromAIStatus(status, user_id, context = {}) {
    const config = STATUS_CONFIG[status];

    if (!config) {
      throw new Error(`Statut IA inconnu : "${status}". Valeurs acceptées : stable | aggravation | critique`);
    }

    // Enrichissement du message si un contexte est fourni
    let message = config.message;
    if (context.zone)    message += ` Zone concernée : ${context.zone}.`;
    if (context.disease) message += ` Maladie : ${context.disease}.`;
    if (context.case_id) message += ` Réf. signalement #${context.case_id}.`;

    const notifId = await NotificationModel.create({
      user_id,
      title:   config.title,
      message,
      level:   config.level
    });

    return {
      id:         notifId,
      user_id,
      title:      config.title,
      message,
      level:      config.level,
      color:      config.color,
      is_read:    false,
      created_at: new Date()
    };
  },

  /**
   * Notifie plusieurs utilisateurs en même temps (ex: tous les admins)
   * @param {string} status
   * @param {number[]} userIds  - Tableau d'IDs
   * @param {object} context
   */
  async notifyMultiple(status, userIds, context = {}) {
    const results = await Promise.all(
      userIds.map(uid => this.createFromAIStatus(status, uid, context))
    );
    return results;
  }
};

module.exports = NotificationService;