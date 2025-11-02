export default function TableCard({ mesa, onClick }) {
  const estilos = {
    DISPONIBLE: { chip: "bg-green-500" },
    OCUPADA: { chip: "bg-red-500" },
    RESERVADA: { chip: "bg-yellow-500" },
    LIMPIEZA: { chip: "bg-blue-500" },
  };

  const estilo = estilos[mesa.estado] || estilos.DISPONIBLE;

  return (
    <button
      onClick={onClick}
      className="relative bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-between p-4 h-44 w-full text-center"
    >
      {/* Nombre de mesa */}
      <div>
        <h3 className="text-xl font-bold text-gray-800">
          {mesa.nombre.toUpperCase()}
        </h3>
        <span
          className={`mt-2 inline-block text-sm font-semibold text-white px-4 py-1 rounded-full ${estilo.chip}`}
        >
          {mesa.estado}
        </span>
      </div>

      {/* Información inferior */}
      <div className="w-full flex justify-between text-sm mt-4">
        <div className="text-left">
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
