document.addEventListener('DOMContentLoaded', function () {
    var entete = document.querySelector('.entete');
    if (!entete) return;

    var hamburger = document.createElement('button');
    hamburger.className = 'nav-hamburger';
    hamburger.setAttribute('aria-label', 'Menu');
    hamburger.innerHTML = '<span></span><span></span><span></span>';
    entete.appendChild(hamburger);

    var navOrigine = document.querySelector('.nav-principale');
    if (!navOrigine) return;

    var navMobile = document.createElement('nav');
    navMobile.className = 'nav-mobile';
    navMobile.innerHTML = navOrigine.innerHTML;
    entete.insertAdjacentElement('afterend', navMobile);

    hamburger.addEventListener('click', function () {
        hamburger.classList.toggle('ouvert');
        navMobile.classList.toggle('visible');
    });

    navMobile.querySelectorAll('a').forEach(function (lien) {
        lien.addEventListener('click', function () {
            hamburger.classList.remove('ouvert');
            navMobile.classList.remove('visible');
        });
    });

    document.addEventListener('click', function (e) {
        if (!entete.contains(e.target) && !navMobile.contains(e.target)) {
            hamburger.classList.remove('ouvert');
            navMobile.classList.remove('visible');
        }
    });
});
