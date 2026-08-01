// /core/comunicacionCore.js
import { Utils } from './utils.js';

export const ComunicacionCore = {

  /**
   * LIMPIA Y FORMATEA EL NÚMERO TELEFÓNICO A FORMATO INTERNACIONAL (MÉXICO +52)
   */
  formatearTelefono(telefono) {
    if (!telefono) return '';
    // Eliminar espacios, guiones y caracteres no numéricos
    let limpio = String(telefono).replace(/\D/g, '');
    
    // Si tiene 10 dígitos (formato estándar MX), agregar la lada de país 52
    if (limpio.length === 10) {
      limpio = `52${limpio}`;
    }
    return limpio;
  },

  /**
   * GENERA EL ENLACE DIRECTO A WHATSAPP WEB / APP CON MENSAJE PRE-CARGADO
   */
  generarEnlaceWhatsApp(telefono, mensaje) {
    const telFormateado = this.formatearTelefono(telefono);
    if (!telFormateado) return null;

    const mensajeTexto = encodeURIComponent(mensaje);
    return `https://api.whatsapp.com/send?phone=${telFormateado}&text=${mensajeTexto}`;
  },

  /**
   * ABRIR DIRECTAMENTE WHATSAPP EN UNA NUEVA PESTAÑA
   */
  abrirWhatsApp(telefono, mensaje) {
    const url = this.generarEnlaceWhatsApp(telefono, mensaje);
    if (url) {
      window.open(url, '_blank');
    } else {
      alert('El número de teléfono no es válido o está incompleto.');
    }
  },

  /**
   * PLANTILLAS DE MENSAJES PERSONALIZADOS
   */
  plantillas: {

    // 🔴 Recordatorio de Cobranza / Saldo Pendiente
    recordatorioPago(cliente, saldo, fechaLimite = null) {
      const fechaTexto = fechaLimite ? ` antes del ${fechaLimite}` : '';
      return `Hola ${cliente} 👋✨ Te saluda tu consejera. Paso a saludarte y recordarte con mucho gusto que tu saldo pendiente actual es de $${saldo}${fechaTexto}. ¡Quedo a tus órdenes si deseas realizar un abono! 💖`;
    },

    // 🟡 Clienta Inactiva (+45 días)
    reactivacion(cliente) {
      return `¡Hola ${cliente}! 👋🌸 Espero que estés teniendo un día excelente. Hace un tiempito que no platicamos y pasaba a contarte que ya tengo disponibles las novedades y lanzamientos de campaña. ¿Te gustaría que te comparta el catálogo digital para que le eches un ojito? 😉✨`;
    },

    // 🟢 Confirmación de Agradecimiento por Compra
    agradecimientoCompra(cliente, producto) {
      return `¡Muchas gracias por tu compra, ${cliente}! 🛍️✨ Ya tengo registrado tu pedido de ${producto}. ¡Sé que te va a encantar! Cualquier duda me avisas. 🥰`;
    },

    // 💖 Agradecimiento por Abono Recibido
    confirmacionAbono(cliente, montoAbonado, saldoRestante) {
      const textoSaldo = saldoRestante > 0 
        ? `Tu nuevo saldo pendiente es de $${saldoRestante.toFixed(2)}.` 
        : `¡Tu cuenta ha quedado totalmente liquidada! 🎉`;

      return `¡Abono recibido con éxito, ${cliente}! 🧾 Registré tu abono de $${montoAbonado}. ${textoSaldo} ¡Muchas gracias por tu puntualidad! 💕`;
    }

  }

};