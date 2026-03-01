activerNotifications();
let tousLesItems = [];
let filtreActif = 'toutes';

function iconeType(type) {
    if (type === 'alerte') {
        return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d0021b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
    }
    if (type === 'notif') {
        return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e67e22" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`;
    }
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00596a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
}

function rendreItemFil(item) {
    const div = document.createElement('div');
    div.className = 'fil-item';
    div.dataset.type = item.type || 'info';
    div.innerHTML = `
        <div class="fil-icone ${item.type || 'info'}">${iconeType(item.type)}</div>
        <div class="fil-contenu">
            <div class="fil-titre">${item.title || item.titre || 'Information sanitaire'}</div>
            <div class="fil-texte">${item.content || item.message || item.description || ''}</div>
            <div class="fil-meta">${item.commune ? item.commune + ' — ' : ''}${formaterDateHeure(item.createdAt)}</div>
        </div>
    `;
    return div;
}

function filtrerFil(type) {
    filtreActif = type;

    const filtres = ['toutes', 'alerte', 'notif', 'info'];
    filtres.forEach(f => {
        const btn = document.getElementById('filtre' + f.charAt(0).toUpperCase() + f.slice(1) + (f === 'toutes' ? 's' : f === 'alerte' ? 's' : f === 'notif' ? 's' : 's'));
        if (btn) btn.classList.remove('actif');
    });

    const btnActif = document.getElementById(
        type === 'toutes' ? 'filtreToutes' :
        type === 'alerte' ? 'filtreAlertes' :
        type === 'notif' ? 'filtreNotifs' : 'filtreInfos'
    );
    if (btnActif) btnActif.classList.add('actif');

    const zone = document.getElementById('zoneFil');
    if (!zone) return;

    const filtre = type === 'toutes' ? tousLesItems : tousLesItems.filter(i => i.type === type);

    if (filtre.length === 0) {
        zone.innerHTML = '<div class="vide-etat">Aucun element dans cette categorie.</div>';
        return;
    }

    zone.innerHTML = '';
    filtre.forEach(item => zone.appendChild(rendreItemFil(item)));
}

async function chargerFil() {
    const zone = document.getElementById('zoneFil');
    if (!zone) return;

    const utilisateur = getUser();
    const commune = utilisateur ? utilisateur.commune : null;

    try {
        const [alertes, notifs] = await Promise.all([
            apiGet('/alerts' + (commune ? '?commune=' + commune : '')).catch(() => ({ alerts: [] })),
            apiGet('/notifications/mine').catch(() => ({ notifications: [] }))
        ]);

        const itemsAlertes = (alertes.alerts || alertes || []).map(a => ({
            ...a,
            type: 'alerte',
            title: 'Alerte : ' + (a.disease || 'Maladie signalée'),
            content: a.description || 'Une alerte officielle a ete emise pour votre commune.'
        }));

        const itemsNotifs = (notifs.notifications || notifs || []).map(n => ({
            ...n,
            type: n.type || 'notif',
            title: n.title || n.titre || 'Notification',
            content: n.content || n.message || ''
        }));

        tousLesItems = [...itemsAlertes, ...itemsNotifs].sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        if (tousLesItems.length === 0) {
            zone.innerHTML = '<div class="vide-etat">Aucune actualite pour le moment.</div>';
            return;
        }

        filtrerFil('toutes');

        const sousTitre = document.getElementById('sousTitreFil');
        if (sousTitre && commune) {
            sousTitre.textContent = 'Alertes et informations pour ' + commune.charAt(0).toUpperCase() + commune.slice(1);
        }

    } catch (err) {
        zone.innerHTML = '<div class="vide-etat">Impossible de charger le fil. Verifiez votre connexion.</div>';
    }
}

if (document.getElementById('zoneFil')) {
    chargerFil();
}
