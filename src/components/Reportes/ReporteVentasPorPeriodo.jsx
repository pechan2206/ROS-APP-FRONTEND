import { useState } from "react";
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

export default function ReporteVentasPorPeriodo() {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [inicio, setInicio]   = useState("");
  const [fin, setFin]         = useState("");
  const [buscado, setBuscado] = useState(false);

  const buscar = () => {
    if (!inicio || !fin) return alert("Selecciona ambas fechas");
    setLoading(true);
    setBuscado(false);
    fetch(`${BASE_URL}/ventas-por-periodo?inicio=${inicio}&fin=${fin}`)
      .then(r => r.json())
      .then(json => { setData(Array.isArray(json) ? json : []); setBuscado(true); })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  };

  const totalGeneral     = data.reduce((a, d) => a + (d.total || 0), 0);
  const totalFacturas    = data.reduce((a, d) => a + (d.cantidadFacturas || 0), 0);

  const chartData = {
    labels: data.map(d => d.fecha?.slice(0, 10)),
    datasets: [{
      label: "Ventas ($)",
      data: data.map(d => d.total),
      backgroundColor: "#36a2eb",
      borderRadius: 6,
    }]
  };

  const generarPDF = async () => {
    const SweetAlert = withReactContent(Swal);
    try {
      const el = document.getElementById("pdf-ventas-periodo");
      const canvas = await html2canvas(el, { scale: 2, backgroundColor: "#fff" });
      const pdf = new jsPDF("p", "mm", "a4");
      const w = pdf.internal.pageSize.getWidth();
      const ratio = w / canvas.width;
      pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 10, canvas.width * ratio, canvas.height * ratio);
      pdf.save(`ventas_periodo_${inicio}_${fin}.pdf`);
      SweetAlert.fire("PDF Generado", "Descarga exitosa", "success");
    } catch {
      Swal.fire("Error", "No se pudo generar el PDF", "error");
    }
  };

  return (
    <>
      {/* Filtros */}
      <div style={{ display: "flex", gap: 12, alignItems: "flex-end", marginBottom: 20 }}>
        <div>
          <label style={{ display: "block", fontSize: 13, marginBottom: 4 }}>Fecha inicio</label>
          <input type="date" value={inicio} onChange={e => setInicio(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd" }} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 13, marginBottom: 4 }}>Fecha fin</label>
          <input type="date" value={fin} onChange={e => setFin(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd" }} />
        </div>
        <button onClick={buscar} disabled={loading}
          style={{ padding: "9px 20px", background: "#36a2eb", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>
          {loading ? "Cargando..." : "Buscar"}
        </button>
      </div>

      {/* Contenido del PDF */}
      {buscado && (
        <div id="pdf-ventas-periodo" style={{ padding: 20 }}>
          <h2>Reporte: Ventas por Período</h2>
          <p style={{ color: "#666" }}>Del {inicio} al {fin}</p>

          {/* Resumen */}
          <div style={{ display: "flex", gap: 20, margin: "16px 0" }}>
            <div style={{ background: "#e8f4fd", padding: "12px 20px", borderRadius: 10, flex: 1 }}>
              <div style={{ fontSize: 12, color: "#666" }}>Total vendido</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#36a2eb" }}>
                ${totalGeneral.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div style={{ background: "#fff3e0", padding: "12px 20px", borderRadius: 10, flex: 1 }}>
              <div style={{ fontSize: 12, color: "#666" }}>Facturas emitidas</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#ff9f40" }}>{totalFacturas}</div>
            </div>
            <div style={{ background: "#e8f5e9", padding: "12px 20px", borderRadius: 10, flex: 1 }}>
              <div style={{ fontSize: 12, color: "#666" }}>Días con ventas</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#4caf50" }}>{data.length}</div>
            </div>
          </div>

          {/* Tabla */}
          <table border="1" cellPadding="6" style={{ width: "100%", borderCollapse: "collapse", marginBottom: 30 }}>
            <thead>
              <tr style={{ backgroundColor: "#f0f0f0" }}>
                <th>Fecha</th>
                <th>Facturas</th>
                <th>Total ($)</th>
                <th>Promedio por factura</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i}>
                  <td>{row.fecha?.slice(0, 10)}</td>
                  <td style={{ textAlign: "center" }}>{row.cantidadFacturas}</td>
                  <td>${Number(row.total).toLocaleString("es-CO", { minimumFractionDigits: 2 })}</td>
                  <td>${(row.total / row.cantidadFacturas).toLocaleString("es-CO", { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
              <tr style={{ fontWeight: "bold", background: "#f0f0f0" }}>
                <td>TOTAL</td>
                <td style={{ textAlign: "center" }}>{totalFacturas}</td>
                <td>${totalGeneral.toLocaleString("es-CO", { minimumFractionDigits: 2 })}</td>
                <td>${totalFacturas > 0 ? (totalGeneral / totalFacturas).toLocaleString("es-CO", { minimumFractionDigits: 2 }) : "0"}</td>
              </tr>
            </tbody>
          </table>

          {/* Gráfica */}
          <div style={{ maxWidth: 600, margin: "auto" }}>
            <h3 style={{ textAlign: "center" }}>Ventas por Día</h3>
            <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
          </div>
        </div>
      )}

      {buscado && data.length === 0 && (
        <p style={{ color: "#999", textAlign: "center", padding: 30 }}>No hay ventas en el período seleccionado.</p>
      )}

      {buscado && data.length > 0 && (
        <button onClick={generarPDF}
          style={{ marginTop: 20, padding: "10px 20px", background: "#333", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>
          Descargar PDF
        </button>
      )}
    </>
  );
}