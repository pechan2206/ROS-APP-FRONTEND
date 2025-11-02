import axios from "axios";

const API_URL = "http://localhost:8080/api/mesas";

export const mesaService = {
  listar: async () => {
    const res = await axios.get(API_URL);
    return res.data;
  },

  obtenerPorId: async (id) => {
    const res = await axios.get(`${API_URL}/${id}`);
    return res.data;
  },

  crear: async (mesa) => {
    const res = await axios.post(API_URL, mesa);
    return res.data;
  },

  actualizar: async (id, mesa) => {
    const res = await axios.put(`${API_URL}/${id}`, mesa);
    return res.data;
  },

  eliminar: async (id) => {
    await axios.delete(`${API_URL}/${id}`);
  },

  actualizarEstado: async (id, nuevoEstado) => {
    const res = await axios.put(`${API_URL}/${id}/estado`, null, {
      params: { nuevoEstado },
    });
    return res.data;
  },
};
