/**
 * ============================================================================
 * NANY KISS CRM - MÓDULO RETOS Y CAMPAÑAS (Vanilla JS Engine)
 * ============================================================================
 */

// Global Event Bus para comunicación desacoplada
window.NK_EventBus = window.NK_EventBus || {
  listeners: {},
  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  },
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }
};

class RetosCampanasModule {
  constructor(config = {}) {
    this.containerId = config.containerId || 'nk-module-retos-campanas';
    
    // Mock Data de Clientes (Simulando API del Core CRM)
    this.dbClientes = config.clientesMock || [
      { id: 1, nombre: "María García", telefono: "525512345678", saldoPendiente: 450, cumpleanosMes: true, activo: true, marcaFavorita: "Nany Beauty" },
      { id: 2, nombre: "Ana Martínez", telefono: "525587654321", saldoPendiente: 0, cumpleanosMes: false, activo: true, marcaFavorita: "Nany Kids" },
      { id: 3, nombre: "Carla López", telefono: "525511223344", saldoPendiente: 1200, cumpleanosMes: true, activo: false, marcaFavorita: "Nany Beauty" },
      { id: 4, nombre: "Sofía Hernández", telefono: "525599887766", saldoPendiente: 0, cumpleanosMes: false, activo: true, marcaFavorita: "Nany Fashion" }
    ];

    // Almacenamiento local de campañas
    this.campanas = JSON.parse(localStorage.getItem('nk_campanas_db')) || this.getInitialSeedData();
    
    this.plantillaSeleccionada = null;
    this.clientesSeleccionadosTemporal = [];
    this.rouletteAngle = 0;

    this.init();
  }

  getInitialSeedData() {
    return [
      {
        id: "camp-cobranza-default",
        tipoPlantilla: "cobranza",
        nombre: "📢 Cobranza - Recuperación Activa",
        vigencia: "2026-08-01",
        publicoTarget: "Cobranza",
        montoPendienteTotal: 1650,
        clientesIds: [1, 3],
        mensajeWhatsApp: "Hola [NOMBRE], ¡tenemos una promoción especial! Liquidando tu saldo adeudado de $[SALDO] antes del [FECHA], te otorgamos un regalo sorpresa.",
        estado: "activa",
        esCobranza: true
      }
    ];
  }

  saveData() {
    localStorage.setItem('nk_campanas_db', JSON.stringify(this.campanas));
  }

  init() {
    this.evaluarVigencias();
    this.renderContainer();
    this.bindGlobalEvents();
  }

  evaluarVigencias() {
    const hoy = new Date().toISOString().split('T')[0];
    let actualizacion = false;

    this.campanas.forEach(c => {
      if (c.estado === 'activa' && c.vigencia < hoy) {
        c.estado = 'historial';
        actualizacion = true;
      }
    });

    if (actualizacion) this.saveData();
  }

  renderContainer() {
    const root = document.getElementById(this.containerId);
    if (!root) return;

    root.innerHTML = `
      <div class="nk-container">
        <!-- SECCIÓN 1: COBRANZA -->
        <div class="nk-section-header">
          <h2 class="nk-section-title">📢 Campañas para Cobranza</h2>
          <button class="nk-btn" id="btn-nueva-cobranza">➕ Nueva Cobranza</button>
        </div>
        <div class="nk-campaigns-grid" id="grid-cobranza"></div>

        <!-- SECCIÓN 2: RETOS Y CAMPAÑAS ACTIVAS -->
        <div class="nk-section-header">
          <h2 class="nk-section-title">🎯 Retos y Campañas Activas</h2>
          <button class="nk-btn" id="btn-nueva-campana">➕ Nueva Campaña / Reto</button>
        </div>
        <div class="nk-campaigns-grid" id="grid-activas"></div>

        <!-- SECCIÓN 3: PROGRAMADAS (BORRADORES) -->
        <div class="nk-section-header">
          <h2 class="nk-section-title">📝 Campañas Programadas (Borradores)</h2>
        </div>
        <div class="nk-campaigns-grid" id="grid-programadas"></div>

        <!-- SECCIÓN 4: HISTORIAL -->
        <div class="nk-section-header">
          <h2 class="nk-section-title">📜 Historial de Campañas</h2>
        </div>
        <div class="nk-campaigns-grid" id="grid-historial"></div>
      </div>

      <!-- CONTAINER PARA MODALES -->
      <div id="nk-modal-root"></div>
    `;

    this.renderGrids();
    this.attachDomEvents();
  }

