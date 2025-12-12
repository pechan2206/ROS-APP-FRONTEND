import { useState, useEffect } from "react";
import SelectTipoPedido from "./SelectTipoPedido";
import { clienteService } from "../services/clienteService";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { pedidoService } from "../services/pedidoService";

export default function PedidoModal({ pedido, onClose, onSave }) {
  const SweetAlert = withReactContent(Swal);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    mesaId: pedido?.mesa?.idMesa || "",
    clienteTelefono: pedido?.cliente?.telefono || "",
    tipo: pedido?.tipo || "Mesa",
    estado: pedido?.estado || "Pendiente",
    total: pedido?.total || 0,
  });

  const [sugerencias, setSugerencias] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Actualiza formData si cambia el pedido
  useEffect(() => {
    setFormData({
      mesaId: pedido?.mesa?.idMesa || "",
      clienteTelefono: pedido?.cliente?.telefono || "",
      tipo: pedido?.tipo || "Mesa",
      estado: pedido?.estado || "Pendiente",
      total: pedido?.total || 0,
    });
    setSugerencias([]);
    setShowSuggestions(false);
  }, [pedido]);

  // Manejo de cambios en inputs
  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "clienteTelefono" && value.length > 0) {
      try {
        const clientes = await clienteService.buscarPorTelefono(value);
        setSugerencias(clientes);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Error al buscar clientes por teléfono:", error);
        setSugerencias([]);
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  // Selección de sugerencia
  const seleccionarSugerencia = (telefono) => {
    setFormData((prev) => ({ ...prev, clienteTelefono: telefono }));
    setShowSuggestions(false);
  };

  // Formateo del total
  const formatTotal = (num) => {
    if (num === null || num === undefined) return "";
    return Number(num).toLocaleString("es-CO");
  };

  // Guardar pedido
  const handleSubmit = () => {
    onSave({
      ...pedido,
      mesa: formData.tipo === "Mesa" ? { idMesa: formData.mesaId } : null,
      cliente: { telefono: formData.clienteTelefono },
      tipo: formData.tipo,
      estado: formData.estado,
      total: parseFloat(formData.total),
    });
    onClose();
  };

  const cambiarEstadoRapido = async (pedido, nuevoEstado) => {
    try {
      await pedidoService.actualizar(pedido.idPedido, {
        ...pedido,
        estado: nuevoEstado,
      });
    } catch (error) {
      console.error("Error al cambiar estado:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80 relative">
        <div className="flex mb-4">
          <h2 className="text-xl font-bold text-center flex-1">
            {pedido ? "Editar Pedido" : "Crear Pedido"}
          </h2>
          <button
            onClick={onClose}
            className="text-red-500 hover:text-red-700 font-bold text-2xl transition-colors duration-200"
          >
            ✖
          </button>
        </div>

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

        {/* Teléfono del cliente con autocomplete */}
        <div className="mb-3 relative">
          <label className="block mb-2">Teléfono del Cliente</label>
          <input
            type="text"
            name="clienteTelefono"
            className="border w-full px-2 py-1 rounded"
            value={formData.clienteTelefono}
            onChange={handleChange}
            autoComplete="off"
          />

          {/* Sugerencias */}
          {showSuggestions && (
            <ul className="absolute z-10 bg-white border w-full mt-1 max-h-40 overflow-y-auto rounded shadow">
              {sugerencias.length > 0 ? (
                sugerencias.map((cliente) => (
                  <li
                    key={cliente.idCliente}
                    className="px-2 py-1 hover:bg-gray-200 cursor-pointer"
                    onClick={() => seleccionarSugerencia(cliente.telefono)}
                  >
                    {cliente.telefono} - {cliente.nombre}
                  </li>
                ))
              ) : (
                <li className="px-2 py-1 text-red-600">
                  Cliente no encontrado
                  <button
                    className="ml-2 text-blue-600 underline"
                    onClick={() => navigate("/mesero/crear-cliente")}
                  >
                    Crear nuevo
                  </button>
                </li>
              )}
            </ul>
          )}
        </div>

        {/* Total */}
        <label className="block mb-2">Total</label>
        <input
          type="text"
          className="border w-full px-2 py-1 rounded mb-3"
          value={formatTotal(formData.total)}
          readOnly
        />

        {/* Botones */}
        <div className="flex justify-end gap-2 mt-4 flex-wrap">
          {/* Ver detalles */}
          {/* Ver detalles */}
          {pedido?.idPedido && pedido?.estado !== "Cancelado" && (
            <button
              className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md shadow hover:bg-green-700 hover:shadow-lg transition-all duration-200"
              onClick={() => navigate(`detalles/${pedido.idPedido}`)}
            >
              Ver detalles
            </button>
          )}

          {/* Agregar productos */}
          {pedido?.idPedido && pedido?.estado !== "Cancelado" && (
            <button
              className="px-3 py-1.5 text-sm bg-yellow-500 text-white rounded-md shadow hover:bg-yellow-600 hover:shadow-lg transition-all duration-200"
              onClick={() => navigate(`${pedido.idPedido}/platos`)}
            >
              Agregar productos
            </button>
          )}

          {/* Cancelar pedido */}
          {pedido?.idPedido && pedido?.estado !== "Cancelado" && (
            <button
              onClick={(e) => {
                e.stopPropagation();

                SweetAlert.fire({
                  title: "¿Cancelar pedido?",
                  text: "Esta acción no se puede deshacer.",
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonText: "Sí, cancelar",
                  cancelButtonText: "No",
                  confirmButtonColor: "#d33",
                  cancelButtonColor: "#3085d6",
                }).then((result) => {
                  if (result.isConfirmed) {
                    cambiarEstadoRapido(pedido, "Cancelado");

                    SweetAlert.fire({
                      icon: "success",
                      title: "Pedido cancelado",
                      text: "El pedido fue cancelado correctamente.",
                      timer: 1500,
                      showConfirmButton: false,
                    });
                  }
                });
              }}
              className="px-4 py-2.5 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition shadow-md hover:shadow-lg flex items-center justify-center"
              title="Cancelar pedido"
            >
              Cancelar pedido
            </button>
          )}

          {/* Guardar */}
          {pedido?.estado !== "Cancelado" && (
            <button
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 hover:shadow-lg transition-all duration-200"
              onClick={handleSubmit}
            >
              Guardar
            </button>
          )}



        </div>
      </div>
    </div>
  );
}
