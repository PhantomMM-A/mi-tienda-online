// =============================================================================
// LÓGICA PRINCIPAL (CARRITO, BÚSQUEDA, MAPA INTERACTIVO CON GPS Y WHATSAPP)
// =============================================================================

let storeConfig = getActiveStoreConfig();
let storeProducts = getActiveProducts();

let currentCategory = "all";
let searchQuery = "";
let cart = [];
let deliveryMethod = "shipping"; // 'shipping' o 'pickup'
let modalSelectedProduct = null;
let modalQuantity = 1;

// Variables del Mapa Leaflet y GPS en la Home
let homepageMap = null;
let homepageMarker = null;
let accuracyCircle = null;
let currentGpsData = null; // { lat, lng, accuracy, mapUrl, address }

// Inicialización cuando carga el DOM
document.addEventListener("DOMContentLoaded", () => {
  storeConfig = getActiveStoreConfig();
  storeProducts = getActiveProducts();

  loadCartFromStorage();
  initStoreInfo();
  renderCategories();
  renderProducts();
  setupEventListeners();
  updateCartUI();

  // Inicializar el mapa interactivo principal en la home
  initHomepageMap();
});

// -----------------------------------------------------------------------------
// Inicializar Datos de Tienda
// -----------------------------------------------------------------------------
function initStoreInfo() {
  document.getElementById("brand-name").textContent = storeConfig.storeName;
  document.getElementById("store-tagline").textContent = storeConfig.storeTagline;
  document.getElementById("footer-store-name").textContent = storeConfig.storeName;
  document.title = `${storeConfig.storeName} | Catálogo y Pedidos con GPS`;
  
  if (storeConfig.instagramUser) {
    document.getElementById("instagram-link").href = `https://instagram.com/${storeConfig.instagramUser}`;
  } else {
    document.getElementById("instagram-link").style.display = "none";
  }

  // Datos bancarios
  document.getElementById("bank-name").textContent = storeConfig.bankDetails.bank;
  document.getElementById("bank-alias").textContent = storeConfig.bankDetails.alias;
  document.getElementById("bank-holder").textContent = storeConfig.bankDetails.holder;
  document.getElementById("pickup-address-text").textContent = storeConfig.pickupAddress;
}

// -----------------------------------------------------------------------------
// Formato de Moneda
// -----------------------------------------------------------------------------
function formatPrice(number) {
  return storeConfig.currency + Number(number).toLocaleString("es-AR");
}

// -----------------------------------------------------------------------------
// Renderizado de Categorías
// -----------------------------------------------------------------------------
function renderCategories() {
  const container = document.getElementById("category-pills");
  container.innerHTML = "";

  storeConfig.categories.forEach(cat => {
    const btn = document.createElement("button");
    btn.className = `category-pill ${cat.id === currentCategory ? "active" : ""}`;
    btn.textContent = cat.name;
    btn.onclick = () => selectCategory(cat.id);
    container.appendChild(btn);
  });
}

