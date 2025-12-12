import api from '../config/api';

export const metodoPagoService = {
  // Listar todos los métodos de pago
  listar: async () => {
    try {
      const response = await api.get('/pagos');
      return response.data;
    } catch (error) {
      console.error('Error al listar métodos de pago:', error);
      throw error;
    }
  },

  // Obtener método de pago por ID
  obtenerPorId: async (id) => {
    try {
      const response = await api.get(`/pagos/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener método de pago ${id}:`, error);
      throw error;
    }
  }
};