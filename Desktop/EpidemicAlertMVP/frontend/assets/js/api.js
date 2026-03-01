const API_BASE = 'https://babi-alert.onrender.com/api';
const MOCK_MODE = false;  

const MOCK_DB = {
    users: [
        { id: 1, _id: '1', name: 'Amadou Diallo', email: 'citoyen@babi.ci', role: 'citoyen', commune: 'cocody', token: 'fake-token-citoyen' },
        { id: 2, _id: '2', name: 'Centre Cocody', email: 'centre@babi.ci', role: 'centre', token: 'fake-token-centre' },
        { id: 3, _id: '3', name: 'Ministere Sante', email: 'autorite@babi.ci', role: 'autorite', token: 'fake-token-autorite' }
    ],
    cases: [
        { _id: 'cas001', userId: '1', userName: 'Amadou Diallo', commune: 'cocody', disease: 'Paludisme', description: 'Fievre forte depuis 2 jours, maux de tete.', status: 'signale', source: 'citoyen', createdAt: '2026-02-20T10:00:00Z', updatedAt: '2026-02-20T10:00:00Z' },
        { _id: 'cas002', userId: '1', userName: 'Amadou Diallo', commune: 'cocody', disease: 'Typhoide', description: 'Douleurs abdominales, perte appetit.', status: 'pris_en_charge', source: 'citoyen', createdAt: '2026-02-15T08:00:00Z', updatedAt: '2026-02-16T09:00:00Z', centerNote: 'Patient pris en charge au CHU Cocody.' },
        { _id: 'cas003', userId: '4', userName: 'Fatoumata Kone', commune: 'abobo', disease: 'Cholera', description: 'Diarrhee aigue, vomissements.', status: 'en_attente', source: 'citoyen', createdAt: '2026-02-25T14:00:00Z', updatedAt: '2026-02-25T14:00:00Z' },
        { _id: 'cas004', userId: '5', userName: 'Konan Yao', commune: 'yopougon', disease: 'Paludisme', description: 'Frissons, sueurs nocturnes.', status: 'valide', source: 'centre', createdAt: '2026-02-22T11:00:00Z', updatedAt: '2026-02-23T10:00:00Z', centerNote: 'Confirme au laboratoire.' },
        { _id: 'cas005', userId: '6', userName: 'Ama Adjoua', commune: 'adjame', disease: 'Dengue', description: 'Fortes douleurs articulaires, eruption cutanee.', status: 'signale', source: 'citoyen', createdAt: '2026-02-27T09:30:00Z', updatedAt: '2026-02-27T09:30:00Z' }
    ],
    alerts: [
        { _id: 'alrt001', disease: 'Paludisme', commune: 'Cocody', level: 'moyen', description: 'Augmentation des cas de paludisme dans la commune de Cocody.', active: true, createdAt: '2026-02-21T08:00:00Z' },
        { _id: 'alrt002', disease: 'Cholera', commune: 'Abobo', level: 'eleve', description: 'Flambee de cholera detectee a Abobo. Consommez uniquement de l\'eau potable.', active: true, createdAt: '2026-02-25T15:00:00Z' },
        { _id: 'alrt003', disease: 'Dengue', commune: 'Adjame', level: 'moyen', description: 'Plusieurs cas de dengue signales a Adjame.', active: true, createdAt: '2026-02-27T10:00:00Z' }
    ],
    notifications: [
        { _id: 'notif001', title: 'Alerte Cocody', content: 'Risque paludisme eleve dans votre commune. Dormez sous moustiquaire.', type: 'notif', commune: 'cocody', createdAt: '2026-02-21T09:00:00Z' },
        { _id: 'notif002', title: 'Rappel prevention', content: 'Lavez-vous les mains regulierement. Buvez de l\'eau potable.', type: 'info', commune: null, createdAt: '2026-02-18T08:00:00Z' }
    ],
    statsMap: [
        { commune: 'Cocody',      niveau_risque: 'moyen', total_cas: 7,  cas_valides: 4, alertes_actives: 1 },
        { commune: 'Abobo',       niveau_risque: 'eleve', total_cas: 12, cas_valides: 8, alertes_actives: 2 },
        { commune: 'Yopougon',    niveau_risque: 'moyen', total_cas: 9,  cas_valides: 5, alertes_actives: 1 },
        { commune: 'Adjame',      niveau_risque: 'moyen', total_cas: 5,  cas_valides: 3, alertes_actives: 1 },
        { commune: 'Koumassi',    niveau_risque: 'faible', total_cas: 2, cas_valides: 1, alertes_actives: 0 },
        { commune: 'Marcory',     niveau_risque: 'faible', total_cas: 1, cas_valides: 0, alertes_actives: 0 },
        { commune: 'Treichville', niveau_risque: 'faible', total_cas: 2, cas_valides: 1, alertes_actives: 0 },
        { commune: 'Plateau',     niveau_risque: 'faible', total_cas: 1, cas_valides: 0, alertes_actives: 0 },
        { commune: 'Port-Bouet',  niveau_risque: 'faible', total_cas: 1, cas_valides: 0, alertes_actives: 0 },
        { commune: 'Bingerville', niveau_risque: 'faible', total_cas: 0, cas_valides: 0, alertes_actives: 0 },
        { commune: 'Attiecoube',  niveau_risque: 'faible', total_cas: 1, cas_valides: 0, alertes_actives: 0 },
        { commune: 'Anyama',      niveau_risque: 'faible', total_cas: 0, cas_valides: 0, alertes_actives: 0 },
        { commune: 'Songon',      niveau_risque: 'faible', total_cas: 0, cas_valides: 0, alertes_actives: 0 }
    ]
};

