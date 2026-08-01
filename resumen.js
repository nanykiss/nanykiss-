/* ==========================================================================
   NANY KISS CRM - MÓDULO RESUMEN & ANÁLISIS DE CAMPAÑA
   ========================================================================== */

// --- 1. CLAVE DE ALMACENAMIENTO Y ESTADO GLOBAL ---
const NK_KEYS = {
    RESUMEN_CAMPANAS: 'nk_campanas_analisis_db',
    CLIENTES: 'nk_clientes_db',
    VENTAS: 'nk_ventas_db',
    INSUMOS: 'nk_insumos_config_db'
};

// Estado interno para la pantalla de Análisis de Campaña
let estadoAnalisis = {
    modo: 'rapido', // 'rapido' | 'completo'
    productos: [],
    insumosDisponibles: [
        { id: 'ins-1', nombre: 'Bolsa de Regalo / Empaque', costo: 5.00 },
        { id: 'ins-2', nombre: 'Muestra de Perfume / Crema', costo: 8.50 },
        { id: 'ins-3', nombre: 'Cinta / Moño Decorativo', costo: 3.00 },
        { id: 'ins-4', nombre: 'Folleto / Catálogo Impreso', costo: 12.00 }
    ],
    insumosSeleccionados: []
};

// --- 2. INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    actualizarMetricasGlobales();
    cargarChecklistCostos();
    inicializarFechas();
    renderizarHistorialMarcas();
});

// --- 3. MÉTRICAS GLOBALES DE LA PANTALLA PRINCIPAL ---
function actualizarMetricasGlobales() {
    const ventas = JSON.parse(localStorage.getItem(NK_KEYS.VENTAS)) || [];
    const clientes = JSON.parse(localStorage.getItem(NK_KEYS.CLIENTES)) || [];
    const campanas = JSON.parse(localStorage.getItem(NK_KEYS.RESUMEN_CAMPANAS)) || [];

    // A) Ventas del Mes
    const ahora = new Date();
    const mesActual = ahora.getMonth();
    const anioActual = meActual = ahora.getFullYear();

    const ventasDelMes = ventas.filter(v => {
        const fechaVenta = new Date(v.fecha);
        return fechaVenta.getMonth() === mesActual && fechaVenta.getFullYear() === anioActual;
    }).reduce((sum, v) => sum + (parseFloat(v.monto) || 0), 0);

    const lblVentasMes = document.getElementById('lbl-ventas-mes');
    if (lblVentasMes) lblVentasMes.textContent = `$${ventasDelMes.toFixed(2)}`;

    // B) Saldo por Cobrar
    const saldoTotal = clientes.reduce((sum, c) => sum + (parseFloat(c.saldo) || 0), 0);
    const lblSaldoCobrar = document.getElementById('lbl-saldo-cobrar');
    if (lblSaldoCobrar) lblSaldoCobrar.textContent = `$${saldoTotal.toFixed(2)}`;

    // C) Clientas Activas (Compraron este mes / Registradas)
    const clientasCompraronMes = new Set(
        ventas.filter(v => {
            const f = new Date(v.fecha);
            return f.getMonth() === mesActual && f.getFullYear() === anioActual;
        }).map(v => v.idCliente)
    ).size;

    const lblClientasActivas = document.getElementById('lbl-clientas-activas');
    if (lblClientasActivas) lblClientasActivas.textContent = `${clientasCompraronMes} / ${clientes.length}`;

    // D) Campaña Activa & Utilidades
    if (campanas.length > 0) {
        const ultimaCampana = campanas[campanas.length - 1];
        
        document.getElementById('lbl-activa-marca').textContent = ultimaCampana.marca || 'Sin seleccionar';
        document.getElementById('lbl-activa-numero').textContent = ultimaCampana.numeroCampana || '-';
        
        const lblEstado = document.getElementById('lbl-activa-estado');
        lblEstado.textContent = '🟢 Analizada';
        lblEstado.className = 'badge-status badge-activa';

        // Desplegar Utilidad Estimada de la última campaña
        document.getElementById('lbl-porcentaje-real').textContent = `${ultimaCampana.porcentajeReal.toFixed(1)}%`;
        document.getElementById('lbl-dinero-real').textContent = `$${ultimaCampana.utilidadReal.toFixed(2)}`;
        document.getElementById('lbl-utilidad-empresa').textContent = `${ultimaCampana.porcentajeEmpresa.toFixed(1)}%`;
        document.getElementById('lbl-utilidad-real-comparativa').textContent = `${ultimaCampana.porcentajeReal.toFixed(1)}%`;
    }
}

