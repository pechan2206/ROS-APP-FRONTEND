import { useState } from "react";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";

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

  // Función para descargar el PDF
  const descargarPDF = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/report/mesas", {
        method: "GET",
        headers: {
          "Accept": "application/pdf",  // Asegúrate de que el servidor devuelve el PDF
        },
      });

      if (response.ok) {
        // Verificar el tipo de contenido antes de proceder
        const contentType = response.headers.get("Content-Type");
        if (contentType && contentType.includes("application/pdf")) {
          // Crear un Blob de la respuesta
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);

          // Crear un enlace para la descarga
          const link = document.createElement("a");
          link.href = url;
          link.download = "reporte_mesas.pdf";  // Nombre del archivo
          document.body.appendChild(link);
          link.click();

          // Limpiar el objeto URL después de la descarga
          window.URL.revokeObjectURL(url);
        } else {
          alert("❌ El archivo descargado no es un PDF válido");
        }
      } else {
        alert("❌ No se pudo generar el reporte");
      }
    } catch (error) {
      console.error(error);
      alert("⚠ Error al intentar descargar el PDF");
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

        {/* Correo */}
        <input
          type="email"
          placeholder="Correo destino"
          value={destino}
          onChange={(e) => setDestino(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg mb-3 focus:ring-2 focus:ring-blue-500"
        />

        {/* Asunto */}
        <input
          type="text"
          placeholder="Asunto"
          value={asunto}
          onChange={(e) => setAsunto(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg mb-3 focus:ring-2 focus:ring-blue-500"
        />

        {/* Mensaje */}
        <textarea
          placeholder="Mensaje"
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg mb-3 h-24 focus:ring-2 focus:ring-blue-500"
        />

        {/* Botón para enviar correo */}
        <button
          onClick={enviarCorreo}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl shadow-md hover:bg-blue-700 transition-all"
        >
          <PaperAirplaneIcon className="w-5 h-5" />
          Enviar correo
        </button>
      </div>

      {/* Botón para descargar el reporte PDF */}
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
