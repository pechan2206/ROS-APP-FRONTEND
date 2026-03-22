import api from '../config/api';

export const categoriaPlatoService = {
    listar: async () => {
        const res = await api.get('/categorias-plato');
        return res.data;
    },

    buscarPorId: async (id) => {
        const res = await api.get(`/categorias-plato/${id}`);
        return res.data;
    },

    guardar: async (categoria) => {
        const res = await api.post('/categorias-plato', categoria);
        return res.data;
    },

    actualizar: async (id, categoria) => {
        const res = await api.put(`/categorias-plato/${id}`, categoria);
        return res.data;
    },

    eliminar: async (id) => {
        await api.delete(`/categorias-plato/${id}`);
    },

}