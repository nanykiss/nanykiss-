/**
 * 🎀 NANY KISS CRM - DASHBOARD CONTROLLER (index.js)
 * Cumple con el Principio de Responsabilidad Única y separación del Core.
 */

// ESTADO LOCAL DE NAVEGACIÓN
let historialNavegacion = ['dashboard'];
let filtroActual = null;

// ELEMENTOS DEL DOM
const vistaDashboard = document.getElementById('vista-dashboard');
const vistaFiltrada = document.getElementById('vista-filtrada');
const vistaFichaCliente = document.getElementById('vista-ficha-cliente');

const listaClientesGeneral = document.getElementById('lista-clientes-general');
const listaClientesFiltrados = document.getElementById('lista-clientes-filtrados');
const retosListaContainer = document.getElementById('retos-lista');
const inputBusqueda = document.getElementById('input-busqueda');

// INICIALIZAR DASHBOARD AL CARGAR LA APLICACIÓN
document.addEventListener('DOMContentLoaded', () => {
  inicializarDashboard();
  configurarEventos();
});

function inicializarDashboard() {
  // Integración con el Core (actualmente usa funciones Mock)
  const clientes = mockObtenerClientes(); // Reemplazar por Core.obtenerClientes()
  const retos = mockObtenerRetos();       // Reemplazar por Core.obtenerRetos()

  actualizarContadoresKPI(clientes);
  renderizarRetos(retos);
  renderizarClientes(clientes, listaClientesGeneral);
}

// 🎯 EVENTOS DE NAVEGACIÓN Y BÚSQUEDA
function configurarEventos() {
  // 1. Clic en Tarjetas KPI
  document.querySelectorAll('.kpi-card').forEach(card => {
    card.addEventListener('click', () => {
      filtroActual = card.getAttribute('data-filtro');
      abrirVistaFiltrada(filtroActual);
    });
  });

  // 2. Botones Regresar (con verificación de existencia)
  const btnRegresarDashboard = document.getElementById('btn-regresar-dashboard');
  const btnRegresarFiltrada = document.getElementById('btn-regresar-filtrada');

  if (btnRegresarDashboard) btnRegresarDashboard.addEventListener('click', regresarNavegacion);
  if (btnRegresarFiltrada) btnRegresarFiltrada.addEventListener('click', regresarNavegacion);

  // 3. Búsqueda Instantánea por Nombre, Marca o Producto
  inputBusqueda.addEventListener('input', (e) => {
    const termino = e.target.value.toLowerCase().trim();
    const clientes = mockObtenerClientes();
    
    const filtrados = clientes.filter(c => 
      c.nombre.toLowerCase().includes(termino) ||
      c.marcaHabitual.toLowerCase().includes(termino) ||
      c.ultimoProducto.toLowerCase().includes(termino)
    );

    renderizarClientes(filtrados, listaClientesGeneral);
  });
}

// 🔀 NAVEGACIÓN CONTROLADA
function abrirVistaFiltrada(tipoFiltro) {
  const clientes = mockObtenerClientes();
  const clientesFiltrados = aplicarFiltro(clientes, tipoFiltro);
  
  document.getElementById('titulo-vista-filtrada').innerText = obtenerTituloFiltro(tipoFiltro);
  renderizarClientes(clientesFiltrados, listaClientesFiltrados);

  cambiarVista(vistaFiltrada);
  historialNavegacion.push('filtrada');
}

function abrirFichaCliente(idCliente) {
  // Carga la ficha reutilizable en el contenedor
  const contenedorFicha = document.getElementById('contenedor-ficha-cliente');
  if (contenedorFicha) {
    contenedorFicha.innerHTML = `<p style="padding:20px; text-align:center;">Cargando ficha de la clienta ${idCliente}...</p>`;
  }
  
  cambiarVista(vistaFichaCliente);
  historialNavegacion.push('ficha');
}

function regresarNavegacion() {
  if (historialNavegacion.length > 1) {
    historialNavegacion.pop();
  }

  const vistaAnterior = historialNavegacion[historialNavegacion.length - 1] || 'dashboard';

  if (vistaAnterior === 'filtrada') {
    cambiarVista(vistaFiltrada);
  } else {
    cambiarVista(vistaDashboard);
  }
}

function cambiarVista(vistaObjetivo) {
  [vistaDashboard, vistaFiltrada, vistaFichaCliente].forEach(v => {
    if (v) {
      v.classList.remove('active');
      v.classList.add('hidden');
    }
  });

  if (vistaObjetivo) {
    vistaObjetivo.classList.remove('hidden');
    vistaObjetivo.classList.add('active');
  }
}

