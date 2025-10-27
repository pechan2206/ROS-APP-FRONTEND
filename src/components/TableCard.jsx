export default function TableCard({ mesa, onClick }) {
  const estilos = {
    libre: {
      chip: "bg-green-500",
    },
    ocupada: {
      chip: "bg-red-500",
    },
    otro: {
      chip: "bg-yellow-500",
    },
  };

  const estilo = estilos[mesa.estado] || estilos.libre;

  return (
    <button
      onClick={onClick}
      className="relative bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 flex flex-col justify-between p-4 h-36 w-full text-left"
    >
      {/* Encabezado: nombre + estado */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800 truncate max-w-[60%]">
          {mesa.nombre}
        </h3>

        <span
          className={`text-xs font-semibold text-white px-3 py-1 ml-3 rounded-full ${estilo.chip}`}
        >
          {mesa.estado.toUpperCase()}
        </span>
      </div>

      {/* Información inferior */}
      <div className="mt-3 flex justify-between items-end text-sm">
        <div>
          <p className="text-gray-500 text-xs">Capacidad</p>
          <p className="font-semibold text-gray-800">{mesa.capacidad}</p>
        </div>
        <div className="text-right">
          <p className="text-gray-500 text-xs">ID</p>
          <p className="font-semibold text-gray-800">{mesa.id}</p>
        </div>
      </div>

      {/* Franja inferior */}
      <div
        className={`absolute bottom-0 left-0 w-full h-2 rounded-b-2xl ${estilo.chip}`}
      ></div>
    </button>
  );
}