  renderGrids() {
    const gridCobranza = document.getElementById('grid-cobranza');
    const gridActivas = document.getElementById('grid-activas');
    const gridProgramadas = document.getElementById('grid-programadas');
    const gridHistorial = document.getElementById('grid-historial');

    gridCobranza.innerHTML = '';
    gridActivas.innerHTML = '';
    gridProgramadas.innerHTML = '';
    gridHistorial.innerHTML = '';

    const cobranzaList = this.campanas.filter(c => c.esCobranza && c.estado === 'activa');
    const activasList = this.campanas.filter(c => !c.esCobranza && c.estado === 'activa');
    const programadasList = this.campanas.filter(c => c.estado === 'borrador');
    const historialList = this.campanas.filter(c => c.estado === 'historial');

    // Renderizar Cobranza
    if (cobranzaList.length === 0) {
      gridCobranza.innerHTML = '<p class="nk-card-info">No hay campañas de cobranza activas.</p>';
    } else {
      cobranzaList.forEach(c => gridCobranza.appendChild(this.buildCardElement(c)));
    }

    // Renderizar Activas
    if (activasList.length === 0) {
      gridActivas.innerHTML = '<p class="nk-card-info">No hay retos o campañas activas.</p>';
    } else {
      activasList.forEach(c => gridActivas.appendChild(this.buildCardElement(c)));
    }

    // Renderizar Programadas
    if (programadasList.length === 0) {
      gridProgramadas.innerHTML = '<p class="nk-card-info">No hay borradores programados.</p>';
    } else {
      programadasList.forEach(c => gridProgramadas.appendChild(this.buildCardElement(c)));
    }

    // Renderizar Historial
    if (historialList.length === 0) {
      gridHistorial.innerHTML = '<p class="nk-card-info">Historial vacío.</p>';
    } else {
      historialList.forEach(c => gridHistorial.appendChild(this.buildCardElement(c)));
    }
  }

  buildCardElement(campana) {
    const card = document.createElement('div');
    card.className = `nk-card ${campana.esCobranza ? 'cobranza' : campana.estado}`;

    let extraInfo = '';
    if (campana.esCobranza) {
      extraInfo = `
        <p class="nk-card-info"><strong>Clientes pendientes:</strong> ${campana.clientesIds.length}</p>
        <p class="nk-card-info"><strong>Deuda Total:</strong> $${campana.montoPendienteTotal || 0}</p>
      `;
    } else {
      extraInfo = `<p class="nk-card-info"><strong>Público:</strong> ${campana.publicoTarget}</p>`;
    }

    card.innerHTML = `
      <span class="nk-card-badge">${campana.estado}</span>
      <div>
        <h3 class="nk-card-title">${campana.nombre}</h3>
        <p class="nk-card-info"><strong>Vigencia:</strong> ${campana.vigencia}</p>
        ${extraInfo}
      </div>
      <div class="nk-card-actions">
        ${campana.estado === 'activa' ? `<button class="nk-btn nk-btn-whatsapp btn-enviar-wa" data-id="${campana.id}">💬 Gestionar Envíos</button>` : ''}
        ${(campana.tipoPlantilla === 'rifa' || campana.tipoPlantilla === 'rifa_puntos') && campana.estado === 'activa' 
            ? `<button class="nk-btn btn-sorteo" data-id="${campana.id}">🎡 Realizar Sorteo</button>` 
            : ''}
        ${campana.estado === 'borrador' ? `<button class="nk-btn btn-publicar" data-id="${campana.id}">🚀 Publicar</button>` : ''}
        ${campana.estado === 'historial' ? `<button class="nk-btn nk-btn-secondary btn-reutilizar" data-id="${campana.id}">🔄 Reutilizar</button>` : ''}
      </div>
    `;

    setTimeout(() => {
      const btnWa = card.querySelector('.btn-enviar-wa');
      if (btnWa) btnWa.onclick = () => this.abrirModalGestionClientes(campana);

      const btnSorteo = card.querySelector('.btn-sorteo');
      if (btnSorteo) btnSorteo.onclick = () => this.abrirModalSorteo(campana);

      const btnPub = card.querySelector('.btn-publicar');
      if (btnPub) btnPub.onclick = () => this.publicarCampana(campana.id);

      const btnReut = card.querySelector('.btn-reutilizar');
      if (btnReut) btnReut.onclick = () => this.reutilizarCampana(campana);
    }, 0);

    return card;
  }

