// Give the shared navbar the same scroll effect as the homepage navbar.
const mainNav = document.getElementById("mainNav");

function updateNavbar() {
    if (mainNav) {
        mainNav.classList.toggle("scrolled", window.scrollY > 30);
    }
}

updateNavbar();
window.addEventListener("scroll", updateNavbar, { passive: true });

// Close the mobile menu after a navigation link is selected.
document.querySelectorAll("#navMenu .nav-link").forEach((link) => {
    link.addEventListener("click", () => {
        const menu = document.getElementById("navMenu");
        if (menu && menu.classList.contains("show") && window.bootstrap) {
            bootstrap.Collapse.getOrCreateInstance(menu).hide();
        }
    });
});

// Filter the database-powered products on the homepage.
const filterButtons = document.querySelectorAll("#filters .filter-btn");
const menuProducts = document.querySelectorAll("#menuGrid .menu-product");

filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const selectedCategory = button.dataset.filter;

        filterButtons.forEach((item) => item.classList.remove("active"));
        button.classList.add("active");

        menuProducts.forEach((product) => {
            const shouldShow = selectedCategory === "all" || product.dataset.category === selectedCategory;
            product.classList.toggle("d-none", !shouldShow);
        });
    });
});

// The cart is saved locally so it stays available while the customer moves between pages.
const cartStorageKey = "dadiKiRasoiCart";
const cartProductsStorageKey = "dadiKiRasoiCartProducts";
let productQuantities = {};
let cartProducts = {};

try {
    productQuantities = JSON.parse(localStorage.getItem(cartStorageKey)) || {};
    cartProducts = JSON.parse(localStorage.getItem(cartProductsStorageKey)) || {};
} catch (error) {
    productQuantities = {};
    cartProducts = {};
}

const cartRoot = document.querySelector("[data-cart-root='true']");
const cartItems = cartRoot?.querySelector("#cartItems");
const cartTotal = cartRoot?.querySelector("#grandTotal");

function escapeHtml(value) {
    const element = document.createElement("div");
    element.textContent = value;
    return element.innerHTML;
}

function updateCartCount() {
    const totalQuantity = Object.values(productQuantities).reduce((total, quantity) => total + Number(quantity), 0);
    document.querySelectorAll("#cartCount").forEach((badge) => { badge.textContent = totalQuantity; });
}

function updateQuantityControls(productId) {
    document.querySelectorAll(`.quantity-control[data-product-id="${productId}"]`).forEach((control) => {
        const quantity = Number(productQuantities[productId] || 0);
        control.querySelector(".quantity-value").textContent = quantity;
        control.querySelector(".quantity-minus").disabled = quantity === 0;
    });
}

function renderCart() {
    if (!cartItems || !cartTotal) return;
    const entries = Object.entries(productQuantities).filter(([, quantity]) => Number(quantity) > 0);
    if (!entries.length) {
        cartItems.innerHTML = '<div class="empty-cart"><span>🛒</span><p>Your cart is empty.</p></div>';
        cartTotal.textContent = "\u20B90";
        return;
    }

    let total = 0;
    cartItems.innerHTML = entries.map(([id, quantity]) => {
        const product = cartProducts[id] || { name: "Selected item", price: 0 };
        const lineTotal = Number(product.price) * Number(quantity);
        total += lineTotal;
        return `<div class="cart-item"><div class="cart-emoji">🍲</div><div class="flex-grow-1"><strong>${escapeHtml(product.name)}</strong><div class="small text-muted">\u20B9${Number(product.price).toFixed(2)} each</div><div class="qty mt-2"><button type="button" data-cart-action="decrease" data-product-id="${id}" aria-label="Remove one">−</button><span class="mx-2">${quantity}</span><button type="button" data-cart-action="increase" data-product-id="${id}" aria-label="Add one">+</button></div></div><strong>\u20B9${lineTotal.toFixed(2)}</strong></div>`;
    }).join("");
    cartTotal.textContent = `\u20B9${total.toFixed(2)}`;
}

function saveCart() {
    localStorage.setItem(cartStorageKey, JSON.stringify(productQuantities));
    localStorage.setItem(cartProductsStorageKey, JSON.stringify(cartProducts));
    updateCartCount();
    renderCart();
}