function selectCategory(catId) {
  currentCategory = catId;
  
  document.querySelectorAll(".category-pill").forEach(pill => {
    const isThis = pill.textContent.trim() === storeConfig.categories.find(c => c.id === catId)?.name;
    pill.classList.toggle("active", isThis);
  });

  const catObj = storeConfig.categories.find(c => c.id === catId);
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

  let filtered = storeProducts;

  if (currentCategory === "destacados") {
    filtered = filtered.filter(p => p.featured);
  } else if (currentCategory !== "all") {
    filtered = filtered.filter(p => p.category === currentCategory);
  }

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
// MAPA INTERACTIVO LEAFLET EN LA PÁGINA PRINCIPAL
// -----------------------------------------------------------------------------
function initHomepageMap() {
  const mapElement = document.getElementById("homepage-map");
  if (!mapElement || typeof L === "undefined") return;

  if (!homepageMap) {
    // Coordenadas por defecto (Buenos Aires / Centro)
    const defaultCoords = [-34.6037, -58.3816];

    homepageMap = L.map('homepage-map', {
      zoomControl: true,
      attributionControl: false
    }).setView(defaultCoords, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(homepageMap);

    // Al hacer clic en cualquier parte del mapa, colocar o mover el pin
    homepageMap.on('click', (e) => {
      setMapPinLocation(e.latlng.lat, e.latlng.lng, true);
    });

    // Escuchar cambios manuales en el input de dirección
    const addrInput = document.getElementById("homepage-address-input");
    if (addrInput) {
      addrInput.addEventListener("input", (e) => {
        syncAddressToAll(e.target.value);
      });
    }
  }
}

function scrollToMapAndActivateGps() {
  const mapSection = document.getElementById("main-map-section");
  if (mapSection) {
    mapSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  requestGpsLocation();
}

function setMapPinLocation(lat, lng, fetchAddress = true, accuracy = null) {
  if (!homepageMap) return;

  const mapUrl = `https://www.google.com/maps?q=${lat},${lng}`;
  currentGpsData = { lat, lng, accuracy, mapUrl };

  // Ocultar overlay
  const overlay = document.getElementById("homepage-map-overlay");
  if (overlay) overlay.style.display = "none";

  // Marcador arrastrable
  if (homepageMarker) {
    homepageMarker.setLatLng([lat, lng]);
  } else {
    homepageMarker = L.marker([lat, lng], { draggable: true }).addTo(homepageMap);
    
    homepageMarker.on('dragend', function (event) {
      const position = event.target.getLatLng();
      setMapPinLocation(position.lat, position.lng, true);
    });
  }

  homepageMarker.bindPopup("<b>📍 Tu punto de entrega</b><br>Arrastrá este pin para afinar la entrada exacta").openPopup();

  // Círculo de precisión
  if (accuracyCircle) {
    homepageMap.removeLayer(accuracyCircle);
    accuracyCircle = null;
  }
  if (accuracy && accuracy < 500) {
    accuracyCircle = L.circle([lat, lng], {
      color: '#10b981',
      fillColor: '#34d399',
      fillOpacity: 0.18,
      radius: accuracy
    }).addTo(homepageMap);
  }

  // Centrar con animación
  homepageMap.setView([lat, lng], 17);

  // Actualizar estado en pantalla
  const statusBox = document.getElementById("homepage-gps-status");
  statusBox.className = "homepage-gps-status";
  statusBox.style.display = "block";
  statusBox.innerHTML = `
    ✅ <b>Punto fijado en el mapa</b> (${lat.toFixed(5)}, ${lng.toFixed(5)})
    ${accuracy ? `• Margen satelital: ~${accuracy}m` : ''}<br>
    <small>💡 Podés <b>arrastrar el pin</b> o hacer clic en el mapa para marcar la puerta exacta.</small>
  `;

  // Geocodificación inversa
  if (fetchAddress) {
    reverseGeocode(lat, lng);
  }
}

async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
      headers: { 'Accept-Language': 'es' }
    });
    const data = await res.json();
    if (data && data.address) {
      const street = data.address.road || data.address.pedestrian || "";
      const number = data.address.house_number || "";
      const neighbourhood = data.address.suburb || data.address.neighbourhood || data.address.city_district || "";
      const city = data.address.city || data.address.town || "";

      let formatted = [street, number].filter(Boolean).join(" ");
      if (neighbourhood) formatted += `, ${neighbourhood}`;
      if (city) formatted += ` (${city})`;

      if (formatted.trim() !== "") {
        syncAddressToAll(formatted);
        if (currentGpsData) currentGpsData.address = formatted;
      }
    }
  } catch (err) {
    console.warn("Geocodificación inversa no completada:", err);
  }
}

function syncAddressToAll(addressText) {
  const topbar = document.getElementById("topbar-address-text");
  const homeInput = document.getElementById("homepage-address-input");
  const drawerInput = document.getElementById("customer-address");
  const drawerIndicator = document.getElementById("drawer-gps-status-text");

  if (topbar) topbar.textContent = addressText || "Ubicación fijada en el mapa";
  if (homeInput && homeInput.value !== addressText) homeInput.value = addressText;
  if (drawerInput && drawerInput.value !== addressText) drawerInput.value = addressText;
  if (drawerIndicator) drawerIndicator.textContent = `📍 GPS sincronizado: ${addressText.substring(0, 30)}...`;
}

