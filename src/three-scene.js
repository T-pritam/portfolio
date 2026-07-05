import * as THREE from 'three';

// Interactive particle field rendered behind the hero. Particles drift on a
// noise-like wave, glow toward the accent color, and swirl away from the
// pointer. Heavy settings are cut down on touch devices; reduced-motion
// visitors get a static field.

const ACCENT = new THREE.Color('#c8f651');
const BASE = new THREE.Color('#3a4038');

const vertexShader = /* glsl */ `
    uniform float uTime;
    uniform float uScroll;
    uniform vec3 uMouse;
    uniform float uMouseStrength;
    uniform float uSize;

    attribute float aScale;
    attribute float aOffset;

    varying float vGlow;

    void main() {
        vec3 pos = position;

        // layered sine "noise" drift
        float t = uTime * 0.35 + aOffset * 6.2831;
        pos.y += sin(pos.x * 0.55 + t) * 0.45;
        pos.y += sin(pos.z * 0.42 + t * 1.4) * 0.35;
        pos.x += cos(pos.z * 0.35 + t * 0.8) * 0.3;

        // scroll parallax: field slides up + spreads as you scroll
        pos.y += uScroll * 4.0;
        pos.z += uScroll * 2.5;

        // pointer repulsion with a soft swirl
        vec3 toMouse = pos - uMouse;
        float dist = length(toMouse.xy);
        float radius = 3.2;
        float force = smoothstep(radius, 0.0, dist) * uMouseStrength;
        vec3 dir = normalize(vec3(toMouse.xy, 0.0) + 0.0001);
        vec3 swirl = vec3(-dir.y, dir.x, 0.0);
        pos += (dir * 1.1 + swirl * 0.55) * force;

        // mostly-dim field; a sparse subset twinkles toward the accent
        float sparkle = smoothstep(0.82, 1.0, fract(aOffset * 7.13 + uTime * 0.05));
        vGlow = clamp(force * 1.8 + sparkle * 0.8 + 0.06, 0.0, 1.0);

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        gl_PointSize = uSize * aScale * (18.0 / -mvPosition.z);
    }
`;

const fragmentShader = /* glsl */ `
    uniform vec3 uColorBase;
    uniform vec3 uColorAccent;

    varying float vGlow;

    void main() {
        // small crisp core with a faint halo
        float d = length(gl_PointCoord - 0.5);
        float core = smoothstep(0.18, 0.0, d);
        float halo = smoothstep(0.5, 0.1, d) * 0.25;
        float alpha = core + halo;
        if (alpha < 0.01) discard;

        vec3 color = mix(uColorBase, uColorAccent, vGlow);
        gl_FragColor = vec4(color, alpha * (0.3 + vGlow * 0.7));
    }
`;

export function initHeroScene() {
    const canvas = document.getElementById('webgl');
    if (!canvas) return;

    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: false,
            alpha: true,
            powerPreference: 'low-power',
        });
    } catch {
        // WebGL unavailable — the hero still works as plain markup.
        canvas.remove();
        return;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = window.matchMedia('(pointer: coarse)').matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 60);
    camera.position.set(0, 0, 11);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // --- particles -------------------------------------------------------
    const COUNT = isTouch ? 2200 : 6500;
    const positions = new Float32Array(COUNT * 3);
    const scales = new Float32Array(COUNT);
    const offsets = new Float32Array(COUNT);

    const SPREAD_X = 26;
    const SPREAD_Y = 15;
    const SPREAD_Z = 10;

    for (let i = 0; i < COUNT; i++) {
        positions[i * 3] = (Math.random() - 0.5) * SPREAD_X;
        positions[i * 3 + 1] = (Math.random() - 0.5) * SPREAD_Y;
        positions[i * 3 + 2] = (Math.random() - 0.5) * SPREAD_Z - 2;
        scales[i] = 0.4 + Math.random() * 1.1;
        offsets[i] = Math.random();
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
    geometry.setAttribute('aOffset', new THREE.BufferAttribute(offsets, 1));

    const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
            uTime: { value: 0 },
            uScroll: { value: 0 },
            uMouse: { value: new THREE.Vector3(999, 999, 0) },
            uMouseStrength: { value: isTouch ? 0.6 : 1 },
            uSize: { value: isTouch ? 11 : 9 },
            uColorBase: { value: BASE },
            uColorAccent: { value: ACCENT },
        },
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // --- sizing ----------------------------------------------------------
    const hero = canvas.parentElement;

    function resize() {
        const w = hero.clientWidth;
        const h = hero.clientHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener('resize', resize);

    // --- pointer tracking (projected onto the z=0 plane) ------------------
    const raycaster = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const ndc = new THREE.Vector2();
    const hit = new THREE.Vector3();
    const mouseTarget = new THREE.Vector3(999, 999, 0);

    function trackPointer(clientX, clientY) {
        const rect = canvas.getBoundingClientRect();
        ndc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        ndc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(ndc, camera);
        if (raycaster.ray.intersectPlane(plane, hit)) {
            mouseTarget.copy(hit);
        }
    }

    window.addEventListener('pointermove', (e) => trackPointer(e.clientX, e.clientY), { passive: true });
    window.addEventListener('touchmove', (e) => {
        if (e.touches[0]) trackPointer(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    // --- scroll link -------------------------------------------------------
    function updateScroll() {
        const heroHeight = hero.offsetHeight || 1;
        material.uniforms.uScroll.value = Math.min(window.scrollY / heroHeight, 1.5);
    }
    window.addEventListener('scroll', updateScroll, { passive: true });

    // --- render loop -------------------------------------------------------
    const clock = new THREE.Clock();
    let visible = true;
    let rafId = 0;

    const io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !rafId && !reducedMotion) loop();
    });
    io.observe(canvas);

    function render() {
        const mouse = material.uniforms.uMouse.value;
        mouse.lerp(mouseTarget, 0.08);
        material.uniforms.uTime.value = clock.getElapsedTime();
        points.rotation.y = Math.sin(clock.getElapsedTime() * 0.05) * 0.08;
        renderer.render(scene, camera);
    }

    function loop() {
        if (!visible) {
            rafId = 0;
            return;
        }
        render();
        rafId = requestAnimationFrame(loop);
    }

    if (reducedMotion) {
        // single static frame
        render();
    } else {
        loop();
    }
}