// --- 4. NAVEGACIÓN ENTRE VISTAS ---
function abrirPantallaAnalizarCampana() {
    document.getElementById('vista-resumen-principal').style.display = 'none';
    document.getElementById('vista-analizar-campana').style.display = 'block';
}

function volverAResumenPrincipal() {
    document.getElementById('vista-analizar-campana').style.display = 'none';
    document.getElementById('vista-resumen-principal').style.display = 'block';
    actualizarMetricasGlobales();
}

// --- 5. LÓGICA DE ANÁLISIS DE CAMPAÑA ---
function cambiarModoAnalisis(modo) {
    estadoAnalisis.modo = modo;
    
    const btnRapido = document.getElementById('btn-modo-rapido');
    const btnCompleto = document.getElementById('btn-modo-completo');
    const secRapida = document.getElementById('seccion-captura-rapida');
    const secCompleta = document.getElementById('seccion-captura-productos');

    if (modo === 'rapido') {
        btnRapido.classList.add('active');
        btnCompleto.classList.remove('active');
        secRapida.style.display = 'block';
        secCompleta.style.display = 'none';
    } else {
        btnCompleto.classList.add('active');
        btnRapido.classList.remove('active');
        secRapida.style.display = 'none';
        secCompleta.style.display = 'block';
        
        // Agregar fila inicial si la tabla está vacía
        if (estadoAnalisis.productos.length === 0) {
            agregarFilaProducto();
        }
    }
}

function cargarChecklistCostos() {
    const contenedor = document.getElementById('container-checklist-costos');
    if (!contenedor) return;

    contenedor.innerHTML = '';
    estadoAnalisis.insumosDisponibles.forEach(insumo => {
        const item = document.createElement('label');
        item.className = 'checkbox-costo-item';
        item.innerHTML = `
            <input type="checkbox" value="${insumo.id}" onchange="actualizarInsumosSeleccionados()">
            <span>${insumo.nombre} (+$${insumo.costo.toFixed(2)})</span>
        `;
        contenedor.appendChild(item);
    });
}

function actualizarInsumosSeleccionados() {
    const checkboxes = document.querySelectorAll('#container-checklist-costos input[type="checkbox"]:checked');
    const seleccionadosIds = Array.from(checkboxes).map(cb => cb.value);
    
    estadoAnalisis.insumosSeleccionados = estadoAnalisis.insumosDisponibles.filter(i => 
        seleccionadosIds.includes(i.id)
    );

    recalcularAuto();
}

