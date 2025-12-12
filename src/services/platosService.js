import axios from "axios";

const API_URL = "http://localhost:8080/api/platos";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const platosService = {
  // Obtener todos los detalles de pedido
  listar: async () => {
    try {
      const res = await axios.get(API_URL, {
        headers: getAuthHeaders(),
      });
      return res.data;
    } catch (error) {
      console.error("Error al listar platos:", error);
      throw error; // para que quien llame al método pueda manejarlo
    }
  },



}