  attachDomEvents() {
    document.getElementById('btn-nueva-cobranza').onclick = () => this.abrirBibliotecaPlantillas(true);
    document.getElementById('btn-nueva-campana').onclick = () => this.abrirBibliotecaPlantillas(false);
  }

  /* ==========================================================================
     BIBLIOTECA DE PLANTILLAS & MODALES
     ========================================================================== */

  abrirBibliotecaPlantillas(soloCobranza = false) {
    const modalRoot = document.getElementById('nk-modal-root');
    
    let plantillasHTML = '';
    if (soloCobranza) {
      plantillasHTML = `<div class="nk-template-btn" data-type="cobranza">💳 Paga y Gana (Cobranza)</div>`;
    } else {
      plantillasHTML = `
        <div class="nk-template-btn" data-type="compra_beneficio">🎁 Compra y Recibe Beneficio</div>
        <div class="nk-template-btn" data-type="rifa">🎡 Rifa Comercial</div>
        <div class="nk-template-btn" data-type="rifa_puntos">🎟️ Rifa por Puntos</div>
        <div class="nk-template-btn" data-type="invita_amiga">👭 Invita a una Amiga</div>
        <div class="nk-template-btn" data-type="cumpleanos">🎂 Cumpleaños del Mes</div>
        <div class="nk-template-btn" data-type="compra_acumulada">⭐ Compra Acumulada</div>
      `;
    }

    modalRoot.innerHTML = `
      <div class="nk-modal-backdrop">
        <div class="nk-modal">
          <div class="nk-modal-header">
            <h3>Seleccionar Plantilla de Campaña</h3>
            <button class="nk-btn nk-btn-secondary" id="btn-close-modal">✕</button>
          </div>
          <div class="nk-template-grid">
            ${plantillasHTML}
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-close-modal').onclick = () => this.cerrarModal();

    modalRoot.querySelectorAll('.nk-template-btn').forEach(btn => {
      btn.onclick = (e) => {
        const type = e.target.getAttribute('data-type');
        this.abrirConfiguracionPlantilla(type);
      };
    });
  }

  abrirConfiguracionPlantilla(tipo, campanaBase = null) {
    this.plantillaSeleccionada = tipo;
    const modalRoot = document.getElementById('nk-modal-root');

    this.calcularAudienciaInicial(tipo);

    const titleMap = {
      cobranza: "💳 Configurar Campaña Paga y Gana (Cobranza)",
      compra_beneficio: "🎁 Configurar Compra y Recibe un Beneficio",
      rifa: "🎡 Configurar Rifa",
      rifa_puntos: "🎟️ Configurar Rifa por Puntos ($ = Boletos)",
      invita_amiga: "👭 Configurar Invita a una Amiga",
      cumpleanos: "🎂 Configurar Campaña de Cumpleaños",
      compra_acumulada: "⭐ Configurar Compra Acumulada"
    };

    modalRoot.innerHTML = `
      <div class="nk-modal-backdrop">
        <div class="nk-modal">
          <div class="nk-modal-header">
            <h3>${titleMap[tipo]}</h3>
            <button class="nk-btn nk-btn-secondary" id="btn-close-modal">✕</button>
          </div>
          <form id="nk-form-campana">
            <div class="nk-form-group">
              <label>Nombre de la Campaña</label>
              <input type="text" id="cfg-nombre" required value="${campanaBase ? campanaBase.nombre + ' (Copia)' : ''}" placeholder="Ej: Especial Día de las Madres">
            </div>

            <div class="nk-form-group">
              <label>Vigencia (Fecha Fin)</label>
              <input type="date" id="cfg-vigencia" required value="${campanaBase ? campanaBase.vigencia : ''}">
            </div>

            ${tipo !== 'cobranza' && tipo !== 'cumpleanos' ? `
              <div class="nk-form-group">
                <label>Público Objetivo</label>
                <select id="cfg-publico">
                  <option value="Todos">Todos los Clientes</option>
                  <option value="Activos">Clientes Activos</option>
                  <option value="Inactivos">Clientes Inactivos</option>
                  <option value="MarcaEspecifica">Por Marca Específica</option>
                </select>
              </div>
            ` : ''}

            ${tipo === 'rifa_puntos' ? `
              <div class="nk-form-group">
                <label>Monto por Boleto ($)</label>
                <input type="number" id="cfg-monto-boleto" value="100" min="1">
              </div>
            ` : ''}

            ${tipo === 'compra_acumulada' ? `
              <div class="nk-form-group">
                <label>Objetivo Económico Acumulado ($)</label>
                <input type="number" id="cfg-objetivo-acumulado" value="1000">
              </div>
            ` : ''}

            <div class="nk-form-group">
              <label>Beneficio / Premio</label>
              <input type="text" id="cfg-beneficio" required placeholder="Ej: 15% Descuento / Regalo Sorpresa" value="${campanaBase ? campanaBase.beneficio || '' : ''}">
            </div>

            <div class="nk-form-group">
              <label>Clientes Seleccionados (<span id="count-clientes">${this.clientesSeleccionadosTemporal.length}</span>)</label>
              <div class="nk-customer-selector" id="customer-selector-list"></div>
            </div>

            <div class="nk-form-group">
              <label>Mensaje para WhatsApp (Plantilla Auto-Generada)</label>
              <textarea id="cfg-mensaje"></textarea>
            </div>

            <div class="nk-modal-header" style="border:none; padding:0;">
              <button type="button" class="nk-btn nk-btn-secondary" id="btn-guardar-borrador">💾 Guardar Programada</button>
              <button type="submit" class="nk-btn">🚀 Publicar Campaña</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.getElementById('btn-close-modal').onclick = () => this.cerrarModal();
    this.renderCustomerSelector();
    this.generarMensajeTemplate();

    const selectPublico = document.getElementById('cfg-publico');
    if (selectPublico) {
      selectPublico.onchange = (e) => {
        this.calcularAudienciaPorFiltro(e.target.value);
        this.renderCustomerSelector();
        this.generarMensajeTemplate();
      };
    }

    document.getElementById('cfg-nombre').oninput = () => this.generarMensajeTemplate();
    document.getElementById('cfg-beneficio').oninput = () => this.generarMensajeTemplate();

    document.getElementById('nk-form-campana').onsubmit = (e) => {
      e.preventDefault();
      this.guardarCampana('activa');
    };

    document.getElementById('btn-guardar-borrador').onclick = () => {
      this.guardarCampana('borrador');
    };
  }

