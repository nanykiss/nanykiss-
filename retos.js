// CONFIGURACIÓN: Enlace a tu Google Apps Script
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzb7rdtOS0v4NVwAiPC5teM64CDYv04hbsDOJmbD5DVNYXdNA7Caq7uQBkBtUKKi5ET/exec";

// Cargar catálogo de clientas al abrir la pantalla de retos
document.addEventListener('DOMContentLoaded', () => {
  cargarClientasRetos();
});

async function cargarClientasRetos() {
  const select = document.getElementById('mov-clienta');
  if (!select) return;
  select.innerHTML = '<option>Cargando directorio...</option>';
  
  try {
    const response = await fetch(`${WEB_APP_URL}?action=getData`);
    const data = await response.json();
    if (data.status === 'success') {
      select.innerHTML = '<option value="">-- Selecciona una Clienta --</option>';
      data.clientas.forEach(c => {
        const option = document.createElement('option');
        option.value = c.Nombre || c.nombre;
        option.textContent = c.Nombre || c.nombre;
        option.dataset.telefono = c.Teléfono || c.telefono || c.Celular || c.celular || '';
        select.appendChild(option);
      });
    }
  } catch (error) {
    console.error(error);
    select.innerHTML = '<option value="">Error al cargar directorio</option>';
  }
}

// PROCESAR FORMULARIO Y DISPARAR MENSAJES DE WHATSAPP AUTOMÁTICOS
function procesarMovimientoFidelidad(event) {
  event.preventDefault();
  
  const selectClienta = document.getElementById('mov-clienta');
  const nombre = selectClienta.value;
  const telefono = selectClienta.options[selectClienta.selectedIndex].dataset.telefono;
  const tipoMovimiento = document.getElementById('mov-tipo').value;
  const monto = document.getElementById('mov-monto').value;
  const puntos = document.getElementById('mov-puntos').value || "0";
  
  if (!nombre) {
    alert("Por favor, selecciona una clienta primero.");
    return;
  }

  // Recuperar los datos bancarios desde Ajustes en tiempo real
  const miTarjeta = localStorage.getItem('nk_tarjeta') || '[Completar Tarjeta en Ajustes]';
  const miTitular = localStorage.getItem('nk_titular') || '[Completar Titular en Ajustes]';
  
  let textoWA = "";
  
  // DICCIONARIO DE PLANTILLAS INTELIGENTES SEGÚN LA ACCIÓN SELECCIONADA
  switch (tipoMovimiento) {
    case "Venta Directa":
    case "Adeudo":
      // REGISTRO DE VENTA, TARJETA DE FIDELIDAD E INVITACIÓN AL RETO
      textoWA = `¡Hola ${nombre}! Te comparto que registré tu nueva compra por $${monto}. 🛍️ Con esto sumas +${puntos} puntos en tu Tarjeta de Fidelidad de Nany Kiss. ¡Ya estás participando en nuestro reto mensual! Gracias por tu confianza. ✨`;
      break;
      
    case "Abono":
      // ABONO RECIBIDO (Incluye los datos de pago por si los requiere en el futuro)
      textoWA = `¡Hola ${nombre}! Recibí correctamente tu abono de $${monto}. 📝 Tu pago ya quedó registrado en el sistema. Te recuerdo que para siguientes abonos puedes transferir a la tarjeta ${miTarjeta} a nombre de ${miTitular}. ¡Muchas gracias por tu puntualidad! 💕`;
      break;
      
    case "Liquidación":
      // CUENTA LIQUIDADA
      textoWA = `¡Hola ${nombre}! Te escribo para confirmarte que tu cuenta ha quedado totalmente LIQUIDADA con tu último pago de $${monto}. 🎉 Muchísimas gracias por tu constancia y puntualidad. ¡Es un placer atenderte! 🥰`;
      break;
      
    case "Avance Reto":
      // AVANCE DEL RETO
      textoWA = `¡Hola ${nombre}! Te escribo para felicitarte porque vas súper bien en tu Reto Nany Kiss. 🏃‍♀️💨 Ya llevas acumulados ${puntos} puntos en tu tarjeta digital. ¡Estás muy cerca de alcanzar la meta de este mes!`;
      break;
      
    case "Reto Completado":
      // RETO COMPLETADO
      textoWA = `¡Felicidades ${nombre}! 🎉🥳 ¡Has COMPLETADO con éxito tu Reto Nany Kiss de este mes! Lograste acumular todos tus puntos. Gracias por ser una clienta tan increíble, te avisaré pronto los detalles para consentirte. 💖`;
      break;
      
    case "Entrega Premio":
      // ENTREGA DE PREMIO
      textoWA = `¡Hola ${nombre}! Qué alegría entregarte hoy tu premio por haber completado tu Reto Nany Kiss. 🎁✨ Disfrútalo mucho, está hecho con mucho cariño para consentirte. ¡Vamos por el siguiente reto! 😉`;
      break;
      
    case "Recompra":
      // ALERTA DE RECOMPRA
      textoWA = `¡Hola ${nombre}! Espero que estés muy bien. 🥰 Te escribo para saludarte y recordarte que ya salieron las novedades y promociones del nuevo catálogo. ¡Sé que te van a encantar! Avísame si quieres que te envíe el enlace digital. 📖✨`;
      break;
      
    case "Cumpleaños":
      // FELICITACIONES POR CUMPLEAÑOS
      textoWA = `¡Feliz Cumpleaños, ${nombre}! 🎂🎉 De parte de Nany Kiss te deseamos un día espectacular lleno de amor y alegría. Para festejarte como te mereces, tienes un regalo especial o descuento esperándote en tu próximo pedido. ¡Pásala increíble! 🥳🎈`;
      break;
  }
  
  // Construir enlace de WhatsApp y abrirlo
  const urlWA = `https://wa.me/${telefono}?text=${encodeURIComponent(textoWA)}`;
  window.open(urlWA, '_blank');
  
  // Alerta local amigable para Nancy
  alert(`Movimiento de "${tipoMovimiento}" registrado localmente. Se abrirá WhatsApp para notificar a ${nombre}.`);
  document.getElementById('form-retos-fidelidad').reset();
}