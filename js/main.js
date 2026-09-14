(() => {
    const header = document.getElementById('site-header');
    const nav = document.getElementById('nav-links');
    const toggle = document.getElementById('menu-toggle');
    const toggleIcon = toggle.querySelector('.ph');

    document.getElementById('footer-year').textContent = new Date().getFullYear();

    // Light / dark theme. Follows the OS until the visitor picks one, then remembers it.
    const root = document.documentElement;
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('.ph');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
    const themeColors = document.querySelectorAll('meta[name="theme-color"]');

    const currentTheme = () => root.dataset.theme || (systemDark.matches ? 'dark' : 'light');
    const syncThemeUI = () => {
        const dark = currentTheme() === 'dark';
        themeIcon.classList.toggle('ph-sun', dark);
        themeIcon.classList.toggle('ph-moon', !dark);
        themeToggle.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
        if (root.dataset.theme) {
            themeColors.forEach((meta) => meta.setAttribute('content', dark ? '#0d0f12' : '#f3f4f2'));
        }
    };

    themeToggle.addEventListener('click', () => {
        const next = currentTheme() === 'dark' ? 'light' : 'dark';
        root.dataset.theme = next;
        try { localStorage.setItem('theme', next); } catch (e) { /* storage unavailable */ }
        syncThemeUI();
    });
    systemDark.addEventListener('change', syncThemeUI);
    syncThemeUI();

    // Mobile menu
    const setMenu = (open) => {
        nav.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        toggleIcon.classList.toggle('ph-list', !open);
        toggleIcon.classList.toggle('ph-x', open);
    };
    toggle.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && nav.classList.contains('is-open')) {
            setMenu(false);
            toggle.focus();
        }
    });

    if (!('IntersectionObserver' in window)) {
        document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
        return;
    }

    // Header border once the page has moved past the top
    const sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:8px;pointer-events:none;';
    document.body.prepend(sentinel);
    new IntersectionObserver(([entry]) => {
        header.classList.toggle('is-scrolled', !entry.isIntersecting);
    }).observe(sentinel);

    // Reveal sections as they enter the viewport
    const revealer = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach((el) => revealer.observe(el));

    // Highlight the nav link for the section in view
    const links = new Map(
        [...nav.querySelectorAll('a[href^="#"]')].map((a) => [a.getAttribute('href').slice(1), a])
    );
    const spy = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            links.forEach((a) => a.removeAttribute('aria-current'));
            links.get(entry.target.id)?.setAttribute('aria-current', 'true');
        });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach((_, id) => {
        const section = document.getElementById(id);
        if (section) spy.observe(section);
    });
})();
