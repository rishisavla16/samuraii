function encodeImagePath(path) {
  return path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function categoryPageHref(categoryId) {
  return categoryId === "all" ? "shop.html" : `${categoryId}.html`;
}

function productPageHref(product) {
  return `product.html?id=${encodeURIComponent(product.id)}`;
}

function createCategoryCard(category, index) {
  const card = document.createElement("a");
  card.href = categoryPageHref(category.id);
  card.className = "category-card";
  card.style.setProperty("--stagger", `${index * 0.07}s`);
  card.innerHTML = `
    <div class="category-card__media">
      <img src="${encodeImagePath(category.image)}" alt="${category.label}" loading="lazy" />
    </div>
    <span class="category-card__label">${category.label}</span>
  `;
  return card;
}

function renderCategoryGrid(container) {
  if (!container) return;
  container.innerHTML = "";
  SHOP_CATEGORIES.forEach((category, index) => {
    container.appendChild(createCategoryCard(category, index));
  });
  if (typeof staggerChildren === "function") {
    staggerChildren(container, ".category-card");
  }
}

function createProductCard(product) {
  const card = document.createElement("article");
  card.className = "product-card";
  card.dataset.category = product.category;
  card.dataset.productId = product.id;
  card.id = product.id;

  card.innerHTML = `
    <div class="product-card__media">
      <a href="${productPageHref(product)}" aria-label="View ${product.name}">
        <img src="${encodeImagePath(product.image)}" alt="${product.name}" loading="lazy" />
      </a>
      <button
        type="button"
        class="favorite-btn"
        data-favorite-id="${product.id}"
        aria-label="Save ${product.name}"
        aria-pressed="false"
      >
        <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
          <path
            d="M12 20.5l-1.45-1.32C5.4 14.36 2 11.28 2 7.5 2 5 4 3 6.5 3c1.74 0 3.41 0.81 4.5 2.09C12.09 3.81 13.76 3 15.5 3 18 3 20 5 20 7.5c0 3.78-3.4 6.86-8.55 11.68L12 20.5z"
          />
        </svg>
      </button>
    </div>
    <div class="product-card__body">
      <p class="product-card__category">${product.category}</p>
      <h3 class="product-card__title">
        <a href="${productPageHref(product)}">${product.name}</a>
      </h3>
      <p class="product-card__price">${formatPrice(product.price)}</p>
      <button type="button" class="btn btn--ghost btn--small" data-add-to-cart="${product.id}">
        Add to cart
      </button>
    </div>
  `;

  return card;
}

function scrollToHashProduct() {
  const id = window.location.hash ? decodeURIComponent(window.location.hash.slice(1)) : "";
  if (!id) return;

  const target = document.getElementById(id);
  if (!target?.classList.contains("product-card")) return;

  window.requestAnimationFrame(() => {
    const behavior =
      typeof prefersReducedMotion === "function" && prefersReducedMotion() ? "auto" : "smooth";
    target.scrollIntoView({ block: "start", behavior });
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  });
}

function getCategoryLabel(categoryId) {
  return CATEGORIES.find((category) => category.id === categoryId)?.label || categoryId;
}

function getProductFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id") || (window.location.hash ? window.location.hash.slice(1) : "");
  return PRODUCTS.find((product) => product.id === id);
}

