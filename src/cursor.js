import gsap from 'gsap';

// Custom cursor — fine-pointer devices only. Touch devices keep native
// behaviour and never get the `has-cursor` class, so `cursor: none` never
// applies to them.

export function initCursor() {
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!finePointer || reducedMotion) return;

    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    if (!dot || !ring) return;

    document.documentElement.classList.add('has-cursor');

    const dotX = gsap.quickTo(dot, 'left', { duration: 0.08, ease: 'power2.out' });
    const dotY = gsap.quickTo(dot, 'top', { duration: 0.08, ease: 'power2.out' });
    const ringX = gsap.quickTo(ring, 'left', { duration: 0.35, ease: 'power3.out' });
    const ringY = gsap.quickTo(ring, 'top', { duration: 0.35, ease: 'power3.out' });

    window.addEventListener('pointermove', (e) => {
        dotX(e.clientX);
        dotY(e.clientY);
        ringX(e.clientX);
        ringY(e.clientY);
    }, { passive: true });

    const interactive = 'a, button, input, textarea, label, [data-magnetic]';
    document.addEventListener('pointerover', (e) => {
        if (e.target.closest(interactive)) ring.classList.add('is-hover');
    });
    document.addEventListener('pointerout', (e) => {
        if (e.target.closest(interactive)) ring.classList.remove('is-hover');
    });
}
