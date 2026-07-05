import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;
const NAV_OFFSET = -72;

let lenis = null;

/* ------------------------------------------------------------------ */
/* Smooth scroll                                                        */
/* ------------------------------------------------------------------ */
function initSmoothScroll() {
    if (reducedMotion) return;

    lenis = new Lenis({
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
}

function scrollToTarget(target) {
    if (lenis) {
        // force: also scroll while lenis is stopped (mobile menu open)
        lenis.scrollTo(target, { offset: NAV_OFFSET, force: true });
    } else {
        const el = typeof target === 'string' ? document.querySelector(target) : target;
        el?.scrollIntoView({ behavior: 'smooth' });
    }
}

function initAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', (e) => {
            const id = link.getAttribute('href');
            if (id.length < 2) return;
            const target = document.querySelector(id);
            if (!target) return;
            e.preventDefault();
            scrollToTarget(target);
        });
    });

    document.getElementById('backTop')?.addEventListener('click', () => scrollToTarget(document.body));
}

/* ------------------------------------------------------------------ */
/* Preloader + hero intro                                               */
/* ------------------------------------------------------------------ */
function initIntro() {
    const preloader = document.getElementById('preloader');
    const heroTitle = document.getElementById('heroTitle');
    const heroFades = gsap.utils.toArray('[data-hero-fade]');

    if (reducedMotion) {
        preloader?.remove();
        return;
    }

    let titleChars = null;
    try {
        titleChars = new SplitText(heroTitle, { type: 'chars', charsClass: 'char' }).chars;
    } catch {
        titleChars = null;
    }

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (preloader) {
        const counter = { value: 0 };
        const countEl = document.getElementById('preloaderCount');
        const barEl = document.getElementById('preloaderBar');

        tl.to(counter, {
            value: 100,
            duration: 1.4,
            ease: 'power2.inOut',
            onUpdate() {
                if (countEl) countEl.textContent = Math.round(counter.value);
                if (barEl) barEl.style.width = `${counter.value}%`;
            },
        })
            .to(preloader.querySelector('.preloader-inner'), { yPercent: -40, opacity: 0, duration: 0.45 }, '+=0.1')
            .to(preloader, {
                yPercent: -100,
                duration: 0.8,
                ease: 'power4.inOut',
                onComplete() {
                    preloader.remove();
                    ScrollTrigger.refresh();
                },
            }, '-=0.15');
    }

    if (titleChars && titleChars.length) {
        tl.from(titleChars, {
            yPercent: 120,
            rotate: 6,
            opacity: 0,
            duration: 0.9,
            ease: 'power4.out',
            stagger: 0.035,
        }, preloader ? '-=0.35' : 0);
    } else if (heroTitle) {
        tl.from(heroTitle, { y: 60, opacity: 0, duration: 0.9 }, preloader ? '-=0.35' : 0);
    }

    if (heroFades.length) {
        tl.from(heroFades, {
            y: 28,
            opacity: 0,
            duration: 0.7,
            stagger: 0.09,
        }, '-=0.55');
    }
}

/* ------------------------------------------------------------------ */
/* Scroll-driven reveals                                                */
/* ------------------------------------------------------------------ */
function initScrollReveals() {
    if (reducedMotion) return;

    // Section titles: line mask reveal
    gsap.utils.toArray('[data-split]').forEach((title) => {
        let lines;
        try {
            lines = new SplitText(title, { type: 'lines', mask: 'lines' }).lines;
        } catch {
            lines = [title];
        }
        gsap.from(lines, {
            yPercent: 110,
            duration: 0.9,
            ease: 'power4.out',
            stagger: 0.08,
            scrollTrigger: { trigger: title, start: 'top 88%', once: true },
        });
    });

    // Generic fade-up reveals
    gsap.utils.toArray('[data-reveal]').forEach((el) => {
        gsap.from(el, {
            y: 44,
            opacity: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        });
    });

    // About photo: clip reveal + slow parallax
    const photo = document.querySelector('[data-reveal-img]');
    if (photo) {
        const frame = photo.querySelector('.about-photo-frame');
        const img = photo.querySelector('img');
        gsap.from(frame, {
            clipPath: 'inset(0 0 100% 0)',
            duration: 1.2,
            ease: 'power4.inOut',
            scrollTrigger: { trigger: photo, start: 'top 85%', once: true },
        });
        gsap.fromTo(img, { yPercent: -8, scale: 1.12 }, {
            yPercent: 8,
            scale: 1.12,
            ease: 'none',
            scrollTrigger: { trigger: photo, start: 'top bottom', end: 'bottom top', scrub: true },
        });
    }

    // Stat counters
    gsap.utils.toArray('[data-count]').forEach((el) => {
        const end = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const decimals = String(el.dataset.count).includes('.') ? 1 : 0;
        const counter = { value: 0 };
        gsap.to(counter, {
            value: end,
            duration: 1.6,
            ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 92%', once: true },
            onUpdate() {
                el.textContent = counter.value.toFixed(decimals) + suffix;
            },
        });
    });

    // Experience timeline line draw
    const timelineLine = document.getElementById('timelineLine');
    if (timelineLine) {
        gsap.to(timelineLine, {
            '--draw': 1,
            ease: 'none',
            scrollTrigger: {
                trigger: '.timeline',
                start: 'top 80%',
                end: 'bottom 55%',
                scrub: 0.6,
            },
        });
    }

    // Scroll progress bar
    const progress = document.getElementById('scrollProgress');
    if (progress) {
        gsap.to(progress, {
            scaleX: 1,
            ease: 'none',
            scrollTrigger: { start: 0, end: 'max', scrub: 0.3 },
        });
    }
}

