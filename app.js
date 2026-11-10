// =============================================================================
// LÓGICA DE LA APLICACIÓN (CARRITO, BÚSQUEDA, MODALES Y WHATSAPP)
// =============================================================================

let currentCategory = "all";
let searchQuery = "";
let cart = [];
let deliveryMethod = "shipping"; // 'shipping' o 'pickup'
let modalSelectedProduct = null;
let modalQuantity = 1;

// Inicialización cuando carga el DOM
document.addEventListener("DOMContentLoaded", () => {
  loadCartFromStorage();
  initStoreInfo();
  renderCategories();
  renderProducts();
  setupEventListeners();
  updateCartUI();
});

// -----------------------------------------------------------------------------
// Inicializar Datos de Tienda desde STORE_CONFIG
// -----------------------------------------------------------------------------
function initStoreInfo() {
  document.getElementById("brand-name").textContent = STORE_CONFIG.storeName;
  document.getElementById("store-tagline").textContent = STORE_CONFIG.storeTagline;
  document.title = `${STORE_CONFIG.storeName} | Pedí Online`;
  
  if (STORE_CONFIG.instagramUser) {
    document.getElementById("instagram-link").href = `https://instagram.com/${STORE_CONFIG.instagramUser}`;
  } else {
    document.getElementById("instagram-link").style.display = "none";
  }

  // Datos bancarios
  document.getElementById("bank-name").textContent = STORE_CONFIG.bankDetails.bank;
  document.getElementById("bank-alias").textContent = STORE_CONFIG.bankDetails.alias;
  document.getElementById("bank-holder").textContent = STORE_CONFIG.bankDetails.holder;
  document.getElementById("pickup-address-text").textContent = STORE_CONFIG.pickupAddress;
}

// -----------------------------------------------------------------------------
// Formato de Moneda
// -----------------------------------------------------------------------------
function formatPrice(number) {
  return STORE_CONFIG.currency + Number(number).toLocaleString("es-AR");
}

// -----------------------------------------------------------------------------
// Renderizado de Categorías
// -----------------------------------------------------------------------------
function renderCategories() {
  const container = document.getElementById("category-pills");
  container.innerHTML = "";

  STORE_CONFIG.categories.forEach(cat => {
    const btn = document.createElement("button");
    btn.className = `category-pill ${cat.id === currentCategory ? "active" : ""}`;
    btn.textContent = cat.name;
    btn.onclick = () => selectCategory(cat.id);
    container.appendChild(btn);
  });
}

function selectCategory(catId) {
  currentCategory = catId;
  
  // Actualizar clases activas
  document.querySelectorAll(".category-pill").forEach(pill => {
    const isThis = pill.textContent.trim() === STORE_CONFIG.categories.find(c => c.id === catId)?.name;
    pill.classList.toggle("active", isThis);
  });

  const catObj = STORE_CONFIG.categories.find(c => c.id === catId);
  document.getElementById("current-category-title").textContent = catObj ? catObj.name : "Catálogo";

  renderProducts();
}

// -----------------------------------------------------------------------------
// Renderizado de Productos con Filtros y Búsqueda
// -----------------------------------------------------------------------------
function renderProducts() {
  const grid = document.getElementById("product-grid");
  const noProductsMsg = document.getElementById("no-products-msg");
  const countBadge = document.getElementById("product-count");

  let filtered = STORE_CONFIG.products;

  // Filtro por categoría
  if (currentCategory === "destacados") {
    filtered = filtered.filter(p => p.featured);
  } else if (currentCategory !== "all") {
    filtered = filtered.filter(p => p.category === currentCategory);
  }

  // Filtro por búsqueda
  if (searchQuery.trim() !== "") {
    const query = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(query) || 
      (p.description && p.description.toLowerCase().includes(query))
    );
  }

  countBadge.textContent = `${filtered.length} artículo${filtered.length === 1 ? '' : 's'}`;

  if (filtered.length === 0) {
    grid.innerHTML = "";
    noProductsMsg.style.display = "block";
    return;
  }

  noProductsMsg.style.display = "none";
  grid.innerHTML = filtered.map(product => `
    <article class="product-card" data-id="${product.id}">
      <div class="product-img-wrap" onclick="openProductModal('${product.id}')">
        <img src="${product.image}" alt="${product.name}" loading="lazy">
        ${product.badge ? `<span class="card-badge">${product.badge}</span>` : ""}
      </div>
      <div class="product-details">
        <h4 class="product-name" onclick="openProductModal('${product.id}')">${product.name}</h4>
        <p class="product-desc">${product.description || ""}</p>
        <div class="product-bottom-row">
          <span class="product-price">${formatPrice(product.price)}</span>
          <button class="add-btn" onclick="addToCart('${product.id}', 1)" title="Agregar al carrito">+</button>
        </div>
      </div>
    </article>
  `).join("");
}

