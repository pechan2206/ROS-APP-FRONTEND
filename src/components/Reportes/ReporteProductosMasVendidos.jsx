import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, Title, Tooltip, Legend
} from "chart.js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BASE_URL = "https://remarkable-grace-production.up.railway.app/api/report";

export default function ReporteProductosMasVendidos() {
  const [data, setData]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE_URL}/productos-mas-vendidos`)
      .then(r => r.json())
      .then(json => setData(Array.isArray(json) ? json : []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  const totalUnidades = data.reduce((a, d) => a + (d.cantidadVendida || 0), 0);
  const totalIngresos = data.reduce((a, d) => a + (d.totalGenerado  || 0), 0);
  const topProducto   = data[0] ?? null; // ya viene ordenado DESC

  const chartData = {
    labels: data.map(d => d.nombre),
    datasets: [{
      label: "Unidades vendidas",
      data: data.map(d => d.cantidadVendida),
      backgroundColor: "#ffce56",
      borderRadius: 6,
    }]
  };

  const generarPDF = async () => {
    const SweetAlert = withReactContent(Swal);
    try {
      const el = document.getElementById("pdf-productos-vendidos");
      const canvas = await html2canvas(el, { scale: 2, backgroundColor: "#fff" });
      const pdf = new jsPDF("p", "mm", "a4");
      const w = pdf.internal.pageSize.getWidth();
      const ratio = w / canvas.width;
      pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 10, canvas.width * ratio, canvas.height * ratio);
      pdf.save("productos_mas_vendidos.pdf");
      SweetAlert.fire("PDF Generado", "Descarga exitosa", "success");
    } catch {
      Swal.fire("Error", "No se pudo generar el PDF", "error");
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Cargando datos...</div>;
  if (data.length === 0) return <div style={{ padding: 20 }}>No hay productos vendidos registrados.</div>;

  return (
    <>
      <div id="pdf-productos-vendidos" style={{ padding: 20 }}>
        <h2>Reporte: Productos Más Vendidos</h2>

        {/* Resumen */}
        <div style={{ display: "flex", gap: 20, margin: "16px 0" }}>
          <div style={{ background: "#fffde7", padding: "12px 20px", borderRadius: 10, flex: 1 }}>
            <div style={{ fontSize: 12, color: "#666" }}>Total unidades vendidas</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#ffce56" }}>{totalUnidades}</div>
          </div>
          <div style={{ background: "#fff3e0", padding: "12px 20px", borderRadius: 10, flex: 1 }}>
            <div style={{ fontSize: 12, color: "#666" }}>Ingresos generados</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#ff9f40" }}>
              ${totalIngresos.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
            </div>
          </div>
          {topProducto && (
            <div style={{ background: "#e8f5e9", padding: "12px 20px", borderRadius: 10, flex: 1 }}>
              <div style={{ fontSize: 12, color: "#666" }}>Producto estrella</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#4caf50" }}>{topProducto.nombre}</div>
              <div style={{ fontSize: 13, color: "#666" }}>{topProducto.cantidadVendida} unidades</div>
            </div>
          )}
        </div>

        {/* Tabla */}
        <table border="1" cellPadding="6" style={{ width: "100%", borderCollapse: "collapse", marginBottom: 30 }}>
          <thead>
            <tr style={{ backgroundColor: "#f0f0f0" }}>
              <th>#</th>
              <th>Producto</th>
              <th>Unidades vendidas</th>
              <th>Total generado ($)</th>
              <th>Precio promedio</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} style={i === 0 ? { background: "#fffde7" } : {}}>
                <td style={{ textAlign: "center" }}>{i + 1}</td>
                <td>{row.nombre}</td>
                <td style={{ textAlign: "center" }}>{row.cantidadVendida}</td>
                <td>${Number(row.totalGenerado).toLocaleString("es-CO", { minimumFractionDigits: 2 })}</td>
                <td>${(row.totalGenerado / row.cantidadVendida).toLocaleString("es-CO", { minimumFractionDigits: 2 })}</td>
              </tr>
            ))}
            <tr style={{ fontWeight: "bold", background: "#f0f0f0" }}>
              <td colSpan={2}>TOTAL</td>
              <td style={{ textAlign: "center" }}>{totalUnidades}</td>
              <td>${totalIngresos.toLocaleString("es-CO", { minimumFractionDigits: 2 })}</td>
              <td>—</td>
            </tr>
          </tbody>
        </table>

        {/* Gráfica */}
        <div style={{ maxWidth: 600, margin: "auto" }}>
          <h3 style={{ textAlign: "center" }}>Unidades Vendidas por Producto</h3>
          <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        </div>
      </div>

      <button onClick={generarPDF}
        style={{ marginTop: 20, padding: "10px 20px", background: "#333", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>
        Descargar PDF
      </button>
    </>
  );
}