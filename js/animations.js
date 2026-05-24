const MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function prefersReducedMotion() {
  return window.matchMedia(MOTION_QUERY).matches;
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function isInternalPageLink(link) {
  if (!link?.href || link.target === "_blank" || link.hasAttribute("download")) {
    return false;
  }

  try {
    const href = link.href || "";
    const currentPath = window.location.href;
    
    // Handle file:// protocol and relative URLs
    if (currentPath.startsWith("file://")) {
      // For file protocol, check if href is relative or same-origin
      if (href.startsWith("http") || href.startsWith("https")) return false;
      if (href.startsWith("#")) return false;
      // Allow relative URLs and same-directory URLs
      return /\.html$/i.test(href) || href.includes(".html");
    }
    
    // Standard handling for http/https
    const url = new URL(href, currentPath);
    if (url.origin !== new URL(currentPath).origin) return false;
    return /\.html$/i.test(url.pathname) || url.pathname.endsWith("/");
  } catch {
    return false;
  }
}

function initPageTransitions() {
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (!link || !isInternalPageLink(link)) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    event.preventDefault();
    const href = link.href;

    if (prefersReducedMotion()) {
      window.location.href = href;
      return;
    }

    document.body.classList.add("is-leaving");
    window.setTimeout(() => {
      window.location.href = href;
    }, 380);
  });
}

function initPageEnter() {
  const reveal = () => {
    document.body.classList.remove("is-leaving");
    document.body.classList.add("is-ready");
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", reveal, { once: true });
  } else {
    requestAnimationFrame(reveal);
  }

  window.addEventListener("pageshow", (event) => {
    if (event.persisted) reveal();
  });
}

let revealObserver;

function observeReveals(root = document) {
  if (prefersReducedMotion()) {
    root.querySelectorAll(".reveal:not(.is-visible)").forEach((el) => {
      el.classList.add("is-visible");
    });
    return;
  }

  if (!revealObserver) {
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
  }

  root.querySelectorAll(".reveal:not(.is-visible)").forEach((el) => {
    revealObserver.observe(el);
  });
}

function initScrollReveal() {
  observeReveals();
}

function staggerChildren(container, selector = ":scope > *") {
  if (!container || prefersReducedMotion()) return;

  const items = container.querySelectorAll(selector);
  items.forEach((item, index) => {
    item.style.setProperty("--stagger", `${index * 0.06}s`);
    item.classList.remove("is-animated");
    void item.offsetWidth;
    item.classList.add("is-animated");
  });
}

function animateProductGrid(container) {
  if (!container) return;
  container.classList.remove("is-visible");
  void container.offsetWidth;
  container.classList.add("is-visible");
  staggerChildren(container, ".product-card");
}

async function fadeProductGrid(container, updateFn) {
  if (!container) return;

  if (prefersReducedMotion()) {
    updateFn();
    animateProductGrid(container);
    return;
  }

  container.classList.add("is-filtering");
  await wait(220);
  updateFn();
  container.classList.remove("is-filtering");
  animateProductGrid(container);
}

function initInteractivePress() {
  document.addEventListener(
    "mousedown",
    (event) => {
      const target = event.target.closest(".product-card__media, .category-card");
      if (target) target.classList.add("is-pressed");
    },
    true
  );

  document.addEventListener(
    "mouseup",
    () => {
      document.querySelectorAll(".is-pressed").forEach((el) => el.classList.remove("is-pressed"));
    },
    true
  );

  document.addEventListener(
    "mouseleave",
    () => {
      document.querySelectorAll(".is-pressed").forEach((el) => el.classList.remove("is-pressed"));
    },
    true
  );
}

function initAddToCartPulse() {
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-add-to-cart]");
    if (!button || prefersReducedMotion()) return;
    button.classList.add("is-pulsed");
    window.setTimeout(() => button.classList.remove("is-pulsed"), 500);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initPageEnter();
  initPageTransitions();
  initScrollReveal();
  initInteractivePress();
  initAddToCartPulse();
});