async function mockApi(endpoint, methode, corps) {
    await new Promise(r => setTimeout(r, 280));

    const base = endpoint.split('?')[0];
    const params = new URLSearchParams(endpoint.includes('?') ? endpoint.split('?')[1] : '');

    if (base === '/auth/login' && methode === 'POST') {
        const user = MOCK_DB.users.find(u => u.email === corps.email);
        if (user && corps.password === 'password123') {
            setToken(user.token);
            setUser(user);
            return { token: user.token, user };
        }
        throw new Error('Email ou mot de passe incorrect');
    }

    if (base === '/auth/register' && methode === 'POST') {
        const existe = MOCK_DB.users.find(u => u.email === corps.email);
        if (existe) throw new Error('Cet email est deja utilise');
        const newUser = { _id: String(Date.now()), id: Date.now(), name: corps.name, email: corps.email, commune: corps.commune, role: 'citoyen', token: 'fake-' + Date.now() };
        MOCK_DB.users.push(newUser);
        setToken(newUser.token);
        setUser(newUser);
        return { token: newUser.token, user: newUser };
    }

    if (base === '/cases/mine' && methode === 'GET') {
        const user = getUser();
        const uid = user ? String(user.id || user._id) : '1';
        return { cases: MOCK_DB.cases.filter(c => c.userId === uid) };
    }

    if (base === '/cases/stats' && methode === 'GET') {
        const counts = {};
        MOCK_DB.cases.forEach(c => { counts[c.status] = (counts[c.status] || 0) + 1; });
        return { stats: counts };
    }

    if (base === '/cases' && methode === 'GET') {
        let cas = [...MOCK_DB.cases];
        const statusParam = params.get('status');
        const communeParam = params.get('commune');
        if (statusParam) {
            const statuts = statusParam.split(',');
            cas = cas.filter(c => statuts.includes(c.status));
        }
        if (communeParam) {
            cas = cas.filter(c => c.commune.toLowerCase() === communeParam.toLowerCase());
        }
        return { cases: cas };
    }

    if (base === '/cases' && methode === 'POST') {
        const user = getUser();
        const newCase = {
            _id: 'cas' + Date.now(),
            userId: user ? String(user.id || user._id) : '0',
            userName: user ? user.name : 'Citoyen',
            commune: corps.commune,
            disease: corps.disease || null,
            description: corps.description,
            location: corps.location || null,
            status: 'signale',
            source: 'citoyen',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        MOCK_DB.cases.push(newCase);
        return { case: newCase };
    }

    if (base.startsWith('/cases/') && base.endsWith('/status') && methode === 'PATCH') {
        const id = base.split('/')[2];
        const cas = MOCK_DB.cases.find(c => c._id === id);
        if (!cas) throw new Error('Cas introuvable');
        if (corps.status) cas.status = corps.status;
        if (corps.note) cas.centerNote = corps.note;
        cas.updatedAt = new Date().toISOString();
        return { case: cas };
    }

    if (base === '/alerts/map' && methode === 'GET') {
        return { data: MOCK_DB.statsMap };
    }

    if (base === '/alerts' && methode === 'GET') {
        let alertes = [...MOCK_DB.alerts];
        const communeParam = params.get('commune');
        if (communeParam) {
            alertes = alertes.filter(a => !a.commune || a.commune.toLowerCase() === communeParam.toLowerCase());
        }
        const limitParam = parseInt(params.get('limit'));
        if (limitParam) alertes = alertes.slice(0, limitParam);
        return { alerts: alertes };
    }

    if (base === '/alerts' && methode === 'POST') {
        const newAlert = {
            _id: 'alrt' + Date.now(),
            disease: corps.disease,
            commune: corps.commune || null,
            level: corps.level || 'moyen',
            description: corps.description,
            active: true,
            createdAt: new Date().toISOString()
        };
        MOCK_DB.alerts.push(newAlert);
        return { alert: newAlert };
    }

    if (base.startsWith('/alerts/') && methode === 'PATCH') {
        const id = base.split('/')[2];
        const alerte = MOCK_DB.alerts.find(a => a._id === id);
        if (!alerte) throw new Error('Alerte introuvable');
        Object.assign(alerte, corps);
        return { alert: alerte };
    }

    if (base === '/stats/summary' && methode === 'GET') {
        const totalCases = MOCK_DB.cases.length;
        const activeAlerts = MOCK_DB.alerts.filter(a => a.active).length;
        const validatedCases = MOCK_DB.cases.filter(c => c.status === 'valide').length;
        const communesSet = new Set(MOCK_DB.cases.map(c => c.commune));
        const communes = MOCK_DB.statsMap.map(c => ({
            name: c.commune,
            commune: c.commune,
            casSignales: c.total_cas,
            casValides: c.cas_valides,
            alertesActives: c.alertes_actives,
            niveau: c.niveau_risque
        }));
        return { totalCases, activeAlerts, validatedCases, affectedCommunes: communesSet.size, communes };
    }

    if (base === '/notifications/mine' && methode === 'GET') {
        const user = getUser();
        const notifs = MOCK_DB.notifications.filter(n => !n.commune || (user && n.commune === (user.commune || '').toLowerCase()));
        return { notifications: notifs };
    }

    if (base === '/notifications' && methode === 'POST') {
        const newNotif = {
            _id: 'notif' + Date.now(),
            title: corps.title,
            content: corps.content,
            type: 'notif',
            commune: corps.commune || null,
            recipients: corps.recipients,
            createdAt: new Date().toISOString()
        };
        MOCK_DB.notifications.push(newNotif);
        return { notification: newNotif };
    }

    if (base === '/ia/message' && methode === 'POST') {
        const msg = (corps.message || '').toLowerCase();
        let type = 'information';
        let reponse = "Je suis l'assistant sanitaire Babi Alert. Decrivez vos symptomes ou posez une question de sante.";

        if (msg.includes('urgence') || msg.includes('grave') || msg.includes('respire pas')) {
            type = 'urgence';
            reponse = "Situation potentiellement urgente. Appelez le SAMU au 185 ou les Sapeurs-Pompiers au 180 immediatement.";
        } else if (msg.includes('diarrhee') || msg.includes('vomi') || msg.includes('cholera')) {
            type = 'alerte';
            reponse = "Ces symptomes peuvent indiquer un cholera ou une gastro-enterite severe. Hydratez-vous et consultez un medecin immediatement.";
        } else if (msg.includes('fievre') || msg.includes('tete') || msg.includes('paludisme')) {
            type = 'conseil';
            reponse = "La fievre et les maux de tete peuvent correspondre a un paludisme. Consultez le centre de sante de votre commune sans tarder.";
        } else if (msg.includes('yopougon')) {
            type = 'orientation';
            reponse = "Le centre de sante le plus proche de Yopougon est le CHU de Yopougon, Zone industrielle.";
        } else if (msg.includes('abobo')) {
            type = 'orientation';
            reponse = "Le centre de sante le plus proche d'Abobo est le CHU Abobo, Quartier SOGEFIA.";
        } else if (msg.includes('cocody')) {
            type = 'orientation';
            reponse = "Le centre de sante le plus proche de Cocody est le CHU de Cocody, Avenue Pierre et Marie Curie.";
        } else if (msg.includes('centre') || msg.includes('hopital') || msg.includes('ou aller')) {
            type = 'orientation';
            reponse = "Indiquez-moi votre commune et je vous oriente vers le centre de sante le plus proche.";
        } else if (msg.includes('prevention') || msg.includes('proteger') || msg.includes('moustique')) {
            type = 'prevention';
            reponse = "Pour vous proteger du paludisme : dormez sous moustiquaire impregnee, eliminez les eaux stagnantes autour de votre habitation.";
        } else if (msg.includes('signaler') || msg.includes('declarer')) {
            type = 'information';
            reponse = "Pour signaler un cas, accedez a la section Signaler un cas depuis l'accueil et remplissez le formulaire.";
        }

        return { succes: true, reponse: { type, message: reponse, extras: { symptomesDetectes: [], maladiesSuspectes: [], zone: null } } };
    }

    console.warn('Endpoint mock non defini :', methode, base);
    return { data: [] };
}

function getToken() {
    return localStorage.getItem('babi_token');
}

function setToken(token) {
    localStorage.setItem('babi_token', token);
}

function getUser() {
    const u = localStorage.getItem('babi_user');
    return u ? JSON.parse(u) : null;
}

function setUser(user) {
    localStorage.setItem('babi_user', JSON.stringify(user));
}

function deconnexion() {
    localStorage.removeItem('babi_token');
    localStorage.removeItem('babi_user');
    window.location.href = '/auth/login.html';
}

async function apiGet(endpoint) {
    if (MOCK_MODE) return mockApi(endpoint, 'GET', null);
    const rep = await fetch(API_BASE + endpoint, {
        headers: { 'Authorization': 'Bearer ' + getToken(), 'Content-Type': 'application/json' }
    });
    if (rep.status === 401) { deconnexion(); return null; }
    const data = await rep.json();
    if (!rep.ok) throw new Error(data.message || 'Erreur serveur');
    return data;
}

async function apiPost(endpoint, corps) {
    if (MOCK_MODE) return mockApi(endpoint, 'POST', corps);
    const rep = await fetch(API_BASE + endpoint, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + getToken(), 'Content-Type': 'application/json' },
        body: JSON.stringify(corps)
    });
    if (rep.status === 401) { deconnexion(); return null; }
    const data = await rep.json();
    if (!rep.ok) throw new Error(data.message || 'Erreur serveur');
    return data;
}

