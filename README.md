# 🚀 Tu Tienda Online Express (Catálogo + Pedidos por WhatsApp)

Una tienda web moderna, ultra rápida y pensada específicamente para **tráfico de redes sociales (Instagram, TikTok, WhatsApp)**.

---

## 💡 1. ¿Cómo funciona el negocio y los pagos? (Efectivo vs. Facturación)

### ¿Necesitás un sistema de facturación electrónica desde el día 1?
**La respuesta corta es NO.** Para empezar a vender y validar tu producto, **Efectivo contra entrega + Transferencia bancaria (Alias/CBU)** es la mejor estrategia:

1. **Cero comisiones:** No perdés entre el 4% y 7% que cobran pasarelas automáticas (como Mercado Pago o tarjetas de crédito).
2. **Cero burocracia técnica:** Integrar facturación electrónica directa (como AFIP o similares) requiere certificados digitales fiscales, web services, servidores backend de pago y contadores.
3. **Máxima confianza del cliente:** En compras locales o por delivery, el cliente prefiere pagar cuando ve el producto en su puerta o mediante una transferencia simple sin dejar sus tarjetas en webs que no conoce.
4. **Fricción mínima:** El usuario arma su carrito en 30 segundos, pone su dirección o elige retiro, y con un toque te manda el pedido perfectamente formateado a tu WhatsApp. Vos solo confirmás y despachás.

> **¿Cuándo sumar facturación y pasarela automática?**  
> Cuando el volumen de ventas supere los 20 o 30 pedidos diarios y ya no des abasto atendiendo el WhatsApp manualmente, o si vendés productos a nivel nacional con envíos por correo tradicional.

---

## 🛠️ 2. ¿Cómo personalizar tu tienda?

Todos los datos de tu negocio se cambian en un solo archivo: **`config.js`**.  
Abrilo con cualquier editor (como VS Code, Bloc de notas, etc.):

- **`whatsappNumber`**: Tu número con código de país y de área (Ejemplo Argentina: `5491123456789`).
- **`storeName`**: Nombre de tu tienda o marca.
- **`deliveryCost`**: Costo de envío a domicilio.
- **`freeDeliveryThreshold`**: Monto a partir del cual el envío es gratis (o `0` si cobrás siempre).
- **`bankDetails`**: Tu Alias, CBU y Banco para transferencias.
- **`products`**: La lista de tus artículos con su nombre, precio, descripción, foto y badge ("Más Vendido", "Oferta", etc.).

---

## 🌐 3. ¿Cómo probarlo en tu computadora?

Simplemente hacé doble clic sobre el archivo **`index.html`** y se abrirá en tu navegador favorito (Chrome, Edge, Firefox, Safari).  
¡No requiere instalar nada para funcionar!

---

## 📦 4. Guía Paso a Paso: Subir a GitHub

GitHub es 100% gratuito y mantiene tu código seguro en la nube.

### Paso 1: Crear una cuenta y un repositorio en GitHub
1. Entrá a [github.com](https://github.com) e iniciá sesión (o create una cuenta gratis).
2. Arriba a la derecha, hacé clic en el botón **`+`** y elegí **New repository** (Nuevo repositorio).
3. En **Repository name**, poné un nombre (ej: `mi-tienda`).
4. Dejalo en **Public** y **NO marques** "Add a README file" (porque ya tenemos uno).
5. Hacé clic en el botón verde **Create repository**.
6. GitHub te mostrará una URL tipo: `https://github.com/TU_USUARIO/mi-tienda.git`. Copiala.

### Paso 2: Subir tus archivos desde tu terminal
Abrí la consola (PowerShell o Git Bash) en la carpeta de este proyecto y ejecutá:

```bash
git init
git add .
git commit -m "Mi primera tienda online"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/mi-tienda.git
git push -u origin main
```
*(Reemplazá `TU_USUARIO/mi-tienda.git` con tu link real de GitHub)*.

---

## ⚡ 5. Publicar GRATIS en Vercel (Dominio y Hosting)

Vercel es gratuito, súper veloz y te otorga un dominio con HTTPS (candadito verde) de por vida:

1. Entrá a [vercel.com](https://vercel.com) y hacé clic en **Sign Up**.
2. Elegí **Continue with GitHub** (se conecta en un solo clic).
3. En el panel principal de Vercel, hacé clic en **Add New...** -> **Project**.
4. Vas a ver tu repositorio de GitHub (`mi-tienda`). Hacé clic en **Import**.
5. Dejá todas las opciones predeterminadas tal como están y hacé clic en **Deploy**.
6. En menos de 30 segundos, Vercel te dará un link público gratuito como:  
   👉 **`https://mi-tienda.vercel.app`**

### ¿Y si quiero mi propio dominio (ej: `.com` o `.com.ar`)?
Vercel te permite conectar tu propio dominio de forma 100% gratuita:
1. En Vercel, vas a **Settings** -> **Domains**.
2. Escribís tu dominio (ej: `mitienda.com`).
3. Te indicará los 2 DNS o registros CNAME que debés colocar donde compraste el dominio (ej: Nic.ar, DonWeb, Namecheap, etc.) y listo.

---

## 📱 6. Cómo usarlo en Redes Sociales (Instagram / TikTok / WhatsApp)

1. **Instagram Bio:** Poné tu link de Vercel (`https://tu-tienda.vercel.app`) en el campo "Sitio web" del perfil de Instagram.
2. **Historias de Instagram:** Usá el sticker de **"Enlace"** con la URL directa. Al hacer clic, el cliente entra directamente a tu tienda dentro de Instagram con carga ultrarrápida.
3. **TikTok Bio:** Agregá el enlace en tu perfil de TikTok.
4. **Publicidad / Ads:** Si hacés anuncios pagos en Instagram/Facebook, podés usar esta web como destino final.
