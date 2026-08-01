// /core/cobranzaCore.js
import { ConexionSheets } from './conexionSheets.js';
import { Utils } from './utils.js';

export const CobranzaCore = {
  
  /**
   * REGISTRA UN ABONO Y ACTUALIZA EL SALDO DE LA CLIENTA
   * @param {string|number} idCliente - Identificador único de la clienta
   * @param {number} montoAbono - Cantidad a abonar
   * @param {Object} clienteActual - Objeto con los datos de la clienta
   */
  async registrarAbono(idCliente, montoAbono, clienteActual) {
    try {
      const monto = parseFloat(montoAbono) || 0;
      
      if (monto <= 0) {
        return { exito: false, mensaje: 'El monto del abono debe ser mayor a 0' };
      }

      // Obtener el saldo actual de forma segura (soporta 'saldoPendiente' o 'saldo')
      const saldoPrevio = parseFloat(clienteActual.saldoPendiente ?? clienteActual.saldo) || 0;

      if (saldoPrevio <= 0) {
        return { exito: false, mensaje: 'Esta clienta no tiene saldo pendiente por cobrar.' };
      }

      // 1. Calcular el nuevo saldo general (evitando números negativos)
      const nuevoSaldo = Math.max(0, saldoPrevio - monto);
      const idUnico = idCliente || clienteActual.idCliente || clienteActual.id;
      const fechaHoy = Utils.formatearFecha();

      // 2. Crear el objeto para el Historial de Movimientos
      const movimientoAbono = {
        Fecha: fechaHoy,
        Clienta: clienteActual.nombre,
        ID_CLIENTE: idUnico,
        Tipo: 'Pago',
        Forma_de_pago: 'Abono',
        Marca: clienteActual.Marca_Habitual || '-',
        Detalle: `Abono a saldo general (${Utils.formatearMoneda ? Utils.formatearMoneda(monto) : '$' + monto})`,
        Monto: monto,
        Categoria: 'Cobranza'
      };

      // 3. Guardar el movimiento en la pestaña 'historial' de Sheets
      const resHistorial = await ConexionSheets.guardarRegistro('historial', movimientoAbono);

      // 4. Actualizar el saldo total acumulado en la pestaña 'directorio'
      const resDirectorio = await ConexionSheets.actualizarFila('directorio', 'ID_CLIENTE', idUnico, {
        Saldo_Pendiente: nuevoSaldo
      });

      const esExitoso = resHistorial.exito && resDirectorio.exito;

      return {
        exito: esExitoso,
        nuevoSaldo: nuevoSaldo,
        liquidado: nuevoSaldo === 0,
        mensaje: esExitoso 
          ? `Abono registrado con éxito. Nuevo saldo: $${nuevoSaldo.toFixed(2)}`
          : 'El abono se procesó pero hubo un detalle al sincronizar con Sheets.'
      };

    } catch (error) {
      console.error('Error en CobranzaCore.registrarAbono:', error);
      return {
        exito: false,
        mensaje: 'Ocurrió un error inesperado al registrar el abono.'
      };
    }
  }

};