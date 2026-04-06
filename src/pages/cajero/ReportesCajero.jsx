import { useState } from "react";
import { X, TrendingUp, BarChart2 } from "lucide-react";
import ReporteIngresosPorMetodoPago from "../../components/Reportes/ReporteIngresosPorMetodoPago";

export default function ReportesCajero() {
  const [reporteActivo, setReporteActivo] = useState(null);

  const reportes = [
    {
      id: "ingresos-metodo-pago",
      titulo: "Ingresos por Método de Pago",
      descripcion: "Distribución de ingresos por método: Efectivo, Nequi, Daviplata, Tarjeta, etc.",
      icono: <TrendingUp size={40} />,
      color: "#4bc0c0",
      habilitado: true,
    },
  ];

  const renderComponente = () => {
    switch (reporteActivo) {
      case "ingresos-metodo-pago": return <ReporteIngresosPorMetodoPago />;
      default: return null;
    }
  };

  const tituloActivo = reportes.find((r) => r.id === reporteActivo)?.titulo;
  const colorActivo  = reportes.find((r) => r.id === reporteActivo)?.color;

  return (
    <>
      {/* Modal */}
      {reporteActivo && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-10"
          onClick={(e) => { if (e.target === e.currentTarget) setReporteActivo(null); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colorActivo }} />
                <h2 className="text-xl font-bold text-gray-800">{tituloActivo}</h2>
              </div>
              <button
                onClick={() => setReporteActivo(null)}
                className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-500 hover:text-gray-800"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">{renderComponente()}</div>
          </div>
        </div>
      )}

      {/* Página */}
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Reportes</h1>
          <p className="text-gray-600">Consulta los ingresos registrados en caja</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportes.map((reporte) => (
            <div
              key={reporte.id}
              className="border-2 border-gray-200 rounded-xl p-6 bg-white transition-all duration-300 shadow-md cursor-pointer hover:shadow-xl hover:-translate-y-1"
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = reporte.color;
                e.currentTarget.style.boxShadow = `0 10px 25px ${reporte.color}40`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#e5e7eb";
                e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
              }}
              onClick={() => setReporteActivo(reporte.id)}
            >
              <div style={{ color: reporte.color }} className="mb-4">
                {reporte.icono}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">{reporte.titulo}</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">{reporte.descripcion}</p>
              <button
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-lg font-semibold text-sm text-white hover:opacity-90 transition"
                style={{ backgroundColor: reporte.color }}
              >
                <BarChart2 size={15} /> Generar Reporte
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}