// -----------------------------------------------------------------------------
// Modal Detalle de Producto
// -----------------------------------------------------------------------------
function openProductModal(productId) {
  const product = STORE_CONFIG.products.find(p => p.id === productId);
  if (!product) return;

  modalSelectedProduct = product;
  modalQuantity = 1;

  document.getElementById("modal-product-img").src = product.image;
  document.getElementById("modal-product-name").textContent = product.name;
  document.getElementById("modal-product-desc").textContent = product.description || "";
  document.getElementById("modal-product-price").textContent = formatPrice(product.price);
  document.getElementById("modal-qty-num").textContent = modalQuantity;
  
  const badgeEl = document.getElementById("modal-product-badge");
  if (product.badge) {
    badgeEl.textContent = product.badge;
    badgeEl.style.display = "inline-block";
  } else {
    badgeEl.style.display = "none";
  }

  updateModalSubtotal();
  document.getElementById("product-modal").style.display = "flex";
}

function closeProductModal() {
  document.getElementById("product-modal").style.display = "none";
  modalSelectedProduct = null;
}

function updateModalSubtotal() {
  if (!modalSelectedProduct) return;
  const subtotal = modalSelectedProduct.price * modalQuantity;
  document.getElementById("modal-btn-subtotal").textContent = formatPrice(subtotal);
  document.getElementById("modal-qty-num").textContent = modalQuantity;
}

// -----------------------------------------------------------------------------
// Gestión del Carrito (State & LocalStorage)
// -----------------------------------------------------------------------------
function loadCartFromStorage() {
  try {
    const saved = localStorage.getItem("tienda_cart");
    if (saved) cart = JSON.parse(saved);
  } catch (e) {
    cart = [];
  }
}

function saveCartToStorage() {
  try {
    localStorage.setItem("tienda_cart", JSON.stringify(cart));
  } catch (e) {}
}

function addToCart(productId, quantity = 1) {
  const product = STORE_CONFIG.products.find(p => p.id === productId);
  if (!product) return;

  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: quantity
    });
  }

  saveCartToStorage();
  updateCartUI();
  showToast(`¡${product.name} agregado al pedido!`);
}

function updateItemQuantity(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    cart = cart.filter(i => i.id !== productId);
  }

  saveCartToStorage();
  updateCartUI();
}

function removeFromCart(productId) {
  cart = cart.filter(i => i.id !== productId);
  saveCartToStorage();
  updateCartUI();
}