// Función para activar el GPS satelital del navegador
function requestGpsLocation() {
  const activateBtn = document.getElementById("homepage-activate-gps-btn");
  const gpsBtnLabel = document.getElementById("homepage-gps-label");
  const statusBox = document.getElementById("homepage-gps-status");

  if (!navigator.geolocation) {
    statusBox.textContent = "Tu navegador no soporta geolocalización GPS.";
    statusBox.className = "homepage-gps-status error";
    statusBox.style.display = "block";
    return;
  }

  if (activateBtn) activateBtn.classList.add("loading");
  if (gpsBtnLabel) gpsBtnLabel.textContent = "🛰️ Conectando GPS...";
  
  statusBox.textContent = "🛰️ Conectando con satélites GPS... Por favor aceptá el permiso de ubicación en tu navegador.";
  statusBox.className = "homepage-gps-status";
  statusBox.style.display = "block";

  initHomepageMap();

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const accuracy = Math.round(position.coords.accuracy);

      if (activateBtn) activateBtn.classList.remove("loading");
      if (gpsBtnLabel) gpsBtnLabel.textContent = "✓ GPS Activo";

      setMapPinLocation(lat, lng, true, accuracy);
      showToast("📍 ¡GPS activado y ubicado en el mapa!");
    },
    (error) => {
      if (activateBtn) activateBtn.classList.remove("loading");
      if (gpsBtnLabel) gpsBtnLabel.textContent = "🎯 Activar mi GPS ahora";
      statusBox.className = "homepage-gps-status error";

      switch (error.code) {
        case error.PERMISSION_DENIED:
          statusBox.textContent = "⚠️ Permiso de GPS denegado. Podés hacer clic en el mapa para marcar tu casa o escribir la dirección.";
          break;
        case error.POSITION_UNAVAILABLE:
          statusBox.textContent = "⚠️ Señal de GPS no disponible en este momento. Podés marcar tu ubicación haciendo clic en el mapa.";
          break;
        case error.TIMEOUT:
          statusBox.textContent = "⚠️ Tiempo de espera GPS agotado. Intentá de nuevo o tocá en el mapa para marcar.";
          break;
        default:
          statusBox.textContent = "⚠️ Error al activar el GPS.";
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 0
    }
  );
}

// -----------------------------------------------------------------------------
// Modal Detalle de Producto
// -----------------------------------------------------------------------------
function openProductModal(productId) {
  const product = storeProducts.find(p => p.id === productId);
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
  const product = storeProducts.find(p => p.id === productId);
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

  let shippingCost = 0;
  if (deliveryMethod === "shipping") {
    if (storeConfig.freeDeliveryThreshold > 0 && subtotal >= storeConfig.freeDeliveryThreshold) {
      shippingCost = 0;
    } else {
      shippingCost = storeConfig.deliveryCost;
    }
  }

  const finalTotal = subtotal + shippingCost;

  document.getElementById("cart-count-badge").textContent = totalCount;
  document.getElementById("drawer-item-count").textContent = `${totalCount} item${totalCount === 1 ? '' : 's'}`;
  document.getElementById("floating-cart-count").textContent = `${totalCount} producto${totalCount === 1 ? '' : 's'}`;
  document.getElementById("floating-cart-total").textContent = formatPrice(finalTotal);

  const floatingBar = document.getElementById("floating-cart-bar");
  if (totalCount > 0) {
    floatingBar.style.display = "block";
  } else {
    floatingBar.style.display = "none";
  }

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

  document.getElementById("summary-subtotal").textContent = formatPrice(subtotal);
  
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
  document.body.style.overflow = "hidden";
}

function closeCartDrawer() {
  document.getElementById("cart-drawer").classList.remove("open");
  document.getElementById("cart-drawer-overlay").style.display = "none";
  document.body.style.overflow = "";
}

