import { useState, useEffect } from "react";
import SelectTipoPedido from "./SelectTipoPedido";

export default function PedidoModal({ pedido, onClose, onSave }) {
  const [formData, setFormData] = useState({
    mesaId: pedido?.mesa?.idMesa || "",
    clienteId: pedido?.cliente?.idCliente || "",
    tipo: pedido?.tipo || "Mesa",
    estado: pedido?.estado || "Pendiente",
    total: pedido?.total || 0,
  });

  useEffect(() => {
    setFormData({
      mesaId: pedido?.mesa?.idMesa || "",
      clienteId: pedido?.cliente?.idCliente || "",
      tipo: pedido?.tipo || "Mesa",
      estado: pedido?.estado || "Pendiente",
      total: pedido?.total || 0,
    });
  }, [pedido]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSave({
      ...pedido,
      mesa: formData.tipo === "Mesa" ? { idMesa: formData.mesaId } : null,
      cliente: { idCliente: formData.clienteId },
      tipo: formData.tipo,
      estado: formData.estado,
      total: parseFloat(formData.total),
    });
    onClose();
  };

  const formatTotal = (num) => {
    if (num === null || num === undefined) return "";
    return Number(num).toLocaleString("es-CO");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80">
        <h2 className="text-xl font-bold mb-4">
          {pedido ? "Editar Pedido" : "Crear Pedido"}
        </h2>

        <label className="block mb-2">Tipo</label>
        {/* Tipo de pedido */}
        <SelectTipoPedido
          name="tipo"
          label="Tipo de pedido"
          value={formData.tipo}
          onChange={handleChange}
        />

        {/* Número de mesa solo si es tipo "Mesa" */}
        {formData.tipo === "Mesa" && (
          <div className="mb-3">
            <label className="block mb-2">Número de Mesa</label>
            <input
              type="number"
              name="mesaId"
              className="border w-full px-2 py-1 rounded"
              value={formData.mesaId}
              onChange={handleChange}
            />
          </div>
        )}

        <label className="block mb-2">Cliente</label>
        <input
          type="number"
          name="clienteId"
          className="border w-full px-2 py-1 rounded mb-3"
          value={formData.clienteId}
          onChange={handleChange}
        />

        <label className="block mb-2">Estado</label>
        <select
          name="estado"
          className="border w-full px-2 py-1 rounded mb-3"
          value={formData.estado}
          onChange={handleChange}
        >
          <option value="Pendiente">Pendiente</option>
          <option value="En preparación">En preparación</option>
          <option value="Entregado">Entregado</option>
          <option value="Cancelado">Cancelado</option>
        </select>

        <label className="block mb-2">Total</label>
        <input
          type="text"
          className="border w-full px-2 py-1 rounded mb-3"
          value={formatTotal(formData.total)}
          readOnly
        />

        <div className="flex justify-end gap-2 mt-4">
          <button
            className="px-4 py-2 bg-gray-400 text-white rounded"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={handleSubmit}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
