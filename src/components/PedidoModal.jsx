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

  const esCancelado = pedido?.estado === "Anulado";

  const [formData, setFormData] = useState({
    mesaId: pedido?.mesa?.idMesa || "",
    clienteTelefono: pedido?.cliente?.telefono || "",
    tipo: pedido?.tipo || "Mesa",
    estado: pedido?.estado || "Pendiente",
    total: pedido?.total || 0,
  });

  const [sugerencias, setSugerencias] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

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

  const handleChange = async (e) => {
    if (esCancelado) return;
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "clienteTelefono" && value.length > 0) {
      try {
        const clientes = await clienteService.buscarPorTelefono(value);
        setSugerencias(clientes);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Error al buscar clientes:", error);
        setSugerencias([]);
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const seleccionarSugerencia = (telefono) => {
    if (esCancelado) return;
    setFormData((prev) => ({ ...prev, clienteTelefono: telefono }));
    setShowSuggestions(false);
  };

  const formatTotal = (num) => {
    if (num == null) return "";
    return Number(num).toLocaleString("es-CO");
  };

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
      const pedidoActualizado = { ...pedido, estado: nuevoEstado };
      await pedidoService.actualizar(pedido.idPedido, pedidoActualizado);
      onSave(pedidoActualizado);
      onClose();
    } catch (error) {
      console.error("Error al cambiar estado:", error);
    }
  };

  const inputClass = `border w-full px-2 py-1 rounded ${esCancelado ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80 relative">
        <div className="flex mb-4">
          <h2 className="text-xl font-bold text-center flex-1">
            {pedido ? "Editar Pedido" : "Crear Pedido"}
          </h2>
          <button
            onClick={onClose}
            className="text-red-500 hover:text-red-700 font-bold text-2xl"
          >
            ✖
          </button>
        </div>

        {esCancelado && (
          <div className="mb-3 px-3 py-2 bg-red-100 text-red-600 text-sm rounded-md text-center font-semibold">
            Pedido anulado
          </div>
        )}

        <SelectTipoPedido
          name="tipo"
          label="Tipo de pedido"
          value={formData.tipo}
          onChange={handleChange}
          disabled={esCancelado}
          required
        />

        {formData.tipo === "Mesa" && (
          <div className="mb-3">
            <label className="block mb-2">Número de Mesa</label>
            <input
              type="number"
              name="mesaId"
              className={inputClass}
              value={formData.mesaId}
              onChange={handleChange}
              disabled={esCancelado}
              required
            />
          </div>
        )}

        <div className="mb-3 relative">
          <label className="block mb-2">Teléfono del Cliente</label>
          <input
            type="text"
            name="clienteTelefono"
            className={inputClass}
            value={formData.clienteTelefono}
            onChange={handleChange}
            autoComplete="off"
            disabled={esCancelado}
            required
          />

          {showSuggestions && !esCancelado && (
            <ul className="absolute z-10 bg-white border w-full mt-1 max-h-40 overflow-y-auto rounded shadow">
              {sugerencias.length > 0 ? (
                sugerencias.map((cliente) => (
                  <li
                    key={cliente.idCliente}
                    className="px-2 py-1 hover:bg-gray-200 cursor-pointer"
                    onClick={() => seleccionarSugerencia(cliente.telefono)}
                    required
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

        <label className="block mb-2">Total</label>
        <input
          type="text"
          className={inputClass}
          value={formatTotal(formData.total)}
          readOnly
        />

        <div className="flex justify-end gap-2 mt-4 flex-wrap">
          {pedido?.idPedido && !esCancelado && (
            <button
              className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-md shadow hover:bg-green-700"
              onClick={() => navigate(`detalles/${pedido.idPedido}`)}
            >
              Ver detalles
            </button>
          )}

          {pedido?.idPedido && !esCancelado && (
            <button
              className="px-3 py-1.5 bg-yellow-500 text-white text-sm rounded-md shadow hover:bg-yellow-600"
              onClick={() => navigate(`${pedido.idPedido}/platos`)}
            >
              Agregar productos
            </button>
          )}

          {pedido?.idPedido && !esCancelado && (
            <button
              className="p-2 bg-purple-600 text-white rounded-md shadow hover:bg-purple-700"
              onClick={() =>
                navigate(`/mesero/pedido/${pedido.idPedido}/imprimir`)
              }
              title="Imprimir pedido"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="white"
              >
                <path d="M6 9V2h12v7h2v8h-4v4H8v-4H4V9h2zm2-5v5h8V4H8zm8 14v-4H8v4h8z" />
              </svg>
            </button>
          )}

          {pedido?.idPedido && !esCancelado && (
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
                }).then((result) => {
                  if (result.isConfirmed) {
                    cambiarEstadoRapido(pedido, "Anulado").then(() => {
                      SweetAlert.fire({
                        icon: "success",
                        title: "Pedido cancelado",
                        timer: 1500,
                        showConfirmButton: false,
                      });
                    });
                  }
                });
              }}
              className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-md shadow"
            >
              Cancelar
            </button>
          )}


          {!esCancelado && (
            <button
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md shadow hover:bg-blue-700"
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
