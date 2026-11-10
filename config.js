// =============================================================================
// CONFIGURACIÓN POR DEFECTO DE TU TIENDA ONLINE
// (Nota: Podés editar esto acá o gestionarlo directamente desde el Panel Dev / Admin: admin.html)
// =============================================================================

const DEFAULT_STORE_CONFIG = {
  // Datos del Negocio
  storeName: "Nexus Shop",
  storeTagline: "Tecnología, accesorios y tendencias con entrega por GPS ⚡",
  currency: "$",
  whatsappNumber: "5491123456789", // Número que recibe los pedidos (se cambia desde admin.html)
  instagramUser: "nexus_shop", // Tu usuario de Instagram (sin @)
  
  // Opciones de Entrega
  deliveryCost: 2500, // Costo de envío a domicilio
  freeDeliveryThreshold: 45000, // Envío gratis superando este monto (0 para desactivar)
  allowPickup: true, // Permitir retiro en el local
  pickupAddress: "Av. Corrientes 1450 (Centro)", // Dirección de retiro

  // Datos para Transferencia Bancaria
  bankDetails: {
    bank: "Mercado Pago / Ualá / Santander",
    alias: "NEXUS.SHOP.PAGOS",
    cbu: "0000003100018899220011",
    holder: "Nexus Shop SRL"
  },

  // Categorías de Productos Físicos
  categories: [
    { id: "all", name: "Todos" },
    { id: "destacados", name: "⭐ Destacados" },
    { id: "audio", name: "🎧 Audio & Sonido" },
    { id: "smartwatches", name: "⌚ Smartwatches" },
    { id: "accesorios", name: "🔌 Carga & Accesorios" },
    { id: "lifestyle", name: "🎒 Mochilas & Lifestyle" }
  ],

  // Catálogo Inicial de Productos Físicos
  products: [
    {
      id: "prod-1",
      name: "Auriculares Inalámbricos Pro ANC",
      category: "audio",
      price: 28500,
      description: "Cancelación activa de ruido, Bluetooth 5.3, estuche de carga con hasta 30hs de batería y sonido Hi-Fi.",
      image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=700&q=80",
      featured: true,
      badge: "Más Vendido"
    },
    {
      id: "prod-2",
      name: "Smartwatch Deportivo Ultra Serie 8",
      category: "smartwatches",
      price: 38900,
      description: "Pantalla táctil AMOLED de 2.0'', monitor de ritmo cardíaco, oxígeno en sangre, notificaciones y resistente al agua IP68.",
      image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=700&q=80",
      featured: true,
      badge: "Oferta Flash"
    },
    {
      id: "prod-3",
      name: "Cargador Rápido 65W GaN Triple Puerto",
      category: "accesorios",
      price: 18400,
      description: "Tecnología GaN ultra compacta, 2 puertos USB-C y 1 USB-A. Carga notebooks, tablets y celulares a máxima velocidad.",
      image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=700&q=80",
      featured: false,
      badge: "Novedad"
    },
    {
      id: "prod-4",
      name: "Mochila Urbana Antirrobo Impermeable",
      category: "lifestyle",
      price: 34000,
      description: "Compartimiento acolchado para notebook de hasta 15.6'', puerto USB exterior, cierres ocultos y tela repelente al agua.",
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=700&q=80",
      featured: true,
      badge: "Top Calidad"
    },
    {
      id: "prod-5",
      name: "Parlante Portátil Bluetooth Waterproof",
      category: "audio",
      price: 22800,
      description: "Sonido 360° con graves potentes, protección IPX7 contra agua, luces RGB al ritmo de la música y 12hs de batería.",
      image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=700&q=80",
      featured: false,
      badge: null
    },
    {
      id: "prod-6",
      name: "Soporte Magnético Giratorio para Auto",
      category: "accesorios",
      price: 9500,
      description: "Imanes de neodimio de alta potencia, compatible con MagSafe, giro 360° para rejilla de ventilación.",
      image: "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=700&q=80",
      featured: false,
      badge: null
    }
  ]
};

// Limpieza automática de caché antigua de comida si existiera
(function cleanOldFoodCache() {
  try {
    const oldCart = localStorage.getItem("tienda_cart");
    if (oldCart && (oldCart.includes("Burger") || oldCart.includes("Pizza") || oldCart.includes("Papas"))) {
      localStorage.removeItem("tienda_cart");
    }
    const oldProds = localStorage.getItem("nexus_store_products");
    if (oldProds && (oldProds.includes("Burger") || oldProds.includes("Pizza"))) {
      localStorage.removeItem("nexus_store_products");
    }
  } catch (e) {}
})();

// Función para obtener la configuración activa
function getActiveStoreConfig() {
  try {
    const customConfig = localStorage.getItem("nexus_store_config");
    if (customConfig) {
      return { ...DEFAULT_STORE_CONFIG, ...JSON.parse(customConfig) };
    }
  } catch (e) {
    console.error("Error al cargar config personalizada:", e);
  }
  return DEFAULT_STORE_CONFIG;
}

// Función para obtener los productos activos
function getActiveProducts() {
  try {
    const customProducts = localStorage.getItem("nexus_store_products");
    if (customProducts) {
      const parsed = JSON.parse(customProducts);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error("Error al cargar productos personalizados:", e);
  }
  return DEFAULT_STORE_CONFIG.products;
}
