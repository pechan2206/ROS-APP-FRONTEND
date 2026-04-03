import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { usuarioService } from "../services/usuarioService";

export default function PerfilPage({ nombre = "Usuario", rol = "mesero", rutaInicio = "/" }) {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [foto, setFoto] = useState(() => localStorage.getItem("foto") || null);
  const [nombreInput, setNombreInput] = useState(nombre);
  const [passActual, setPassActual] = useState("");
  const [passNueva, setPassNueva] = useState("");
  const [passConfirm, setPassConfirm] = useState("");
  const [toast, setToast] = useState(null); // { tipo: "ok" | "error", msg }

  // Obtenemos el correo del usuario logueado
  const user = usuarioService.getUserFromToken();
  const email = user?.sub || "";

  const handleFoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setFoto(reader.result);
      localStorage.setItem("foto", reader.result);
    };
    reader.readAsDataURL(file);
  };

  const mostrarToast = (tipo, msg) => {
    setToast({ tipo, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const handleGuardar = async () => {
    try {
      if (passNueva) {
        if (!passActual) {
          mostrarToast("error", "Ingresa tu contraseña actual.");
          return;
        }
        if (passNueva !== passConfirm) {
          mostrarToast("error", "Las contraseñas no coinciden.");
          return;
        }
      }

      const correo = user?.sub;

      if (!correo) {
        mostrarToast("error", "No se pudo identificar el usuario.");
        return;
      }

      const todos = await usuarioService.listar();
      const usuarioActual = todos.find(u => u.correo === correo);

      if (!usuarioActual) {
        mostrarToast("error", "Usuario no encontrado.");
        return;
      }

      const usuarioId = usuarioActual.idUsuario;

      // Incluimos solo los datos editables y necesarios
      const payload = {
        nombre: nombreInput,
        correo: email, // siempre el correo del usuario logueado
        apellido: usuarioActual.apellido,
        telefono: usuarioActual.telefono,
        rol: usuarioActual.rol,
        estado: usuarioActual.estado,
      };

      if (passNueva) {
        payload.contrasena = passNueva;
      }

      await usuarioService.actualizar(usuarioId, payload);

      localStorage.setItem("nombre", nombreInput);

      mostrarToast("ok", "Cambios guardados correctamente.");
      setPassActual("");
      setPassNueva("");
      setPassConfirm("");

    } catch (error) {
      mostrarToast("error", error.response?.data?.message || "Error al actualizar.");
    }
  };

  const inicial = nombreInput?.[0]?.toUpperCase() || "?";

  const colorAvatar = {
    admin: "bg-blue-600",
    mesero: "bg-blue-500",
    cajero: "bg-green-600",
    cocinero: "bg-orange-600",
  }[rol] || "bg-blue-500";

  const colorAccent = {
    admin: "text-blue-600",
    mesero: "text-blue-600",
    cajero: "text-green-600",
    cocinero: "text-orange-600",
  }[rol] || "text-blue-600";

  const labelRol = {
    admin: "Administrador",
    mesero: "Mesero",
    cajero: "Cajero",
    cocinero: "Cocinero",
  }[rol] || rol;

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center py-10 px-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm w-full max-w-md p-8">

        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <div
            className="relative w-24 h-24 rounded-full cursor-pointer group"
            onClick={() => fileRef.current.click()}
          >
            {foto ? (
              <img src={foto} alt="foto" className="w-24 h-24 rounded-full object-cover border-2 border-gray-200" />
            ) : (
              <div className={`w-24 h-24 rounded-full ${colorAvatar} text-white flex items-center justify-center text-3xl font-semibold border-2 border-gray-200`}>
                {inicial}
              </div>
            )}
          </div>

          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFoto} />

          <p className="mt-3 text-base font-medium text-gray-800">{nombreInput}</p>
          <span className={`text-xs mt-1 px-3 py-0.5 rounded-full bg-gray-100 ${colorAccent} font-medium`}>
            {labelRol}
          </span>
        </div>

        {/* Información */}
        <div className="border-t border-gray-100 pt-5">
          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest mb-4">Información</p>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Nombre completo</label>
              <input
                type="text"
                value={nombreInput}
                onChange={(e) => setNombreInput(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Correo electrónico</label>
              <input
                type="email"
                value={email}
                readOnly
                className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 bg-gray-100 text-gray-700 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Contraseña */}
        <div className="border-t border-gray-100 pt-5 mt-5">
          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest mb-4">Cambiar contraseña</p>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Contraseña actual</label>
              <input
                type="password"
                value={passActual}
                onChange={(e) => setPassActual(e.target.value)}
                placeholder="••••••••"
                className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Nueva contraseña</label>
              <input
                type="password"
                value={passNueva}
                onChange={(e) => setPassNueva(e.target.value)}
                placeholder="••••••••"
                className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Confirmar nueva contraseña</label>
              <input
                type="password"
                value={passConfirm}
                onChange={(e) => setPassConfirm(e.target.value)}
                placeholder="••••••••"
                className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
              />
            </div>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div className={`mt-4 text-sm text-center rounded-lg px-4 py-2 ${
            toast.tipo === "ok"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-600"
          }`}>
            {toast.msg}
          </div>
        )}

        {/* Acciones */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => navigate(rutaInicio)}
            className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            className={`flex-1 py-2.5 rounded-lg text-sm text-white font-medium transition ${
              {
                admin: "bg-blue-600 hover:bg-blue-700",
                mesero: "bg-blue-500 hover:bg-blue-600",
                cajero: "bg-green-600 hover:bg-green-700",
                cocinero: "bg-orange-600 hover:bg-orange-700",
              }[rol] || "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}