// CONFIGURACIÓN: Enlace a tu Google Apps Script
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzb7rdtOS0v4NVwAiPC5teM64CDYv04hbsDOJmbD5DVNYXdNA7Caq7uQBkBtUKKi5ET/exec";

let todasLasClientas = [];
let todosLosMovimientos = [];

// Cargar los datos en cuanto se abre la pantalla de la Agenda
document.addEventListener('DOMContentLoaded', () => {
  cargarDatosAgenda();
});

async function cargarDatosAgenda() {
  const contenedorApartados = document.getElementById('lista-layaway');
  contenedorApartados.innerHTML = '<div style="text-align:center;"><i class="fa-solid fa-spinner fa-spin"></i> Leyendo plazos en Google Sheets...</div>';
  
  try {
    const response = await fetch(`${WEB_APP_URL}?action=getData`);
    const data = await response.json();
    
    if (data.status === 'success') {
      todasLasClientas = data.clientas;
      todosLosMovimientos = data.movimientos;
      
      calcularFechasDePago();
    } else {
      contenedorApartados.innerHTML = '<p style="color:red; text-align:center;">Error al obtener información.</p>';
    }
  } catch (error) {
    console.error(error);
    contenedorApartados.innerHTML = '<p style="color:red; text-align:center;">Error de conexión local.</p>';
  }
}

function calcularFechasDePago() {
  const contenedorApartados = document.getElementById('lista-layaway');
  contenedorApartados.innerHTML = ''; // Limpiar el texto de carga
  
  let estadoClientas = {};
  
  todosLosMovimientos.forEach(mov => {
    const nombre = mov["Clienta"] || mov["clienta"];
    const tipo = mov["Tipo"] || mov["tipo"];
    const monto = parseFloat(mov["Monto"] || mov["monto"]) || 0;
    const fechaStr = mov["Fecha"] || mov["fecha"];
    const frecuencia = mov["Frecuencia"] || mov["frecuencia"] || 'Quincenal';
    
    if (!nombre) return;
    
    if (!estadoClientas[nombre]) {
      estadoClientas[nombre] = { saldo: 0, fechaUltimoAdeudo: null, frecuencia: 'Quincenal' };
    }
    
    if (tipo === 'Adeudo' || tipo === 'Venta Directa') {
      estadoClientas[nombre].saldo += monto;
      if (tipo === 'Adeudo' && fechaStr) {
        estadoClientas[nombre].fechaUltimoAdeudo = new Date(fechaStr);
        estadoClientas[nombre].frecuencia = frecuencia;
      }
    } else if (tipo === 'Abono' || tipo === 'Liquidación') {
      estadoClientas[nombre].saldo -= monto;
    }
  });
  
  let apartadosActivos = 0;
  const hoy = new Date();
  
  let directorioTelefonos = {};
  todasLasClientas.forEach(c => {
    const nombre = c["Nombre"] || c["nombre"];
    const tel = c["Teléfono"] || c["telefono"] || c["Celular"] || c["celular"];
    if (nombre && tel) {
      directorioTelefonos[nombre] = tel;
    }
  });

  for (const nombre in estadoClientas) {
    const info = estadoClientas[nombre];
    
    if (info.saldo > 0 && info.fechaUltimoAdeudo) {
      apartadosActivos++;
      
      const diferenciaTiempo = hoy.getTime() - info.fechaUltimoAdeudo.getTime();
      const diasPasados = Math.floor(diferenciaTiempo / (1000 * 60 * 60 * 24));
      const diasLimite = (info.frecuencia === 'Semanal') ? 7 : 15;
      
      let estiloClase = 'status-seguro';
      let mensajeTiempo = `Día ${diasPasados} de ${diasLimite} (A tiempo)`;
      
      if (diasPasados >= diasLimite) {
        styleClase = 'status-critico';
        mensajeTiempo = `¡VENCIDO! (Lleva ${diasPasados} días sin abonar)`;
      } else if (diasPasados >= (diasLimite - 2)) {
        estiloClase = 'status-limite';
        mensajeTiempo = `Próximo a vencer (Día ${diasPasados} de ${diasLimite})`;
      }
      
      const telCliente = directorioTelefonos[nombre] || '';
      
      // Recuperar datos dinámicos de Ajustes (si no hay, avisa en el texto)
      const miTarjeta = localStorage.getItem('nk_tarjeta') || '[Completar Tarjeta en Ajustes]';
      const miTitular = localStorage.getItem('nk_titular') || '[Completar Titular en Ajustes]';
      
      // PLANTILLA DE WHATSAPP PARA ABONOS RECURRENTES
      const textoWA = `Hola ${nombre} te escribo para recordarte tu abono de $${info.saldo} que te toca el dia de hoy. Puedes realizarlo por transferencia (Tarjeta: ${miTarjeta}) a nombre de ${miTitular}. Te agradezco tu puntualidad. Saludos Nancy`;
      
      const urlWA = `https://wa.me/${telCliente}?text=${encodeURIComponent(textoWA)}`;
      
      const item = document.createElement('div');
      item.className = 'cliente-item';
      item.style.flexDirection = 'column';
      item.style.alignItems = 'flex-start';
      item.style.gap = '8px';
      
      item.innerHTML = `
        <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
          <h4>${nombre}</h4>
          <button class="btn-cobro" onclick="window.open('${urlWA}', '_blank')">
            <i class="fa-brands fa-whatsapp"></i> Recordar
          </button>
        </div>
        <p style="margin: 0; color:#57606f; font-size:0.9rem;">Saldo Pendiente: <strong>$${info.saldo}</strong></p>
        <div class="alerta-tiempo ${estiloClase}">
          <i class="fa-solid fa-hourglass-half"></i> ${mensajeTiempo}
        </div>
      `;
      
      contenedorApartados.appendChild(item);
    }
  }
  
  if (apartadosActivos === 0) {
    contenedorApartados.innerHTML = '<p style="text-align: center; color: #2ed573; font-weight: bold; padding: 20px;">¡Todo al día! No hay cobros pendientes de parcialidades para hoy. 🎉</p>';
  }
  
  document.getElementById('lista-citas-calendario').innerHTML = '<p style="text-align: center; color: #747d8c; padding: 10px;">No hay entregas de catálogos o pedidos agendados para esta semana.</p>';
}