import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { detallePedidoService } from "../../services/detallePedidoService";
import { UtensilsCrossed, AlertTriangle, Loader2, ArrowLeft, X } from "lucide-react";
import Swal from "sweetalert2";

const formatCOP = (num) => "$" + Number(num).toLocaleString("es-CO");

export default function DetallesPedido() {
  const { id }      = useParams();
  const navigate    = useNavigate();

  const [detalles,  setDetalles]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [total,     setTotal]     = useState(0);

  const [modificados, setModificados] = useState(new Set());

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await detallePedidoService.listarPorPedido(id);
        const con = data.map((item) => ({
          ...item,
          precioUnitario: item.precioUnitario ?? item.plato?.precio ?? 0,
          subtotal: (item.precioUnitario ?? item.plato?.precio ?? 0) * item.cantidad,
          cantidadOriginal: item.cantidad,
        }));
        setDetalles(con);
        calcularTotal(con);
        setModificados(new Set());
      } catch (e) {
        console.error("Error al cargar detalles:", e);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [id]);

  const calcularTotal = (lista) =>
    setTotal(lista.reduce((s, i) => s + i.subtotal, 0));

  const actualizarCantidad = (idDetalle, nuevaCantidad) => {
    setDetalles((prev) => {
      const updated = prev.map((d) => {
        if (d.idDetallePedido !== idDetalle) return d;
        return { ...d, cantidad: nuevaCantidad, subtotal: nuevaCantidad * d.precioUnitario };
      });
      calcularTotal(updated);
      return updated;
    });

    setModificados((prev) => {
      const next = new Set(prev);
      const original = detalles.find((d) => d.idDetallePedido === idDetalle);
      if (original && nuevaCantidad !== original.cantidadOriginal) {
        next.add(idDetalle);
      } else {
        next.delete(idDetalle);
      }
      return next;
    });
  };

  const eliminarDetalle = async (idDetalle) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar producto?",
      text: "Este cambio no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
    if (!confirm.isConfirmed) return;

    try {
      await detallePedidoService.eliminar(idDetalle);
      const nuevos = detalles.filter((d) => d.idDetallePedido !== idDetalle);
      setDetalles(nuevos);
      calcularTotal(nuevos);
      setModificados((prev) => { const n = new Set(prev); n.delete(idDetalle); return n; });
      Swal.fire({ icon: "success", title: "Eliminado", timer: 1200, showConfirmButton: false });
    } catch (e) {
      Swal.fire({ icon: "error", title: "Error", text: "No se pudo eliminar el producto." });
    }
  };

  const guardarCambios = async () => {
    if (modificados.size === 0) {
      Swal.fire({ icon: "info", title: "Sin cambios", text: "No hay productos modificados para guardar.", timer: 1500, showConfirmButton: false });
      return;
    }

    setGuardando(true);
    try {
      const aGuardar = detalles.filter((d) => modificados.has(d.idDetallePedido));

      for (const d of aGuardar) {
        await detallePedidoService.actualizar(d.idDetallePedido, {
          pedido:         { idPedido: Number(id) },
          plato:          { idPlato: d.plato.idPlato },
          cantidad:       d.cantidad,
          precioUnitario: d.precioUnitario,
          subtotal:       d.subtotal,
        });
      }

      setDetalles((prev) =>
        prev.map((d) =>
          modificados.has(d.idDetallePedido) ? { ...d, cantidadOriginal: d.cantidad } : d
        )
      );
      setModificados(new Set());

      await Swal.fire({
        icon: "success",
        title: "Cambios guardados",
        text: `${aGuardar.length} producto${aGuardar.length !== 1 ? "s" : ""} actualizado${aGuardar.length !== 1 ? "s" : ""}.`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (e) {
      Swal.fire({ icon: "error", title: "Error", text: "Hubo un problema guardando los cambios." });
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400 text-sm">
          <Loader2 size={18} className="animate-spin text-blue-500" />
          Cargando detalles del pedido…
        </div>
      </div>
    );
  }

  const hayModificados = modificados.size > 0;

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6">

      {/* Encabezado */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 font-medium mb-4 transition"
        >
          <ArrowLeft size={15} /> Volver
        </button>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-0.5">Pedido</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Detalles #{id}</h1>
          </div>
          <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-sm px-5 py-3 text-right">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-0.5">Total del pedido</p>
            <p className="text-2xl font-bold text-gray-800">{formatCOP(total)}</p>
          </div>
        </div>
      </div>

      {/* Banner cambios pendientes */}
      {hayModificados && (
        <div className="mb-4 flex items-center gap-3 bg-yellow-50 border border-yellow-300 rounded-xl px-4 py-3">
          <AlertTriangle size={18} className="text-yellow-500 shrink-0" />
          <p className="text-sm font-semibold text-yellow-800 flex-1">
            Tienes <span className="underline">{modificados.size} producto{modificados.size !== 1 ? "s" : ""} con cambios sin guardar</span>.
          </p>
          <button
            onClick={guardarCambios}
            disabled={guardando}
            className="shrink-0 text-xs font-semibold bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg px-3 py-1.5 transition disabled:opacity-60"
          >
            Guardar ahora
          </button>
        </div>
      )}

      {/* Card principal */}
      <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-xl ring-1 ring-gray-300/60 overflow-hidden">

        {/* Header card */}
        <div className="bg-gray-50 px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-0.5">Contenido</p>
            <h2 className="text-lg font-bold text-gray-800">
              {detalles.length} producto{detalles.length !== 1 ? "s" : ""}
            </h2>
          </div>
          <button
            onClick={() => navigate(`/mesero/pedidos/${id}/platos`)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-100 transition"
          >
            + Agregar productos
          </button>
        </div>

        {/* Lista vacía */}
        {detalles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
            <UtensilsCrossed size={48} strokeWidth={1.5} className="text-gray-300" />
            <p className="font-semibold text-gray-600">Sin productos</p>
            <p className="text-sm">Agrega productos al pedido con el botón de arriba.</p>
          </div>
        ) : (
          <>
            {/* Tabla */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/50">
                    <th className="text-left  text-xs font-bold uppercase tracking-wide text-gray-400 px-5 py-3">Producto</th>
                    <th className="text-center text-xs font-bold uppercase tracking-wide text-gray-400 px-5 py-3">Cantidad</th>
                    <th className="text-right  text-xs font-bold uppercase tracking-wide text-gray-400 px-5 py-3">Precio unit.</th>
                    <th className="text-right  text-xs font-bold uppercase tracking-wide text-gray-400 px-5 py-3">Subtotal</th>
                    <th className="text-center text-xs font-bold uppercase tracking-wide text-gray-400 px-5 py-3">Acción</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {detalles.map((item) => {
                    const esMod = modificados.has(item.idDetallePedido);
                    return (
                      <tr
                        key={item.idDetallePedido}
                        className={`transition-colors ${esMod ? "bg-yellow-50/60" : "hover:bg-gray-50"}`}
                      >
                        {/* Producto */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="text-sm font-semibold text-gray-800">{item.plato.nombre}</p>
                              {item.plato.descripcion && (
                                <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{item.plato.descripcion}</p>
                              )}
                            </div>
                            {esMod && (
                              <span className="shrink-0 text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-300 px-2 py-0.5 rounded-full">
                                modificado
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Cantidad */}
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() =>
                                item.cantidad > 1 &&
                                actualizarCantidad(item.idDetallePedido, item.cantidad - 1)
                              }
                              disabled={item.cantidad <= 1}
                              className="w-7 h-7 rounded-lg border border-gray-300 bg-white text-gray-600 text-sm font-bold hover:bg-red-50 hover:border-red-300 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition"
                            >
                              −
                            </button>
                            <span className={`w-6 text-center text-sm font-bold ${esMod ? "text-yellow-700" : "text-gray-800"}`}>
                              {item.cantidad}
                            </span>
                            <button
                              onClick={() => actualizarCantidad(item.idDetallePedido, item.cantidad + 1)}
                              className="w-7 h-7 rounded-lg border border-gray-300 bg-white text-gray-600 text-sm font-bold hover:bg-green-50 hover:border-green-300 hover:text-green-600 transition"
                            >
                              +
                            </button>
                          </div>
                        </td>

                        {/* Precio unitario */}
                        <td className="px-5 py-4 text-right">
                          <span className="text-sm text-gray-600">{formatCOP(item.precioUnitario)}</span>
                        </td>

                        {/* Subtotal */}
                        <td className="px-5 py-4 text-right">
                          <span className={`text-sm font-bold ${esMod ? "text-yellow-700" : "text-gray-800"}`}>
                            {formatCOP(item.subtotal)}
                          </span>
                        </td>

                        {/* Eliminar */}
                        <td className="px-5 py-4 text-center">
                          <button
                            onClick={() => eliminarDetalle(item.idDetallePedido)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 hover:border-red-300 transition"
                            title="Eliminar producto"
                          >
                            <X size={14} strokeWidth={2.5} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-0.5">Total</p>
                <p className="text-xl font-bold text-gray-800">{formatCOP(total)}</p>
              </div>
              <div className="flex gap-3 items-center">
                {hayModificados && (
                  <span className="text-xs font-semibold text-yellow-700 bg-yellow-100 border border-yellow-300 rounded-full px-2.5 py-1">
                    {modificados.size} sin guardar
                  </span>
                )}
                <button
                  onClick={() => navigate(-1)}
                  className="text-sm font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardarCambios}
                  disabled={guardando || !hayModificados}
                  className={`inline-flex items-center gap-2 text-sm font-semibold rounded-lg px-5 py-2 shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed ${hayModificados ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-gray-200 text-gray-400"}`}
                >
                  {guardando ? (
                    <><Loader2 size={14} className="animate-spin" /> Guardando…</>
                  ) : (
                    "Guardar cambios"
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}