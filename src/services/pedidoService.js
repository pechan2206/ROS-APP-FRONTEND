import axios from "axios";

const API_URL = "http://localhost:8080/api/pedidos";

// 🔐 Token opcional
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const pedidoService = {
  // 🔹 Listar todos los pedidos
  listar: async () => {
    const res = await axios.get(API_URL, {
      headers: getAuthHeaders(),
    });
    return res.data;
  },

  // 🔹 Obtener pedido por ID
  obtenerPorId: async (id) => {
    const res = await axios.get(`${API_URL}/${id}`, {
      headers: getAuthHeaders(),
    });
    return res.data;
  },

  // 🔹 Crear un pedido
  crear: async (pedido) => {
    const res = await axios.post(API_URL, pedido, {
      headers: getAuthHeaders(),
    });
    return res.data;
  },

  // 🔹 Actualizar pedido
  actualizar: async (id, pedido) => {
    const res = await axios.put(`${API_URL}/${id}`, pedido, {
      headers: getAuthHeaders(),
    });
    return res.data;
  },

  // 🔹 Eliminar pedido
  eliminar: async (id) => {
    await axios.delete(`${API_URL}/${id}`, {
      headers: getAuthHeaders(),
    });
  },

  // 🔹 Listar pedidos por mesa
  listarPorMesa: async (idMesa) => {
    const res = await axios.get(`${API_URL}/mesa/${idMesa}`, {
      headers: getAuthHeaders(),
    });
    return res.data;
  },

  // 🔹 Listar pedidos por rango de fechas
  listarPorRangoFechas: async (desde, hasta) => {
    const res = await axios.get(`${API_URL}/fecha`, {
      headers: getAuthHeaders(),
      params: { desde, hasta },
    });
    return res.data;
  },
};
