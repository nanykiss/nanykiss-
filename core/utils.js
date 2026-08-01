// /core/utils.js

export const Utils = {

  /**
   * DEVUELVE LA FECHA ACTUAL EN FORMATO DÍAS/MES/AÑO (DD/MM/YYYY)
   */
  formatearFecha(fecha = new Date()) {
    const d = typeof fecha === 'string' ? this.parsearFecha(fecha) : new Date(fecha);
    if (isNaN(d.getTime())) return '';
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const anio = d.getFullYear();
    return `${dia}/${mes}/${anio}`;
  },

  /**
   * REPARSA CADENAS DD/MM/YYYY O YYYY-MM-DD A OBJETOS DATE VÁLIDOS
   */
  parsearFecha(fechaStr) {
    if (!fechaStr) return new Date();
    if (fechaStr instanceof Date) return fechaStr;

    if (typeof fechaStr === 'string' && fechaStr.includes('/')) {
      const partes = fechaStr.split('/');
      // Asume formato DD/MM/YYYY
      return new Date(parseInt(partes[2], 10), parseInt(partes[1], 10) - 1, parseInt(partes[0], 10));
    }

    if (typeof fechaStr === 'string' && fechaStr.includes('-')) {
      const partes = fechaStr.split('-');
      // Asume formato YYYY-MM-DD
      return new Date(parseInt(partes[0], 10), parseInt(partes[1], 10) - 1, parseInt(partes[2], 10));
    }

    return new Date(fechaStr);
  },

  /**
   * CALCULA LOS DÍAS TRANSCURRIDOS DESDE UNA FECHA HASTA HOY
   */
  calcularDiasDesde(fechaString) {
    if (!fechaString) return 999;

    const fechaInicio = this.parsearFecha(fechaString);
    if (isNaN(fechaInicio.getTime())) return 999;

    const hoy = new Date();
    // Normalizar a medianoche para evitar desfase por horas
    fechaInicio.setHours(0, 0, 0, 0);
    hoy.setHours(0, 0, 0, 0);

    const diferenciaMs = hoy - fechaInicio;
    return Math.floor(diferenciaMs / (1000 * 60 * 60 * 24));
  },

  /**
   * CALCULA LA DIFERENCIA EN DÍAS ENTRE DOS FECHAS
   */
  calcularDiasEntre(fechaInicioStr, fechaFinStr) {
    const inicio = this.parsearFecha(fechaInicioStr);
    const fin = this.parsearFecha(fechaFinStr);

    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) return 0;

    inicio.setHours(0, 0, 0, 0);
    fin.setHours(0, 0, 0, 0);

    const diferenciaMs = fin - inicio;
    return Math.floor(diferenciaMs / (1000 * 60 * 60 * 24));
  },

  /**
   * FORMATEA NÚMEROS A MONEDA LOCAL ($1,250.00)
   */
  formatearMoneda(monto) {
    const num = parseFloat(monto) || 0;
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(num);
  }

};