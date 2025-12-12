import { useState } from "react";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

export default function DashboardAdmin() {
  const [destino, setDestino] = useState("");
  const [asunto, setAsunto] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [asuntoMasivo, setAsuntoMasivo] = useState("");
  const [mensajeMasivo, setMensajeMasivo] = useState("");

  const SweetAlert = withReactContent(Swal);

  // ✔ VALIDACIÓN DE CORREO
  const esCorreoValido = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Enviar correo manual a un destinatario
  const enviarCorreo = async () => {
    if (!destino || !asunto || !mensaje) {
      return SweetAlert.fire(
        "Error",
        "Todos los campos son obligatorios",
        "warning"
      );
    }

    if (!esCorreoValido(destino)) {
      return SweetAlert.fire("Error", "Debes ingresar un correo válido", "warning");
    }

    try {
      const res = await fetch("http://localhost:8080/api/email/enviar-json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destino, asunto, mensaje }),
      });

      if (res.ok) {
        SweetAlert.fire("Envio correo", "Correo enviado correctamente", "success");
        setDestino("");
        setAsunto("");
        setMensaje("");
      } else {
        SweetAlert.fire("Error", "No se pudo enviar el correo", "error");
      }
    } catch (error) {
      console.error(error);
      SweetAlert.fire("Error", "Error de conexión con el servidor", "warning");
    }
  };

  // Enviar correo a todos los usuarios
  const enviarCorreoMasivo = async () => {
    if (!asuntoMasivo || !mensajeMasivo) {
      return SweetAlert.fire(
        "Error",
        "Todos los campos son obligatorios para correo masivo",
        "warning"
      );
    }

    try {
      const res = await fetch("http://localhost:8080/api/email/enviar-a-usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ asunto: asuntoMasivo, mensaje: mensajeMasivo }),
      });

      if (res.ok) {
        SweetAlert.fire("Envio correo masivo", "Correos enviados a todos los usuarios", "success");
        setAsuntoMasivo("");
        setMensajeMasivo("");
      } else {
        SweetAlert.fire("Error", "No se pudo enviar el correo masivo", "error");
      }
    } catch (error) {
      console.error(error);
      SweetAlert.fire("Error", "Error de conexión con el servidor", "warning");
    }
  };

  return (
    <div className="px-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Panel general</h2>

      {/* FORMULARIO DE CORREO MANUAL */}
      <div className="bg-white shadow-md rounded-xl p-6 max-w-xl border border-gray-200 mb-6">
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

      {/* FORMULARIO DE CORREO MASIVO */}
      <div className="bg-white shadow-md rounded-xl p-6 max-w-xl border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">
          Enviar correo a todos los usuarios
        </h3>

        <input
          type="text"
          placeholder="Asunto"
          value={asuntoMasivo}
          onChange={(e) => setAsuntoMasivo(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg mb-3 focus:ring-2 focus:ring-green-500"
        />

        <textarea
          placeholder="Mensaje"
          value={mensajeMasivo}
          onChange={(e) => setMensajeMasivo(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg mb-3 h-24 focus:ring-2 focus:ring-green-500"
        />

        <button
          onClick={enviarCorreoMasivo}
          className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-5 py-3 rounded-xl shadow-md hover:bg-green-700 transition-all"
        >
          <PaperAirplaneIcon className="w-5 h-5" />
          Enviar a todos
        </button>
      </div>
    </div>
  );
}