  calcularAudienciaInicial(tipo) {
    if (tipo === 'cobranza') {
      this.clientesSeleccionadosTemporal = this.dbClientes.filter(c => c.saldoPendiente > 0);
    } else if (tipo === 'cumpleanos') {
      this.clientesSeleccionadosTemporal = this.dbClientes.filter(c => c.cumpleanosMes);
    } else {
      this.clientesSeleccionadosTemporal = [...this.dbClientes];
    }
  }

  calcularAudienciaPorFiltro(filtro) {
    if (filtro === 'Todos') this.clientesSeleccionadosTemporal = [...this.dbClientes];
    if (filtro === 'Activos') this.clientesSeleccionadosTemporal = this.dbClientes.filter(c => c.activo);
    if (filtro === 'Inactivos') this.clientesSeleccionadosTemporal = this.dbClientes.filter(c => !c.activo);
    if (filtro === 'MarcaEspecifica') this.clientesSeleccionadosTemporal = this.dbClientes.filter(c => c.marcaFavorita === 'Nany Beauty');
  }

  renderCustomerSelector() {
    const list = document.getElementById('customer-selector-list');
    const count = document.getElementById('count-clientes');
    if (!list) return;

    count.innerText = this.clientesSeleccionadosTemporal.length;
    list.innerHTML = '';

    this.dbClientes.forEach(cliente => {
      const isSelected = this.clientesSeleccionadosTemporal.some(c => c.id === cliente.id);
      const item = document.createElement('div');
      item.className = 'nk-customer-item';
      item.innerHTML = `
        <span>${cliente.nombre} ${cliente.saldoPendiente > 0 ? `(Deuda: $${cliente.saldoPendiente})` : ''}</span>
        <input type="checkbox" ${isSelected ? 'checked' : ''} data-id="${cliente.id}">
      `;

      item.querySelector('input').onchange = (e) => {
        if (e.target.checked) {
          this.clientesSeleccionadosTemporal.push(cliente);
        } else {
          this.clientesSeleccionadosTemporal = this.clientesSeleccionadosTemporal.filter(c => c.id !== cliente.id);
        }
        document.getElementById('count-clientes').innerText = this.clientesSeleccionadosTemporal.length;
      };

      list.appendChild(item);
    });
  }

