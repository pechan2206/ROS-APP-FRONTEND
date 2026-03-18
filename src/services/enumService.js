import api from '../config/api'; // ajusta la ruta según tu estructura de carpetas

export const enumService = {
    estados: async () => {
        const res = await api.get('/enums/estado-pedido');
        return res.data;
    },

    tipos: async () => {
        const res = await api.get('/enums/tipo-pedido');
        return res.data;
    },
};