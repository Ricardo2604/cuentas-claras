# Cuentas Claras

App minimalista para llevar las finanzas personales: gastos e ingresos en Bs o USD, tasas BCV y USDT, ahorro, plan de pagos y consejos sobre qué gastos se pueden recortar.

- `app/index.html`: la app completa en un solo archivo.
- `app/manifest.webmanifest`, `app/sw.js`, `app/icons/`: lo que permite instalarla en el teléfono. La caché del `sw.js` se renueva sola en cada publicación.
- `capturas/`: imágenes de apoyo (pasos para Android, etc.).
- Cada cambio en `main` se publica solo en GitHub Pages (`.github/workflows/pages.yml`).

## Diferencias con la versión dentro de Claude

En GitHub Pages la app funciona sola en el navegador:
- Los datos se guardan en el teléfono (almacenamiento del navegador), no en la cuenta de Claude.
- Las tasas BCV/USDT se escriben a mano en Ajustes; no se actualizan solas.
- Leer capturas de Pago Móvil con imagen no está disponible; pegar el texto del SMS sí.
- Exportar a CSV no aparece.
