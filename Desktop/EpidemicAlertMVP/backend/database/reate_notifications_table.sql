-- migrations/create_notifications_table.sql

CREATE TABLE IF NOT EXISTS notifications (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,                          -- destinataire (admin, agent, autorité)
  title       VARCHAR(255) NOT NULL,
  message     TEXT NOT NULL,
  level       ENUM('info', 'warning', 'critical') NOT NULL DEFAULT 'info',
  is_read     TINYINT(1) NOT NULL DEFAULT 0,                 -- false par défaut
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_user_unread (user_id, is_read),                  -- accélère la requête "non lues"
  INDEX idx_created (created_at),

  CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;