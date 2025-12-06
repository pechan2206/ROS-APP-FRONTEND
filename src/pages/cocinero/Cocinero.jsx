import { useEffect, useState } from "react";
import PedidoCard from "../../components/PedidoCard";
import PedidoModal from "../../components/PedidoModal";
import { pedidoService } from "../../services/pedidoService";

export default function Cocina() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState("todos");

  // Cargar pedidos
  const cargarPedidos = async () => {
    try {
      const data = await pedidoService.listar();
      // Filtrar solo pedidos pendientes o en preparación para la cocina
      const pedidosCocina = data.filter(
        (p) => p.estado === "Pendiente" || p.estado === "En preparación"
      );
      setPedidos(pedidosCocina);
    } catch (error) {
      console.error("Error al cargar pedidos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPedidos();
    // Auto-refresh cada 30 segundos
    const interval = setInterval(cargarPedidos, 30000);
    return () => clearInterval(interval);
  }, []);

  // Lista filtrada según estado
  const pedidosFiltrados =
    filtroEstado === "todos"
      ? pedidos
      : pedidos.filter((p) => p.estado === filtroEstado);

  const abrirModal = (pedido) => {
    setPedidoSeleccionado(pedido);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setPedidoSeleccionado(null);
    setModalOpen(false);
  };

  const actualizarEstadoPedido = async (pedidoActualizado) => {
    try {
      await pedidoService.actualizar(
        pedidoActualizado.idPedido,
        pedidoActualizado
      );
      cerrarModal();
      cargarPedidos();
    } catch (error) {
      console.error("Error al actualizar pedido:", error);
    }
  };

  // Función rápida para cambiar estado sin abrir modal
  const cambiarEstadoRapido = async (pedido, nuevoEstado) => {
    try {
      await pedidoService.actualizar(pedido.idPedido, {
        ...pedido,
        estado: nuevoEstado,
      });
      cargarPedidos();
    } catch (error) {
      console.error("Error al cambiar estado:", error);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">Cargando pedidos...</div>
      </div>
    );

  return (
    <div className="p-6">
      {/* Header con título y botón de actualizar */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          🍳 Pedidos en Cocina
        </h1>
        <button
          onClick={cargarPedidos}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
        >
          🔄 Actualizar
        </button>
      </div>

      {/* Filtros por estado */}
      <div className="mb-6 flex gap-3">
        <button
          onClick={() => setFiltroEstado("todos")}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            filtroEstado === "todos"
              ? "bg-orange-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Todos ({pedidos.length})
        </button>
        <button
          onClick={() => setFiltroEstado("Pendiente")}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            filtroEstado === "Pendiente"
              ? "bg-yellow-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Pendientes (
          {pedidos.filter((p) => p.estado === "Pendiente").length})
        </button>
        <button
          onClick={() => setFiltroEstado("En preparación")}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            filtroEstado === "En preparación"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          En Preparación (
          {pedidos.filter((p) => p.estado === "En preparación").length})
        </button>
      </div>

      {/* Contador de pedidos */}
      <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
        <p className="font-semibold text-yellow-800">
          📋 {pedidosFiltrados.length} pedido(s) en espera
        </p>
      </div>

      {/* Lista de pedidos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {pedidosFiltrados.map((pedido) => (
          <div key={pedido.idPedido} className="relative">
            <PedidoCard pedido={pedido} onClick={() => abrirModal(pedido)} />

            {/* Botones de acción rápida */}
            <div className="mt-2 flex gap-2">
              {pedido.estado === "Pendiente" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    cambiarEstadoRapido(pedido, "En preparación");
                  }}
                  className="flex-1 px-3 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
                >
                  🔥 Iniciar
                </button>
              )}
              {pedido.estado === "En preparación" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    cambiarEstadoRapido(pedido, "Entregado");
                  }}
                  className="flex-1 px-3 py-1.5 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition"
                >
                  ✅ Finalizar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Mensaje cuando no hay pedidos */}
      {pedidosFiltrados.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-xl">
            ✅ No hay pedidos{" "}
            {filtroEstado === "todos"
              ? "pendientes"
              : filtroEstado.toLowerCase()}
          </p>
          <p className="text-sm mt-2">Los nuevos pedidos aparecerán aquí</p>
        </div>
      )}

      {/* Modal para ver detalles */}
      {modalOpen && (
        <PedidoModal
          pedido={pedidoSeleccionado}
          onClose={cerrarModal}
          onSave={actualizarEstadoPedido}
        />
      )}
    </div>
  );
}