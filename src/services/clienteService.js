import api from '../config/api';

export const clienteService = {

    // Solo activos — para pedidos, búsquedas rápidas, etc.
    listar: async () => {
        const res = await api.get('/clientes');
        return res.data;
    },

    // Activos + inactivos — para la vista de administración
    listarTodos: async () => {
        const res = await api.get('/clientes/listar-todos');
        return res.data;
    },

    obtenerPorId: async (id) => {
        const res = await api.get(`/clientes/${id}`);
        return res.data;
    },

    guardar: async (cliente) => {
        try {
            const res = await api.post('/clientes', cliente);
            return res.data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                JSON.stringify(error.response?.data) ||
                error.message ||
                'Error desconocido';
            throw new Error(errorMessage);
        }
    },

    actualizar: async (id, cliente) => {
        const res = await api.put(`/clientes/${id}`, cliente);
        return res.data;
    },

    eliminar: async (id) => {
        await api.delete(`/clientes/${id}`);
    },

    activar: async (id) => {
        await api.patch(`/clientes/${id}/activar`);
    },

    buscarPorNombre: async (nombre) => {
        const res = await api.get('/clientes/buscar-nombre', {
            params: { nombre },
        });
        return res.data;
    },

    buscarPorTelefono: async (telefono) => {
        const res = await api.get('/clientes/buscar-telefono', {
            params: { telefono },
        });
        return res.data;
    },
};