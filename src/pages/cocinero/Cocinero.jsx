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

      const estadosPermitidos = [
        "Pendiente",
        "En_preparacion",
        "Entregado",
        "Cancelado",
      ];

      const pedidosCocina = data.filter((p) =>
        estadosPermitidos.includes(p.estado)
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
    const interval = setInterval(cargarPedidos, 30000);
    return () => clearInterval(interval);
  }, []);

  // Lista filtrada según estado
  const pedidosFiltrados =
    filtroEstado === "todos"
      ? pedidos
      : pedidos.filter((p) => p.estado === filtroEstado);

  // Calcular contadores
  const contadores = {
    total: pedidos.length,
    pendientes: pedidos.filter((p) => p.estado === "Pendiente").length,
    en_preparacion: pedidos.filter((p) => p.estado === "En_preparacion")
      .length,
    entregados: pedidos.filter((p) => p.estado === "Entregado").length,
    cancelados: pedidos.filter((p) => p.estado === "Cancelado").length,
  };

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

  const cambiarEstadoRapido = async (pedido, nuevoEstado) => {
    try {
      await pedidoService.actualizar(pedido.idPedido, {
        ...pedido,
        estado: nuevoEstado,
      });
      cargarPedidos();
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      alert("Error al actualizar el pedido");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">Cargando pedidos...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          🍳 Pedidos en Cocina
        </h1>
        <button
          onClick={cargarPedidos}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Actualizar
        </button>
      </div>

      {/* Filtros por estado */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => setFiltroEstado("todos")}
          className={`px-4 py-2 rounded-full font-semibold border transition ${
            filtroEstado === "todos"
              ? "bg-gray-700 text-white border-gray-700"
              : "bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300"
          }`}
        >
          Todos ({contadores.total})
        </button>

        <button
          onClick={() => setFiltroEstado("Pendiente")}
          className={`px-4 py-2 rounded-full font-semibold border flex items-center gap-2 transition ${
            filtroEstado === "Pendiente"
              ? "bg-yellow-500 text-white border-yellow-500"
              : "bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200"
          }`}
        >
          <span>⏳ Pendientes</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              filtroEstado === "Pendiente"
                ? "bg-white text-yellow-700"
                : "bg-yellow-300 text-yellow-900"
            }`}
          >
            {contadores.pendientes}
          </span>
        </button>

        <button
          onClick={() => setFiltroEstado("En_preparacion")}
          className={`px-4 py-2 rounded-full font-semibold border flex items-center gap-2 transition ${
            filtroEstado === "En_preparacion"
              ? "bg-blue-500 text-white border-blue-500"
              : "bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200"
          }`}
        >
          <span>👨‍🍳 En Preparación</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              filtroEstado === "En_preparacion"
                ? "bg-white text-blue-700"
                : "bg-blue-300 text-blue-900"
            }`}
          >
            {contadores.en_preparacion}
          </span>
        </button>

        <button
          onClick={() => setFiltroEstado("Entregado")}
          className={`px-4 py-2 rounded-full font-semibold border flex items-center gap-2 transition ${
            filtroEstado === "Entregado"
              ? "bg-green-500 text-white border-green-500"
              : "bg-green-100 text-green-700 border-green-300 hover:bg-green-200"
          }`}
        >
          <span>✅ Entregados</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              filtroEstado === "Entregado"
                ? "bg-white text-green-700"
                : "bg-green-300 text-green-900"
            }`}
          >
            {contadores.entregados}
          </span>
        </button>

        <button
          onClick={() => setFiltroEstado("Cancelado")}
          className={`px-4 py-2 rounded-full font-semibold border flex items-center gap-2 transition ${
            filtroEstado === "Cancelado"
              ? "bg-red-500 text-white border-red-500"
              : "bg-red-100 text-red-700 border-red-300 hover:bg-red-200"
          }`}
        >
          <span>❌ Cancelados</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              filtroEstado === "Cancelado"
                ? "bg-white text-red-700"
                : "bg-red-300 text-red-900"
            }`}
          >
            {contadores.cancelados}
          </span>
        </button>
      </div>

      {/* Contador de pedidos */}
      <div className="mb-6 p-4 bg-orange-50 border-l-4 border-orange-500 rounded">
        <p className="font-semibold text-orange-800">
          📋 {pedidosFiltrados.length} pedido(s){" "}
          {filtroEstado !== "todos" && (
            <span>
              -{" "}
              {filtroEstado === "En_preparacion"
                ? "En Preparación"
                : filtroEstado}
            </span>
          )}
        </p>
      </div>

      {/* Lista de pedidos */}
      {pedidosFiltrados.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {pedidosFiltrados.map((pedido) => (
            <div key={pedido.idPedido} className="flex flex-col gap-2">
              {/* Card del pedido */}
              <PedidoCard pedido={pedido} onClick={() => abrirModal(pedido)} />

              {/* Botones de acción según el estado */}
              <div className="flex gap-2">
                {/* PENDIENTE: Iniciar o Cancelar */}
                {pedido.estado === "Pendiente" && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        cambiarEstadoRapido(pedido, "En_preparacion");
                      }}
                      className="flex-1 px-4 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition shadow-md hover:shadow-lg"
                    >
                      Iniciar Preparación
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          window.confirm(
                            "¿Estás seguro de cancelar este pedido?"
                          )
                        ) {
                          cambiarEstadoRapido(pedido, "Cancelado");
                        }
                      }}
                      className="px-4 py-2.5 bg-red-400 text-white text-sm font-bold rounded-lg hover:bg-red-500 transition shadow-md hover:shadow-lg flex items-center justify-center"
                      title="Cancelar pedido"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </>
                )}

                {/* EN PREPARACIÓN: Marcar como Entregado o Cancelar */}
                {pedido.estado === "En_preparacion" && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        cambiarEstadoRapido(pedido, "Entregado");
                      }}
                      className="flex-1 px-4 py-2.5 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition shadow-md hover:shadow-lg"
                    >
                      Marcar Entregado
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          window.confirm(
                            "¿Estás seguro de cancelar este pedido?"
                          )
                        ) {
                          cambiarEstadoRapido(pedido, "Cancelado");
                        }
                      }}
                      className="px-4 py-2.5 bg-red-400 text-white text-sm font-bold rounded-lg hover:bg-red-500 transition shadow-md hover:shadow-lg flex items-center justify-center"
                      title="Cancelar pedido"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Mensaje cuando no hay pedidos */
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
          <div className="text-6xl mb-4">🍽️</div>
          <p className="text-xl font-semibold text-gray-700 mb-2">
            No hay pedidos{" "}
            {filtroEstado === "todos"
              ? "en cocina"
              : filtroEstado === "En_preparacion"
              ? "en preparación"
              : filtroEstado.toLowerCase()}
          </p>
          <p className="text-sm text-gray-500">
            Los nuevos pedidos aparecerán aquí automáticamente
          </p>
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