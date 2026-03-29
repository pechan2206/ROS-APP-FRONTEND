import api from '../config/api'; // ajusta la ruta según tu estructura de carpetas

export const mesaService = {
    listar: async () => {
        const res = await api.get('/mesas');
        return res.data;
    },

    buscarPorNumero: async (numero) => {
        const res = await api.get(`/mesas/numero/${numero}`);
        return res.data;
    },

    obtenerPorId: async (id) => {
        const res = await api.get(`/mesas/${id}`);
        return res.data;
    },

    crear: async (mesa) => {
        const res = await api.post('/mesas', mesa);
        return res.data;
    },

    actualizar: async (id, mesa) => {
        const res = await api.put(`/mesas/${id}`, mesa);
        return res.data;
    },

    eliminar: async (id) => {
        await api.delete(`/mesas/${id}`);
    },

    actualizarEstado: async (id, nuevoEstado) => {
        const res = await api.put(`/mesas/${id}/estado`, null, {
            params: { nuevoEstado },
        });
        return res.data;
    },
};