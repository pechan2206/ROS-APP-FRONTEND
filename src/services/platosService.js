import api from '../config/api';

export const platosService = {
    listar: async () => {
        const res = await api.get('/platos');
        return res.data;
    },
};