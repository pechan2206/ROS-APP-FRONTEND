import api from "../config/api";

export const platosService = {
  listar: async () => {
    const res = await api.get("/platos");
    return res.data;
  },
  listarActivos: async () => {
    const res = await api.get("/platos/listar-activos");
    return res.data;
  },

  listarCategorias: async () => {
    const res = await api.get("/categorias-plato");
    return res.data;
  },

  crear: async (plato) => {
    const res = await api.post("/platos", plato);
    return res.data;
  },

  actualizar: async (id, plato) => {
    const res = await api.put(`/platos/${id}`, plato);
    return res.data;
  },

  eliminar: async (id) => {
    const res = await api.delete(`/platos/${id}`);
    return res.data;
  },
};
