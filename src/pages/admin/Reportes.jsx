import { useState } from "react";
import { FileText, TrendingUp, Users, Package, Calendar, Download } from "lucide-react";
import ReportePedidosPorTipo from "../../components/Reportes/ReportePedidosPorTipo";

export default function Reportes() {
  const [mostrarComponenteOculto, setMostrarComponenteOculto] = useState(false);

  const handleGenerarPedidosPorTipo = () => {
    setMostrarComponenteOculto(true);
    
    setTimeout(() => {
      const botones = document.querySelectorAll('button');
      const botonPDF = Array.from(botones).find(btn => 
        btn.textContent.includes('Descargar PDF')
      );
      
      if (botonPDF) {
        botonPDF.click();
        setTimeout(() => setMostrarComponenteOculto(false), 2000);
      } else {
        alert("No se pudo encontrar el botón del PDF");
        setMostrarComponenteOculto(false);
      }
    }, 1000);
  };

  const reportes = [
    {
      id: "pedidos-tipo",
      titulo: "Pedidos por Tipo",
      descripcion: "Visualiza la cantidad de pedidos por tipo (Mesa, Domicilio, Para llevar)",
      icono: <Package size={40} />,
      color: "#ff6384",
      accion: handleGenerarPedidosPorTipo,
      habilitado: true
    },
    {
      id: "ventas-periodo",
      titulo: "Ventas por Período",
      descripcion: "Analiza las ventas en un rango de fechas específico",
      icono: <TrendingUp size={40} />,
      color: "#36a2eb",
      accion: () => {},
      habilitado: false
    },
    {
      id: "productos-vendidos",
      titulo: "Productos Más Vendidos",
      descripcion: "Conoce cuáles son los productos con mayor demanda",
      icono: <FileText size={40} />,
      color: "#ffce56",
      accion: () => {},
      habilitado: false
    },
    {
      id: "empleados-desempeño",
      titulo: "Desempeño de Empleados",
      descripcion: "Evalúa el rendimiento y productividad del personal",
      icono: <Users size={40} />,
      color: "#4bc0c0",
      accion: () => {},
      habilitado: false
    },
    {
      id: "ventas-diarias",
      titulo: "Ventas Diarias",
      descripcion: "Resumen de ventas día por día del mes actual",
      icono: <Calendar size={40} />,
      color: "#9966ff",
      accion: () => {},
      habilitado: false
    },
    {
      id: "inventario",
      titulo: "Estado de Inventario",
      descripcion: "Revisa el stock actual y productos con bajo inventario",
      icono: <Package size={40} />,
      color: "#ff9f40",
      accion: () => {},
      habilitado: false
    }
  ];

  return (
    <>
      {/* Componente oculto para generar el PDF */}
      {mostrarComponenteOculto && (
        <div className="absolute -left-[9999px] top-0">
          <ReportePedidosPorTipo />
        </div>
      )}

      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Sistema de Reportes
          </h1>
          <p className="text-gray-600 text-base">
            Selecciona el tipo de reporte que deseas generar
          </p>
        </div>

        {/* Grid de Reportes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {reportes.map((reporte) => (
            <div
              key={reporte.id}
              className={`
                border-2 border-gray-200 rounded-xl p-6 bg-white
                transition-all duration-300 shadow-md
                ${reporte.habilitado 
                  ? 'cursor-pointer hover:shadow-xl hover:-translate-y-1' 
                  : 'cursor-not-allowed'
                }
              `}
              style={{
                ...(reporte.habilitado && {
                  '--hover-color': reporte.color
                })
              }}
              onMouseEnter={(e) => {
                if (reporte.habilitado) {
                  e.currentTarget.style.borderColor = reporte.color;
                  e.currentTarget.style.boxShadow = `0 10px 25px ${reporte.color}40`;
                }
              }}
              onMouseLeave={(e) => {
                if (reporte.habilitado) {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                }
              }}
              onClick={() => reporte.habilitado && reporte.accion && reporte.accion()}
            >
              <div style={{ color: reporte.color }} className="mb-4">
                {reporte.icono}
              </div>
              
              <h3 className="text-xl font-semibold mb-2 text-gray-800">
                {reporte.titulo}
              </h3>
              
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                {reporte.descripcion}
              </p>
              
              <button
                disabled={!reporte.habilitado}
                className={`
                  w-full py-2.5 px-5 rounded-lg font-semibold text-sm text-white
                  flex items-center justify-center gap-2 transition-all
                  ${reporte.habilitado ? 'hover:opacity-90' : 'cursor-not-allowed'}
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