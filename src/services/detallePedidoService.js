const API_URL = "http://localhost:8080/api/detalles-pedido";

export const detallePedidoService = {
  // Obtener todos los detalles de pedido
  listar: async () => {
    const res = await fetch(API_URL);
    return res.json();
  },

  // Obtener detalle de pedido por ID
  obtenerPorId: async (id) => {
    const res = await fetch(`${API_URL}/${id}`);
    return res.json();
  },

  // Crear un detalle de pedido
  crear: async (detallePedido) => {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(detallePedido),
    });
    return res.json();
  },

  // Actualizar un detalle de pedido
  actualizar: async (id, detallePedido) => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(detallePedido),
    });
    return res.json();
  },

  // Eliminar un detalle de pedido
  eliminar: async (id) => {
    await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
  },

  // Listar detalles por id de pedido
  listarPorPedido: async (idPedido) => {
    const res = await fetch(`${API_URL}/pedido/${idPedido}`);
    return res.json();
  },
};
