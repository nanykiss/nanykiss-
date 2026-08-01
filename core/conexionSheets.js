// /core/conexionSheets.js
import { CONFIG } from './config.js';

export const ConexionSheets = {

  /**
   * OBTIENE TODOS LOS DATOS (DIRECTORIO Y HISTORIAL) DESDE SHEETS
   */
  async obtenerDatosPrincipales() {
    try {
      const url = `${CONFIG.SHEETS_API_URL}?action=getData`;
      const respuesta = await fetch(url, { method: 'GET', redirect: 'follow' });
      const resultado = await respuesta.json();

      if (resultado.status === 'success') {
        return {
          exito: true,
          clientas: resultado.clientas || [],
          movimientos: resultado.movimientos || []
        };
      } else {
        throw new Error('Respuesta no exitosa de la base de datos');
      }
    } catch (error) {
      console.error('Error al conectar con Google Sheets (obtenerDatosPrincipales):', error);
      return { exito: false, clientas: [], movimientos: [] };
    }
  },

  /**
   * OBTIENE LOS RETOS ACTIVOS Y PROGRESO DESDE SHEETS
   */
  async obtenerRetos() {
    try {
      const url = `${CONFIG.SHEETS_API_URL}?action=getRetos`;
      const respuesta = await fetch(url, { method: 'GET', redirect: 'follow' });
      const resultado = await respuesta.json();

      if (resultado.status === 'success') {
        return {
          exito: true,
          listaRetos: resultado.listaRetos || [],
          listaProgreso: resultado.listaProgreso || []
        };
      } else {
        throw new Error('Error al obtener los retos');
      }
    } catch (error) {
      console.error('Error al conectar con los retos:', error);
      return { exito: false, listaRetos: [], listaProgreso: [] };
    }
  },

  /**
   * GUARDA UN NUEVO REGISTRO EN LA PESTAÑA ESPECIFICADA ('historial', 'directorio', etc.)
   */
  async guardarRegistro(pestana, datos) {
    try {
      const payload = {
        action: 'guardarRegistro',
        pestana: pestana,
        datos: datos
      };

      const respuesta = await fetch(CONFIG.SHEETS_API_URL, {
        method: 'POST',
        mode: 'cors',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });

      const resultado = await respuesta.json();
      return { exito: resultado.status === 'success', mensaje: resultado.message || '' };
    } catch (error) {
      console.error(`Error al guardar en pestaña ${pestana}:`, error);
      return { exito: false, mensaje: 'Error de red al guardar datos.' };
    }
  },

  /**
   * ACTUALIZA UNA FILA EXISTENTE EN GOOGLE SHEETS
   */
  async actualizarFila(pestana, columnaClave, valorClave, nuevosDatos) {
    try {
      const payload = {
        action: 'actualizarFila',
        pestana: pestana,
        columnaClave: columnaClave,
        valorClave: valorClave,
        nuevosDatos: nuevosDatos
      };

      const respuesta = await fetch(CONFIG.SHEETS_API_URL, {
        method: 'POST',
        mode: 'cors',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });

      const resultado = await respuesta.json();
      return { exito: resultado.status === 'success', mensaje: resultado.message || '' };
    } catch (error) {
      console.error(`Error al actualizar fila en ${pestana}:`, error);
      return { exito: false, mensaje: 'Error de red al actualizar datos.' };
    }
  }

};