function changeQuantity(productId, change) {
    const nextQuantity = Math.max(0, Number(productQuantities[productId] || 0) + change);
    if (nextQuantity === 0) delete productQuantities[productId];
    else productQuantities[productId] = nextQuantity;
    updateQuantityControls(productId);
    saveCart();
}

function rememberProduct(button) {
    cartProducts[button.dataset.productId] = {
        name: button.dataset.productName,
        price: Number(button.dataset.productPrice),
    };
}

function showToast(message) {
    const toastElement = document.querySelector("#appToast");
    const toastMessage = document.querySelector("#toastMsg");
    if (!toastElement || !toastMessage || !window.bootstrap) return;
    toastMessage.textContent = message;
    bootstrap.Toast.getOrCreateInstance(toastElement, { delay: 2500 }).show();
}

document.querySelectorAll(".quantity-control").forEach((control) => {
    const productId = control.dataset.productId;
    const addButton = control.parentElement.querySelector(".add-to-cart");
    if (addButton) rememberProduct(addButton);
    updateQuantityControls(productId);
    control.querySelector(".quantity-plus").addEventListener("click", () => changeQuantity(productId, 1));
    control.querySelector(".quantity-minus").addEventListener("click", () => changeQuantity(productId, -1));
});

document.querySelectorAll(".add-to-cart").forEach((button) => {
    button.addEventListener("click", () => {
        rememberProduct(button);
        changeQuantity(button.dataset.productId, 1);
        showToast(`${button.dataset.productName} added to your cart.`);
    });
});

document.querySelectorAll(".add-plan-to-cart").forEach((button) => {
    button.addEventListener("click", () => {
        rememberProduct(button);
        productQuantities[button.dataset.productId] = 1;
        saveCart();
        showToast(`${button.dataset.productName} added to your cart.`);
    });
});

cartItems?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-cart-action]");
    if (!button) return;
    changeQuantity(button.dataset.productId, button.dataset.cartAction === "increase" ? 1 : -1);
});

cartRoot?.querySelector("#clearCart")?.addEventListener("click", () => {
    productQuantities = {};
    cartProducts = {};
    document.querySelectorAll(".quantity-control").forEach((control) => updateQuantityControls(control.dataset.productId));
    saveCart();
});

cartRoot?.querySelector("#checkoutBtn")?.addEventListener("click", (event) => {
    if (Object.keys(productQuantities).length) return;
    event.preventDefault();
    showToast("Please add a product before checkout.");
});

const checkoutForm = document.querySelector("#checkoutForm");
checkoutForm?.addEventListener("submit", (event) => {
    const entries = Object.entries(productQuantities).filter(([, quantity]) => Number(quantity) > 0);
    if (!entries.length) {
        event.preventDefault();
        showToast("Please add a product before checkout.");
        return;
    }

    const name = checkoutForm.querySelector("#id_name")?.value.trim() || "";
    const phone = checkoutForm.querySelector("#id_phone")?.value.trim() || "";
    const address = checkoutForm.querySelector("#id_address")?.value.trim() || "";
    const orderLines = entries.map(([id, quantity]) => {
        const product = cartProducts[id] || { name: "Selected item", price: 0 };
        return `• ${product.name} x ${quantity} — \u20B9${(Number(product.price) * Number(quantity)).toFixed(2)}`;
    });
    const total = entries.reduce((sum, [id, quantity]) => {
        return sum + Number(cartProducts[id]?.price || 0) * Number(quantity);
    }, 0);
    const message = [
        "*New Order — Dadi Ki Rasoi*",
        "",
        `*Name:* ${name}`,
        `*Phone:* ${phone}`,
        `*Address:* ${address}`,
        "",
        "*Order items:*",
        ...orderLines,
        "",
        `*Total:* \u20B9${total.toFixed(2)}`,
    ].join("\n");

    window.open(`https://wa.me/918965960737?text=${encodeURIComponent(message)}`, "_blank", "noopener");
});

if (document.querySelector("#checkoutSuccess")) {
    productQuantities = {};
    cartProducts = {};
    localStorage.removeItem(cartStorageKey);
    localStorage.removeItem(cartProductsStorageKey);
    updateCartCount();
    renderCart();
}

updateCartCount();
renderCart();
