import { useState } from "react";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import ReportePedidosPorTipo from "./ReportePedidosPorTipo"; // Necesario para generar el PDF internamente
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function DashboardAdmin() {
  const [destino, setDestino] = useState("");
  const [asunto, setAsunto] = useState("");
  const [mensaje, setMensaje] = useState("");

  // ✔ VALIDACIÓN DE CORREO
  const esCorreoValido = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const enviarCorreo = async () => {
    if (!destino || !asunto || !mensaje) {
      return alert("⚠️ Todos los campos son obligatorios");
    }

    if (!esCorreoValido(destino)) {
      return alert("⚠️ Debes ingresar un correo válido");
    }

    try {
      const res = await fetch("http://localhost:8080/api/email/enviar-json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destino, asunto, mensaje }),
      });

      if (res.ok) {
        alert("📨 Correo enviado correctamente");
        setDestino("");
        setAsunto("");
        setMensaje("");
      } else {
        const errorData = await res.json();
        alert(`❌ No se pudo enviar el correo: ${errorData.message || "Error desconocido"}`);
      }
    } catch (error) {
      console.error(error);
      alert("⚠ Error de conexión con el servidor");
    }
  };

  // ⭐ AQUÍ SE GENERA EL PDF DIRECTO AL TOCAR EL BOTÓN
  const descargarPDF = async () => {
    try {
      // Crear un contenedor temporal con el reporte oculto
      const tempDiv = document.createElement("div");
      tempDiv.style.position = "absolute";
      tempDiv.style.left = "-9999px";
      document.body.appendChild(tempDiv);

      // Renderizar el componente ahí
      const element = document.createElement("div");
      element.id = "pdf-content";
      tempDiv.appendChild(element);

      // Renderizamos el contenido mediante React 18
      import("react-dom/client").then(({ createRoot }) => {
        const root = createRoot(element);
        root.render(<ReportePedidosPorTipo modoPDF={true} />);

        setTimeout(async () => {
          const canvas = await html2canvas(element);
          const img = canvas.toDataURL("image/png");

          const pdf = new jsPDF("p", "mm", "a4");
          const width = pdf.internal.pageSize.getWidth();
          const height = (canvas.height * width) / canvas.width;

          pdf.addImage(img, "PNG", 0, 0, width, height);
          pdf.save("reporte_pedidos_por_tipo.pdf");

          // limpiar
          document.body.removeChild(tempDiv);
        }, 800); // tiempo para que renderice el gráfico
      });
    } catch (error) {
      console.error(error);
      alert("❌ Error generando el PDF");
    }
  };

  return (
    <div className="px-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Panel general</h2>

      {/* FORMULARIO DE CORREO */}
      <div className="bg-white shadow-md rounded-xl p-6 max-w-xl border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">
          Enviar correo manual
        </h3>

        <input
          type="email"
          placeholder="Correo destino"
          value={destino}
          onChange={(e) => setDestino(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg mb-3 focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="text"
          placeholder="Asunto"
          value={asunto}
          onChange={(e) => setAsunto(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg mb-3 focus:ring-2 focus:ring-blue-500"
        />

        <textarea
          placeholder="Mensaje"
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg mb-3 h-24 focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={enviarCorreo}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl shadow-md hover:bg-blue-700 transition-all"
        >
          <PaperAirplaneIcon className="w-5 h-5" />
          Enviar correo
        </button>
      </div>

      {/* BOTÓN PARA DESCARGAR PDF (SIN CAMBIAR EL DISEÑO) */}
      <div className="mt-6">
        <button
          onClick={descargarPDF}
          className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-5 py-3 rounded-xl shadow-md hover:bg-green-700 transition-all"
        >
          Descargar reporte PDF
        </button>
      </div>
    </div>
  );
}
