const API_URL = "http://localhost:8080/api/detalles-pedido";

export const detallePedidoService = {
  listar: async () => {
    const res = await fetch(API_URL);
    return res.json();
  },

  obtenerPorId: async (id) => {
    const res = await fetch(`${API_URL}/${id}`);
    return res.json();
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

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cuerpo),
    });

    if (!res.ok) {
      throw new Error("Error al crear detalle de pedido");
    }

    return res.json();
  },


  eliminar: async (id) => {
    await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
  },

  listarPorPedido: async (idPedido) => {
    const res = await fetch(`${API_URL}/pedido/${idPedido}`);
    return res.json();
  },
  actualizar: async (id, detallePedido) => {
    const cuerpo = {
      pedido: { idPedido: detallePedido.pedido?.idPedido },
      plato: { idPlato: detallePedido.plato?.idPlato },
      cantidad: detallePedido.cantidad,
      precioUnitario: detallePedido.precioUnitario,
      subtotal: detallePedido.subtotal,
    };

    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cuerpo),
    });

    if (!res.ok) {
      throw new Error("Error al actualizar detalle de pedido");
    }

    return res.json();
  },

};