  generarMensajeTemplate() {
    const nombre = document.getElementById('cfg-nombre').value || '[Nombre Campaña]';
    const beneficio = document.getElementById('cfg-beneficio').value || '[Beneficio]';
    const msgArea = document.getElementById('cfg-mensaje');

    let template = "";
    if (this.plantillaSeleccionada === 'cobranza') {
      template = `Hola [NOMBRE], aprovechando nuestra campaña "${nombre}", te ofrecemos ${beneficio} al realizar la liquidación de tu cuenta pendiente. ¡Aprovecha hoy!`;
    } else if (this.plantillaSeleccionada === 'cumpleanos') {
      template = `🎂 ¡Feliz Cumpleaños [NOMBRE]! En Nany Kiss queremos celebrarte: obtén ${beneficio} en cualquier compra realizada durante este mes.`;
    } else {
      template = `Hola [NOMBRE], te invitamos a participar en nuestra campaña "${nombre}". ¡Al comprar recibes ${beneficio}! Responde este mensaje para más detalles.`;
    }

    msgArea.value = template;
  }

  guardarCampana(estado) {
    const esCobranza = this.plantillaSeleccionada === 'cobranza';
    const montoTotal = esCobranza ? this.clientesSeleccionadosTemporal.reduce((acc, c) => acc + c.saldoPendiente, 0) : 0;

    const nuevaCampana = {
      id: "camp-" + Date.now(),
      tipoPlantilla: this.plantillaSeleccionada,
      nombre: document.getElementById('cfg-nombre').value,
      vigencia: document.getElementById('cfg-vigencia').value,
      publicoTarget: document.getElementById('cfg-publico') ? document.getElementById('cfg-publico').value : (esCobranza ? 'Cobranza' : 'Cumpleaños'),
      beneficio: document.getElementById('cfg-beneficio').value,
      mensajeWhatsApp: document.getElementById('cfg-mensaje').value,
      clientesIds: this.clientesSeleccionadosTemporal.map(c => c.id),
      montoPendienteTotal: montoTotal,
      montoBoleto: document.getElementById('cfg-monto-boleto') ? parseFloat(document.getElementById('cfg-monto-boleto').value) : null,
      objetivoAcumulado: document.getElementById('cfg-objetivo-acumulado') ? parseFloat(document.getElementById('cfg-objetivo-acumulado').value) : null,
      estado: estado,
      esCobranza: esCobranza
    };

    this.campanas.unshift(nuevaCampana);
    this.saveData();
    this.cerrarModal();
    this.renderGrids();
  }

  publicarCampana(id) {
    const c = this.campanas.find(x => x.id === id);
    if (c) {
      c.estado = 'activa';
      this.saveData();
      this.renderGrids();
    }
  }

  reutilizarCampana(campana) {
    this.abrirConfiguracionPlantilla(campana.tipoPlantilla, campana);
  }

  cerrarModal() {
    document.getElementById('nk-modal-root').innerHTML = '';
  }

  /* ==========================================================================
     ENVÍO DE MENSAJES Y WHATSAPP MANUAL
     ========================================================================== */