// -----------------------------------------------------------------------------
// Guardar Pedido en Historial Local
// -----------------------------------------------------------------------------
function saveOrderToHistory(orderData) {
  try {
    const existingOrders = JSON.parse(localStorage.getItem("tienda_orders") || "[]");
    existingOrders.unshift(orderData);
    localStorage.setItem("tienda_orders", JSON.stringify(existingOrders));
  } catch (e) {
    console.error("Error al guardar pedido en historial:", e);
  }
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

  if (deliveryMethod === "shipping" && !address && !currentGpsData) {
    alert("Por favor marcá tu ubicación en el mapa o escribí tu dirección.");
    return;
  }

  const paymentMethodEl = document.querySelector('input[name="paymentMethod"]:checked');
  const paymentMethod = paymentMethodEl ? paymentMethodEl.value : "cash";

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  let shippingCost = 0;
  if (deliveryMethod === "shipping") {
    shippingCost = (storeConfig.freeDeliveryThreshold > 0 && subtotal >= storeConfig.freeDeliveryThreshold) ? 0 : storeConfig.deliveryCost;
  }
  const total = subtotal + shippingCost;

  let cashNote = "";
  let cashAmount = 0;
  let cashChange = 0;
  if (paymentMethod === "cash") {
    cashAmount = Number(document.getElementById("cash-amount-input").value);
    if (cashAmount > 0) {
      if (cashAmount < total) {
        alert(`El monto en efectivo ingresado ($${cashAmount.toLocaleString('es-AR')}) es menor al total ($${total.toLocaleString('es-AR')}).`);
        return;
      }
      cashChange = cashAmount - total;
      cashNote = ` (Paga con: $${cashAmount.toLocaleString('es-AR')} | Vuelto: $${cashChange.toLocaleString('es-AR')})`;
    } else {
      cashNote = " (Abona monto exacto o coordinar cambio)";
    }
  }

  const orderId = Math.floor(1000 + Math.random() * 9000);
  const now = new Date();
  const dateFormatted = now.toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" });

  const orderRecord = {
    id: orderId,
    date: dateFormatted,
    timestamp: now.getTime(),
    status: "Pendiente",
    customer: {
      name,
      phone,
      deliveryMethod,
      address: deliveryMethod === "shipping" ? (address || "Ubicación fijada en mapa GPS") : storeConfig.pickupAddress,
      notes: notes || "Sin aclaraciones",
      gps: currentGpsData ? {
        lat: currentGpsData.lat,
        lng: currentGpsData.lng,
        accuracy: currentGpsData.accuracy,
        mapUrl: currentGpsData.mapUrl
      } : null
    },
    items: [...cart],
    subtotal,
    shippingCost,
    total,
    paymentMethod,
    cashAmount,
    cashChange
  };

  saveOrderToHistory(orderRecord);

  let msg = `🛍️ *NUEVO PEDIDO #${orderId}*\n`;
  msg += `--------------------------------\n`;
  msg += `👤 *Cliente:* ${name}\n`;
  msg += `📱 *Teléfono:* ${phone}\n`;
  
  if (deliveryMethod === "shipping") {
    msg += `🛵 *Entrega:* A domicilio\n`;
    msg += `📍 *Dirección:* ${address || "Ver enlace en mapa GPS abajo"}\n`;
    if (currentGpsData) {
      msg += `🗺️ *Ubicación GPS en vivo:* ${currentGpsData.mapUrl}\n`;
    }
  } else {
    msg += `🏬 *Entrega:* Retiro en sucursal (${storeConfig.pickupAddress})\n`;
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
    msg += `💳 *Forma de Pago:* Transferencia Bancaria (Adjunto comprobante)\n`;
  }

  msg += `\n¡Hola! Acabo de hacer este pedido con ubicación GPS desde la tienda. ¿Me confirman la recepción? ¡Gracias!`;

  cart = [];
  saveCartToStorage();
  updateCartUI();
  closeCartDrawer();

  const encodedMsg = encodeURIComponent(msg);
  const targetPhone = storeConfig.whatsappNumber || "5491123456789";
  const whatsappUrl = `https://wa.me/${targetPhone}?text=${encodedMsg}`;

  window.open(whatsappUrl, "_blank");
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
// Event Listeners y Handlers
// -----------------------------------------------------------------------------
function setupEventListeners() {
  document.getElementById("cart-btn").addEventListener("click", openCartDrawer);
  document.getElementById("floating-cart-btn").addEventListener("click", openCartDrawer);
  document.getElementById("close-cart-btn").addEventListener("click", closeCartDrawer);
  document.getElementById("cart-drawer-overlay").addEventListener("click", closeCartDrawer);
  
  const browseBtn = document.getElementById("browse-menu-btn");
  if (browseBtn) {
    browseBtn.addEventListener("click", closeCartDrawer);
  }

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
    shippingGroup.style.display = "flex";
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
    const shipping = (deliveryMethod === "shipping" && (storeConfig.freeDeliveryThreshold === 0 || subtotal < storeConfig.freeDeliveryThreshold)) ? storeConfig.deliveryCost : 0;
    recalcCashChange(subtotal + shipping);
  });

  // Botón Copiar Alias
  document.getElementById("copy-alias-btn").addEventListener("click", () => {
    navigator.clipboard.writeText(storeConfig.bankDetails.alias).then(() => {
      showToast("¡Alias copiado al portapapeles! 📋");
    }).catch(() => {
      showToast("Alias: " + storeConfig.bankDetails.alias);
    });
  });

  // Botón Enviar Pedido por WhatsApp
  document.getElementById("send-order-btn").addEventListener("click", submitOrderToWhatsApp);
}
