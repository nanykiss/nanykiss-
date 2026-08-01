// /core/config.js

export const CONFIG = {
  // 🔗 Tu enlace de Google Apps Script integrado:
  SHEETS_API_URL: 'https://script.google.com/macros/s/AKfycbx8jebucDh_UGr-k1t0I2uA7USJBwdmsKhC9ziEHD5HPDP9gyQDMgit5R7n2r6EDW2T/exec',

  // Reglas de Negocio NSD (Ventas por Catálogo)
  CLIENTES: {
    DIAS_INACTIVO: 45 // Pasa a semáforo amarillo tras 45 días sin compra
  },

  FIDELIZACION: {
    COMPRAS_PARA_REGALO: 5 // La 5ª compra reserva el regalo, la 6ª lo entrega
  },

  // Parámetros para el Módulo de Resumen/Finanzas
  FINANZAS: {
    MARGEN_GANANCIA_DEFAULT: 0.40, // 40% de ganancia sobre el precio de venta (Ajustable según el catálogo)
    META_VENTA_MENSUAL: 15000      // Meta base para los gráficos de avance (opcional)
  }
};