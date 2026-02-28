function afficherErreur(msg) {
    const el = document.getElementById('msgErreur');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('visible');
}

function masquerErreur() {
    const el = document.getElementById('msgErreur');
    if (!el) return;
    el.classList.remove('visible');
}

function afficherSucces(msg) {
    const el = document.getElementById('msgSucces');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('visible');
}

const btnVoirMdp = document.getElementById('btnVoirMdp');
if (btnVoirMdp) {
    btnVoirMdp.addEventListener('click', () => {
        const input = document.getElementById('mdp');
        input.type = input.type === 'password' ? 'text' : 'password';
    });
}

const btnVoirMdpConfirm = document.getElementById('btnVoirMdpConfirm');
if (btnVoirMdpConfirm) {
    btnVoirMdpConfirm.addEventListener('click', () => {
        const input = document.getElementById('mdpConfirm');
        input.type = input.type === 'password' ? 'text' : 'password';
    });
}

const formConnexion = document.getElementById('formConnexion');
if (formConnexion) {
    formConnexion.addEventListener('submit', async (e) => {
        e.preventDefault();
        masquerErreur();

        const email = document.getElementById('email').value.trim();
        const mdp = document.getElementById('mdp').value;
        const btn = document.getElementById('btnConnexion');

        if (!email || !mdp) {
            afficherErreur('Veuillez remplir tous les champs.');
            return;
        }

        btn.disabled = true;
        btn.textContent = 'Connexion en cours...';

        try {
            const data = await apiPost('/auth/login', { email, password: mdp });
            setToken(data.token);
            setUser(data.user);

            if (data.user.role === 'citoyen') {
                window.location.href = '../citizen/dashboard.html';
            } else if (data.user.role === 'centre') {
                window.location.href = '../center/dashboard.html';
            } else if (data.user.role === 'autorite') {
                window.location.href = '../authority/dashboard.html';
            } else {
                window.location.href = '../index.html';
            }
        } catch (err) {
            afficherErreur(err.message || 'Email ou mot de passe incorrect.');
            btn.disabled = false;
            btn.textContent = 'Se connecter';
        }
    });
}

const formInscription = document.getElementById('formInscription');
if (formInscription) {
    formInscription.addEventListener('submit', async (e) => {
        e.preventDefault();
        masquerErreur();

        const nomComplet = document.getElementById('nomComplet').value.trim();
        const email = document.getElementById('email').value.trim();
        const commune = document.getElementById('commune').value;
        const mdp = document.getElementById('mdp').value;
        const mdpConfirm = document.getElementById('mdpConfirm').value;
        const btn = document.getElementById('btnInscription');

        if (!nomComplet || !email || !commune || !mdp || !mdpConfirm) {
            afficherErreur('Veuillez remplir tous les champs obligatoires.');
            return;
        }

        if (mdp.length < 8) {
            afficherErreur('Le mot de passe doit contenir au moins 8 caracteres.');
            return;
        }

        if (mdp !== mdpConfirm) {
            afficherErreur('Les mots de passe ne correspondent pas.');
            return;
        }

        btn.disabled = true;
        btn.textContent = 'Creation en cours...';

        try {
            await apiPost('/auth/register', {
                name: nomComplet,
                email,
                commune,
                password: mdp,
                role: 'citoyen'
            });

            afficherSucces('Compte cree avec succes ! Vous allez etre redirige vers la connexion...');
            btn.textContent = 'Compte cree';

            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } catch (err) {
            afficherErreur(err.message || 'Une erreur est survenue. Verifiez vos informations.');
            btn.disabled = false;
            btn.textContent = 'Creer mon compte';
        }
    });
}
