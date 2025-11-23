import { useEffect, useState } from "react";
import TableCard from "../../components/TableCard";
import MesaModal from "../../components/MesaModal";
import { mesaService } from "../../services/mesaService";

export default function Mesas() {
  const [mesas, setMesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null);

  // Cargar mesas desde backend
  const cargarMesas = async () => {
    try {
      const data = await mesaService.listar();
      setMesas(data);
    } catch (error) {
      console.error("Error al cargar mesas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarMesas();
  }, []);

  // Abrir modal para crear o editar
  const abrirModal = (mesa = null) => {
    setMesaSeleccionada(mesa);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setMesaSeleccionada(null);
    setModalOpen(false);
  };

  // Guardar mesa (crear o actualizar)
  const guardarMesa = async (mesa) => {
    try {
      // Normalizar estado antes de enviar
      mesa.estado = mesa.estado.charAt(0).toUpperCase() + mesa.estado.slice(1).toLowerCase();

      if (mesa.idMesa) {
        await mesaService.actualizar(mesa.idMesa, mesa);
      } else {
        await mesaService.crear(mesa);
      }

      cerrarModal();
      cargarMesas();
    } catch (error) {
      console.error("Error al guardar mesa:", error);
    }
  };

  // Actualizar solo estado desde TableCard
  const actualizarEstadoMesa = async (id, nuevoEstado) => {
    try {
      // Normalizar enum
      const estadoNormalized = nuevoEstado.charAt(0).toUpperCase() + nuevoEstado.slice(1).toLowerCase();
      await mesaService.actualizarEstado(id, estadoNormalized);
      cargarMesas();
    } catch (error) {
      console.error("Error al actualizar estado de mesa:", error);
    }
  };

  if (loading) return <p>Cargando mesas...</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Mesas</h1>

      {/* Botón para crear */}
      <button
        onClick={() => abrirModal(null)}
        className="mb-4 px-4 py-2 bg-green-600 text-white rounded-lg"
      >
        Agregar Mesa
      </button>

      {/* Lista de mesas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {mesas.map((mesa) => (
          <TableCard
            key={mesa.idMesa}
            mesa={mesa}
            onClick={() => abrirModal(mesa)}
            actualizarEstado={actualizarEstadoMesa}
          />
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <MesaModal
          mesa={mesaSeleccionada}
          onClose={cerrarModal}
          onSave={guardarMesa}
        />
      )}
    </div>
  );
}
