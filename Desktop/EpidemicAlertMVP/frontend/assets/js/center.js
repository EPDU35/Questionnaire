const utilisateurCentre = getUser();

if (utilisateurCentre) {
    const avatar = document.getElementById('sidebarAvatar');
    const nom = document.getElementById('sidebarNom');
    const nomCentre = document.getElementById('nomCentre');
    if (avatar) avatar.textContent = utilisateurCentre.name ? utilisateurCentre.name.charAt(0).toUpperCase() : 'C';
    if (nom) nom.textContent = utilisateurCentre.name || 'Centre';
    if (nomCentre) nomCentre.textContent = utilisateurCentre.name || 'Centre de sante';
}

const btnDeconnexion = document.getElementById('btnDeconnexion');
if (btnDeconnexion) {
    btnDeconnexion.addEventListener('click', (e) => {
        e.preventDefault();
        deconnexion();
    });
}

let casEnCoursDeMaj = null;

function afficherOnglet(nom) {
    document.getElementById('ongletEnAttente').style.display = nom === 'en-attente' ? 'block' : 'none';
    document.getElementById('ongletHistorique').style.display = nom === 'historique' ? 'block' : 'none';
    if (nom === 'historique') chargerHistorique();
}

function ouvrirModalStatut(casId, nomCitoyen) {
    casEnCoursDeMaj = casId;
    const modalCitoyen = document.getElementById('modalCitoyen');
    const modal = document.getElementById('modalStatut');
    const erreur = document.getElementById('modalErreur');
    if (modalCitoyen) modalCitoyen.value = nomCitoyen || '—';
    if (erreur) erreur.classList.remove('visible');
    if (modal) modal.style.display = 'flex';
}

function fermerModal() {
    const modal = document.getElementById('modalStatut');
    if (modal) modal.style.display = 'none';
    casEnCoursDeMaj = null;
}

const btnConfirmerStatut = document.getElementById('btnConfirmerStatut');
if (btnConfirmerStatut) {
    btnConfirmerStatut.addEventListener('click', async () => {
        if (!casEnCoursDeMaj) return;
        const nouveauStatut = document.getElementById('modalNouveauStatut').value;
        const note = document.getElementById('modalNote').value.trim();
        const erreur = document.getElementById('modalErreur');
        if (erreur) erreur.classList.remove('visible');

        btnConfirmerStatut.disabled = true;
        btnConfirmerStatut.textContent = 'Mise a jour...';

        try {
            await apiPatch('/cases/' + casEnCoursDeMaj + '/status', { status: nouveauStatut, note });
            fermerModal();
            chargerCasEnAttente();
            chargerHistorique();
            chargerStatsCenter();
        } catch (err) {
            if (erreur) { erreur.textContent = err.message || 'Erreur lors de la mise a jour.'; erreur.classList.add('visible'); }
        }

        btnConfirmerStatut.disabled = false;
        btnConfirmerStatut.textContent = 'Confirmer';
    });
}