function agregarFilaProducto() {
    const tbody = document.getElementById('tbody-productos');
    const idProducto = `prod-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    const tr = document.createElement('tr');
    tr.id = idProducto;
    tr.innerHTML = `
        <td><input type="text" class="input-prod-nombre form-control" placeholder="Ej. Lápiz labial"></td>
        <td><input type="number" class="input-prod-cant form-control" value="1" min="1" onchange="recalcularAuto()"></td>
        <td><input type="number" class="input-prod-precio form-control" placeholder="0.00" step="0.01" onchange="recalcularAuto()"></td>
        <td class="text-center"><input type="checkbox" class="input-prod-regalo" onchange="recalcularAuto()"></td>
        <td><button class="btn-nk btn-sm btn-danger" onclick="eliminarFilaProducto('${idProducto}')">❌</button></td>
    `;
    tbody.appendChild(tr);
}

function eliminarFilaProducto(id) {
    const fila = document.getElementById(id);
    if (fila) fila.remove();
    recalcularAuto();
}

function recalcularAuto() {
    // Si la tarjeta de resultados ya está visible, actualiza automáticamente al cambiar datos
    const cardResultados = document.getElementById('card-resultados-campana');
    if (cardResultados && cardResultados.style.display !== 'none') {
        ejecutarCalculoCampana();
    }
}

// --- 6. CÁLCULO DE RENTABILIDAD Y UTILIDAD REAL ---
function ejecutarCalculoCampana() {
    const totalFactura = parseFloat(document.getElementById('txt-total-factura').value) || 0;
    const gananciaEmpresa = parseFloat(document.getElementById('txt-ganancia-empresa').value) || 0;
    const flete = parseFloat(document.getElementById('txt-flete').value) || 0;
    const gastosAdmin = parseFloat(document.getElementById('txt-gastos-admin').value) || 0;

    if (totalFactura <= 0) {
        alert('Por favor, ingresa el Total de la Factura de la campaña.');
        return;
    }

    // Costo total de insumos seleccionados
    const costoInsumos = estadoAnalisis.insumosSeleccionados.reduce((sum, i) => sum + i.costo, 0);

    // Deducir costos reales de la ganancia teórica
    const gastosOperativosTotales = flete + gastosAdmin + costoInsumos;
    const utilidadReal = gananciaEmpresa - gastosOperativosTotales;

    // Porcentajes de rentabilidad
    const porcentajeEmpresa = (gananciaEmpresa / totalFactura) * 100;
    const porcentajeReal = (utilidadReal / totalFactura) * 100;

    // Identificar productos de mayor y menor utilidad (Modo Completo)
    let prodMayor = '-';
    let prodMenor = '-';

    if (estadoAnalisis.modo === 'completo') {
        const filas = document.querySelectorAll('#tbody-productos tr');
        let mayorPrecio = -1;
        let menorPrecio = Infinity;

        filas.forEach(fila => {
            const nombre = fila.querySelector('.input-prod-nombre').value || 'Sin nombre';
            const precio = parseFloat(fila.querySelector('.input-prod-precio').value) || 0;
            const esRegalo = fila.querySelector('.input-prod-regalo').checked;

            if (!esRegalo && precio > 0) {
                if (precio > mayorPrecio) {
                    mayorPrecio = precio;
                    prodMayor = nombre;
                }
                if (precio < menorPrecio) {
                    menorPrecio = precio;
                    prodMenor = nombre;
                }
            }
        });
    } else {
        const nombreRapido = document.getElementById('rapido-nombre').value;
        if (nombreRapido) prodMayor = nombreRapido;
    }

    // Renderizar Resultados
    document.getElementById('res-utilidad-total').textContent = `$${utilidadReal.toFixed(2)}`;
    document.getElementById('res-porcentaje-real').textContent = `${porcentajeReal.toFixed(1)}%`;
    document.getElementById('res-prod-mayor').textContent = prodMayor;
    document.getElementById('res-prod-menor').textContent = prodMenor === Infinity ? '-' : prodMenor;

    // Guardar temporalmente el resultado en el estado
    estadoAnalisis.ultimoCalculo = {
        marca: document.getElementById('sel-marca-analisis').value,
        numeroCampana: document.getElementById('txt-num-campana').value,
        fecha: document.getElementById('txt-fecha-campana').value,
        totalFactura,
        gananciaEmpresa,
        flete,
        gastosAdmin,
        costoInsumos,
        utilidadReal,
        porcentajeEmpresa,
        porcentajeReal,
        observaciones: document.getElementById('txt-observaciones').value
    };

    document.getElementById('card-resultados-campana').style.display = 'block';
}

// --- 7. GUARDAR CAMPAÑA Y HISTORIAL ---
function guardarCampanaEnBackend() {
    if (!estadoAnalisis.ultimoCalculo || !estadoAnalisis.ultimoCalculo.marca) {
        alert('Selecciona una marca y ejecuta el cálculo antes de guardar.');
        return;
    }

    const campanas = JSON.parse(localStorage.getItem(NK_KEYS.RESUMEN_CAMPANAS)) || [];
    campanas.push({
        id: `camp-analisis-${Date.now()}`,
        ...estadoAnalisis.ultimoCalculo
    });

    localStorage.setItem(NK_KEYS.RESUMEN_CAMPANAS, JSON.stringify(campanas));
    renderizarHistorialMarcas();
    alert('¡Campaña analizada y guardada exitosamente!');
    volverAResumenPrincipal();
}

function toggleHistorialMarcas() {
    const panel = document.getElementById('panel-historial-marcas');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

function renderizarHistorialMarcas() {
    const contenedor = document.getElementById('contenedor-historial-agrupado');
    if (!contenedor) return;

    const campanas = JSON.parse(localStorage.getItem(NK_KEYS.RESUMEN_CAMPANAS)) || [];
    if (campanas.length === 0) {
        contenedor.innerHTML = '<p class="subtext">No hay campañas registradas aún.</p>';
        return;
    }

    // Agrupar por marca
    const agrupado = campanas.reduce((acc, c) => {
        acc[c.marca] = acc[c.marca] || [];
        acc[c.marca].push(c);
        return acc;
    }, {});

    let html = '';
    for (const [marca, lista] of Object.entries(agrupado)) {
        html += `<div class="historial-grupo-marca">
            <h4>📦 ${marca}</h4>
            <ul>`;
        lista.forEach(c => {
            html += `<li>
                <strong>Campaña: ${c.numeroCampana || 'S/N'}</strong> (${c.fecha || 'Sin fecha'}) 
                - Utilidad Real: <span class="txt-success">$${c.utilidadReal.toFixed(2)} (${c.porcentajeReal.toFixed(1)}%)</span>
            </li>`;
        });
        html += `</ul></div>`;
    }

    contenedor.innerHTML = html;
}

function iniciarNuevaCampana() {
    document.getElementById('txt-num-campana').value = '';
    document.getElementById('txt-total-factura').value = '';
    document.getElementById('txt-ganancia-empresa').value = '';
    document.getElementById('txt-flete').value = '';
    document.getElementById('txt-gastos-admin').value = '';
    document.getElementById('txt-observaciones').value = '';
    document.getElementById('tbody-productos').innerHTML = '';
    document.getElementById('card-resultados-campana').style.display = 'none';
    inicializarFechas();
}

function inicializarFechas() {
    const txtFecha = document.getElementById('txt-fecha-campana');
    if (txtFecha) {
        txtFecha.value = new Date().toISOString().split('T')[0];
    }
}

// --- 8. EMISIÓN DE REPORTES EN PDF ---
function solicitarReportePDF(tipoReporte) {
    const titulos = {
        'marca_mas_vendida': 'Reporte de Producto o Marca Más Vendida',
        'historial_clienta': 'Reporte de Historial de Clientas',
        'total_vendido': 'Reporte General de Total Vendido',
        'historial_rentabilidad': 'Reporte de Historial de Rentabilidad por Campaña'
    };

    const titulo = titulos[tipoReporte] || 'Reporte de Sistema';
    
    // Crear una ventana limpia de impresión para simular la exportación a PDF
    const ventanaImpresion = window.open('', '_blank');
    ventanaImpresion.document.write(`
        <html>
            <head>
                <title>${titulo} - Nany Kiss CRM</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
                    h1 { color: #c2185b; border-bottom: 2px solid #e91e63; padding-bottom: 8px; }
                    .fecha { color: #757575; font-size: 0.9em; margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f8f9fa; color: #c2185b; }
                </style>
            </head>
            <body>
                <h1>NANY KISS CRM</h1>
                <h2>${titulo}</h2>
                <div class="fecha">Generado el: ${new Date().toLocaleString()}</div>
                <p>Este documento es un extracto oficial generado por la plataforma Nany Kiss CRM.</p>
                <hr>
                <script>
                    window.onload = function() { window.print(); window.close(); };
                </script>
            </body>
        </html>
    `);
    ventanaImpresion.document.close();
}