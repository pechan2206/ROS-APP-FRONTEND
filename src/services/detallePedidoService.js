import api from '../config/api';

export const detallePedidoService = {
    listar: async () => {
        const res = await api.get('/detalles-pedido');
        return res.data;
    },

    obtenerPorId: async (id) => {
        const res = await api.get(`/detalles-pedido/${id}`);
        return res.data;
    },

    crear: async (detallePedido) => {
        const cuerpo = {
            pedido: { idPedido: detallePedido.pedido?.idPedido },
            plato: { idPlato: detallePedido.plato?.idPlato },
            cantidad: detallePedido.cantidad,
            precioUnitario: detallePedido.precioUnitario ?? detallePedido.precio,
            subtotal:
                (detallePedido.precioUnitario ?? detallePedido.precio) *
                detallePedido.cantidad,
        };

        try {
            const res = await api.post('/detalles-pedido', cuerpo);
            return res.data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                JSON.stringify(error.response?.data) ||
                error.message ||
                'Error al crear detalle de pedido';
            throw new Error(errorMessage);
        }
    },

    eliminar: async (id) => {
        await api.delete(`/detalles-pedido/${id}`);
    },

    listarPorPedido: async (idPedido) => {
        const res = await api.get(`/detalles-pedido/pedido/${idPedido}`);
        return res.data;
    },

    actualizar: async (id, detallePedido) => {
        const cuerpo = {
            pedido: { idPedido: detallePedido.pedido?.idPedido },
            plato: { idPlato: detallePedido.plato?.idPlato },
            cantidad: detallePedido.cantidad,
            precioUnitario: detallePedido.precioUnitario,
            subtotal: detallePedido.subtotal,
        };

        try {
            const res = await api.put(`/detalles-pedido/${id}`, cuerpo);
            return res.data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                JSON.stringify(error.response?.data) ||
                error.message ||
                'Error al actualizar detalle de pedido';
            throw new Error(errorMessage);
        }
    },
};