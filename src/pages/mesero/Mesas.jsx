import { useEffect, useState } from "react";
import TableCard from "../../components/TableCard";
import MesaModal from "../../components/MesaModal";
import { mesaService } from "../../services/mesaService";



export default function Mesas() {
  const [mesas, setMesas] = useState([]);
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null);
  const [filtro, setFiltro] = useState("todas");

  // ✅ Cargar las mesas al montar el componente
  useEffect(() => {
    const cargarMesas = async () => {
      try {
        const data = await mesaService.listar();
        setMesas(data);
      } catch (error) {
        console.error("Error al obtener las mesas:", error);
      }
    };
    cargarMesas();
  }, []);

  // ✅ Guardar los cambios de una mesa
  const actualizarMesa = async (mesaActualizada) => {
    try {
      await mesaService.actualizar(mesaActualizada.idMesa, mesaActualizada);
      setMesas((prev) =>
        prev.map((m) =>
          m.idMesa === mesaActualizada.idMesa ? mesaActualizada : m
        )
      );
    } catch (error) {
      console.error("Error al actualizar mesa:", error);
    }
  };

  // ✅ Filtro visual
  const mesasFiltradas =
    filtro === "todas" ? mesas : mesas.filter((m) => m.estado === filtro);

  const total = mesas.length;
  const disponibles = mesas.filter((m) => m.estado === "DISPONIBLE").length;
  const ocupadas = mesas.filter((m) => m.estado === "OCUPADA").length;
  const reservadas = mesas.filter((m) => m.estado === "RESERVADA").length;
  const limpieza = mesas.filter((m) => m.estado === "LIMPIEZA").length;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <main className="flex-grow max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <h2 className="text-3xl font-semibold text-gray-800">
            Control de Mesas
          </h2>

          <div className="flex items-center gap-3">
            <label className="text-gray-600 text-sm">Filtrar por:</label>
            <select
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="todas">Todas</option>
              <option value="DISPONIBLE">Disponibles</option>
              <option value="OCUPADA">Ocupadas</option>
              <option value="RESERVADA">Reservadas</option>
              <option value="LIMPIEZA">Limpieza</option>
            </select>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          <div className="bg-green-100 text-green-700 rounded-xl p-4 shadow-sm text-center">
            <p className="text-sm font-medium">Disponibles</p>
            <p className="text-2xl font-bold">{disponibles}</p>
          </div>
          <div className="bg-red-100 text-red-700 rounded-xl p-4 shadow-sm text-center">
            <p className="text-sm font-medium">Ocupadas</p>
            <p className="text-2xl font-bold">{ocupadas}</p>
          </div>
          <div className="bg-yellow-100 text-yellow-700 rounded-xl p-4 shadow-sm text-center">
            <p className="text-sm font-medium">Reservadas</p>
            <p className="text-2xl font-bold">{reservadas}</p>
          </div>
          <div className="bg-blue-100 text-blue-700 rounded-xl p-4 shadow-sm text-center">
            <p className="text-sm font-medium">Limpieza</p>
            <p className="text-2xl font-bold">{limpieza}</p>
          </div>
        </div>

        {/* Tarjetas */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
          {mesasFiltradas.map((mesa) => (
            <TableCard
              key={mesa.idMesa}
              mesa={{
                id: mesa.idMesa,
                nombre: `Mesa ${mesa.numeroMesa}`,
                estado: mesa.estado,
                capacidad: mesa.capacidad ?? 4,
              }}
              onClick={() => setMesaSeleccionada(mesa)}
            />
          ))}
        </div>
      </main>

      {mesaSeleccionada && (
        <MesaModal
          mesa={mesaSeleccionada}
          onClose={() => setMesaSeleccionada(null)}
          onSave={(nuevaMesa) => actualizarMesa(nuevaMesa)}
        />
      )}
    </div>
  );
}