function renderProductPage() {
  const detail = document.querySelector("[data-product-detail]");
  if (!detail) return;

  const product = getProductFromUrl();
  const relatedGrid = document.querySelector("[data-related-products]");

  if (!product) {
    document.title = "SAMURAIi - Product not found";
    detail.innerHTML = `
      <div class="product-detail__empty">
        <p>Product not found.</p>
        <a href="shop.html" class="btn btn--solid">Shop all</a>
      </div>
    `;
    if (relatedGrid) relatedGrid.innerHTML = "";
    return;
  }

  const categoryLabel = getCategoryLabel(product.category);
  document.title = `SAMURAIi - ${product.name}`;
  detail.innerHTML = `
    <nav class="product-detail__breadcrumb" aria-label="Breadcrumb">
      <a href="shop.html">Shop</a>
      <span>/</span>
      <a href="${categoryPageHref(product.category)}">${categoryLabel}</a>
    </nav>
    <div class="product-detail__layout">
      <div class="product-detail__media">
        <img src="${encodeImagePath(product.image)}" alt="${product.name}" loading="lazy" />
      </div>
      <section class="product-detail__info" aria-labelledby="product-title">
        <p class="product-detail__category">${categoryLabel}</p>
        <h1 id="product-title">${product.name}</h1>
        <p class="product-detail__price">${formatPrice(product.price)}</p>
        <p class="product-detail__copy">
          A SAMURAIi piece selected for everyday styling, built to sharpen the final detail of a look.
        </p>
        <div class="product-detail__controls">
          <div class="product-qty" aria-label="Quantity">
            <button type="button" data-product-qty-minus aria-label="Decrease quantity">-</button>
            <span data-product-qty>1</span>
            <button type="button" data-product-qty-plus aria-label="Increase quantity">+</button>
          </div>
          <button type="button" class="btn btn--solid" data-product-detail-add="${product.id}">
            Add to cart
          </button>
          <button
            type="button"
            class="favorite-btn product-detail__favorite"
            data-favorite-id="${product.id}"
            aria-label="Save ${product.name}"
            aria-pressed="false"
          >
            <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
              <path d="M12 20.5l-1.45-1.32C5.4 14.36 2 11.28 2 7.5 2 5 4 3 6.5 3c1.74 0 3.41 0.81 4.5 2.09C12.09 3.81 13.76 3 15.5 3 18 3 20 5 20 7.5c0 3.78-3.4 6.86-8.55 11.68L12 20.5z" />
            </svg>
          </button>
        </div>
        <dl class="product-detail__meta">
          <div>
            <dt>Category</dt>
            <dd>${categoryLabel}</dd>
          </div>
          <div>
            <dt>Shipping</dt>
            <dd>Ships from Mumbai</dd>
          </div>
          <div>
            <dt>Care</dt>
            <dd>Keep dry and store separately</dd>
          </div>
        </dl>
      </section>
    </div>
  `;

  if (relatedGrid) {
    const related = PRODUCTS.filter(
      (item) => item.category === product.category && item.id !== product.id
    ).slice(0, 4);
    relatedGrid.innerHTML = "";
    related.forEach((item) => relatedGrid.appendChild(createProductCard(item)));
    if (typeof animateProductGrid === "function") {
      animateProductGrid(relatedGrid);
    }
  }

  updateFavoriteButtons();
}

function initProductPageActions() {
  const detail = document.querySelector("[data-product-detail]");
  if (!detail) return;

  detail.addEventListener("click", (event) => {
    const qty = detail.querySelector("[data-product-qty]");
    if (!qty) return;

    const current = Number(qty.textContent) || 1;
    if (event.target.closest("[data-product-qty-minus]")) {
      qty.textContent = String(Math.max(1, current - 1));
    }

    if (event.target.closest("[data-product-qty-plus]")) {
      qty.textContent = String(Math.min(10, current + 1));
    }

    const addButton = event.target.closest("[data-product-detail-add]");
    if (addButton) {
      addToCart(addButton.getAttribute("data-product-detail-add"), Number(qty.textContent) || 1);
      const original = addButton.textContent;
      addButton.textContent = "Added";
      addButton.disabled = true;
      window.setTimeout(() => {
        addButton.textContent = original;
        addButton.disabled = false;
      }, 1200);
    }
  });
}

function renderProducts(container, filter = "all") {
  if (!container) return;

  const items =
    filter === "all"
      ? PRODUCTS
      : PRODUCTS.filter((product) => product.category === filter);

  container.innerHTML = "";
  items.forEach((product) => {
    container.appendChild(createProductCard(product));
  });

  if (typeof animateProductGrid === "function") {
    animateProductGrid(container);
  }

  updateFavoriteButtons();
  scrollToHashProduct();
}

function initMobileNav() {
  const toggle = document.querySelector("[data-nav-toggle]");
  const panel = document.querySelector("[data-nav-panel]");
  if (!toggle || !panel) return;

  toggle.addEventListener("click", () => {
    const open = panel.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("nav-open", open);
  });

  panel.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      panel.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("nav-open");
    });
  });
}

function initAddToCart() {
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-add-to-cart]");
    if (!button) return;

    const productId = button.getAttribute("data-add-to-cart");
    addToCart(productId);

    const original = button.textContent;
    button.textContent = "Added";
    button.disabled = true;
    window.setTimeout(() => {
      button.textContent = original;
      button.disabled = false;
    }, 1200);
  });
}

function initProductGrid() {
  const grid = document.querySelector("[data-product-grid]");
  if (!grid) return;

  const category = document.querySelector("[data-category]")?.dataset.category || "all";
  renderProducts(grid, category);
}

const FAVORITES_KEY = "samuraii-favorites";

