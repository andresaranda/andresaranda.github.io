const siteNav = document.querySelector('#site-nav');
const navToggle = document.querySelector('#nav-toggle');
const hamBtn = document.querySelector('.hamburger-btn');
const hero = document.querySelector('.hero');
const heroBg = document.querySelector('.hero-bg');
const heroLogo = document.querySelector('.hero-logo');
const heroSlogan = document.querySelector('.hero-slogan');
const heroCtas = document.querySelector('.hero-ctas');
const featureImages = document.querySelectorAll('.feature-media img');
const faders = document.querySelectorAll('.fade-in');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const updateFeatureParallax = () => {
    if (reduceMotion) return;

    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    featureImages.forEach((img) => {
        const media = img.closest('.feature-media');
        if (!media) return;

        const rect = media.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > viewportHeight) return;

        // 0 when entering from bottom, 1 when exiting at top
        const progress = clamp(
            (viewportHeight - rect.top) / (viewportHeight + rect.height),
            0,
            1
        );
        // Strong vertical drift; horizontal kept to ~25% of that range
        const offsetY = -22 + progress * 28;
        const offsetX = -4.5 + progress * 6;
        img.style.transform = `translate3d(${offsetX}%, ${offsetY}%, 0)`;
    });
};

const updateHeroScroll = () => {
    const heroHeight = hero.offsetHeight || window.innerHeight;
    const scrollY = window.scrollY || window.pageYOffset;
    const progress = clamp(scrollY / (heroHeight * 0.55), 0, 1);

    siteNav.classList.toggle('is-compact', progress > 0.55);

    if (reduceMotion) {
        const hidden = progress > 0.55 ? '0' : '1';
        heroLogo.style.opacity = hidden;
        heroSlogan.style.opacity = hidden;
        heroCtas.style.opacity = hidden;
        return;
    }

    const contentFade = 1 - clamp((progress - 0.15) / 0.55, 0, 1);
    const logoScale = 1 - progress * 0.45;
    const logoShift = progress * -36;

    heroLogo.style.opacity = String(contentFade);
    heroLogo.style.transform = `translate3d(0, ${logoShift}px, 0) scale(${logoScale})`;
    heroSlogan.style.opacity = String(contentFade);
    heroSlogan.style.transform = `translate3d(0, ${progress * -18}px, 0)`;
    heroCtas.style.opacity = String(contentFade);
    heroCtas.style.transform = `translate3d(0, ${progress * -12}px, 0)`;
    heroBg.style.transform = `translate3d(0, ${scrollY * 0.28}px, 0)`;
};

const updateOnScroll = () => {
    updateHeroScroll();
    updateFeatureParallax();
};

let ticking = false;
window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
        updateOnScroll();
        ticking = false;
    });
}, { passive: true });

window.addEventListener('resize', updateOnScroll);
updateOnScroll();

hamBtn.addEventListener('click', () => {
    const isOpen = navToggle.classList.toggle('activated-ham-menu');
    hamBtn.setAttribute('aria-expanded', String(isOpen));
});

window.addEventListener('click', (event) => {
    if (
        !event.target.classList.contains('hamburger-btn') &&
        event.target.id !== 'nav-list' &&
        !event.target.closest('#nav-list') &&
        !event.target.closest('.hamburger-bars')
    ) {
        navToggle.classList.remove('activated-ham-menu');
        hamBtn.setAttribute('aria-expanded', 'false');
    }
});

document.querySelectorAll('#nav-list a').forEach((link) => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('activated-ham-menu');
        hamBtn.setAttribute('aria-expanded', 'false');
    });
});

const appearOptions = {
    root: null,
    threshold: 0.05,
    rootMargin: '0px 0px -80px 0px'
};

const appearOnScroll = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('appear');
            observer.unobserve(entry.target);
        }
    });
}, appearOptions);

faders.forEach((fader) => {
    if (fader.getBoundingClientRect().top < window.innerHeight * 0.85) {
        fader.classList.add('appear');
        return;
    }
    appearOnScroll.observe(fader);
});
