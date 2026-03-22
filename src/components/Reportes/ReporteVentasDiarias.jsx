import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Title, Tooltip, Legend, Filler
} from "chart.js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const BASE_URL = "https://remarkable-grace-production.up.railway.app/api/report";

export default function ReporteVentasDiarias() {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE_URL}/ventas-diarias`)
      .then(r => r.json())
      .then(json => setData(Array.isArray(json) ? json : []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  const totalMes      = data.reduce((a, d) => a + (d.total || 0), 0);
  const totalFacturas = data.reduce((a, d) => a + (d.cantidadFacturas || 0), 0);
  const mejorDia      = data.reduce((best, d) => (!best || d.total > best.total) ? d : best, null);

  const chartData = {
    labels: data.map(d => d.fecha?.slice(0, 10)),
    datasets: [{
      label: "Ventas ($)",
      data: data.map(d => d.total),
      borderColor: "#9966ff",
      backgroundColor: "rgba(153,102,255,0.15)",
      fill: true,
      tension: 0.4,
      pointRadius: 5,
    }]
  };

  const generarPDF = async () => {
    const SweetAlert = withReactContent(Swal);
    try {
      const el = document.getElementById("pdf-ventas-diarias");
      const canvas = await html2canvas(el, { scale: 2, backgroundColor: "#fff" });
      const pdf = new jsPDF("p", "mm", "a4");
      const w = pdf.internal.pageSize.getWidth();
      const ratio = w / canvas.width;
      pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 10, canvas.width * ratio, canvas.height * ratio);
      pdf.save("ventas_diarias_mes.pdf");
      SweetAlert.fire("PDF Generado", "Descarga exitosa", "success");
    } catch {
      Swal.fire("Error", "No se pudo generar el PDF", "error");
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Cargando datos...</div>;
  if (data.length === 0) return <div style={{ padding: 20 }}>No hay ventas registradas este dia.</div>;

  const mesActual = new Date().toLocaleString("es-CO", { month: "long", year: "numeric" });

  return (
    <>
      <div id="pdf-ventas-diarias" style={{ padding: 20 }}>
        <h2>Reporte: Ventas Diarias</h2>
        <p style={{ color: "#666", textTransform: "capitalize" }}>{mesActual}</p>

        {/* Resumen */}
        <div style={{ display: "flex", gap: 20, margin: "16px 0" }}>
          <div style={{ background: "#f3e8ff", padding: "12px 20px", borderRadius: 10, flex: 1 }}>
            <div style={{ fontSize: 12, color: "#666" }}>Total del mes</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#9966ff" }}>
              ${totalMes.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div style={{ background: "#fff3e0", padding: "12px 20px", borderRadius: 10, flex: 1 }}>
            <div style={{ fontSize: 12, color: "#666" }}>Facturas emitidas</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#ff9f40" }}>{totalFacturas}</div>
          </div>
          {mejorDia && (
            <div style={{ background: "#e8f5e9", padding: "12px 20px", borderRadius: 10, flex: 1 }}>
              <div style={{ fontSize: 12, color: "#666" }}>Mejor día</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#4caf50" }}>
                {mejorDia.dia} ({mejorDia.fecha?.slice(0, 10)})
              </div>
              <div style={{ fontSize: 13, color: "#666" }}>
                ${Number(mejorDia.total).toLocaleString("es-CO", { minimumFractionDigits: 2 })}
              </div>
            </div>
          )}
        </div>

        {/* Tabla */}
        <table border="1" cellPadding="6" style={{ width: "100%", borderCollapse: "collapse", marginBottom: 30 }}>
          <thead>
            <tr style={{ backgroundColor: "#f0f0f0" }}>
              <th>Día</th>
              <th>Fecha</th>
              <th>Facturas</th>
              <th>Total ($)</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} style={mejorDia?.fecha === row.fecha ? { background: "#f3e8ff" } : {}}>
                <td>{row.dia}</td>
                <td>{row.fecha?.slice(0, 10)}</td>
                <td style={{ textAlign: "center" }}>{row.cantidadFacturas}</td>
                <td>${Number(row.total).toLocaleString("es-CO", { minimumFractionDigits: 2 })}</td>
              </tr>
            ))}
            <tr style={{ fontWeight: "bold", background: "#f0f0f0" }}>
              <td colSpan={2}>TOTAL</td>
              <td style={{ textAlign: "center" }}>{totalFacturas}</td>
              <td>${totalMes.toLocaleString("es-CO", { minimumFractionDigits: 2 })}</td>
            </tr>
          </tbody>
        </table>

        {/* Gráfica */}
        <div style={{ maxWidth: 600, margin: "auto" }}>
          <h3 style={{ textAlign: "center" }}>Tendencia de Ventas del Mes</h3>
          <Line data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        </div>
      </div>

      <button onClick={generarPDF}
        style={{ marginTop: 20, padding: "10px 20px", background: "#333", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>
        Descargar PDF
      </button>
    </>
  );
}