import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PedidoCard from "../../components/PedidoCard";
import PedidoModal from "../../components/PedidoModal";
import { pedidoService } from "../../services/pedidoService";
import TipoTags from "../../components/TipoTags";

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState("");

  const navigate = useNavigate(); // ← Definido aquí

  // Cargar pedidos
  const cargarPedidos = async () => {
    try {
      const data = await pedidoService.listar();
      setPedidos(data);
    } catch (error) {
      console.error("Error al cargar pedidos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  // Lista filtrada según filtroTipo
  const pedidosFiltrados = filtroTipo
    ? pedidos.filter((p) => p.tipo === filtroTipo)
    : pedidos;

  const abrirModal = (pedido = null) => {
    setPedidoSeleccionado(pedido);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setPedidoSeleccionado(null);
    setModalOpen(false);
  };

  const guardarPedido = async (pedidoActualizado) => {
    try {
      let pedidoGuardado;
      if (pedidoActualizado.idPedido) {
        pedidoGuardado = await pedidoService.actualizar(pedidoActualizado.idPedido, pedidoActualizado);
      } else {
        pedidoGuardado = await pedidoService.crear(pedidoActualizado);
        // Redirige a la página de detalle del pedido
        navigate(`${pedidoGuardado.idPedido}/platos `);
      }
      cerrarModal();
      cargarPedidos();
    } catch (error) {
      console.error("Error al guardar pedido:", error);
    }
  };


  if (loading) return <p>Cargando pedidos...</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Pedidos</h1>

      {/* FILTRO DE TAGS */}
      <TipoTags
        filtroActivo={filtroTipo}
        onFiltrar={(tipo) => setFiltroTipo(tipo)}
        pedidos={pedidos}
      />

      {/* Botón crear pedido */}
      <button
        onClick={() => abrirModal(null)}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        Crear Pedido
      </button>

      {/* Lista filtrada */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {pedidosFiltrados.map((pedido) => (
          <PedidoCard
            key={pedido.idPedido}
            pedido={pedido}
            onClick={() => abrirModal(pedido)}
            onSave={guardarPedido}
          />
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <PedidoModal
          pedido={pedidoSeleccionado}
          onClose={cerrarModal}
          onSave={guardarPedido}
        />
      )}
    </div>
  );
}
