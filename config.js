// =============================================================================
// CONFIGURACIÓN DE TU TIENDA ONLINE
// Editá este archivo para cambiar los datos de tu negocio, medios de pago y productos.
// =============================================================================

const STORE_CONFIG = {
  // Datos del Negocio
  storeName: "Mi Tienda Express",
  storeTagline: "Pedí online y recibilo en tu puerta 🚀",
  currency: "$",
  whatsappNumber: "5491123456789", // Formato internacional sin '+' ni espacios (Ej: 54911... para Argentina)
  instagramUser: "mitienda_express", // Tu usuario de Instagram (sin @)
  
  // Opciones de Entrega
  deliveryCost: 1500, // Costo de envío a domicilio
  freeDeliveryThreshold: 20000, // Envío gratis a partir de este monto (0 para desactivar)
  allowPickup: true, // Permitir retiro en el local
  pickupAddress: "Av. Siempre Viva 742 (Centro)", // Dirección de retiro

  // Datos para Transferencia Bancaria
  bankDetails: {
    bank: "Mercado Pago / Banco Galicia",
    alias: "MI.TIENDA.PAGOS",
    cbu: "0000003100010000000000",
    holder: "Tu Nombre o Razón Social"
  },

  // Categorías de Productos
  categories: [
    { id: "all", name: "Todos" },
    { id: "destacados", name: "⭐ Destacados" },
    { id: "combos", name: "🍔 Combos / Promos" },
    { id: "principales", name: "🍕 Principales" },
    { id: "bebidas", name: "🥤 Bebidas" }
  ],

  // Catálogo de Productos
  // Podés agregar, quitar o modificar los productos que quieras
  products: [
    {
      id: "prod-1",
      name: "Combo Mega Burger",
      category: "combos",
      price: 8500,
      description: "Doble carne smasheada, doble cheddar, bacon crocante, salsa especial con papas fritas.",
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80",
      featured: true,
      badge: "Más Vendido"
    },
    {
      id: "prod-2",
      name: "Pizza Napolitana Especial",
      category: "principales",
      price: 9200,
      description: "Masa madre 48hs de fermentación, mozzarella premium, rodajas de tomate fresco, ajo y albahaca.",
      image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=700&q=80",
      featured: true,
      badge: "Oferta"
    },
    {
      id: "prod-3",
      name: "Papas Rústicas con Cheddar y Bacon",
      category: "principales",
      price: 5200,
      description: "Papas rústicas cortadas a mano, bañadas en queso cheddar fundido y panceta crocante.",
      image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=700&q=80",
      featured: false,
      badge: null
    },
    {
      id: "prod-4",
      name: "Gaseosa Línea Coca-Cola 1.5L",
      category: "bebidas",
      price: 2800,
      description: "Bien fría. Variedades: Regular, Zero o Sprite.",
      image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=700&q=80",
      featured: false,
      badge: null
    },
    {
      id: "prod-5",
      name: "Cerveza Artesanal IPA 500ml",
      category: "bebidas",
      price: 3500,
      description: "Lata de cerveza artesanal rubia lupulada con toques cítricos.",
      image: "https://images.unsplash.com/photo-1608270118542-a6f671da2df3?auto=format&fit=crop&w=700&q=80",
      featured: false,
      badge: "Artesanal"
    },
    {
      id: "prod-6",
      name: "Super Combo Pareja",
      category: "combos",
      price: 15500,
      description: "2 Hamburguesas completas + 1 porción grande de papas + 2 bebidas a elección.",
      image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=700&q=80",
      featured: true,
      badge: "Ahorro 20%"
    }
  ]
};