  abrirModalGestionClientes(campana) {
    const modalRoot = document.getElementById('nk-modal-root');
    const clientesLista = this.dbClientes.filter(c => campana.clientesIds.includes(c.id));

    let itemsHTML = clientesLista.map(c => {
      let msgCustom = campana.mensajeWhatsApp
        .replace('[NOMBRE]', c.nombre)
        .replace('[SALDO]', c.saldoPendiente || 0)
        .replace('[FECHA]', campana.vigencia);

      const waUrl = `https://wa.me/${c.telefono}?text=${encodeURIComponent(msgCustom)}`;

      return `
        <div class="nk-customer-item">
          <div>
            <strong>${c.nombre}</strong> (${c.telefono})
          </div>
          <div>
            <a href="${waUrl}" target="_blank" class="nk-btn nk-btn-whatsapp" style="text-decoration:none; font-size:0.8rem;">📱 Enviar WhatsApp</a>
          </div>
        </div>
      `;
    }).join('');

    modalRoot.innerHTML = `
      <div class="nk-modal-backdrop">
        <div class="nk-modal">
          <div class="nk-modal-header">
            <h3>Gestión de Envíos: ${campana.nombre}</h3>
            <button class="nk-btn nk-btn-secondary" id="btn-close-modal">✕</button>
          </div>
          <p class="nk-card-info">Los mensajes se envían manualmente respetando los términos de WhatsApp.</p>
          <div style="max-height: 300px; overflow-y: auto;">
            ${itemsHTML}
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-close-modal').onclick = () => this.cerrarModal();
  }

  /* ==========================================================================
     MÓDULO SORTEO / RULETA DE SORTEOS
     ========================================================================== */

  abrirModalSorteo(campana) {
    const modalRoot = document.getElementById('nk-modal-root');
    const participantes = this.dbClientes.filter(c => campana.clientesIds.includes(c.id));

    if (participantes.length === 0) {
      alert("No hay clientes participantes seleccionados en esta campaña.");
      return;
    }

    modalRoot.innerHTML = `
      <div class="nk-modal-backdrop">
        <div class="nk-modal">
          <div class="nk-modal-header">
            <h3>🎡 Sorteo: ${campana.nombre}</h3>
            <button class="nk-btn nk-btn-secondary" id="btn-close-modal">✕</button>
          </div>
          <div class="nk-roulette-container">
            <canvas id="nk-roulette-canvas" width="300" height="300"></canvas>
            <div style="margin-top: 15px;">
              <button class="nk-btn" id="btn-girar-ruleta">🎯 Girar Ruleta</button>
            </div>
            <h3 id="winner-display" style="color: var(--nk-primary); margin-top:15px;"></h3>
            <div id="winner-actions" style="display:none; gap:10px; justify-content:center; margin-top:10px;">
              <button class="nk-btn nk-btn-whatsapp" id="btn-notify-winner">💬 Notificar Ganador por WhatsApp</button>
              <button class="nk-btn nk-btn-secondary" id="btn-confirm-prize">🎁 Registrar Premio Entregado</button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-close-modal').onclick = () => this.cerrarModal();
    
    this.drawRoulette(participantes);

    document.getElementById('btn-girar-ruleta').onclick = () => {
      this.spinRoulette(participantes, campana);
    };
  }

