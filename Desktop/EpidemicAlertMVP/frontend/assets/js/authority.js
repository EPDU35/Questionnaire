activerNotifications();
// Vérification au tout début
if (!getToken()) {
    window.location.href = '/auth/login.html';
}
const utilisateurAutorite = getUser();

if (utilisateurAutorite) {
    const avatar = document.getElementById('sidebarAvatar');
    const nom = document.getElementById('sidebarNom');
    if (avatar) avatar.textContent = utilisateurAutorite.name ? utilisateurAutorite.name.charAt(0).toUpperCase() : 'A';
    if (nom) nom.textContent = utilisateurAutorite.name || 'Autorite';
}

function afficherSection(nom) {
    const sections = ['apercu', 'alertes', 'cas', 'notifications'];
    sections.forEach(s => {
        const el = document.getElementById('section' + s.charAt(0).toUpperCase() + s.slice(1));
        if (el) el.style.display = s === nom ? 'block' : 'none';
    });

    if (nom === 'alertes') chargerAlertes();
    if (nom === 'cas') chargerTousCas();
    if (nom === 'apercu') chargerApercu();
}

function ouvrirModalAlerte() {
    const modal = document.getElementById('modalAlerte');
    const erreur = document.getElementById('alerteErreur');
    if (erreur) erreur.classList.remove('visible');
    if (modal) modal.style.display = 'flex';
}

function fermerModalAlerte() {
    const modal = document.getElementById('modalAlerte');
    if (modal) modal.style.display = 'none';
}

const btnPublierAlerte = document.getElementById('btnPublierAlerte');
if (btnPublierAlerte) {
    btnPublierAlerte.addEventListener('click', async () => {
        const maladie = document.getElementById('alerteMaladie').value;
        const commune = document.getElementById('alerteCommune').value;
        const niveau = document.getElementById('alerteNiveau').value;
        const description = document.getElementById('alerteDescription').value.trim();
        const erreur = document.getElementById('alerteErreur');

        if (erreur) erreur.classList.remove('visible');

        if (!maladie || !description) {
            if (erreur) { erreur.textContent = 'Veuillez remplir la maladie et la description.'; erreur.classList.add('visible'); }
            return;
        }

        btnPublierAlerte.disabled = true;
        btnPublierAlerte.textContent = 'Publication...';

        try {
            await apiPost('/alerts', { disease: maladie, commune: commune || null, level: niveau, description });
            fermerModalAlerte();
            chargerApercu();
            chargerAlertes();
        } catch (err) {
            if (erreur) { erreur.textContent = err.message || 'Erreur lors de la publication.'; erreur.classList.add('visible'); }
        }

        btnPublierAlerte.disabled = false;
        btnPublierAlerte.textContent = 'Publier l\'alerte';
    });
}

async function chargerApercu() {
    try {
        const data = await apiGet('/stats/summary');

        const statCasTotal = document.getElementById('statCasTotal');
        const statAlertesActives = document.getElementById('statAlertesActives');
        const statCommunesAffectees = document.getElementById('statCommunesAffectees');
        const statCasValides = document.getElementById('statCasValides');

        if (statCasTotal && data.totalCases !== undefined) statCasTotal.textContent = data.totalCases;
        if (statAlertesActives && data.activeAlerts !== undefined) statAlertesActives.textContent = data.activeAlerts;
        if (statCommunesAffectees && data.affectedCommunes !== undefined) statCommunesAffectees.textContent = data.affectedCommunes;
        if (statCasValides && data.validatedCases !== undefined) statCasValides.textContent = data.validatedCases;

        chargerTableauCommunes(data.communes || []);

    } catch (err) {
        const corps = document.getElementById('corpsTableauCommunes');
        if (corps) corps.innerHTML = '<tr><td colspan="5"><div class="vide-etat">Impossible de charger les statistiques.</div></td></tr>';
    }
}

function chargerTableauCommunes(communes) {
    const corps = document.getElementById('corpsTableauCommunes');
    if (!corps) return;

    const listDefaut = ['Abobo', 'Adjame', 'Anyama', 'Attiecoube', 'Cocody', 'Koumassi', 'Marcory', 'Plateau', 'Port-Bouet', 'Treichville', 'Yopougon', 'Bingerville', 'Songon'];

    const donnees = communes.length > 0 ? communes : listDefaut.map(c => ({
        name: c,
        casSignales: 0,
        casValides: 0,
        alertesActives: 0,
        niveau: 'faible'
    }));

    corps.innerHTML = '';
    donnees.forEach(c => {
        const row = document.createElement('tr');
        const niveau = c.niveau || 'faible';
        row.innerHTML = `
            <td style="font-weight:600;">${c.name || c.commune || '—'}</td>
            <td>${c.casSignales !== undefined ? c.casSignales : '—'}</td>
            <td>${c.casValides !== undefined ? c.casValides : '—'}</td>
            <td>${c.alertesActives !== undefined ? c.alertesActives : '—'}</td>
            <td><span class="badge-risque ${niveau}">${niveau === 'eleve' ? 'Eleve' : niveau === 'moyen' ? 'Moyen' : 'Faible'}</span></td>
        `;
        corps.appendChild(row);
    });
}

