import { useState } from "react";
import { FileText, TrendingUp, Users, Package, Calendar, Download, X } from "lucide-react";
import ReportePedidosPorTipo from "../../components/Reportes/ReportePedidosPorTipo";
import ReporteVentasPorPeriodo from "../../components/Reportes/ReporteVentasPorPeriodo";
import ReporteVentasDiarias from "../../components/Reportes/ReporteVentasDiarias";
import ReporteProductosMasVendidos from "../../components/Reportes/ReporteProductosMasVendidos";

export default function Reportes() {
  const [reporteActivo, setReporteActivo] = useState(null);

  const abrirReporte = (id) => setReporteActivo(id);
  const cerrarReporte = () => setReporteActivo(null);

  const reportes = [
    {
      id: "pedidos-tipo",
      titulo: "Pedidos por Tipo",
      descripcion: "Visualiza la cantidad de pedidos por tipo (Mesa, Domicilio, Para llevar)",
      icono: <Package size={40} />,
      color: "#ff6384",
      habilitado: true
    },
    {
      id: "ventas-periodo",
      titulo: "Ventas por Período",
      descripcion: "Analiza las ventas en un rango de fechas específico",
      icono: <TrendingUp size={40} />,
      color: "#36a2eb",
      habilitado: true
    },
    {
      id: "productos-vendidos",
      titulo: "Productos Más Vendidos",
      descripcion: "Conoce cuáles son los productos con mayor demanda",
      icono: <FileText size={40} />,
      color: "#ffce56",
      habilitado: true  // ← activado
    },
    {
      id: "empleados-desempeño",
      titulo: "Desempeño de Empleados",
      descripcion: "Evalúa el rendimiento y productividad del personal",
      icono: <Users size={40} />,
      color: "#4bc0c0",
      habilitado: false
    },
    {
      id: "ventas-diarias",
      titulo: "Ventas Diarias",
      descripcion: "Resumen de ventas día por día del mes actual",
      icono: <Calendar size={40} />,
      color: "#9966ff",
      habilitado: true
    },
    {
      id: "inventario",
      titulo: "Estado de Inventario",
      descripcion: "Revisa el stock actual y productos con bajo inventario",
      icono: <Package size={40} />,
      color: "#ff9f40",
      habilitado: false
    }
  ];

  const renderComponente = () => {
    switch (reporteActivo) {
      case "pedidos-tipo":       return <ReportePedidosPorTipo />;
      case "ventas-periodo":     return <ReporteVentasPorPeriodo />;
      case "productos-vendidos": return <ReporteProductosMasVendidos />;
      case "ventas-diarias":     return <ReporteVentasDiarias />;
      default:                   return null;
    }
  };

  const tituloActivo = reportes.find(r => r.id === reporteActivo)?.titulo;
  const colorActivo  = reportes.find(r => r.id === reporteActivo)?.color;

  return (
    <>
      {/* ── MODAL ── */}
      {reporteActivo && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-10"
          onClick={(e) => { if (e.target === e.currentTarget) cerrarReporte(); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4">
            {/* Header del modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colorActivo }} />
                <h2 className="text-xl font-bold text-gray-800">{tituloActivo}</h2>
              </div>
              <button
                onClick={cerrarReporte}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-800"
              >
                <X size={20} />
              </button>
            </div>

            {/* Contenido */}
            <div className="p-6">
              {renderComponente()}
            </div>
          </div>
        </div>
      )}

      {/* ── PÁGINA ── */}
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Sistema de Reportes</h1>
          <p className="text-gray-600 text-base">Selecciona el tipo de reporte que deseas generar</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {reportes.map((reporte) => (
            <div
              key={reporte.id}
              className={`
                border-2 border-gray-200 rounded-xl p-6 bg-white
                transition-all duration-300 shadow-md
                ${reporte.habilitado ? 'cursor-pointer hover:shadow-xl hover:-translate-y-1' : 'cursor-not-allowed'}
              `}
              onMouseEnter={(e) => {
                if (reporte.habilitado) {
                  e.currentTarget.style.borderColor = reporte.color;
                  e.currentTarget.style.boxShadow = `0 10px 25px ${reporte.color}40`;
                }
              }}
              onMouseLeave={(e) => {
                if (reporte.habilitado) {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                }
              }}
              onClick={() => reporte.habilitado && abrirReporte(reporte.id)}
            >
              <div style={{ color: reporte.color }} className="mb-4">
                {reporte.icono}
              </div>

              <h3 className="text-xl font-semibold mb-2 text-gray-800">{reporte.titulo}</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">{reporte.descripcion}</p>

              <button
                disabled={!reporte.habilitado}
                className={`
                  w-full py-2.5 px-5 rounded-lg font-semibold text-sm text-white
                  flex items-center justify-center gap-2 transition-all
                  ${reporte.habilitado ? 'hover:opacity-90' : 'cursor-not-allowed opacity-60'}
                `}
                style={{ backgroundColor: reporte.color }}
              >
                <Download size={18} />
                {reporte.habilitado ? "Generar Reporte" : "Próximamente"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}