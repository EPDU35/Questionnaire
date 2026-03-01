// assets/js/notifications.js

const API_BASE = 'http://localhost:3000/api'; // adapte selon ton .env

/**
 * Charge les notifications depuis l'API et met à jour l'interface
 */
async function loadNotifications() {
  try {
    const token = localStorage.getItem('token');

    const res  = await fetch(`${API_BASE}/notifications`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();

    if (!data.success) return;

    updateBadge(data.unread_count);
    renderNotifications(data.notifications);

  } catch (err) {
    console.error('Erreur chargement notifications', err);
  }
}

/**
 * Met à jour le badge 🔔 avec le compteur
 */
function updateBadge(count) {
  const badge = document.getElementById('notif-badge');
  if (count > 0) {
    badge.textContent = count > 99 ? '99+' : count;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}

/**
 * Génère le HTML de chaque notification
 */
function renderNotifications(notifications) {
  const list = document.getElementById('notif-list');

  if (!notifications.length) {
    list.innerHTML = '<p class="notif-empty">Aucune notification</p>';
    return;
  }

  list.innerHTML = notifications.map(n => `
    <div class="notif-item ${n.is_read ? '' : 'unread'}"
         style="border-left-color: ${n.color};"
         onclick="markAsRead(${n.id}, this)">
      <div class="notif-title">${n.title}</div>
      <div class="notif-message">${n.message}</div>
      <div class="notif-time">${formatDate(n.created_at)}</div>
    </div>
  `).join('');
}

/**
 * Marque une notification comme lue au clic
 */
async function markAsRead(id, element) {
  try {
    const token = localStorage.getItem('token');

    await fetch(`${API_BASE}/notifications/${id}/read`, {
      method:  'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    // Mise à jour visuelle immédiate, sans recharger
    element.classList.remove('unread');

    // Recalcule le badge
    const unread = document.querySelectorAll('.notif-item.unread').length;
    updateBadge(unread);

  } catch (err) {
    console.error('Erreur markAsRead', err);
  }
}

/**
 * Marque tout comme lu
 */
async function markAllRead() {
  try {
    const token = localStorage.getItem('token');

    await fetch(`${API_BASE}/notifications/read-all`, {
      method:  'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    document.querySelectorAll('.notif-item.unread')
            .forEach(el => el.classList.remove('unread'));
    updateBadge(0);

  } catch (err) {
    console.error('Erreur markAllRead', err);
  }
}

/**
 * Ouvre / ferme le panneau
 */
function toggleNotifPanel() {
  const panel = document.getElementById('notif-panel');
  const isOpen = panel.style.display !== 'none';
  panel.style.display = isOpen ? 'none' : 'block';
  if (!isOpen) loadNotifications(); // recharge à chaque ouverture
}

/**
 * Ferme le panneau si on clique ailleurs
 */
document.addEventListener('click', (e) => {
  const wrapper = document.querySelector('.notif-wrapper');
  if (wrapper && !wrapper.contains(e.target)) {
    document.getElementById('notif-panel').style.display = 'none';
  }
});

/**
 * Formate la date en "il y a X minutes / heures..."
 */
function formatDate(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)    return 'À l\'instant';
  if (diff < 3600)  return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
  return new Date(dateStr).toLocaleDateString('fr-FR');
}

// Charge au démarrage + rafraîchit toutes les 30 secondes (polling léger)
loadNotifications();
setInterval(loadNotifications, 30000);