function getFavorites() {
  try {
    const raw = window.localStorage.getItem(FAVORITES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setFavorites(ids) {
  window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
}

function toggleFavorite(id) {
  const current = new Set(getFavorites());
  if (current.has(id)) {
    current.delete(id);
  } else {
    current.add(id);
  }
  setFavorites([...current]);
  updateFavoriteButtons();
  renderFavoritesPage();
}

function updateFavoriteButtons() {
  const favorites = new Set(getFavorites());
  document.querySelectorAll("[data-favorite-id]").forEach((button) => {
    const id = button.getAttribute("data-favorite-id");
    const active = favorites.has(id);
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function initFavorites() {
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-favorite-id]");
    if (!button) return;
    toggleFavorite(button.getAttribute("data-favorite-id"));
  });
}

function initCategorySelect() {
  document.querySelectorAll("[data-category-select]").forEach((select) => {
    select.addEventListener("change", () => {
      const target = select.value;
      if (target) window.location.href = target;
    });
  });
}

function markActiveCategoryNav() {
  const category = document.querySelector("[data-category]")?.dataset.category;
  if (!category || category === "all") return;

  document.querySelectorAll(`.nav-dropdown a[href="${category}.html"]`).forEach((link) => {
    link.setAttribute("aria-current", "page");
  });
}

function renderFavoritesPage() {
  const grid = document.querySelector("[data-favorites-grid]");
  if (!grid) return;

  const empty = document.querySelector("[data-favorites-empty]");
  const favorites = new Set(getFavorites());
  const items = PRODUCTS.filter((product) => favorites.has(product.id));

  grid.innerHTML = "";
  items.forEach((product) => grid.appendChild(createProductCard(product)));

  if (empty) empty.hidden = items.length > 0;

  updateFavoriteButtons();
}

function initContactForm() {
  const form = document.querySelector("[data-contact-form]");
  const notice = document.querySelector("[data-form-notice]");
  if (!form || !notice) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    notice.textContent = "Thank you — we'll get back to you soon.";
    notice.hidden = false;
    form.reset();
  });
}

function initCartPage() {
  const list = document.querySelector("[data-cart-list]");
  const empty = document.querySelector("[data-cart-empty]");
  const summary = document.querySelector("[data-cart-summary]");
  if (!list) return;

  const render = () => {
    const cart = getCart();
    list.innerHTML = "";

    if (!cart.length) {
      if (empty) empty.hidden = false;
      if (summary) summary.hidden = true;
      return;
    }

    if (empty) empty.hidden = true;
    if (summary) summary.hidden = false;

    let total = 0;

    cart.forEach((item) => {
      total += item.price * item.quantity;
      const row = document.createElement("div");
      row.className = "cart-item";
      row.innerHTML = `
        <div class="cart-item__media">
          <img src="${encodeImagePath(item.image)}" alt="${item.name}" loading="lazy" />
        </div>
        <div class="cart-item__details">
          <h3>${item.name}</h3>
          <p>${formatPrice(item.price)}</p>
          <div class="cart-item__qty">
            <button type="button" aria-label="Decrease quantity" data-qty-minus="${item.id}">−</button>
            <span>${item.quantity}</span>
            <button type="button" aria-label="Increase quantity" data-qty-plus="${item.id}">+</button>
          </div>
          <button type="button" class="cart-item__remove" data-remove="${item.id}">Remove</button>
        </div>
        <p class="cart-item__line-total">${formatPrice(item.price * item.quantity)}</p>
      `;
      list.appendChild(row);
    });

    const totalEl = document.querySelector("[data-cart-total]");
    if (totalEl) totalEl.textContent = formatPrice(total);

    if (typeof staggerChildren === "function") {
      staggerChildren(list, ".cart-item");
    }
  };

  list.addEventListener("click", (event) => {
    const minus = event.target.closest("[data-qty-minus]");
    const plus = event.target.closest("[data-qty-plus]");
    const remove = event.target.closest("[data-remove]");

    if (minus) {
      const id = minus.getAttribute("data-qty-minus");
      const item = getCart().find((entry) => entry.id === id);
      if (item) updateCartQuantity(id, item.quantity - 1);
      render();
    }

    if (plus) {
      const id = plus.getAttribute("data-qty-plus");
      const item = getCart().find((entry) => entry.id === id);
      if (item) updateCartQuantity(id, item.quantity + 1);
      render();
    }

    if (remove) {
      removeFromCart(remove.getAttribute("data-remove"));
      render();
    }
  });

  const clearBtn = document.querySelector("[data-clear-cart]");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      clearCart();
      render();
    });
  }

  window.addEventListener("cart-updated", render);
  render();
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();
  initMobileNav();
  initAddToCart();
  initProductGrid();
  initFavorites();
  initCategorySelect();
  markActiveCategoryNav();
  renderProductPage();
  initProductPageActions();
  initContactForm();
  initCartPage();
  renderFavoritesPage();

  const categoryGrid = document.querySelector("[data-category-grid]");
  if (categoryGrid) renderCategoryGrid(categoryGrid);

  document.querySelectorAll(".page-header, .about-split, .contact-layout, .profile-layout").forEach((el) => {
    el.classList.add("reveal");
  });

  if (typeof observeReveals === "function") {
    observeReveals();
  }

  if (typeof initPageTransitions === "function") {
    initPageTransitions();
  }

  if (typeof initPageEnter === "function") {
    initPageEnter();
  }
});
