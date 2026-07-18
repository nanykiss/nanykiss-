// CONFIGURACIÓN: Enlace a tu Google Apps Script
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzb7rdtOS0v4NVwAiPC5teM64CDYv04hbsDOJmbD5DVNYXdNA7Caq7uQBkBtUKKi5ET/exec";

// Cargar los reportes al abrir la pantalla
document.addEventListener('DOMContentLoaded', () => {
  cargarDatosResumen();
});

async function cargarDatosResumen() {
  try {
    const response = await fetch(`${WEB_APP_URL}?action=getData`);
    const data = await response.json();
    
    if (data.status === 'success') {
      generarReporteFinanciero(data.movimientos);
    } else {
      alert("Error al obtener los datos para el resumen.");
    }
  } catch (error) {
    console.error(error);
    alert("Error de conexión al cargar el resumen financiero.");
  }
}

function generarReporteFinanciero(movimientos) {
  let dineroCobrado = 0;
  let dineroPorCobrar = 0;
  let totalPedidos = 0;
  let parcialesActivas = 0;
  let pedidosLiquidados = 0;
  
  // Objeto temporal para calcular el saldo final de cada clienta
  let saldosPorClienta = {};

  movimientos.forEach(mov => {
    const nombre = mov["Clienta"] || mov["clienta"];
    const tipo = mov["Tipo"] || mov["tipo"];
    const monto = parseFloat(mov["Monto"] || mov["monto"]) || 0;

    if (!nombre) return;

    // Inicializar la clienta si no existe en el registro
    if (!saldosPorClienta[nombre]) {
      saldosPorClienta[nombre] = 0;
    }

    // 1. Calcular el flujo de dinero
    if (tipo === 'Venta Directa') {
      dineroCobrado += monto; // Dinero completo que entró de inmediato
      totalPedidos++;
      pedidosLiquidados++;
    } 
    else if (tipo === 'Adeudo') {
      saldosPorClienta[nombre] += monto; // Se va a su cuenta por cobrar
      totalPedidos++;
      parcialesActivas++;
    } 
    else if (tipo === 'Abono') {
      dineroCobrado += monto; // Dinero físico que entra a caja
      saldosPorClienta[nombre] -= monto; // Se resta de lo que debe
    } 
    else if (tipo === 'Liquidación') {
      dineroCobrado += monto; // Último pago recibido
      saldosPorClienta[nombre] -= monto; // Su deuda queda en 0
      parcialesActivas--; // Deja de ser parcialidad activa
      pedidosLiquidados++;
    }
  });

  // 2. Sumar todo el dinero que sigue en la calle (saldos mayores a 0)
  for (const cliente in saldosPorClienta) {
    if (saldosPorClienta[cliente] > 0) {
      dineroPorCobrar += saldosPorClienta[cliente];
    }
  }

  // 3. Pintar los resultados reales en las tarjetas de la pantalla
  document.getElementById('kpi-cobrado').innerText = `$${dineroCobrado.toFixed(2)}`;
  document.getElementById('kpi-por-cobrar').innerText = `$${dineroPorCobrar.toFixed(2)}`;
  document.getElementById('total-pedidos').innerText = totalPedidos;
  document.getElementById('pedidos-parciales').innerText = parcialesActivas < 0 ? 0 : parcialesActivas;
  document.getElementById('pedidos-liquidados').innerText = pedidosLiquidados;
}