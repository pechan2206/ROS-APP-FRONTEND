import api from '../config/api';

export const ingresoService = {
  // Listar todos los ingresos
  listar: async () => {
    try {
      const response = await api.get('/ingresos');
      return response.data;
    } catch (error) {
      console.error('Error al listar ingresos:', error);
      throw error;
    }
  },

  // Obtener ingreso por ID
  obtenerPorId: async (id) => {
    try {
      const response = await api.get(`/ingresos/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener ingreso ${id}:`, error);
      throw error;
    }
  },

  // Crear un nuevo ingreso
  crear: async (ingreso) => {
    try {
      const ingresoData = {
        monto: ingreso.monto,
        descripcion: ingreso.descripcion,
        fecha: ingreso.fecha,
        metodoPago: { idMetodo: ingreso.metodoPago.idMetodo }
      };
      
      const response = await api.post('/ingresos', ingresoData);
      return response.data;
    } catch (error) {
      console.error('Error al crear ingreso:', error);
      throw error;
    }
  },

  // Actualizar un ingreso existente
  actualizar: async (id, ingreso) => {
    try {
      const ingresoData = {
        monto: ingreso.monto,
        descripcion: ingreso.descripcion,
        fecha: ingreso.fecha,
        metodoPago: { idMetodo: ingreso.metodoPago.idMetodo }
      };
      
      const response = await api.put(`/ingresos/${id}`, ingresoData);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar ingreso ${id}:`, error);
      throw error;
    }
  },

  // Eliminar un ingreso
  eliminar: async (id) => {
    try {
      await api.delete(`/ingresos/${id}`);
    } catch (error) {
      console.error(`Error al eliminar ingreso ${id}:`, error);
      throw error;
    }
  }
};