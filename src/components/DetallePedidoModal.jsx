import { useNavigate } from "react-router-dom";
import { X, Printer, Plus, Ban, Receipt } from "lucide-react";
import { pedidoService } from "../services/pedidoService";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const formatCOP = (n) =>
  !n && n !== 0 ? "—" : "$" + Number(n).toLocaleString("es-CO");

const estadoConfig = {
  Pendiente:      { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-300" },
  En_preparacion: { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-300" },
  Entregado:      { bg: "bg-green-100",  text: "text-green-800",  border: "border-green-300"  },
  Anulado:        { bg: "bg-red-100",    text: "text-red-800",    border: "border-red-300"    },
  Pagado:         { bg: "bg-blue-100",   text: "text-blue-800",   border: "border-blue-300"   },
};

export default function DetallePedidoModal({ pedido, onClose, onActualizado }) {
  const navigate   = useNavigate();
  const SweetAlert = withReactContent(Swal);

  if (!pedido) return null;

  const estadoCfg = estadoConfig[pedido.estado] || estadoConfig.Pendiente;

  const cancelarPedido = () => {
    SweetAlert.fire({
      title: "¿Cancelar pedido?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "No",
      confirmButtonColor: "#dc2626",
    }).then(async r => {
      if (r.isConfirmed) {
        await pedidoService.actualizar(pedido.idPedido, { ...pedido, estado: "Anulado" });
        SweetAlert.fire({ icon: "success", title: "Pedido cancelado", timer: 1500, showConfirmButton: false });
        onActualizado?.();
        onClose();
      }
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-white border-2 border-gray-200 rounded-xl">
              <Receipt size={18} className="text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">
                Mesa {pedido.mesa?.numero}
              </p>
              <h2 className="text-lg font-black text-gray-800">
                Pedido #{pedido.idPedido}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">

          {/* Cliente + Estado */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Cliente</p>
              <p className="text-sm font-bold text-gray-800">
                {pedido.cliente?.nombre || "—"}
              </p>
              <p className="text-xs text-gray-400">{pedido.cliente?.telefono || ""}</p>
            </div>
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full border
              ${estadoCfg.bg} ${estadoCfg.text} ${estadoCfg.border}`}>
              {pedido.estado?.replace("_", " ")}
            </span>
          </div>

          <div className="border-t border-gray-100" />

          {/* Productos */}
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-3">
              Productos
            </p>

            {pedido.detallePedidos?.length > 0 ? (
              <div className="flex flex-col gap-2 max-h-52 overflow-y-auto pr-1">
                {pedido.detallePedidos.map((d, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 flex items-center justify-center bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 shrink-0">
                        {d.cantidad}
                      </span>
                      <span className="text-sm font-semibold text-gray-800">
                        {d.plato?.nombre || "—"}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-gray-700 shrink-0">
                      {formatCOP(d.subtotal)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4 bg-gray-50 rounded-xl">
                Sin productos aún
              </p>
            )}
          </div>

          <div className="border-t border-gray-100" />

          {/* Total */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-500">Total</span>
            <span className="text-2xl font-black text-gray-800">
              {formatCOP(pedido.total)}
            </span>
          </div>
        </div>

        {/* Footer acciones */}
        {pedido.estado !== "Anulado" && pedido.estado !== "Pagado" && (
          <div className="flex gap-2 px-6 pb-6 flex-wrap">
            <button
              onClick={() => navigate(`/mesero/pedidos/${pedido.idPedido}/platos`)}
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-semibold rounded-xl transition"
            >
              <Plus size={14} />
              Productos
            </button>
            <button
              onClick={() => navigate(`/mesero/pedido/${pedido.idPedido}/imprimir`)}
              className="flex items-center gap-1.5 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-semibold rounded-xl transition"
            >
              <Printer size={14} />
              Imprimir
            </button>
            <button
              onClick={cancelarPedido}
              className="flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold rounded-xl transition"
            >
              <Ban size={14} />
              Cancelar
            </button>
            <button
              onClick={() => navigate(`/mesero/pedidos/detalles/${pedido.idPedido}`)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition shadow-sm"
            >
              <Receipt size={14} />
              Ver completo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}