/* ------------------------------------------------------------------ */
/* Nav behaviour                                                        */
/* ------------------------------------------------------------------ */
function initNav() {
    const nav = document.getElementById('siteNav');

    if (nav && !reducedMotion) {
        ScrollTrigger.create({
            start: 'top top-=120',
            end: 'max',
            onUpdate(self) {
                nav.classList.toggle('is-hidden', self.direction === 1);
            },
            onLeaveBack() {
                nav.classList.remove('is-hidden');
            },
        });
    }

    // Active link highlighting
    const links = document.querySelectorAll('.nav-link');
    document.querySelectorAll('section[id]').forEach((section) => {
        ScrollTrigger.create({
            trigger: section,
            start: 'top 45%',
            end: 'bottom 45%',
            onToggle(self) {
                if (!self.isActive) return;
                links.forEach((l) => l.classList.toggle('is-active', l.dataset.section === section.id));
            },
        });
    });

    // Clock (IST)
    const clock = document.getElementById('navClock');
    if (clock) {
        const tick = () => {
            clock.textContent = 'HYD ' + new Intl.DateTimeFormat('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
                timeZone: 'Asia/Kolkata',
            }).format(new Date());
        };
        tick();
        setInterval(tick, 30000);
    }
}

/* ------------------------------------------------------------------ */
/* Mobile menu                                                          */
/* ------------------------------------------------------------------ */
function initMobileMenu() {
    const btn = document.getElementById('menuBtn');
    const menu = document.getElementById('mobileMenu');
    if (!btn || !menu) return;

    const items = menu.querySelectorAll('.mobile-link, .mobile-menu-footer');
    let open = false;

    const tl = gsap.timeline({ paused: true })
        .set(menu, { visibility: 'visible' })
        .to(menu, { clipPath: 'inset(0 0 0% 0)', duration: reducedMotion ? 0 : 0.6, ease: 'power4.inOut' })
        .from(items, {
            y: 40,
            opacity: 0,
            duration: reducedMotion ? 0 : 0.5,
            stagger: reducedMotion ? 0 : 0.06,
            ease: 'power3.out',
        }, '-=0.25');

    function setOpen(next) {
        open = next;
        btn.classList.toggle('is-open', open);
        btn.setAttribute('aria-expanded', String(open));
        btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        menu.setAttribute('aria-hidden', String(!open));
        if (open) {
            tl.play();
            lenis?.stop();
        } else {
            tl.reverse();
            lenis?.start();
        }
    }

    btn.addEventListener('click', () => setOpen(!open));
    menu.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', () => setOpen(false));
    });
}

/* ------------------------------------------------------------------ */
/* Magnetic hover                                                       */
/* ------------------------------------------------------------------ */
function initMagnetic() {
    if (!finePointer || reducedMotion) return;

    document.querySelectorAll('[data-magnetic]').forEach((el) => {
        const strength = 0.35;
        const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' });
        const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' });

        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            xTo((e.clientX - rect.left - rect.width / 2) * strength);
            yTo((e.clientY - rect.top - rect.height / 2) * strength);
        });
        el.addEventListener('mouseleave', () => {
            xTo(0);
            yTo(0);
        });
    });
}

/* ------------------------------------------------------------------ */
export function initAnimations() {
    initSmoothScroll();
    // The menu-close listener must run before the anchor scroll: lenis.start()
    // resets any in-flight scrollTo animation.
    initMobileMenu();
    initAnchors();
    initIntro();
    initScrollReveals();
    initNav();
    initMagnetic();

    // Recalculate trigger positions once fonts/images settle
    window.addEventListener('load', () => ScrollTrigger.refresh());
}
