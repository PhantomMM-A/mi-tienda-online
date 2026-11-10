# 🚀 Nexus Shop - Catálogo Online con GPS, Pedidos por WhatsApp y Panel Dev

Una plataforma web moderna, rápida y adaptable para vender **productos físicos** (tecnología, accesorios, gadgets, moda, lifestyle, etc.) con tráfico directo desde **Instagram, TikTok y WhatsApp**.

---

## ⚡ Novedades Principales

1. **📍 Botón de Ubicación GPS Satelital:**
   - En el checkout, el cliente presiona **"Usar mi GPS"**.
   - El navegador pide permiso de ubicación y obtiene las coordenadas satelitales exactas (`lat, lng`).
   - Autocompleta automáticamente la calle y número por geocodificación inversa.
   - Genera un enlace directo a **Google Maps / Waze** (`https://maps.google.com/?q=lat,lng`) que se incluye en el mensaje de WhatsApp y en el panel administrativo para que el repartidor llegue sin perderse.

2. **📱 Número de WhatsApp Configurable desde la Web:**
   - Podés ingresar tu número de WhatsApp directamente desde una casilla en el **Panel Dev (`admin.html`)** sin tocar código.
   - Los pedidos llegarán automáticamente al número que definas.

3. **⚙️ Panel Dev y Administración (`admin.html`):**
   - **Historial de Pedidos:** Mirá los pedidos que entran con el detalle de artículos, total, cliente, teléfono y botón **"🗺️ Ver en Google Maps"**.
   - **Gestor de Catálogo:** Agregá nuevos productos, cambiales el precio, subí fotos desde tu computadora (o poné links de internet) y eliminá artículos con 1 clic.
   - **Configuración del Negocio:** Modificá el nombre, slogan, costo de envío, envío gratis y datos de transferencia bancaria (Alias/CBU).

4. **📦 Catálogo de Productos Físicos (No comida):**
   - Configurado con productos como Auriculares Hi-Fi con cancelación de ruido, Smartwatches deportivos, Cargadores GaN rápidos, Mochilas antirrobo, etc.
   - Podés cambiarlo a cualquier otro tipo de producto desde el panel.

---

## 💡 Estrategia de Pagos y Facturación (Efectivo vs. Facturación)

### ¿Necesitás un sistema de facturación desde el día 1?
**NO.** Para comenzar a vender por redes sociales, la combinación de **Efectivo contra entrega + Transferencia bancaria (Alias/CBU)** es la mejor opción:
* **0% de comisiones:** No perdés entre 4% y 7% en comisiones de pasarelas de pago.
* **Cero burocracia impositiva:** No necesitás certificados de AFIP ni servidores backend de pago al arrancar.
* **Confianza total del cliente:** El cliente nuevo prefiere pagar al recibir el producto o por transferencia directa.
* **Vuelto exacto:** Si el cliente paga en efectivo, el sistema le pregunta con cuánto va a pagar y calcula el cambio a llevar.

---

## 📂 Estructura del Proyecto

* **`index.html`**: Tienda principal para los clientes (catálogo, carrito, buscador, checkout con GPS y botón de WhatsApp).
* **`admin.html`**: Panel de control para el administrador / dev (pedidos con GPS, número de WhatsApp y gestor de catálogo).
* **`style.css`**: Diseño moderno, responsivo y adaptado para celulares.
* **`app.js`**: Lógica de carrito, cálculo de totales, API de GPS y generador del mensaje de WhatsApp.
* **`config.js`**: Valores iniciales por defecto y sincronización con `localStorage`.

---

## 🚀 Cómo Probarlo en tu Computadora

1. Hacé doble clic en **`index.html`** para ver la tienda de cara al cliente.
2. Hacé doble clic en **`admin.html`** para abrir el panel de control, definir tu número de teléfono y cargar tus productos.

---

## 📦 Subir a GitHub y Publicar en Vercel

Tu proyecto ya tiene Git configurado y enlazado con tu repositorio de GitHub:
`https://github.com/PhantomMM-A/mi-tienda-online.git`

### Paso 1: Subir tus cambios a GitHub
Abrí la terminal de comandos en esta carpeta y ejecutá:

```powershell
cd "C:\Users\Miran\OneDrive\Escritorio\Pagina"
git add .
git commit -m "Catálogo de productos físicos, API GPS satelital y Panel Admin Dev"
git push -u origin main
```

### Paso 2: Publicar GRATIS en Vercel
1. Entrá a [vercel.com](https://vercel.com) e iniciá sesión con tu cuenta de GitHub.
2. Hacé clic en **Add New...** ➔ **Project**.
3. Seleccioná el repositorio **`mi-tienda-online`** y hacé clic en **Import**.
4. Dale a **Deploy** sin cambiar ninguna opción.
5. ¡Listo! Vercel te dará tu link público gratuito con HTTPS como:  
   👉 `https://mi-tienda-online.vercel.app`