async function apiPatch(endpoint, corps) {
    if (MOCK_MODE) return mockApi(endpoint, 'PATCH', corps);
    const rep = await fetch(API_BASE + endpoint, {
        method: 'PATCH',
        headers: { 'Authorization': 'Bearer ' + getToken(), 'Content-Type': 'application/json' },
        body: JSON.stringify(corps)
    });
    if (rep.status === 401) { deconnexion(); return null; }
    const data = await rep.json();
    if (!rep.ok) throw new Error(data.message || 'Erreur serveur');
    return data;
}

function formaterDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formaterDateHeure(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) + ' a ' +
        d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function labelStatut(statut) {
    const map = {
        signale: 'Signale',
        en_attente: 'En attente',
        encadrement: 'Encadrement en cours',
        pris_en_charge: 'Pris en charge',
        valide: 'Valide',
        rejete: 'Rejete',
        clos: 'Clos'
    };
    return map[statut] || statut;
}

function classeStatut(statut) {
    const map = {
        signale: 'signale',
        en_attente: 'en-attente',
        encadrement: 'encadrement',
        pris_en_charge: 'pris-en-charge',
        valide: 'valide',
        rejete: 'rejete',
        clos: 'clos'
    };
    return map[statut] || '';
}


let derniereAlerteId = null;
let intervalleNotif = null;

