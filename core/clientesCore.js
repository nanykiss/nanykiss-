// /core/clientesCore.js
import { CONFIG } from './config.js';
import { Utils } from './utils.js';

export const ClientesCore = {
  
  /**
   * 1. EVALÚA Y ASIGNA EL SEMÁFORO DE LA CLIENTA
   */
  evaluarEstadoCliente(cliente) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // Normalización de lectura de propiedades
    const saldo = parseFloat(cliente.saldoPendiente ?? cliente.Saldo_Pendiente ?? cliente.saldo) || 0;
    const fechaLimiteRaw = cliente.fechaLimitePago ?? cliente.Fecha_Limite_Pago ?? cliente.fechaLimite;
    const ultimaCompraRaw = cliente.ultimaFechaCompra ?? cliente.Ultima_Fecha_Compra ?? cliente.ultimaFecha;

    // 🔴 ROJO: Tiene saldo pendiente (deuda)
    if (saldo > 0) {
      let esVencido = false;
      let diasAtraso = 0;

      if (fechaLimiteRaw) {
        const fechaLimite = Utils.parsearFecha(fechaLimiteRaw);
        fechaLimite.setHours(0, 0, 0, 0);

        if (fechaLimite < hoy) {
          esVencido = true;
          diasAtraso = Utils.calcularDiasEntre(fechaLimite, hoy);
        }
      }

      return {
        color: 'red',
        etiqueta: esVencido ? `Vencido hace ${diasAtraso} días` : 'Con saldo pendiente',
        esVencido: esVencido,
        diasAtraso: diasAtraso,
        prioridad: 1
      };
    }

    // 🟡 AMARILLO: Sin deuda, pero pasaron +45 días sin comprar
    const diasSinComprar = Utils.calcularDiasDesde(ultimaCompraRaw);
    if (diasSinComprar >= (CONFIG.CLIENTES?.DIAS_INACTIVO || 45)) {
      return {
        color: 'yellow',
        etiqueta: `${diasSinComprar} días sin comprar`,
        diasSinComprar: diasSinComprar,
        prioridad: 2
      };
    }

    // 🟢 VERDE: Al corriente y compra reciente
    return {
      color: 'green',
      etiqueta: 'Al corriente',
      diasSinComprar: diasSinComprar,
      prioridad: 3
    };
  },

  /**
   * 2. DETECTA EL HÁBITO DE COMPRA (Contado / Parcialidades)
   */
  obtenerHabitoCompra(historialCliente) {
    if (!historialCliente || !Array.isArray(historialCliente) || historialCliente.length === 0) {
      return 'contado';
    }

    let comprasContado = 0;
    let comprasParcialidades = 0;

    historialCliente.forEach(mov => {
      const forma = (mov.formaPago ?? mov.Forma_de_pago ?? '').toLowerCase();
      if (forma.includes('contado')) {
        comprasContado++;
      } else if (forma.includes('credito') || forma.includes('parcialidades') || forma.includes('abono')) {
        comprasParcialidades++;
      }
    });

    return comprasParcialidades >= comprasContado ? 'parcialidades' : 'contado';
  },

  /**
   * 3. ORDENA LA LISTA SEGÚN LA PRIORIDAD DE TU BIBLIOTECA DE REGLAS
   */
  ordenarClientesPorPrioridad(listaClientes) {
    if (!Array.isArray(listaClientes)) return [];

    return [...listaClientes].sort((a, b) => {
      const estadoA = this.evaluarEstadoCliente(a);
      const estadoB = this.evaluarEstadoCliente(b);

      // Regla 1: Ordenar primero por color de prioridad (🔴 -> 🟡 -> 🟢)
      if (estadoA.prioridad !== estadoB.prioridad) {
        return estadoA.prioridad - estadoB.prioridad;
      }

      // Regla 2: Dentro de 🔴 ROJO -> Pagos vencidos con más días de atraso primero
      if (estadoA.color === 'red' && estadoB.color === 'red') {
        if (estadoA.esVencido && !estadoB.esVencido) return -1;
        if (!estadoA.esVencido && estadoB.esVencido) return 1;
        return estadoB.diasAtraso - estadoA.diasAtraso;
      }

      // Regla 3: Dentro de 🟡 AMARILLO -> Mayor tiempo sin comprar primero
      if (estadoA.color === 'yellow' && estadoB.color === 'yellow') {
        return estadoB.diasSinComprar - estadoA.diasSinComprar;
      }

      return 0;
    });
  },

  /**
   * 4. PREPARA LOS ÚLTIMOS 6 MOVIMIENTOS PARA LA FICHA DE CONSUMO
   */
  obtenerMovimientosFicha(historialCompleto) {
    if (!Array.isArray(historialCompleto)) return [];

    return [...historialCompleto]
      .sort((a, b) => {
        const fechaA = Utils.parsearFecha(a.fecha ?? a.Fecha);
        const fechaB = Utils.parsearFecha(b.fecha ?? b.Fecha);
        return fechaB - fechaA;
      })
      .slice(0, 6);
  }

};