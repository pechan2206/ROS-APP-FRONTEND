import { useEffect, useState } from "react";
import { pedidoService } from "../../services/pedidoService";
import { ingresoService } from "../../services/ingresoService";
import { metodoPagoService } from "../../services/metodoPagoService";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
console.log("ingresoService:", ingresoService);
console.log("pedidoService:", pedidoService);
console.log("metodoPagoService:", metodoPagoService);
const SweetAlert = withReactContent(Swal);

export default function Caja() {
  const [pedidosEntregados, setPedidosEntregados] = useState([]);
  const [pedidosPagados, setPedidosPagados] = useState([]);
  const [ingresos, setIngresos] = useState([]);
  const [metodosPago, setMetodosPago] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cobrandoIds, setCobrandoIds] = useState(new Set());
  const [pestana, setPestana] = useState("pendientes");

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const todosPedidos = await pedidoService.listar();

      setPedidosEntregados(todosPedidos.filter((p) => p.estado === "Entregado"));
      setPedidosPagados(todosPedidos.filter((p) => p.estado === "Pagado"));

      // ✅ Limpia TODO el set al recargar — fix del "procesando"
      setCobrandoIds(new Set());

      const todosIngresos = await ingresoService.listar();
      const hoy = new Date().toISOString().split("T")[0];
      setIngresos(todosIngresos.filter((i) => i.fecha?.split("T")[0] === hoy));

      const metodos = await metodoPagoService.listar();
      setMetodosPago(metodos);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      SweetAlert.fire("Error", "No se pudieron cargar los datos", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const registrarCobro = async (pedido) => {
    if (cobrandoIds.has(pedido.idPedido)) return;
    setCobrandoIds((prev) => new Set(prev).add(pedido.idPedido));

    const { value: formValues } = await SweetAlert.fire({
      title: `Cobrar Pedido #${pedido.idPedido}`,
      html: `
        <div style="text-align:left">
          <div style="background:#f9fafb;padding:16px;border-radius:8px;margin-bottom:16px">
            <p style="font-size:13px;color:#6b7280;margin:0">Total a cobrar:</p>
            <p style="font-size:28px;font-weight:700;color:#16a34a;margin:4px 0 0">
              $${Number(pedido.total || 0).toLocaleString("es-CO")}
            </p>
          </div>
          <div style="margin-bottom:12px">
            <label style="font-size:13px;font-weight:500;color:#374151;display:block;margin-bottom:6px">
              Método de Pago:
            </label>
            <select id="metodoPago" class="swal2-input" style="width:100%;margin:0">
              ${metodosPago
                .map((m) => `<option value="${m.idMetodo}">${m.nombre}</option>`)
                .join("")}
            </select>
          </div>
          <div>
            <label style="font-size:13px;font-weight:500;color:#374151;display:block;margin-bottom:6px">
              Descripción (opcional):
            </label>
            <input id="descripcion" class="swal2-input" style="width:100%;margin:0"
              placeholder="Ej: Pago pedido mesa 5"
              value="Cobro pedido #${pedido.idPedido} - Mesa ${pedido.mesa?.numero || "N/A"}">
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "💰 Registrar Cobro",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#16a34a",
      preConfirm: () => ({
        metodoPagoId: document.getElementById("metodoPago").value,
        descripcion: document.getElementById("descripcion").value,
      }),
    });

    if (formValues) {
      try {
        await ingresoService.crear({
          monto: pedido.total,
          descripcion: formValues.descripcion,
          fecha: new Date().toISOString().split("T")[0],
          metodoPago: { idMetodo: parseInt(formValues.metodoPagoId) },
          pedido: { idPedido: pedido.idPedido },
        });

        SweetAlert.fire({
          icon: "success",
          title: "¡Cobro registrado!",
          text: `Se registró el cobro de $${Number(pedido.total).toLocaleString("es-CO")}`,
          timer: 2000,
          showConfirmButton: false,
        });

        // ✅ cargarDatos limpia cobrandoIds y actualiza todo
        await cargarDatos();

      } catch (error) {
        console.error("Error al registrar cobro:", error);
        // Desbloquea solo ese id si falla
        setCobrandoIds((prev) => {
          const next = new Set(prev);
          next.delete(pedido.idPedido);
          return next;
        });
        SweetAlert.fire(
          "Error",
          error?.response?.status === 409
            ? "Este pedido ya fue cobrado anteriormente"
            : "No se pudo registrar el cobro",
          "error"
        );
      }
    } else {
      // Canceló el modal → desbloquea
      setCobrandoIds((prev) => {
        const next = new Set(prev);
        next.delete(pedido.idPedido);
        return next;
      });
    }
  };

  const totalIngresos = ingresos.reduce((sum, ing) => sum + ing.monto, 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-xl text-gray-500">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">💰 Caja</h1>
        <button
          onClick={cargarDatos}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
        >
          🔄 Actualizar
        </button>
      </div>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
          <p className="text-sm text-green-700 font-semibold">Ingresos Hoy</p>
          <p className="text-3xl font-bold text-green-700">
            ${totalIngresos.toLocaleString("es-CO")}
          </p>
        </div>
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg">
          <p className="text-sm text-amber-700 font-semibold">Pendientes de Cobro</p>
          <p className="text-3xl font-bold text-amber-700">
            {pedidosEntregados.length}
          </p>
        </div>
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
          <p className="text-sm text-blue-700 font-semibold">Cobros Registrados Hoy</p>
          <p className="text-3xl font-bold text-blue-700">{ingresos.length}</p>
        </div>
      </div>

      {/* Pestañas */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setPestana("pendientes")}
          className={`px-5 py-2.5 text-sm font-semibold rounded-t-lg transition border-b-2 -mb-px ${
            pestana === "pendientes"
              ? "border-green-600 text-green-700 bg-green-50"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          📋 Por Cobrar
          {pedidosEntregados.length > 0 && (
            <span className="ml-2 bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {pedidosEntregados.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setPestana("pagados")}
          className={`px-5 py-2.5 text-sm font-semibold rounded-t-lg transition border-b-2 -mb-px ${
            pestana === "pagados"
              ? "border-green-600 text-green-700 bg-green-50"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          ✅ Pagados
          {pedidosPagados.length > 0 && (
            <span className="ml-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {pedidosPagados.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setPestana("ingresos")}
          className={`px-5 py-2.5 text-sm font-semibold rounded-t-lg transition border-b-2 -mb-px ${
            pestana === "ingresos"
              ? "border-green-600 text-green-700 bg-green-50"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          📊 Ingresos del Día
        </button>
      </div>

      {/* ── Pestaña: Por Cobrar ── */}
      {pestana === "pendientes" && (
        <>
          {pedidosEntregados.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pedidosEntregados.map((pedido) => (
                <div
                  key={pedido.idPedido}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">
                        Pedido #{pedido.idPedido}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Mesa: {pedido.mesa?.numero || "N/A"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Cliente: {pedido.cliente?.nombre || "N/A"}
                      </p>
                    </div>
                    <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-1 rounded-full">
                      {pedido.tipo}
                    </span>
                  </div>
                  <div className="border-t pt-3 mb-3">
                    <p className="text-2xl font-bold text-green-600">
                      ${Number(pedido.total || 0).toLocaleString("es-CO")}
                    </p>
                  </div>
                  <button
                    onClick={() => registrarCobro(pedido)}
                    disabled={cobrandoIds.has(pedido.idPedido)}
                    className={`w-full py-2 rounded-lg transition font-semibold text-white text-sm ${
                      cobrandoIds.has(pedido.idPedido)
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {cobrandoIds.has(pedido.idPedido) ? "⏳ Procesando..." : "💵 Cobrar"}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-xl">
              <p className="text-4xl mb-2">🎉</p>
              <p className="text-gray-500 font-medium">No hay pedidos pendientes de cobro</p>
            </div>
          )}
        </>
      )}

      {/* ── Pestaña: Pagados ── */}
      {pestana === "pagados" && (
        <>
          {pedidosPagados.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pedidosPagados.map((pedido) => (
                <div
                  key={pedido.idPedido}
                  className="bg-white border border-green-200 rounded-xl p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg text-gray-700">
                        Pedido #{pedido.idPedido}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Mesa: {pedido.mesa?.numero || "N/A"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Cliente: {pedido.cliente?.nombre || "N/A"}
                      </p>
                    </div>
                    <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                      ✅ Pagado
                    </span>
                  </div>
                  <div className="border-t pt-3">
                    <p className="text-2xl font-bold text-gray-400">
                      ${Number(pedido.total || 0).toLocaleString("es-CO")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-xl">
              <p className="text-gray-500 font-medium">No hay pedidos pagados aún</p>
            </div>
          )}
        </>
      )}

      {/* ── Pestaña: Ingresos del día ── */}
      {pestana === "ingresos" && (
        <>
          {ingresos.length > 0 ? (
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Descripción</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Método</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ingresos.map((ingreso) => (
                    <tr key={ingreso.idIngreso} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm text-gray-600">#{ingreso.idIngreso}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">{ingreso.descripcion}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                          {ingreso.metodoPago?.nombre || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-green-600">
                        ${Number(ingreso.monto).toLocaleString("es-CO")}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                  <tr>
                    <td colSpan={3} className="px-6 py-3 text-sm font-semibold text-gray-700">
                      Total del día
                    </td>
                    <td className="px-6 py-3 text-base font-bold text-green-700">
                      ${totalIngresos.toLocaleString("es-CO")}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-xl">
              <p className="text-gray-500 font-medium">No hay ingresos registrados hoy</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}