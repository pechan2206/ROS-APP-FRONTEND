export default function TableCard({ mesa, onClick, actualizarEstado }) {
  const estadoNormalizado = mesa.estado?.trim().toUpperCase();

  const estilos = {
    DISPONIBLE: { chip: "bg-green-500" },
    OCUPADA: { chip: "bg-red-500" },
    RESERVADA: { chip: "bg-yellow-500" },
  };

  const estilo = estilos[estadoNormalizado] || estilos.DISPONIBLE;

  return (
    <button
      onClick={() => onClick(mesa)} // envia la mesa al modal
      className="relative bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-between p-4 h-44 w-full text-center"
    >
      <div>
        <h3 className="text-xl font-bold text-gray-800">
          MESA {mesa.numero}
        </h3>

        <span
          className={`mt-2 inline-block text-sm font-semibold text-white px-4 py-1 rounded-full ${estilo.chip}`}
        >
          {mesa.estado}
        </span>
      </div>

      <div className="w-full flex justify-between text-sm mt-4">
        <div className="text-left">
          <p className="text-gray-500 text-xs">Capacidad</p>
          <p className="font-semibold text-gray-800">{mesa.capacidad}</p>
        </div>
        <div className="text-right">
          <p className="text-gray-500 text-xs">ID</p>
          <p className="font-semibold text-gray-800">{mesa.idMesa}</p>
        </div>
      </div>

      <div
        className={`absolute bottom-0 left-0 w-full h-2 rounded-b-2xl ${estilo.chip}`}
      ></div>
    </button>
  );
}