  drawRoulette(participantes) {
    const canvas = document.getElementById('nk-roulette-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const numOptions = participantes.length;
    const arcSize = (2 * Math.PI) / numOptions;

    ctx.clearRect(0, 0, 300, 300);

    const colors = ['#e91e63', '#9c27b0', '#2196f3', '#4caf50', '#ff9800', '#00bcd4'];

    for (let i = 0; i < numOptions; i++) {
      const angle = this.rouletteAngle + i * arcSize;
      ctx.beginPath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.moveTo(150, 150);
      ctx.arc(150, 150, 140, angle, angle + arcSize, false);
      ctx.lineTo(150, 150);
      ctx.fill();

      // Renderizado del texto alineado con el centro del sector
      ctx.save();
      ctx.fillStyle = "white";
      ctx.font = "bold 12px sans-serif";
      const midAngle = angle + arcSize / 2;
      ctx.translate(150 + Math.cos(midAngle) * 90, 150 + Math.sin(midAngle) * 90);
      ctx.rotate(midAngle + Math.PI / 2);
      ctx.fillText(participantes[i].nombre.split(' ')[0], -15, 0);
      ctx.restore();
    }

    // Indicador Central (Flecha apuntando hacia el centro desde la parte superior)
    ctx.fillStyle = "#333333";
    ctx.beginPath();
    ctx.moveTo(140, 0);
    ctx.lineTo(160, 0);
    ctx.lineTo(150, 20);
    ctx.closePath();
    ctx.fill();
  }

  spinRoulette(participantes, campana) {
    const btnGirar = document.getElementById('btn-girar-ruleta');
    btnGirar.disabled = true;

    let totalRounds = 5 + Math.floor(Math.random() * 5);
    let extraAngle = Math.random() * Math.PI * 2;
    let targetAngle = this.rouletteAngle + (totalRounds * Math.PI * 2) + extraAngle;

    let currentStep = 0;
    const totalSteps = 100;

    const animate = () => {
      currentStep++;
      const progress = currentStep / totalSteps;
      const easeOut = 1 - Math.pow(1 - progress, 3);
      this.rouletteAngle = targetAngle * easeOut;

      this.drawRoulette(participantes);

      if (currentStep < totalSteps) {
        requestAnimationFrame(animate);
      } else {
        // Cálculo matemático del sector apuntado por la flecha superior (270° o 3π/2 rad)
        const arcSize = (2 * Math.PI) / participantes.length;
        const currentAngle = this.rouletteAngle % (2 * Math.PI);
        const pointerAngle = (1.5 * Math.PI - currentAngle + 2 * Math.PI) % (2 * Math.PI);
        const indexGanador = Math.floor(pointerAngle / arcSize);
        const ganador = participantes[indexGanador] || participantes[0];

        const winnerDisplay = document.getElementById('winner-display');
        const winnerActions = document.getElementById('winner-actions');

        winnerDisplay.innerText = `🎉 ¡Ganador(a): ${ganador.nombre}!`;
        winnerActions.style.display = 'flex';

        document.getElementById('btn-notify-winner').onclick = () => {
          const msg = `¡Felicidades ${ganador.nombre}! 🎉 Has sido el/la ganadora de nuestra rifa "${campana.nombre}". ¡Ponte en contacto con nosotros para coordinar la entrega de tu premio!`;
          window.open(`https://wa.me/${ganador.telefono}?text=${encodeURIComponent(msg)}`, '_blank');
        };

        document.getElementById('btn-confirm-prize').onclick = () => {
          window.NK_EventBus.emit('CAMPANA:ESTADO_CLIENTE_ACTUALIZADO', {
            clienteId: ganador.id,
            campanaId: campana.id,
            estado: 'Premio entregado'
          });
          alert('Premio registrado como entregado.');
          this.cerrarModal();
        };
      }
    };

    requestAnimationFrame(animate);
  }

  /* ==========================================================================
     MÉTODOS DE INTEGRACIÓN Y REUTILIZACIÓN (BUS DE EVENTOS / CORE CRM)
     ========================================================================== */

  bindGlobalEvents() {
    window.NK_EventBus.on('CLIENTE:REGISTRAR_VENTA_CAMPANA', (data) => {
      this.registrarVentaCampana(data.clienteId, data.campanaId, data.monto);
    });

    window.NK_EventBus.on('CLIENTE:INVITAR_A_CAMPANA', (data) => {
      this.invitarClienteACampana(data.clienteId, data.campanaId);
    });
  }

  invitarClienteACampana(clienteId, campanaId) {
    const c = this.campanas.find(x => x.id === campanaId);
    if (c && !c.clientesIds.includes(clienteId)) {
      c.clientesIds.push(clienteId);
      this.saveData();
      window.NK_EventBus.emit('CAMPANA:ESTADO_CLIENTE_ACTUALIZADO', { clienteId, campanaId, estado: 'Invitado' });
    }
  }

  registrarVentaCampana(clienteId, campanaId, monto) {
    const c = this.campanas.find(x => x.id === campanaId);
    if (c) {
      window.NK_EventBus.emit('CAMPANA:ESTADO_CLIENTE_ACTUALIZADO', { clienteId, campanaId, estado: 'Participando' });
    }
  }
}

// Inicialización Global Segura
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('nk-module-retos-campanas')) {
    window.NK_RetosCampanas = new RetosCampanasModule({
      containerId: 'nk-module-retos-campanas'
    });
  }
});