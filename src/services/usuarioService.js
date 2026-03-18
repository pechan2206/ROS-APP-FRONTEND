import api from '../config/api';

export const usuarioService = {
    listar: async () => {
        const res = await api.get('/usuarios');
        return res.data;
    },

    buscarPorId: async (id) => {
        const res = await api.get(`/usuarios/${id}`);
        return res.data;
    },

    guardar: async (usuario) => {
        const res = await api.post('/usuarios', usuario);
        return res.data;
    },

    actualizar: async (id, usuario) => {
        const res = await api.put(`/usuarios/${id}`, usuario);
        return res.data;
    },

    eliminar: async (id) => {
        await api.delete(`/usuarios/${id}`);
    },

    setToken: (token) => {
        localStorage.setItem('token', token);
    },

    removeToken: () => {
        localStorage.removeItem('token');
    },

    getUserFromToken: () => {
        const token = localStorage.getItem('token');
        if (!token) return null;
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch {
            return null;
        }
    },

    isAuthenticated: () => {
        const token = localStorage.getItem('token');
        if (!token) return false;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp > Math.floor(Date.now() / 1000);
        } catch {
            return false;
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    },
};