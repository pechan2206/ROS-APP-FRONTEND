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

  // Mapa de tipos
  const tiposNombres = {
    0: "Mesa",
    1: "Domicilio",
    2: "Para llevar"
  };

  useEffect(() => {
    fetch("http://localhost:8080/api/report/reporte-por-pedido")
      .then(res => res.json())
      .then(json => setData(json));
  }, []);

  // Generar PDF
  const generarPDF = async () => {
    const element = document.getElementById("pdf-content");
    const canvas = await html2canvas(element);
    const img = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;

    pdf.addImage(img, "PNG", 0, 0, width, height);
    pdf.save("reporte_pedidos_por_tipo.pdf");
  };

  // Datos del pastel
  const totalGeneral = data.reduce((acc, item) => acc + item.total, 0);

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

  return (
    <>
      <div id="pdf-content" style={{ padding: 20 }}>
        <h1>Reporte: Pedidos por Tipo</h1>

        {/* TABLA */}
        <table border="1" cellPadding="6" style={{ width: "100%", marginTop: 20 }}>
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Total</th>
              <th>Porcentaje</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => {
              const porcentaje = ((row.total / totalGeneral) * 100).toFixed(2);
              return (
                <tr key={index}>
                  <td>{tiposNombres[row.tipo]}</td>
                  <td>{row.total}</td>
                  <td>{porcentaje}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <h2 style={{ marginTop: 20 }}>
          Total general: {totalGeneral}
        </h2>

        {/* GRAFICA DE PASTEL */}
        <div style={{ width: "400px", margin: "auto", marginTop: "40px" }}>
          <Pie data={chartData} />
        </div>
      </div>

      <button 
        onClick={generarPDF}
        style={{ marginTop: 20, padding: 10, background: "#333", color: "#fff" }}
      >
        Descargar PDF
      </button>
    </>
  );
}
