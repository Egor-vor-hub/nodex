// Animated dotted wave surface — a real perspective-projected particle grid
// on plain Canvas 2D (no three.js). Ported from the reference site's own
// vanilla port of the DottedSurface effect, so the depth and speed match.
(function () {
  const canvas = document.getElementById("dottedSurface");
  const band = canvas ? canvas.closest(".wave-band") : null;
  if (!canvas || !band) return;
  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const AMOUNTX = 40;   // points across
  const AMOUNTY = 60;   // points in depth
  const SEP = 150;      // world-unit spacing between points
  const FOCAL = 1220;   // camera focal length
  const CAM_Y = 220;    // camera height above the grid

  let width, height, dpr, count = 0, rafId = null;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = band.offsetWidth;
    height = band.offsetHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    const cx = width / 2;
    const cy = height * 0.4;
    for (let ix = 0; ix < AMOUNTX; ix++) {
      for (let iy = 0; iy < AMOUNTY; iy++) {
        const wx = (ix - AMOUNTX / 2) * SEP;
        const wz = iy * SEP;
        const wy = Math.sin((ix + count) * 0.3) * 55 + Math.sin((iy + count) * 0.5) * 55;
        const depth = wz + 620;
        const scale = FOCAL / depth;
        const sx = cx + wx * scale;
        const sy = cy + (CAM_Y - wy) * scale;
        if (sx < -40 || sx > width + 40 || sy < -40 || sy > height + 40) continue;
        const size = Math.max(0.35, 2.4 * scale);
        const alpha = Math.min(0.5, 0.85 * scale);
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(214, 216, 224, ${alpha.toFixed(3)})`;
        ctx.fill();
      }
    }
    count += 0.09;
  }

  function loop() {
    rafId = requestAnimationFrame(loop);
    draw();
  }
  function start() { if (!rafId) { resize(); loop(); } }
  function stop() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } }

  window.addEventListener("resize", () => { if (rafId) resize(); });

  if (reduceMotion) {
    resize();
    draw();
  } else {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => (e.isIntersecting ? start() : stop())),
      { threshold: 0 }
    );
    io.observe(band);
  }
})();

// Header scroll state — the pill darkens slightly right away, then collapses
// down to just the logo and slides to the left once we're well past the hero.
const header = document.getElementById("header");
window.addEventListener("scroll", () => {
  header.classList.toggle("scrolled", window.scrollY > 20);
  header.classList.toggle("compact", window.scrollY > 260);
});

// Mobile nav toggle
const burger = document.getElementById("burger");
const nav = document.getElementById("nav");
burger.addEventListener("click", () => {
  nav.classList.toggle("open");
  burger.classList.toggle("open");
});
nav.querySelectorAll(".nav__link").forEach((link) => {
  link.addEventListener("click", () => nav.classList.remove("open"));
});

// Active nav link on scroll
const sections = document.querySelectorAll("main section[id]");
const navLinks = document.querySelectorAll(".nav__link");
window.addEventListener("scroll", () => {
  let current = "top";
  sections.forEach((section) => {
    const top = section.offsetTop - 140;
    if (window.scrollY >= top) current = section.id;
  });
  navLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
  });
});

// Case study tabs
const caseTabs = document.querySelectorAll(".case-tab");
const casePanels = document.querySelectorAll(".case-panel");
caseTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.case;
    caseTabs.forEach((t) => t.classList.toggle("active", t === tab));
    casePanels.forEach((panel) => panel.classList.toggle("active", panel.dataset.case === target));
  });
});

// Pricing cards — highlight follows whichever plan the visitor picks,
// instead of always sitting on the same "popular" card.
const priceCards = document.querySelectorAll(".price-card");
priceCards.forEach((card) => {
  card.addEventListener("click", () => {
    priceCards.forEach((c) => {
      c.classList.toggle("price-card--selected", c === card);
      const btn = c.querySelector(".btn");
      if (btn) btn.classList.toggle("btn--outline-accent", c === card);
    });
  });
});

// FAQ accordion
document.querySelectorAll(".faq__item").forEach((item) => {
  const question = item.querySelector(".faq__q");
  const answer = item.querySelector(".faq__a");
  question.addEventListener("click", () => {
    const isOpen = item.classList.contains("open");
    document.querySelectorAll(".faq__item.open").forEach((openItem) => {
      openItem.classList.remove("open");
      openItem.querySelector(".faq__a").style.maxHeight = null;
    });
    if (!isOpen) {
      item.classList.add("open");
      answer.style.maxHeight = answer.scrollHeight + "px";
    }
  });
});

// Scroll-reveal for section content
const revealTargets = document.querySelectorAll(
  ".section-head, .feature-card, .pain-card, .price-card, .timeline__step, .faq__item, .case-tabs, .result-card, .result-stat"
);
revealTargets.forEach((el, i) => {
  el.classList.add("reveal");
  el.style.transitionDelay = `${(i % 4) * 90}ms`;
});
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
);
revealTargets.forEach((el) => revealObserver.observe(el));

// Subtle mouse-parallax on the hero visual
const heroVisual = document.querySelector(".hero__bg");
const heroPhoto = document.querySelector(".hero__photo");
const isDesktopPointer = window.matchMedia("(min-width: 981px) and (hover: hover)").matches;
if (heroVisual && isDesktopPointer) {
  document.querySelector(".hero").addEventListener("mousemove", (e) => {
    const { innerWidth, innerHeight } = window;
    const x = (e.clientX / innerWidth - 0.5) * 14;
    const y = (e.clientY / innerHeight - 0.5) * 14;
    // Set via CSS variables (not .style.transform directly) — the entrance
    // animation holds its own "to" transform after finishing (fill-mode: both),
    // which would otherwise silently win over an inline transform every time.
    heroVisual.style.setProperty("--parallax-x", `${x}px`);
    heroVisual.style.setProperty("--parallax-y", `${y}px`);
  });
}

// Studio spotlight that follows the cursor across the page,
// and lights the hero photo up brighter the closer the cursor gets to it.
const cursorGlow = document.getElementById("cursorGlow");
if (cursorGlow && window.matchMedia("(hover: hover)").matches) {
  const root = document.documentElement;
  window.addEventListener("mousemove", (e) => {
    root.style.setProperty("--cursor-x", `${e.clientX}px`);
    root.style.setProperty("--cursor-y", `${e.clientY}px`);
    cursorGlow.classList.add("active");

    if (heroPhoto) {
      const rect = heroPhoto.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
      const proximity = Math.max(0, 1 - dist / 700);
      const glowSize = 50 + proximity * 40;
      const glowAlpha = 0.45 + proximity * 0.45;
      heroPhoto.style.filter = `drop-shadow(0 0 ${glowSize}px rgba(255,122,47,${glowAlpha})) drop-shadow(0 0 14px rgba(255,122,47,0.3))`;
    }
  });
  window.addEventListener("mouseleave", () => cursorGlow.classList.remove("active"));
}

// Contact form -> delivered straight to the studio inbox via FormSubmit
// (no backend needed), with a mailto fallback if the request ever fails,
// so a lead is never silently lost.
const CONTACT_EMAIL = "milikidze.geoi@gmail.com";
const form = document.getElementById("contact-form");
const successOverlay = document.getElementById("successOverlay");
const successClose = document.getElementById("successClose");
const submitBtn = form.querySelector('button[type="submit"]');
const submitBtnDefaultLabel = submitBtn.textContent;

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("cf-name").value.trim();
  const phone = document.getElementById("cf-phone").value.trim();
  const messenger = document.querySelector('input[name="messenger"]:checked').value;

  submitBtn.disabled = true;
  submitBtn.textContent = "Отправляем…";

  try {
    const response = await fetch(`https://formsubmit.co/ajax/${CONTACT_EMAIL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        Имя: name,
        "Телефон / почта": phone,
        "Удобный мессенджер": messenger,
        _subject: `Заявка на анализ бизнеса от ${name}`,
        _template: "table",
      }),
    });
    if (!response.ok) throw new Error("FormSubmit request failed");
  } catch (err) {
    // Fallback: open a pre-filled email so the lead isn't lost if the request fails
    const subject = `Заявка на анализ бизнеса от ${name}`;
    const body = [`Имя: ${name}`, `Телефон/почта: ${phone}`, `Удобный мессенджер: ${messenger}`].join("\n");
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  submitBtn.disabled = false;
  submitBtn.textContent = submitBtnDefaultLabel;
  form.reset();
  successOverlay.classList.add("active");
});

successClose.addEventListener("click", () => successOverlay.classList.remove("active"));
successOverlay.addEventListener("click", (e) => {
  if (e.target === successOverlay) successOverlay.classList.remove("active");
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") successOverlay.classList.remove("active");
});