function rendreCasEnAttente(cas) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${formaterDate(cas.createdAt)}</td>
        <td style="font-weight:600;">${cas.userName || cas.userId || '—'}</td>
        <td>${cas.commune || '—'}</td>
        <td>${cas.disease || 'Non precise'}</td>
        <td style="max-width:260px;color:#65676b;font-size:.83rem;">${(cas.description || '').substring(0, 100)}${cas.description && cas.description.length > 100 ? '...' : ''}</td>
        <td><span class="badge-statut ${classeStatut(cas.status)}">${labelStatut(cas.status)}</span></td>
        <td>
            <div class="actions-ligne">
                <button type="button" class="btn-action valider" onclick="validerCas('${cas._id}')">Valider</button>
                <button type="button" class="btn-action" onclick="ouvrirModalStatut('${cas._id}', '${(cas.userName || '').replace(/'/g, "\\'")}')">Statut</button>
                <button type="button" class="btn-action rejeter" onclick="rejeterCas('${cas._id}')">Rejeter</button>
            </div>
        </td>
    `;
    return row;
}

async function validerCas(casId) {
    try {
        await apiPatch('/cases/' + casId + '/status', { status: 'valide' });
        chargerCasEnAttente();
        chargerStatsCenter();
    } catch (err) {
        alert('Erreur : ' + (err.message || 'Impossible de valider ce cas.'));
    }
}

async function rejeterCas(casId) {
    if (!confirm('Confirmer le rejet de ce cas ?')) return;
    try {
        await apiPatch('/cases/' + casId + '/status', { status: 'rejete' });
        chargerCasEnAttente();
        chargerStatsCenter();
    } catch (err) {
        alert('Erreur : ' + (err.message || 'Impossible de rejeter ce cas.'));
    }
}

async function chargerCasEnAttente() {
    const zone = document.getElementById('listeCasEnAttente');
    if (!zone) return;

    zone.innerHTML = '<div class="texte-chargement">Chargement...</div>';

    try {
        const data = await apiGet('/cases?status=en_attente,signale');
        const cas = data.cases || data || [];

        if (cas.length === 0) {
            zone.innerHTML = '<div class="vide-etat">Aucun cas en attente de validation.</div>';
            return;
        }

        const table = document.createElement('table');
        table.className = 'tableau';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Citoyen</th>
                    <th>Commune</th>
                    <th>Maladie</th>
                    <th>Description</th>
                    <th>Statut</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="corpsCasEnAttente"></tbody>
        `;

        zone.innerHTML = '';
        zone.appendChild(table);

        const corps = document.getElementById('corpsCasEnAttente');
        cas.forEach(c => corps.appendChild(rendreCasEnAttente(c)));

    } catch (err) {
        zone.innerHTML = '<div class="vide-etat">Impossible de charger les cas.</div>';
    }
}

async function chargerHistorique() {
    const corps = document.getElementById('corpsHistorique');
    if (!corps) return;

    corps.innerHTML = '<tr><td colspan="6"><div class="vide-etat">Chargement...</div></td></tr>';

    try {
        const data = await apiGet('/cases?status=valide,rejete,pris_en_charge,clos');
        const cas = data.cases || data || [];

        if (cas.length === 0) {
            corps.innerHTML = '<tr><td colspan="6"><div class="vide-etat">Aucun historique disponible.</div></td></tr>';
            return;
        }

        corps.innerHTML = '';
        cas.forEach(c => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${formaterDate(c.updatedAt || c.createdAt)}</td>
                <td>${c.userName || '—'}</td>
                <td>${c.commune || '—'}</td>
                <td>${c.disease || 'Non precise'}</td>
                <td>${c.centerNote || '—'}</td>
                <td><span class="badge-statut ${classeStatut(c.status)}">${labelStatut(c.status)}</span></td>
            `;
            corps.appendChild(row);
        });

    } catch (err) {
        corps.innerHTML = '<tr><td colspan="6"><div class="vide-etat">Impossible de charger l\'historique.</div></td></tr>';
    }
}

async function chargerStatsCenter() {
    try {
        const data = await apiGet('/cases/stats');
        const s = data.stats || data;
        const nb = (statut) => s[statut] || 0;

        const nbEnAttente = document.getElementById('nbEnAttente');
        const nbValidesMois = document.getElementById('nbValidesMois');
        const nbPrisEnCharge = document.getElementById('nbPrisEnCharge');
        const nbClos = document.getElementById('nbClos');

        if (nbEnAttente) nbEnAttente.textContent = nb('en_attente') + nb('signale');
        if (nbValidesMois) nbValidesMois.textContent = nb('valide');
        if (nbPrisEnCharge) nbPrisEnCharge.textContent = nb('pris_en_charge');
        if (nbClos) nbClos.textContent = nb('clos');
    } catch (err) {}
}

function actualiserCas() {
    chargerCasEnAttente();
}

if (!utilisateurCentre) {
    window.location.href = '../auth/login.html';
} else {
    chargerCasEnAttente();
    chargerStatsCenter();
}
