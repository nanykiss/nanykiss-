// /core/ventasCore.js
import { ConexionSheets } from './conexionSheets.js';
import { Utils } from './utils.js';

export const VentasCore = {

  /**
   * REGISTRA UNA NUEVA VENTA (CONTADO O PARCIALIDADES)
   * @param {Object} datosVenta - Datos del formulario de venta
   * @param {Object} clienteActual - Objeto de la clienta seleccionada
   */
  async registrarVenta(datosVenta, clienteActual) {
    try {
      const esContado = datosVenta.tipoPago === 'Contado';
      const total = parseFloat(datosVenta.montoTotal) || 0;
      const enganche = parseFloat(datosVenta.montoEnganche) || 0;
      const saldoPrevio = parseFloat(clienteActual.saldoPendiente || clienteActual.saldo) || 0;

      // 1. Calcular el nuevo saldo pendiente general de la clienta
      const nuevoSaldo = esContado 
        ? saldoPrevio 
        : saldoPrevio + (total - enganche);

      const fechaHoy = Utils.formatearFecha();

      // 2. Registrar el movimiento de la VENTA en la pestaña 'historial'
      const movimientoVenta = {
        Fecha: fechaHoy,
        Clienta: clienteActual.nombre,
        ID_CLIENTE: clienteActual.idCliente || clienteActual.id,
        Tipo: 'Venta',
        Forma_de_pago: datosVenta.tipoPago,
        Marca: datosVenta.marca || 'Sin Marca',
        Detalle: `${datosVenta.producto || 'Producto'} (${datosVenta.marca || 'N/A'})`,
        Monto: total,
        Categoria: 'Ventas'
      };

      await ConexionSheets.guardarRegistro('historial', movimientoVenta);

      // 3. Si hubo un enganche en una venta a parcialidades, registrar el ABONO en 'historial'
      if (!esContado && enganche > 0) {
        const movimientoEnganche = {
          Fecha: fechaHoy,
          Clienta: clienteActual.nombre,
          ID_CLIENTE: clienteActual.idCliente || clienteActual.id,
          Tipo: 'Abono',
          Forma_de_pago: 'Efectivo/Transferencia',
          Marca: datosVenta.marca || 'Sin Marca',
          Detalle: `Enganche para: ${datosVenta.producto}`,
          Monto: enganche,
          Categoria: 'Cobranza'
        };

        await ConexionSheets.guardarRegistro('historial', movimientoEnganche);
      }

      // 4. Actualizar la ficha general de la clienta en 'directorio'
      await ConexionSheets.actualizarFila('directorio', 'ID_CLIENTE', clienteActual.idCliente || clienteActual.id, {
        Saldo_Pendiente: nuevoSaldo,
        Ultima_Fecha_Compra: fechaHoy,
        Ultimo_Producto: datosVenta.producto,
        Marca_Habitual: datosVenta.marca
      });

      return {
        exito: true,
        mensaje: 'Venta y movimientos registrados con éxito.',
        nuevoSaldo: nuevoSaldo
      };

    } catch (error) {
      console.error('Error en VentasCore.registrarVenta:', error);
      return {
        exito: false,
        mensaje: 'Ocurrió un error al registrar la venta. Inténtalo nuevamente.'
      };
    }
  }

};