// -----------------------------------------------------------------------------
// Renderizado y Actualización de UI del Carrito
// -----------------------------------------------------------------------------
function updateCartUI() {
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Costo de envío
  let shippingCost = 0;
  if (deliveryMethod === "shipping") {
    if (STORE_CONFIG.freeDeliveryThreshold > 0 && subtotal >= STORE_CONFIG.freeDeliveryThreshold) {
      shippingCost = 0;
    } else {
      shippingCost = STORE_CONFIG.deliveryCost;
    }
  }

  const finalTotal = subtotal + shippingCost;

  // Badges y contadores
  document.getElementById("cart-count-badge").textContent = totalCount;
  document.getElementById("drawer-item-count").textContent = `${totalCount} item${totalCount === 1 ? '' : 's'}`;
  document.getElementById("floating-cart-count").textContent = `${totalCount} producto${totalCount === 1 ? '' : 's'}`;
  document.getElementById("floating-cart-total").textContent = formatPrice(finalTotal);

  // Mostrar / ocultar barra flotante
  const floatingBar = document.getElementById("floating-cart-bar");
  if (totalCount > 0) {
    floatingBar.style.display = "block";
  } else {
    floatingBar.style.display = "none";
  }

  // Drawer Carrito
  const itemsContainer = document.getElementById("cart-items-container");
  const emptyView = document.getElementById("cart-empty-view");
  const checkoutSection = document.getElementById("cart-checkout-section");

  if (cart.length === 0) {
    itemsContainer.style.display = "none";
    checkoutSection.style.display = "none";
    emptyView.style.display = "flex";
  } else {
    itemsContainer.style.display = "flex";
    checkoutSection.style.display = "block";
    emptyView.style.display = "none";

    itemsContainer.innerHTML = cart.map(item => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" class="cart-item-img">
        <div class="cart-item-info">
          <div class="cart-item-title">${item.name}</div>
          <div class="cart-item-price">${formatPrice(item.price)} c/u</div>
        </div>
        <div class="cart-item-controls">
          <button class="item-qty-btn" onclick="updateItemQuantity('${item.id}', -1)">−</button>
          <span class="item-qty-count">${item.quantity}</span>
          <button class="item-qty-btn" onclick="updateItemQuantity('${item.id}', 1)">+</button>
          <button class="cart-item-remove" onclick="removeFromCart('${item.id}')" title="Eliminar">🗑️</button>
        </div>
      </div>
    `).join("");
  }

  // Actualizar Resumen de Precios
  document.getElementById("summary-subtotal").textContent = formatPrice(subtotal);
  
  const shippingLine = document.getElementById("summary-shipping-line");
  const shippingVal = document.getElementById("summary-shipping");
  if (deliveryMethod === "pickup") {
    shippingVal.textContent = "Gratis (Retiro)";
    shippingVal.style.color = "#10b981";
  } else if (shippingCost === 0 && subtotal > 0) {
    shippingVal.textContent = "¡GRATIS!";
    shippingVal.style.color = "#10b981";
  } else {
    shippingVal.textContent = formatPrice(shippingCost);
    shippingVal.style.color = "inherit";
  }

  document.getElementById("summary-total").textContent = formatPrice(finalTotal);

  // Recalcular cambio si el cliente puso con cuánto paga
  recalcCashChange(finalTotal);
}

function recalcCashChange(total) {
  const input = document.getElementById("cash-amount-input");
  const result = document.getElementById("cash-change-result");
  const val = Number(input.value);

  if (val > 0) {
    if (val >= total) {
      result.textContent = `Vuelto a llevarte: ${formatPrice(val - total)}`;
      result.style.color = "#059669";
    } else {
      result.textContent = `El monto debe ser al menos ${formatPrice(total)}`;
      result.style.color = "#dc2626";
    }
  } else {
    result.textContent = "";
  }
}

// -----------------------------------------------------------------------------
// Drawer Abrir / Cerrar
// -----------------------------------------------------------------------------
function openCartDrawer() {
  document.getElementById("cart-drawer").classList.add("open");
  document.getElementById("cart-drawer-overlay").style.display = "block";
  document.body.style.overflow = "hidden"; // Prevenir scroll de fondo
}

function closeCartDrawer() {
  document.getElementById("cart-drawer").classList.remove("open");
  document.getElementById("cart-drawer-overlay").style.display = "none";
  document.body.style.overflow = "";
}

// -----------------------------------------------------------------------------
// Notificaciones Toast
// -----------------------------------------------------------------------------
let toastTimer = null;
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

// -----------------------------------------------------------------------------
// Confirmación y Envío a WhatsApp
// -----------------------------------------------------------------------------
function submitOrderToWhatsApp() {
  if (cart.length === 0) {
    alert("Tu carrito está vacío.");
    return;
  }

  const nameInput = document.getElementById("customer-name");
  const phoneInput = document.getElementById("customer-phone");
  const addressInput = document.getElementById("customer-address");
  const notesInput = document.getElementById("customer-notes");

  const name = nameInput.value.trim();
  const phone = phoneInput.value.trim();
  const address = addressInput.value.trim();
  const notes = notesInput.value.trim();

  // Validaciones básicas
  if (!name) {
    alert("Por favor ingresá tu Nombre y Apellido.");
    nameInput.focus();
    return;
  }

  if (!phone) {
    alert("Por favor ingresá tu número de Teléfono / WhatsApp.");
    phoneInput.focus();
    return;
  }

  if (deliveryMethod === "shipping" && !address) {
    alert("Por favor ingresá tu dirección para el envío.");
    addressInput.focus();
    return;
  }

  // Método de pago
  const paymentMethodEl = document.querySelector('input[name="paymentMethod"]:checked');
  const paymentMethod = paymentMethodEl ? paymentMethodEl.value : "cash";

  // Cálculos de total
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  let shippingCost = 0;
  if (deliveryMethod === "shipping") {
    shippingCost = (STORE_CONFIG.freeDeliveryThreshold > 0 && subtotal >= STORE_CONFIG.freeDeliveryThreshold) ? 0 : STORE_CONFIG.deliveryCost;
  }
  const total = subtotal + shippingCost;

  // Validación de pago en efectivo
  let cashNote = "";
  if (paymentMethod === "cash") {
    const cashVal = Number(document.getElementById("cash-amount-input").value);
    if (cashVal > 0) {
      if (cashVal < total) {
        alert(`El monto en efectivo ingresado ($${cashVal}) es menor al total ($${total}).`);
        return;
      }
      cashNote = ` (Paga con: $${cashVal.toLocaleString('es-AR')} | Vuelto: $${(cashVal - total).toLocaleString('es-AR')})`;
    } else {
      cashNote = " (Abona con monto justo o coordinar cambio)";
    }
  }

  // Generar ID de pedido aleatorio
  const orderId = Math.floor(1000 + Math.random() * 9000);

  // Armado del mensaje de WhatsApp estructurado y profesional
  let msg = `🛍️ *NUEVO PEDIDO #${orderId}*\n`;
  msg += `--------------------------------\n`;
  msg += `👤 *Cliente:* ${name}\n`;
  msg += `📱 *Teléfono:* ${phone}\n`;
  
  if (deliveryMethod === "shipping") {
    msg += `🛵 *Entrega:* A domicilio\n`;
    msg += `📍 *Dirección:* ${address}\n`;
  } else {
    msg += `🏬 *Entrega:* Retiro en sucursal (${STORE_CONFIG.pickupAddress})\n`;
  }

  if (notes) {
    msg += `📝 *Aclaraciones:* ${notes}\n`;
  }

  msg += `--------------------------------\n`;
  msg += `🛒 *DETALLE DEL PEDIDO:*\n`;

  cart.forEach(item => {
    msg += `• ${item.quantity}x ${item.name} ($${(item.price * item.quantity).toLocaleString('es-AR')})\n`;
  });

  msg += `--------------------------------\n`;
  msg += `Subtotal: $${subtotal.toLocaleString('es-AR')}\n`;
  if (deliveryMethod === "shipping") {
    msg += `Envío: ${shippingCost === 0 ? '¡GRATIS!' : '$' + shippingCost.toLocaleString('es-AR')}\n`;
  } else {
    msg += `Envío: $0 (Retiro)\n`;
  }
  msg += `💰 *TOTAL: $${total.toLocaleString('es-AR')}*\n`;
  msg += `--------------------------------\n`;

  if (paymentMethod === "cash") {
    msg += `💳 *Forma de Pago:* Efectivo contra entrega${cashNote}\n`;
  } else {
    msg += `💳 *Forma de Pago:* Transferencia Bancaria (Envío comprobante adjunto)\n`;
  }

  msg += `\n¡Hola! Acabo de hacer este pedido desde su web. ¿Me confirman si está todo bien? Gracias! 😊`;

  // Construir link de WhatsApp
  const encodedMsg = encodeURIComponent(msg);
  const whatsappUrl = `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodedMsg}`;

  // Abrir WhatsApp en nueva pestaña
  window.open(whatsappUrl, "_blank");
}

// -----------------------------------------------------------------------------
// Event Listeners y Handlers
// -----------------------------------------------------------------------------
function setupEventListeners() {
  // Drawer Carrito
  document.getElementById("cart-btn").addEventListener("click", openCartDrawer);
  document.getElementById("floating-cart-btn").addEventListener("click", openCartDrawer);
  document.getElementById("close-cart-btn").addEventListener("click", closeCartDrawer);
  document.getElementById("cart-drawer-overlay").addEventListener("click", closeCartDrawer);
  
  const browseBtn = document.getElementById("browse-menu-btn");
  if (browseBtn) {
    browseBtn.addEventListener("click", closeCartDrawer);
  }

  // Modal Producto
  document.getElementById("close-product-modal").addEventListener("click", closeProductModal);
  document.getElementById("product-modal").addEventListener("click", (e) => {
    if (e.target.id === "product-modal") closeProductModal();
  });

  document.getElementById("modal-qty-plus").addEventListener("click", () => {
    modalQuantity++;
    updateModalSubtotal();
  });

  document.getElementById("modal-qty-minus").addEventListener("click", () => {
    if (modalQuantity > 1) {
      modalQuantity--;
      updateModalSubtotal();
    }
  });

  document.getElementById("modal-add-cart-btn").addEventListener("click", () => {
    if (modalSelectedProduct) {
      addToCart(modalSelectedProduct.id, modalQuantity);
      closeProductModal();
    }
  });

  // Búsqueda
  const searchInput = document.getElementById("search-input");
  const clearSearchBtn = document.getElementById("clear-search-btn");

  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    clearSearchBtn.style.display = searchQuery ? "flex" : "none";
    renderProducts();
  });

  clearSearchBtn.addEventListener("click", () => {
    searchInput.value = "";
    searchQuery = "";
    clearSearchBtn.style.display = "none";
    renderProducts();
    searchInput.focus();
  });

  // Toggle de Entrega (Envío vs Retiro)
  const shippingBtn = document.getElementById("delivery-option-shipping");
  const pickupBtn = document.getElementById("delivery-option-pickup");
  const shippingGroup = document.getElementById("shipping-address-group");
  const pickupGroup = document.getElementById("pickup-info-group");

  shippingBtn.addEventListener("click", () => {
    deliveryMethod = "shipping";
    shippingBtn.classList.add("active");
    pickupBtn.classList.remove("active");
    shippingGroup.style.display = "block";
    pickupGroup.style.display = "none";
    updateCartUI();
  });

  pickupBtn.addEventListener("click", () => {
    deliveryMethod = "pickup";
    pickupBtn.classList.add("active");
    shippingBtn.classList.remove("active");
    shippingGroup.style.display = "none";
    pickupGroup.style.display = "block";
    updateCartUI();
  });

  // Toggle de Pago (Efectivo vs Transferencia)
  const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
  const cashBox = document.getElementById("cash-change-box");
  const transferBox = document.getElementById("transfer-info-box");

  paymentRadios.forEach(radio => {
    radio.addEventListener("change", (e) => {
      if (e.target.value === "cash") {
        cashBox.style.display = "block";
        transferBox.style.display = "none";
      } else {
        cashBox.style.display = "none";
        transferBox.style.display = "block";
      }
    });
  });

  // Cálculo en vivo de vuelto
  const cashAmountInput = document.getElementById("cash-amount-input");
  cashAmountInput.addEventListener("input", () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = (deliveryMethod === "shipping" && (STORE_CONFIG.freeDeliveryThreshold === 0 || subtotal < STORE_CONFIG.freeDeliveryThreshold)) ? STORE_CONFIG.deliveryCost : 0;
    recalcCashChange(subtotal + shipping);
  });

  // Botón Copiar Alias
  document.getElementById("copy-alias-btn").addEventListener("click", () => {
    navigator.clipboard.writeText(STORE_CONFIG.bankDetails.alias).then(() => {
      showToast("¡Alias copiado al portapapeles! 📋");
    }).catch(() => {
      showToast("Alias: " + STORE_CONFIG.bankDetails.alias);
    });
  });

  // Botón Enviar Pedido por WhatsApp
  document.getElementById("send-order-btn").addEventListener("click", submitOrderToWhatsApp);
}