// 🧩 REUTILIZACIÓN DEL COMPONENTE TARJETA DE CLIENTE
function renderizarClientes(lista, contenedor) {
  if (!contenedor) return;
  contenedor.innerHTML = '';

  if (lista.length === 0) {
    contenedor.innerHTML = '<p style="text-align:center; color:#888; padding:20px;">No se encontraron clientes.</p>';
    return;
  }

  lista.forEach(cliente => {
    const card = document.createElement('article');
    card.className = 'cliente-card';
    card.addEventListener('click', () => abrirFichaCliente(cliente.id));

    card.innerHTML = `
      <div class="cliente-info">
        <h3>${cliente.nombre}</h3>
        <p>Última compra: ${cliente.ultimoProducto} (${cliente.marcaHabitual})</p>
        <p style="font-size:0.75rem; color:#888;">${cliente.detalleEstado}</p>
      </div>
      <div class="status-bars">
        <div class="status-bar ${cliente.colorSemaforo}"></div>
        <div class="status-bar habit-bar ${cliente.habitoCompra}"></div>
      </div>
    `;

    contenedor.appendChild(card);
  });
}

// 🏆 RENDERIZAR RETOS ACTIVOS
function renderizarRetos(retos) {
  if (!retosListaContainer) return;
  retosListaContainer.innerHTML = '';

  retos.forEach(reto => {
    const card = document.createElement('div');
    card.className = 'reto-card';
    card.addEventListener('click', () => {
      window.location.href = 'retos.html';
    });
    
    card.innerHTML = `
      <div class="reto-header">
        <span>🏆 ${reto.nombre}</span>
        <span>${reto.avance}%</span>
      </div>
      <div class="reto-meta">
        <span>👥 ${reto.participantes} participantes</span>
        <span>⏳ ${reto.diasRestantes} días restantes</span>
      </div>
    `;
    retosListaContainer.appendChild(card);
  });
}

// 📊 MOCK DATA Y FILTROS
function mockObtenerClientes() {
  return [
    { id: 'CLI-01', nombre: 'Fabiana', ultimoProducto: 'Café de Olla', marcaHabitual: 'Farmasi', colorSemaforo: 'red', habitoCompra: 'parcialidades', detalleEstado: 'Debe $125.00 - Vencido hace 3 días' },
    { id: 'CLI-02', nombre: 'Erika', ultimoProducto: 'Jabón Caléndula', marcaHabitual: 'Farmasi', colorSemaforo: 'yellow', habitoCompra: 'contado', detalleEstado: '48 días sin comprar' },
    { id: 'CLI-03', nombre: 'Sara', ultimoProducto: 'Aceite de Árbol', marcaHabitual: 'Terramar', colorSemaforo: 'green', habitoCompra: 'contado', detalleEstado: 'Al corriente' }
  ];
}

function mockObtenerRetos() {
  return [
    { nombre: 'Reto Labiales Verano', participantes: 12, diasRestantes: 5, avance: 75 }
  ];
}

function actualizarContadoresKPI(clientes) {
  const elemCobranza = document.getElementById('count-cobranza');
  const elemRecompra = document.getElementById('count-recompra');
  const elemRegalos = document.getElementById('count-regalos');
  const elemCumple = document.getElementById('count-cumpleanos');
  const elemAlCorriente = document.getElementById('count-al-corriente');

  if (elemCobranza) elemCobranza.innerText = clientes.filter(c => c.colorSemaforo === 'red').length;
  if (elemRecompra) elemRecompra.innerText = clientes.filter(c => c.colorSemaforo === 'yellow').length;
  if (elemRegalos) elemRegalos.innerText = 0;
  if (elemCumple) elemCumple.innerText = 0;
  if (elemAlCorriente) elemAlCorriente.innerText = clientes.filter(c => c.colorSemaforo === 'green').length;
}

function aplicarFiltro(clientes, filtro) {
  if (filtro === 'cobranza') return clientes.filter(c => c.colorSemaforo === 'red');
  if (filtro === 'recompra') return clientes.filter(c => c.colorSemaforo === 'yellow');
  if (filtro === 'al-corriente') return clientes.filter(c => c.colorSemaforo === 'green');
  return clientes;
}

function obtenerTituloFiltro(filtro) {
  const titulos = {
    'cobranza': '🔴 Clientes por Cobrar',
    'recompra': '🟡 Clientes para Recompra',
    'regalos': '🎁 Regalos Pendientes',
    'cumpleanos': '🎂 Cumpleaños del Mes',
    'al-corriente': '🟢 Clientes al Corriente'
  };
  return titulos[filtro] || 'Lista Filtrada';
}