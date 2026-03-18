import api from '../config/api';

export const proveedorService = {
    listar: async () => {
        const res = await api.get('/proveedores');
        return res.data;
    },

    obtenerPorId: async (id) => {
        const res = await api.get(`/proveedores/${id}`);
        return res.data;
    },

    guardar: async (proveedor) => {
        try {
            const res = await api.post('/proveedores', proveedor);
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

    actualizar: async (id, proveedor) => {
        const res = await api.put(`/proveedores/${id}`, proveedor);
        return res.data;
    },

    eliminar: async (id) => {
        await api.delete(`/proveedores/${id}`);
    },
};