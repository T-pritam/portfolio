# T Pritam — Full Stack Developer Portfolio

A dark, highly animated single-page portfolio built with Vite, Three.js and GSAP.

## 🌐 Live

[https://portfolio.pritamrao.tech](https://portfolio.pritamrao.tech)

## 🛠 Tech Stack

- **Vite** — build tooling (vanilla JS, no framework)
- **Three.js** — interactive WebGL particle field in the hero (mouse + scroll reactive)
- **GSAP** (ScrollTrigger, SplitText) — preloader, text reveals, scroll animations, magnetic buttons
- **Lenis** — smooth scrolling
- **Space Grotesk + Inter** — self-hosted variable fonts via Fontsource
- **Brevo** — contact form email delivery

## ✨ Features

- Noir dark theme with an electric-lime accent
- Preloader with counter and slide-away reveal
- Three.js particle starfield hero, reduced on touch devices
- SplitText character reveal on the hero title, line-mask reveals on section titles
- Scroll-driven reveals, stat counters, and a drawn experience timeline
- Custom cursor + magnetic hover (fine-pointer devices only)
- Fullscreen animated mobile menu
- `prefers-reduced-motion` respected throughout
- Working contact form (Brevo) with confetti on success

## 📁 Structure

```
portfolio/
├── index.html            # Page markup
├── src/
│   ├── main.js           # Entry point + Brevo contact form
│   ├── style.css         # Design system + all styles
│   ├── three-scene.js    # WebGL particle field
│   ├── animations.js     # GSAP / Lenis / nav / menu
│   └── cursor.js         # Custom cursor
├── public/
│   ├── image.jpg         # Profile photo
│   └── CNAME             # Custom domain
└── .github/workflows/deploy.yml  # GitHub Pages deploy (master)
```

## 🚀 Development

```bash
npm install
npm run dev       # local dev server
npm run build     # production build to dist/
npm run preview   # preview the production build
```

The contact form needs `VITE_BREVO_API_KEY` (see `.env.example`); in CI it is
injected from the `VITE_BREVO_API_KEY` repository secret.

## 🎨 Customization

Design tokens live at the top of `src/style.css`:

```css
:root {
    --bg: #070707;        /* page background */
    --accent: #c8f651;    /* electric lime accent */
    --text: #f4f4f1;
    --muted: #8f8f89;
}
```

## 🤝 Contact

- **Email**: [pritamrao38@gmail.com](mailto:pritamrao38@gmail.com)
- **LinkedIn**: [linkedin.com/in/t-pritam](https://www.linkedin.com/in/t-pritam)
- **GitHub**: [github.com/T-pritam](https://github.com/T-pritam)
