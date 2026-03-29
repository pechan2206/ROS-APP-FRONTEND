import { Users } from "lucide-react";

export default function TableCard({ mesa, pedidoActivo, onClick }) {
  const estadoNormalizado = mesa.estado?.trim().toUpperCase();

  const estilos = {
    DISPONIBLE: {
      chip:  "bg-emerald-500",
      borde: "border-emerald-300",
      fondo: "bg-emerald-50",
      icono: "●",
    },
    OCUPADA: {
      chip:  "bg-red-500",
      borde: "border-red-300",
      fondo: "bg-red-50",
      icono: "●",
    },
    RESERVADA: {
      chip:  "bg-amber-400",
      borde: "border-amber-300",
      fondo: "bg-amber-50",
      icono: "●",
    },
  };

  const estilo = estilos[estadoNormalizado] || estilos.DISPONIBLE;

  return (
    <button
      onClick={() => onClick(mesa)}
      className={`
        relative border-2 ${estilo.borde} ${estilo.fondo}
        rounded-2xl shadow-sm hover:shadow-md
        transition-all duration-200 hover:-translate-y-1
        flex flex-col justify-between
        p-4 w-full text-left overflow-hidden group cursor-pointer
      `}
      style={{ height: "160px" }}
    >
      {/* Número + chip estado */}
      <div className="flex items-start justify-between w-full">
        <div>
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest leading-none mb-1">
            Mesa
          </p>
          <h3 className="text-4xl font-black text-gray-800 leading-none">
            {mesa.numero}
          </h3>
        </div>

        <span
          className={`${estilo.chip} text-white text-[11px] font-bold
            flex items-center justify-center gap-1 rounded-full py-1 shadow-sm`}
          style={{ width: "100px", minWidth: "100px" }}
        >
          <span className="text-[8px]">●</span>
          {mesa.estado}
        </span>
      </div>

      {/* Footer: capacidad + pedido activo */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-1.5">
          <Users size={13} className="text-gray-400" />
          <span className="text-sm font-semibold text-gray-600">
            {mesa.capacidad} pers.
          </span>
        </div>

        {/* Pedido activo — solo si existe */}
        {pedidoActivo ? (
          <span className="flex items-center gap-1 bg-red-100 text-red-700 text-[11px] font-bold px-2 py-0.5 rounded-full">
            🧾 #{pedidoActivo}
          </span>
        ) : (
          <span className="text-[11px] text-gray-300 font-medium">
            #{mesa.idMesa}
          </span>
        )}
      </div>

      {/* Barra inferior */}
      <div className={`absolute bottom-0 left-0 w-full h-1 ${estilo.chip}
        transition-all duration-300 group-hover:h-2`}
      />
    </button>
  );
}