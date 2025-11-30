import { useEffect, useState } from "react";
import { enumService } from "../services/enumService";

export default function TipoTags({ filtroActivo, onFiltrar, pedidos = [] }) {
  const [tipos, setTipos] = useState([]);
  const [contadores, setContadores] = useState({});

  useEffect(() => {
    // Cargar los tipos desde el backend
    const cargar = async () => {
      try {
        const data = await enumService.tipos(); // GET de los enums
        setTipos(data || []);
      } catch (err) {
        console.error("Error al cargar tipos:", err);
        setTipos([]);
      }
    };
    cargar();
  }, []);

  useEffect(() => {
    // Contar cuántos pedidos hay por cada tipo
    const conteo = {};
    tipos.forEach((tipo) => {
      conteo[tipo] = pedidos.filter((p) => p.tipo === tipo).length;
    });
    setContadores(conteo);
  }, [tipos, pedidos]);

  return (
    <div className="flex gap-3 flex-wrap mb-4">
      {/* Botón para mostrar todos */}
      <button
        onClick={() => onFiltrar("")}
        className={`px-4 py-1 rounded-full font-semibold border transition ${
          filtroActivo === ""
            ? "bg-gray-700 text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        Todos ({pedidos.length})
      </button>

      {tipos.map((tipo) => {
        const activo = filtroActivo === tipo;

        return (
          <button
            key={tipo}
            onClick={() => onFiltrar(activo ? "" : tipo)}
            className={`px-4 py-1 rounded-full font-semibold border flex items-center gap-2 transition ${
              activo
                ? "bg-blue-600 text-white"
                : "bg-blue-100 text-blue-700 hover:bg-blue-200"
            }`}
          >
            <span>{tipo}</span>

            {/* Contador */}
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                activo ? "bg-white text-blue-700" : "bg-blue-300 text-blue-900"
              }`}
            >
              {contadores[tipo] ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}
