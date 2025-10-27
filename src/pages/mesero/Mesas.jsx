import { useState } from "react";
import TableCard from "../../components/TableCard";
import MesaModal from "../../components/MesaModal";

export default function Mesas() {
  const [mesas, setMesas] = useState(
    Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      nombre: `Mesa ${i + 1}`,
      estado: "libre",
      capacidad: [2, 4, 6][Math.floor(Math.random() * 3)],
    }))
  );

  const [mesaSeleccionada, setMesaSeleccionada] = useState(null);
  const [filtro, setFiltro] = useState("todas");

  const actualizarMesa = (mesaActualizada) => {
    setMesas((prev) =>
      prev.map((m) => (m.id === mesaActualizada.id ? mesaActualizada : m))
    );
  };

  const mesasFiltradas =
    filtro === "todas" ? mesas : mesas.filter((m) => m.estado === filtro);

  const total = mesas.length;
  const libres = mesas.filter((m) => m.estado === "libre").length;
  const ocupadas = mesas.filter((m) => m.estado === "ocupada").length;
  const otros = mesas.filter((m) => m.estado === "otro").length;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <main className="flex-grow max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <h2 className="text-3xl font-semibold text-gray-800">Control de Mesas</h2>

          <div className="flex items-center gap-3">
            <label className="text-gray-600 text-sm">Filtrar por:</label>
            <select
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="todas">Todas</option>
              <option value="libre">Libres</option>
              <option value="ocupada">Ocupadas</option>
              <option value="otro">Otro estado</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          <div className="bg-green-100 text-green-700 rounded-xl p-4 shadow-sm text-center">
            <p className="text-sm font-medium">Libres</p>
            <p className="text-2xl font-bold">{libres}</p>
          </div>
          <div className="bg-red-100 text-red-700 rounded-xl p-4 shadow-sm text-center">
            <p className="text-sm font-medium">Ocupadas</p>
            <p className="text-2xl font-bold">{ocupadas}</p>
          </div>
          <div className="bg-yellow-100 text-yellow-700 rounded-xl p-4 shadow-sm text-center">
            <p className="text-sm font-medium">Otros</p>
            <p className="text-2xl font-bold">{otros}</p>
          </div>
          <div className="bg-blue-100 text-blue-700 rounded-xl p-4 shadow-sm text-center">
            <p className="text-sm font-medium">Total</p>
            <p className="text-2xl font-bold">{total}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
          {mesasFiltradas.map((mesa) => (
            <TableCard
              key={mesa.id}
              mesa={mesa}
              onClick={() => setMesaSeleccionada(mesa)}
            />
          ))}
        </div>

        <p className="text-xs text-gray-400 mt-6 text-center">
          Clic en una mesa para ver o modificar sus detalles
        </p>
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
