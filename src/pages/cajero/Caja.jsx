import { useEffect, useState } from "react";
import { pedidoService } from "../../services/pedidoService";
import { ingresoService } from "../../services/ingresoService";
import { metodoPagoService } from "../../services/metodoPagoService";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

export default function Caja() {
  const [pedidosEntregados, setPedidosEntregados] = useState([]);
  const [ingresos, setIngresos] = useState([]);
  const [metodosPago, setMetodosPago] = useState([]);
  const [loading, setLoading] = useState(true);
  const SweetAlert = withReactContent(Swal);

  // Cargar datos iniciales
  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Cargar pedidos entregados
      const todosPedidos = await pedidoService.listar();
      const entregados = todosPedidos.filter((p) => p.estado === "Entregado");
      setPedidosEntregados(entregados);

      // Cargar ingresos del día
      const todosIngresos = await ingresoService.listar();
      const hoy = new Date().toISOString().split("T")[0];
      const ingresosHoy = todosIngresos.filter(
        (i) => i.fecha === hoy
      );
      setIngresos(ingresosHoy);

      // Cargar métodos de pago
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

  // Registrar cobro
  const registrarCobro = async (pedido) => {
    const { value: formValues } = await SweetAlert.fire({
      title: `Cobrar Pedido #${pedido.idPedido}`,
      html: `
        <div class="text-left space-y-4">
          <div class="bg-gray-50 p-4 rounded-lg mb-4">
            <p class="text-sm text-gray-600">Total a cobrar:</p>
            <p class="text-3xl font-bold text-green-600">$${Number(
              pedido.total || 0
            ).toLocaleString("es-CO")}</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Método de Pago:
            </label>
            <select id="metodoPago" class="swal2-input w-full">
              ${metodosPago
                .map(
                  (m) =>
                    `<option value="${m.idMetodo}">${m.nombre}</option>`
                )
                .join("")}
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Descripción (opcional):
            </label>
            <input id="descripcion" class="swal2-input w-full" 
                   placeholder="Ej: Pago pedido mesa 5" 
                   value="Cobro pedido #${pedido.idPedido} - Mesa ${
        pedido.mesa?.numero || "N/A"
      }">
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "💰 Registrar Cobro",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#10b981",
      preConfirm: () => {
        return {
          metodoPagoId: document.getElementById("metodoPago").value,
          descripcion: document.getElementById("descripcion").value,
        };
      },
    });

    if (formValues) {
      try {
        // Crear ingreso
        const nuevoIngreso = {
          monto: pedido.total,
          descripcion: formValues.descripcion,
          fecha: new Date().toISOString().split("T")[0],
          metodoPago: { idMetodo: parseInt(formValues.metodoPagoId) },
        };

        await ingresoService.crear(nuevoIngreso);

        SweetAlert.fire({
          icon: "success",
          title: "¡Cobro registrado!",
          text: `Se registró el cobro de $${Number(
            pedido.total
          ).toLocaleString("es-CO")}`,
          timer: 2000,
        });

        cargarDatos();
      } catch (error) {
        console.error("Error al registrar cobro:", error);
        SweetAlert.fire("Error", "No se pudo registrar el cobro", "error");
      }
    }
  };

  // Calcular total de ingresos del día
  const totalIngresos = ingresos.reduce((sum, ing) => sum + ing.monto, 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">💰 Caja</h1>
        <button
          onClick={cargarDatos}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          🔄 Actualizar
        </button>
      </div>

      {/* Resumen del día */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
          <p className="text-sm text-green-700 font-semibold">Ingresos Hoy</p>
          <p className="text-3xl font-bold text-green-700">
            ${totalIngresos.toLocaleString("es-CO")}
          </p>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
          <p className="text-sm text-blue-700 font-semibold">
            Pedidos Entregados
          </p>
          <p className="text-3xl font-bold text-blue-700">
            {pedidosEntregados.length}
          </p>
        </div>

        <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-lg">
          <p className="text-sm text-purple-700 font-semibold">
            Cobros Registrados
          </p>
          <p className="text-3xl font-bold text-purple-700">
            {ingresos.length}
          </p>
        </div>
      </div>

      {/* Pedidos por cobrar */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">📋 Pedidos Entregados</h2>

        {pedidosEntregados.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pedidosEntregados.map((pedido) => (
              <div
                key={pedido.idPedido}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg">
                      Pedido #{pedido.idPedido}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Mesa: {pedido.mesa?.numero || "N/A"}
                    </p>
                    <p className="text-sm text-gray-600">
                      Cliente: {pedido.cliente?.nombre || "N/A"}
                    </p>
                  </div>
                  <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
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
                  className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-semibold"
                >
                  💵 Cobrar
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">
              No hay pedidos entregados pendientes de cobro
            </p>
          </div>
        )}
      </div>

      {/* Historial de ingresos del día */}
      <div>
        <h2 className="text-2xl font-bold mb-4">📊 Ingresos del Día</h2>

        {ingresos.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Método
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Monto
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {ingresos.map((ingreso) => (
                  <tr key={ingreso.idIngreso}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      #{ingreso.idIngreso}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {ingreso.descripcion}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {ingreso.metodoPago.nombre}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                      ${Number(ingreso.monto).toLocaleString("es-CO")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No hay ingresos registrados hoy</p>
          </div>
        )}
      </div>
    </div>
  );
}