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
      className="relative bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 flex flex-col justify-between p-4 h-48 w-full text-left"
    >
      {/* Encabezado */}
      <div className="flex items-center justify-between w-full mb-3">
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

      {/* Información condicional según tipo */}
      <div className="mb-4 flex justify-between gap-6">

        {/* COLUMNA IZQUIERDA */}
        <div className="flex-1">
          {pedido.tipo !== "Llevar" && (
            <>
              <p className="text-gray-500 text-xs mb-1">
                {pedido.tipo === "Mesa" ? "Mesa" : "Dirección"}
              </p>
              <p
                className="font-semibold text-gray-800 truncate"
                title={
                  pedido.tipo === "Mesa"
                    ? pedido.mesa?.numero ?? "N/A"
                    : pedido.cliente?.direccion ?? "N/A"
                }
              >
                {pedido.tipo === "Mesa"
                  ? pedido.mesa?.numero ?? "N/A"
                  : pedido.cliente?.direccion ?? "N/A"}
              </p>
            </>
          )}
        </div>

        {/* COLUMNA DERECHA */}
        <div className="flex-1">
          <p className="text-gray-500 text-xs mb-1">Estado</p>
          <p className="font-semibold text-gray-800 truncate">
            {pedido.estado || "N/A"}
          </p>
        </div>

      </div>



      {/* Datos adicionales del pedido */}
      <div className="flex justify-between items-center text-sm">
        <div className="flex-1 pr-4">
          <p className="text-gray-500 text-xs">Nombre</p>
          <p className="font-semibold text-gray-800 truncate" title={pedido.cliente?.nombre || "N/A"}>
            {pedido.cliente?.nombre || "N/A"}
          </p>
        </div>

        <div className="flex-1 text-right">
          <p className="text-gray-500 text-xs">Total</p>
          <p className="font-bold text-gray-800">
            {"$" + formatTotal(pedido.total)}
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
