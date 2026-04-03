import { useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

ChartJS.register(ArcElement, Tooltip, Legend);

const BASE_URL = "https://remarkable-grace-production.up.railway.app/api/report";
const COLORES = ["#36a2eb", "#4bc0c0", "#ff6384", "#ffce56", "#9966ff", "#ff9f40"];

export default function ReporteIngresosPorMetodoPago() {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [inicio, setInicio]   = useState("");
  const [fin, setFin]         = useState("");
  const [buscado, setBuscado] = useState(false);

  const buscar = () => {
    if (!inicio || !fin) return alert("Selecciona ambas fechas");
    setLoading(true);
    setBuscado(false);
    fetch(`${BASE_URL}/ingresos-por-metodo-pago?inicio=${inicio}&fin=${fin}`)
      .then((r) => r.json())
      .then((json) => { setData(Array.isArray(json) ? json : []); setBuscado(true); })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  };

  const totalGeneral   = data.reduce((a, d) => a + (Number(d.total)    || 0), 0);
  const totalCantidad  = data.reduce((a, d) => a + (Number(d.cantidad) || 0), 0);

  const chartData = {
    labels: data.map((d) => d.metodoPago),
    datasets: [{
      data: data.map((d) => Number(d.total)),
      backgroundColor: COLORES.slice(0, data.length),
      borderWidth: 2,
      borderColor: "#fff",
    }],
  };

  const generarPDF = async () => {
    const SweetAlert = withReactContent(Swal);
    try {
      const el = document.getElementById("pdf-ingresos-metodo");
      const canvas = await html2canvas(el, { scale: 2, backgroundColor: "#fff" });
      const pdf = new jsPDF("p", "mm", "a4");
      const w = pdf.internal.pageSize.getWidth();
      const ratio = w / canvas.width;
      pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 10, canvas.width * ratio, canvas.height * ratio);
      pdf.save(`ingresos_metodo_pago_${inicio}_${fin}.pdf`);
      SweetAlert.fire("PDF Generado", "Descarga exitosa", "success");
    } catch {
      Swal.fire("Error", "No se pudo generar el PDF", "error");
    }
  };

  return (
    <>
      {/* Filtros de fecha */}
      <div style={{ display: "flex", gap: 12, alignItems: "flex-end", marginBottom: 20, flexWrap: "wrap" }}>
        <div>
          <label style={{ display: "block", fontSize: 13, marginBottom: 4, color: "#374151" }}>
            Fecha inicio
          </label>
          <input
            type="date"
            value={inicio}
            onChange={(e) => setInicio(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14 }}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 13, marginBottom: 4, color: "#374151" }}>
            Fecha fin
          </label>
          <input
            type="date"
            value={fin}
            onChange={(e) => setFin(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14 }}
          />
        </div>
        <button
          onClick={buscar}
          disabled={loading}
          style={{
            padding: "9px 20px",
            background: "#4bc0c0",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: 600,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Cargando..." : "Buscar"}
        </button>
      </div>

      {/* Sin resultados */}
      {buscado && data.length === 0 && (
        <p style={{ color: "#999", textAlign: "center", padding: 30 }}>
          No hay ingresos en el período seleccionado.
        </p>
      )}

      {/* Resultados */}
      {buscado && data.length > 0 && (
        <>
          <div id="pdf-ingresos-metodo" style={{ padding: 20 }}>
            <h2>Reporte: Ingresos por Método de Pago</h2>
            <p style={{ color: "#666" }}>Del {inicio} al {fin}</p>

            {/* Tarjetas resumen */}
            <div style={{ display: "flex", gap: 16, margin: "16px 0", flexWrap: "wrap" }}>
              <div style={{ background: "#e8f5e9", padding: "12px 20px", borderRadius: 10, flex: 1, minWidth: 140 }}>
                <div style={{ fontSize: 12, color: "#666" }}>Total ingresos</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#4caf50" }}>
                  ${totalGeneral.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div style={{ background: "#e3f2fd", padding: "12px 20px", borderRadius: 10, flex: 1, minWidth: 140 }}>
                <div style={{ fontSize: 12, color: "#666" }}>Total transacciones</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#36a2eb" }}>{totalCantidad}</div>
              </div>
              {data[0] && (
                <div style={{ background: "#fff3e0", padding: "12px 20px", borderRadius: 10, flex: 1, minWidth: 140 }}>
                  <div style={{ fontSize: 12, color: "#666" }}>Método principal</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#ff9f40" }}>{data[0].metodoPago}</div>
                  <div style={{ fontSize: 13, color: "#666" }}>
                    ${Number(data[0].total).toLocaleString("es-CO", { minimumFractionDigits: 2 })}
                  </div>
                </div>
              )}
            </div>

            {/* Tabla */}
            <table border="1" cellPadding="6"
              style={{ width: "100%", borderCollapse: "collapse", marginBottom: 30 }}>
              <thead>
                <tr style={{ backgroundColor: "#f0f0f0" }}>
                  <th>#</th>
                  <th>Método de Pago</th>
                  <th>Transacciones</th>
                  <th>Total ($)</th>
                  <th>Porcentaje</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => {
                  const pct = totalGeneral > 0
                    ? ((Number(row.total) / totalGeneral) * 100).toFixed(2)
                    : 0;
                  return (
                    <tr key={i} style={i === 0 ? { background: "#fff8e1" } : {}}>
                      <td style={{ textAlign: "center" }}>{i + 1}</td>
                      <td>
                        <span style={{
                          display: "inline-block", width: 10, height: 10,
                          borderRadius: "50%", background: COLORES[i] || "#ccc", marginRight: 8,
                        }} />
                        {row.metodoPago}
                      </td>
                      <td style={{ textAlign: "center" }}>{row.cantidad}</td>
                      <td>${Number(row.total).toLocaleString("es-CO", { minimumFractionDigits: 2 })}</td>
                      <td>{pct}%</td>
                    </tr>
                  );
                })}
                <tr style={{ fontWeight: "bold", background: "#f0f0f0" }}>
                  <td colSpan={2}>TOTAL</td>
                  <td style={{ textAlign: "center" }}>{totalCantidad}</td>
                  <td>${totalGeneral.toLocaleString("es-CO", { minimumFractionDigits: 2 })}</td>
                  <td>100%</td>
                </tr>
              </tbody>
            </table>

            {/* Gráfica */}
            <div style={{ maxWidth: 380, margin: "auto" }}>
              <h3 style={{ textAlign: "center" }}>Distribución por Método de Pago</h3>
              <Doughnut
                data={chartData}
                options={{ responsive: true, plugins: { legend: { position: "bottom" } } }}
              />
            </div>
          </div>

          <button
            onClick={generarPDF}
            style={{
              marginTop: 20, padding: "10px 20px", background: "#333",
              color: "#fff", border: "none", borderRadius: 8, cursor: "pointer",
            }}
          >
            Descargar PDF
          </button>
        </>
      )}
    </>
  );
}