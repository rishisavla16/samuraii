function encodeImagePath(path) {
  return path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function createCategoryCard(category, index) {
  const card = document.createElement("a");
  card.href = `shop.html#${category.id}`;
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

  card.innerHTML = `
    <a href="shop.html#${product.category}" class="product-card__media">
      <img src="${encodeImagePath(product.image)}" alt="${product.name}" loading="lazy" />
    </a>
    <div class="product-card__body">
      <p class="product-card__category">${product.category}</p>
      <h3 class="product-card__title">${product.name}</h3>
      <p class="product-card__price">${formatPrice(product.price)}</p>
      <button type="button" class="btn btn--ghost btn--small" data-add-to-cart="${product.id}">
        Add to cart
      </button>
    </div>
  `;

  return card;
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

function initShopFilters() {
  const grid = document.querySelector("[data-product-grid]");
  const filters = document.querySelectorAll("[data-shop-filter]");
  if (!grid || !filters.length) return;

  const applyFilter = (filter) => {
    filters.forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.shopFilter === filter);
    });

    if (typeof fadeProductGrid === "function") {
      fadeProductGrid(grid, () => renderProducts(grid, filter));
    } else {
      renderProducts(grid, filter);
    }
  };

  filters.forEach((button) => {
    button.addEventListener("click", () => {
      applyFilter(button.dataset.shopFilter);
      history.replaceState(null, "", `#${button.dataset.shopFilter}`);
    });
  });

  const hash = window.location.hash.replace("#", "");
  const valid = CATEGORIES.some((cat) => cat.id === hash && cat.id !== "all");
  renderProducts(grid, valid ? hash : "all");
  filters.forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.shopFilter === (valid ? hash : "all"));
  });
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
          <img src="${encodeImagePath(item.image)}" alt="${item.name}" />
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
  initShopFilters();
  initContactForm();
  initCartPage();

  const categoryGrid = document.querySelector("[data-category-grid]");
  if (categoryGrid) renderCategoryGrid(categoryGrid);

  document.querySelectorAll(".page-header, .about-split, .contact-layout, .profile-layout").forEach((el) => {
    el.classList.add("reveal");
  });

  if (typeof observeReveals === "function") {
    observeReveals();
  }
});
