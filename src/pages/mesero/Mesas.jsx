import { useEffect, useState } from "react";
import { Plus, LayoutGrid, Search } from "lucide-react";
import TableCard from "../../components/TableCard";
import MesaModal from "../../components/MesaModal";
import { mesaService } from "../../services/mesaService";
import { pedidoService } from "../../services/pedidoService";

export default function Mesas() {
  const [mesas, setMesas]                       = useState([]);
  const [pedidosActivos, setPedidosActivos]      = useState({});  // { idMesa: idPedido }
  const [loading, setLoading]                   = useState(true);
  const [modalOpen, setModalOpen]               = useState(false);
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null);
  const [filtroEstado, setFiltroEstado]         = useState("TODOS");
  const [busqueda, setBusqueda]                 = useState("");

  const cargarMesas = async () => {
    try {
      const [dataMesas, dataPedidos] = await Promise.all([
        mesaService.listar(),
        pedidoService.listar(),
      ]);

      setMesas(dataMesas);

      // Construir mapa idMesa → idPedido para pedidos activos
      const mapa = {};
      dataPedidos
        .filter(p =>
          p.mesa &&
          (p.estado === "Pendiente" || p.estado === "En_preparacion")
        )
        .forEach(p => {
          mapa[p.mesa.idMesa] = p.idPedido;
        });

      setPedidosActivos(mapa);
    } catch (error) {
      console.error("Error al cargar mesas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarMesas(); }, []);

  const abrirModal  = (mesa = null) => { setMesaSeleccionada(mesa); setModalOpen(true); };
  const cerrarModal = () => { setMesaSeleccionada(null); setModalOpen(false); };

  const guardarMesa = async (mesa) => {
    try {
      mesa.estado = mesa.estado.charAt(0).toUpperCase() + mesa.estado.slice(1).toLowerCase();
      if (mesa.idMesa) {
        await mesaService.actualizar(mesa.idMesa, mesa);
      } else {
        await mesaService.crear(mesa);
      }
      cerrarModal();
      cargarMesas();
    } catch (error) {
      throw error;
    }
  };

  const contadores = {
    TODOS:      mesas.length,
    DISPONIBLE: mesas.filter(m => m.estado?.toUpperCase() === "DISPONIBLE").length,
    OCUPADA:    mesas.filter(m => m.estado?.toUpperCase() === "OCUPADA").length,
    RESERVADA:  mesas.filter(m => m.estado?.toUpperCase() === "RESERVADA").length,
  };

  const filtros = [
    { key: "TODOS",      label: "Todas",       color: "bg-gray-600"    },
    { key: "DISPONIBLE", label: "Disponibles", color: "bg-emerald-500" },
    { key: "OCUPADA",    label: "Ocupadas",    color: "bg-red-500"     },
    { key: "RESERVADA",  label: "Reservadas",  color: "bg-amber-400"   },
  ];

  const mesasFiltradas = mesas.filter(m => {
    const coincideEstado   = filtroEstado === "TODOS" || m.estado?.toUpperCase() === filtroEstado;
    const coincideBusqueda = String(m.numero).includes(busqueda.trim());
    return coincideEstado && coincideBusqueda;
  });

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black text-gray-800">Mesas</h1>
          <p className="text-gray-500 text-sm mt-1">{mesas.length} mesas registradas</p>
        </div>
        <button
          onClick={() => abrirModal(null)}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition-all duration-200 hover:-translate-y-0.5"
        >
          <Plus size={18} />
          Agregar Mesa
        </button>
      </div>

      {/* Filtros + Búsqueda */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {filtros.map(f => (
          <button
            key={f.key}
            onClick={() => setFiltroEstado(f.key)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border-2
              ${filtroEstado === f.key
                ? `${f.color} text-white border-transparent shadow`
                : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"}
            `}
          >
            {f.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold
              ${filtroEstado === f.key ? "bg-white/30 text-white" : "bg-gray-100 text-gray-500"}`}>
              {contadores[f.key]}
            </span>
          </button>
        ))}

        <div className="relative ml-auto">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="number"
            placeholder="Buscar mesa..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-44 transition"
          />
        </div>
      </div>

      {/* Grid */}
      {mesasFiltradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <LayoutGrid size={48} className="mb-3 opacity-30" />
          <p className="font-semibold">No hay mesas con ese filtro</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {mesasFiltradas.map(mesa => (
            <TableCard
              key={mesa.idMesa}
              mesa={mesa}
              pedidoActivo={pedidosActivos[mesa.idMesa] ?? null}  // ← nuevo
              onClick={() => abrirModal(mesa)}
            />
          ))}
        </div>
      )}

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