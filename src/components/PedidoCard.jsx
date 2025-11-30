export default function PedidoCard({ pedido, onClick, eliminarPedido }) {
  // Normalizamos el tipo del pedido
  const tipoNormalizado = pedido.tipo?.trim().toUpperCase();

  // Mismos estilos tipo "chip" usados en TableCard
  const estilos = {
    MESA: { chip: "bg-blue-500" },
    LLEVAR: { chip: "bg-green-500" },
    DOMICILIO: { chip: "bg-purple-500" },
  };

  const estilo = estilos[tipoNormalizado] || { chip: "bg-gray-500" };

  const formatTotal = (num) => {
    if (!num && num !== 0) return "";
    return Number(num).toLocaleString("es-CO");
  };


  return (
    <button
      onClick={onClick}
      className="relative bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 flex flex-col justify-between p-4 h-44 w-full text-left"
    >
      {/* Encabezado */}
      <div className="flex items-center justify-between w-full">
        <h3 className="text-xl font-bold text-gray-800">
          Pedido #{pedido.idPedido}
        </h3>

        {/* Chip del tipo */}
        <span
          className={`inline-block text-sm font-semibold text-white px-4 py-1 rounded-full ${estilo.chip}`}
        >
          {pedido.tipo}
        </span>
      </div>

      {/* Datos del pedido */}
      <div>
        <div className="text-left">
          <p className="text-gray-500 text-xs">Total</p>
          <p className="font-semibold text-gray-800">
            {"$" + formatTotal(pedido.total)}
          </p>
        </div>
      </div>
      <div className="w-full flex justify-between text-sm mt-4">
        <div className="text-left">
          <p className="text-gray-500 text-xs">Mesa</p>
          <p className="font-semibold text-gray-800">
            {pedido.mesa?.numero ?? "N/A"}
          </p>
        </div>

        <div className="text-right">
          <p className="text-gray-500 text-xs">ID</p>
          <p className="font-semibold text-gray-800">{pedido.idPedido}</p>
        </div>

        <div className="text-right">
          <p className="text-gray-500 text-xs">Nombre</p>
          <p className="font-semibold text-gray-800">
            {pedido.cliente?.nombre || "N/A"}
          </p>
        </div>
      </div>

      {/* Borde inferior con el color del chip */}
      <div
        className={`absolute bottom-0 left-0 w-full h-2 rounded-b-2xl ${estilo.chip}`}
      ></div>
    </button>
  );
}