async function demanderPermissionNotif() {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    const perm = await Notification.requestPermission();
    return perm === 'granted';
}

function envoyerNotifNavigateur(titre, corps) {
    if (Notification.permission !== 'granted') return;
    new Notification(titre, {
        body: corps,
        icon: '/assets/img/logo.svg'
    });
}

async function verifierNouvellesAlertes() {
    try {
        const data = await apiGet('/alerts?limit=1');
        const alertes = data?.alerts;
        if (!alertes || alertes.length === 0) return;
        const derniere = alertes[0];
        const id = derniere._id || derniere.id;
        if (derniereAlerteId === null) {
            derniereAlerteId = id;
            return;
        }
        if (id !== derniereAlerteId) {
            derniereAlerteId = id;
            const commune = derniere.commune ? ' - ' + derniere.commune : '';
            envoyerNotifNavigateur(
                'Nouvelle alerte : ' + derniere.disease + commune,
                derniere.description
            );
        }
    } catch (err) {
        console.error('Erreur verifierNouvellesAlertes :', err.message);
    }
}

async function activerNotifications() {
    const ok = await demanderPermissionNotif();
    if (!ok) return;
    if (intervalleNotif) clearInterval(intervalleNotif);
    await verifierNouvellesAlertes();
    intervalleNotif = setInterval(verifierNouvellesAlertes, 30000);
}

function desactiverNotifications() {
    if (intervalleNotif) {
        clearInterval(intervalleNotif);
        intervalleNotif = null;
    }
}