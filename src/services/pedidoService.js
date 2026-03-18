import api from '../config/api';

export const pedidoService = {
    listar: async () => {
        const res = await api.get('/pedidos');
        return res.data;
    },

    obtenerPorId: async (id) => {
        const res = await api.get(`/pedidos/${id}`);
        return res.data.value || null;
    },

    buscarPorId: async (id) => {
        const res = await api.get(`/pedidos/${id}`);
        return res.data.value || null;
    },

    crear: async (pedido) => {
        const res = await api.post('/pedidos', pedido);
        return res.data;
    },

    actualizar: async (id, pedido) => {
        const res = await api.put(`/pedidos/${id}`, pedido);
        return res.data;
    },

    eliminar: async (id) => {
        await api.delete(`/pedidos/${id}`);
    },

    listarPorMesa: async (idMesa) => {
        const res = await api.get(`/pedidos/mesa/${idMesa}`);
        return res.data;
    },

    listarPorRangoFechas: async (desde, hasta) => {
        const res = await api.get('/pedidos/fecha', {
            params: { desde, hasta },
        });
        return res.data;
    },
};