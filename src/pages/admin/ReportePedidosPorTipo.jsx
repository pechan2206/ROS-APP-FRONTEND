import { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ReportePedidosPorTipo() {

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mapa de tipos
  const tiposNombres = {
    0: "Mesa",
    1: "Domicilio",
    2: "Para llevar"
  };

  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:8080/api/report/reporte-por-pedido")
      .then(res => res.json())
      .then(json => {
        console.log("Datos recibidos:", json);
        setData(Array.isArray(json) ? json : []);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error al cargar datos:", error);
        setData([]);
        setLoading(false);
      });
  }, []);

  // Generar PDF
  const generarPDF = async () => {
    try {
      const element = document.getElementById("pdf-content");
      if (!element) {
        alert("No se pudo encontrar el contenido para generar el PDF");
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;

      pdf.addImage(imgData, "JPEG", imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save("reporte_pedidos_por_tipo.pdf");
      
      alert("PDF generado exitosamente");
    } catch (error) {
      console.error("Error al generar PDF:", error);
      alert("Error al generar el PDF: " + error.message);
    }
  };

  // Calcular totales
  const totalGeneral = data.reduce((acc, item) => acc + (Number(item.total) || 0), 0);

  const chartData = {
    labels: data.map(d => tiposNombres[d.tipo]),
    datasets: [
      {
        data: data.map(d => d.total),
        backgroundColor: ["#ff6384", "#36a2eb", "#ffce56"],
        borderWidth: 1
      }
    ]
  };

  if (loading) {
    return <div style={{ padding: 20 }}>Cargando datos...</div>;
  }

  if (data.length === 0) {
    return <div style={{ padding: 20 }}>No hay datos disponibles</div>;
  }

  return (
    <>
      <div id="pdf-content" style={{ padding: 20 }}>
        <h1>Reporte: Pedidos por Tipo</h1>

        {/* TABLA */}
        <table border="1" cellPadding="6" style={{ width: "100%", marginTop: 20, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f0f0f0" }}>
              <th>Tipo</th>
              <th>Total</th>
              <th>Porcentaje</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => {
              const porcentaje = totalGeneral > 0 ? ((Number(row.total) / totalGeneral) * 100).toFixed(2) : 0;
              return (
                <tr key={index}>
                  <td>{tiposNombres[row.tipo]}</td>
                  <td>{row.total}</td>
                  <td>{porcentaje}%</td>
                </tr>
              );
            })}
            <tr style={{ backgroundColor: "#f0f0f0", fontWeight: "bold" }}>
              <td>TOTAL</td>
              <td>{totalGeneral}</td>
              <td>100%</td>
            </tr>
          </tbody>
        </table>

        {/* GRAFICA DE PASTEL */}
        <div style={{ width: "400px", margin: "auto", marginTop: "40px" }}>
          <h3 style={{ textAlign: "center" }}>Distribución de Pedidos por Tipo</h3>
          <Pie data={chartData} />
        </div>
      </div>

      <button 
        onClick={generarPDF}
        disabled={loading || data.length === 0}
        style={{ 
          marginTop: 20, 
          padding: 10, 
          background: (loading || data.length === 0) ? "#ccc" : "#333", 
          color: "#fff",
          border: "none",
          borderRadius: 5,
          cursor: (loading || data.length === 0) ? "not-allowed" : "pointer"
        }}
      >
        Descargar PDF
      </button>
    </>
  );
}