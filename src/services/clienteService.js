import api from '../config/api'; // ajusta la ruta según tu estructura de carpetas

export const clienteService = {
    listar: async () => {
        const res = await api.get('/clientes');
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

    buscarPorNombre: async (nombre) => {
        const res = await api.get('/clientes/buscar', {
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