import axios from "axios";

const API_URL = "http://localhost:8080/api/platos";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const platosService = {
  // Obtener todos los detalles de pedido
  listar: async () => {
    const res = await axios.get(API_URL,{
        headers: getAuthHeaders(),
    });
    return res.data;
  },


}