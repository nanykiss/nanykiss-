// CONFIGURACIÓN: Enlace a tu Google Apps Script
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzb7rdtOS0v4NVwAiPC5teM64CDYv04hbsDOJmbD5DVNYXdNA7Caq7uQBkBtUKKi5ET/exec";

let todasLasClientas = [];
let todosLosMovimientos = [];

// Se ejecuta en cuanto carga la página de Inicio (Clientes)
document.addEventListener('DOMContentLoaded', () => {
  cargarDatosInicio();
});

async function cargarDatosInicio() {
  const contenedorRojos = document.getElementById('lista-clientes-rojos');
  contenedorRojos.innerHTML = '<div style="text-align:center; padding: 20px;"><i class="fa-solid fa-spinner fa-spin"></i> Analizando cuentas pendientes...</div>';
  
  try {
    const response = await fetch(`${WEB_APP_URL}?action=getData`);
    const data = await response.json();
    
    if (data.status === 'success') {
      todasLasClientas = data.clientas;
      todosLosMovimientos = data.movimientos;
      
      procesarCuentasEnRojo();
    } else {
      contenedorRojos.innerHTML = '<p style="color:red; text-align:center;">Error al leer la base de datos.</p>';
    }
  } catch (error) {
    console.error(error);
    contenedorRojos.innerHTML = '<p style="color:red; text-align:center;">Error de conexión. Revisa el script.</p>';
  }
}

function procesarCuentasEnRojo() {
  const contenedorRojos = document.getElementById('lista-clientes-rojos');
  contenedorRojos.innerHTML = ''; // Limpiar el cargando
  
  let balanceClientas = {};
  
  // 1. Calcular el saldo real acumulado y registrar el día del último adeudo
  todosLosMovimientos.forEach(mov => {
    const nombre = mov["Clienta"] || mov["clienta"];
    const tipo = mov["Tipo"] || mov["tipo"];
    const monto = parseFloat(mov["Monto"] || mov["monto"]) || 0;
    const fechaStr = mov["Fecha"] || mov["fecha"];
    
    if (!nombre) return;
    
    if (!balanceClientas[nombre]) {
      balanceClientas[nombre] = { saldo: 0, fechaUltimoAdeudo: 'Fecha no registrada' };
    }
    
    if (tipo === 'Adeudo' || tipo === 'Venta Directa') {
      balanceClientas[nombre].saldo += monto;
      if (tipo === 'Adeudo' && fechaStr) {
        const d = new Date(fechaStr);
        balanceClientas[nombre].fechaUltimoAdeudo = !isNaN(d.getTime()) ? d.toLocaleDateString('es-MX') : fechaStr;
      }
    } else if (tipo === 'Abono' || tipo === 'Liquidación') {
      balanceClientas[nombre].saldo -= monto;
    }
  });
  
  // 2. Mapear teléfonos del directorio
  let directorioTelefonos = {};
  todasLasClientas.forEach(c => {
    const nombre = c["Nombre"] || c["nombre"];
    const tel = c["Teléfono"] || c["telefono"] || c["Celular"] || c["celular"];
    if (nombre && tel) {
      directorioTelefonos[nombre] = tel;
    }
  });
  
  let cuentasRojasContadas = 0;
  
  // 3. Pintar solo a las que deben dinero hoy (Zona Roja)
  for (const nombre in balanceClientas) {
    const info = balanceClientas[nombre];
    
    if (info.saldo > 0) {
      cuentasRojasContadas++;
      
      const telCliente = directorioTelefonos[nombre] || '';
      
      // Recuperar datos dinámicos de Ajustes (si no hay, avisa en el texto)
      const miTarjeta = localStorage.getItem('nk_tarjeta') || '[Completar Tarjeta en Ajustes]';
      const miTitular = localStorage.getItem('nk_titular') || '[Completar Titular en Ajustes]';
      
      // PLANTILLA DE WHATSAPP PARA CUENTAS EN ROJO
      const textoWA = `Hola ${nombre} te escribo porque tienes un saldo pendiente de $${info.saldo} del ${info.fechaUltimoAdeudo}. ¿Podrias apoyarme a liquidarlo por favor ? te dejo mi tarjeta ${miTarjeta} a nombre de ${miTitular}. Quedo atenta a tu comprobante.`;
      
      const urlWA = `https://wa.me/${telCliente}?text=${encodeURIComponent(textoWA)}`;
      
      const item = document.createElement('div');
      item.className = 'cliente-item';
      
      item.innerHTML = `
        <div class="cliente-info">
          <h4>${nombre}</h4>
          <p>Debe: $${info.saldo} <span style="color:#747d8c; font-weight:normal; font-size:0.75rem;">(Desde: ${info.fechaUltimoAdeudo})</span></p>
        </div>
        <button class="btn-cobro" onclick="window.open('${urlWA}', '_blank')">
          <i class="fa-brands fa-whatsapp"></i> Cobrar
        </button>
      `;
      
      contenedorRojos.appendChild(item);
    }
  }
  
  if (cuentasRojasContadas === 0) {
    contenedorRojos.innerHTML = '<p style="text-align: center; color: #2ed573; font-weight: bold; padding: 20px;">¡Excelente! Ninguna clienta está en la zona roja hoy. 🎉</p>';
  }
}

function filtrarClientesAlertas() {
  const filtro = document.getElementById('busquedaCliente').value.toLowerCase();
  const items = document.querySelectorAll('#lista-clientes-rojos .cliente-item');
  
  items.forEach(item => {
    const nombreElemento = item.querySelector('h4').innerText.toLowerCase();
    if (nombreElemento.includes(filtro)) {
      item.style.display = 'flex';
    } else {
      item.style.display = 'none';
    }
  });
}