async function chargerAlertes() {
    const corps = document.getElementById('corpsTableauAlertes');
    if (!corps) return;

    corps.innerHTML = '<tr><td colspan="6"><div class="vide-etat">Chargement...</div></td></tr>';

    try {
        const data = await apiGet('/alerts');
        const alertes = data.alerts || data || [];

        if (alertes.length === 0) {
            corps.innerHTML = '<tr><td colspan="6"><div class="vide-etat">Aucune alerte.</div></td></tr>';
            return;
        }

        corps.innerHTML = '';
        alertes.forEach(a => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${formaterDate(a.createdAt)}</td>
                <td style="font-weight:600;">${a.disease || '—'}</td>
                <td>${a.commune || 'Toutes'}</td>
                <td><span class="badge-risque ${a.level || 'moyen'}">${a.level === 'eleve' ? 'Eleve' : a.level === 'faible' ? 'Faible' : 'Moyen'}</span></td>
                <td><span class="badge-statut ${a.active ? 'valide' : 'clos'}">${a.active ? 'Active' : 'Close'}</span></td>
                <td>
                    <button type="button" class="btn-action rejeter" onclick="cloturerAlerte('${a._id}')">Cloturer</button>
                </td>
            `;
            corps.appendChild(row);
        });
    } catch (err) {
        corps.innerHTML = '<tr><td colspan="6"><div class="vide-etat">Impossible de charger les alertes.</div></td></tr>';
    }
}

async function cloturerAlerte(alerteId) {
    if (!confirm('Confirmer la cloture de cette alerte ?')) return;
    try {
        await apiPatch('/alerts/' + alerteId, { active: false });
        chargerAlertes();
        chargerApercu();
    } catch (err) {
        alert('Erreur : ' + (err.message || 'Impossible de cloturer cette alerte.'));
    }
}

async function chargerTousCas() {
    const corps = document.getElementById('corpsTableauCas');
    if (!corps) return;

    corps.innerHTML = '<tr><td colspan="6"><div class="vide-etat">Chargement...</div></td></tr>';

    const commune = document.getElementById('filtreCommuneCas') ? document.getElementById('filtreCommuneCas').value : '';
    const statut = document.getElementById('filtreStatutCas') ? document.getElementById('filtreStatutCas').value : '';

    let url = '/cases?';
    if (commune) url += 'commune=' + commune + '&';
    if (statut) url += 'status=' + statut + '&';

    try {
        const data = await apiGet(url);
        const cas = data.cases || data || [];

        if (cas.length === 0) {
            corps.innerHTML = '<tr><td colspan="6"><div class="vide-etat">Aucun cas trouve.</div></td></tr>';
            return;
        }

        corps.innerHTML = '';
        cas.forEach(c => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${formaterDate(c.createdAt)}</td>
                <td>${c.userName || '—'}</td>
                <td>${c.commune || '—'}</td>
                <td>${c.disease || 'Non precise'}</td>
                <td><span class="badge-statut ${classeStatut(c.status)}">${labelStatut(c.status)}</span></td>
                <td style="font-size:.8rem;color:#aaa;">${c.source === 'centre' ? 'Centre de sante' : 'Citoyen'}</td>
            `;
            corps.appendChild(row);
        });

    } catch (err) {
        corps.innerHTML = '<tr><td colspan="6"><div class="vide-etat">Impossible de charger les cas.</div></td></tr>';
    }
}

function filtrerCas() {
    chargerTousCas();
}

function actualiserStats() {
    chargerApercu();
}

const formNotification = document.getElementById('formNotification');
if (formNotification) {
    formNotification.addEventListener('submit', async (e) => {
        e.preventDefault();
        const destinataires = document.getElementById('destinataires').value;
        const commune = document.getElementById('communeNotif').value;
        const titre = document.getElementById('titreNotif').value.trim();
        const contenu = document.getElementById('contenuNotif').value.trim();
        const erreur = document.getElementById('notifErreur');
        const succes = document.getElementById('notifSucces');

        if (erreur) erreur.classList.remove('visible');
        if (succes) succes.classList.remove('visible');

        if (!titre || !contenu) {
            if (erreur) { erreur.textContent = 'Veuillez remplir le titre et le contenu.'; erreur.classList.add('visible'); }
            return;
        }

        const btn = formNotification.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.textContent = 'Envoi en cours...';

        try {
            await apiPost('/notifications', {
                recipients: destinataires,
                commune: commune || null,
                title: titre,
                content: contenu
            });

            if (succes) { succes.textContent = 'Notification envoyee avec succes.'; succes.classList.add('visible'); }
            document.getElementById('titreNotif').value = '';
            document.getElementById('contenuNotif').value = '';
        } catch (err) {
            if (erreur) { erreur.textContent = err.message || 'Erreur lors de l\'envoi.'; erreur.classList.add('visible'); }
        }

        btn.disabled = false;
        btn.textContent = 'Envoyer la notification';
    });
}

if (!utilisateurAutorite) {
    window.location.href = '../auth/login.html';
} else {
    chargerApercu();
}
