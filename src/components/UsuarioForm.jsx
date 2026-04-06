import { useState } from "react";
import { usuarioService } from "../services/usuarioService";
import { User, Mail, Lock, Phone, Shield, ToggleRight, AlertTriangle } from "lucide-react";

const rolesNombres = { 2: "Mesero", 3: "Cocinero", 4: "Cajero" };

export default function UsuarioForm({ onClose, onSave, usuario }) {
  const [nombre,    setNombre]    = useState(usuario?.nombre    || "");
  const [apellido,  setApellido]  = useState(usuario?.apellido  || "");
  const [correo,    setCorreo]    = useState(usuario?.correo    || "");
  const [telefono,  setTelefono]  = useState(usuario?.telefono  || "");
  const [rol,       setRol]       = useState(usuario?.rol?.idRol || "");
  const [estado,    setEstado]    = useState(usuario?.estado    || "Activo");
  const [contrasena, setContrasena] = useState("");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const nuevoUsuario = {
        nombre,
        apellido,
        correo,
        telefono,
        estado,
        rol: { idRol: parseInt(rol) },
        ...(contrasena && { contrasena }),
      };

      if (usuario?.idUsuario) {
        await usuarioService.actualizar(usuario.idUsuario, nuevoUsuario);
      } else {
        await usuarioService.guardar(nuevoUsuario);
      }

      onSave({
        ...nuevoUsuario,
        rolNombre: rolesNombres[parseInt(rol)] || "—",
      });

    } catch (err) {
      if (err.response?.data?.mensaje) {
        setError(err.response.data.mensaje);
      } else {
        setError(err.message || "Error al guardar usuario");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">
        {usuario ? "Editar Usuario" : "Nuevo Usuario"}
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-lg mb-3 flex items-center gap-2">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">

        {/* Nombre */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Nombre</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <User size={16} />
            </span>
            <input
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Ej: Juan"
              className="w-full border border-gray-300 pl-9 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
        </div>

        {/* Apellido */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Apellido</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <User size={16} />
            </span>
            <input
              value={apellido}
              onChange={e => setApellido(e.target.value)}
              placeholder="Ej: García"
              className="w-full border border-gray-300 pl-9 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        {/* Correo */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Correo</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Mail size={16} />
            </span>
            <input
              type="email"
              value={correo}
              onChange={e => setCorreo(e.target.value)}
              placeholder="Ej: juan@correo.com"
              className="w-full border border-gray-300 pl-9 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
        </div>

        {/* Contraseña */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
            {usuario ? "Nueva contraseña (opcional)" : "Contraseña"}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Lock size={16} />
            </span>
            <input
              type="password"
              value={contrasena}
              onChange={e => setContrasena(e.target.value)}
              placeholder={usuario ? "Dejar vacío para no cambiar" : "Mínimo 6 caracteres"}
              className="w-full border border-gray-300 pl-9 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              minLength={6}
              required={!usuario}
              autoComplete="new-password"
            />
          </div>
        </div>

        {/* Teléfono */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Teléfono</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Phone size={16} />
            </span>
            <input
              value={telefono}
              onChange={e => setTelefono(e.target.value)}
              placeholder="Ej: 3001234567"
              className="w-full border border-gray-300 pl-9 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              pattern="3\d{9}"
              title="Debe iniciar con 3 y tener 10 dígitos"
              required
            />
          </div>
        </div>

        {/* Rol */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Rol</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Shield size={16} />
            </span>
            <select
              value={rol}
              onChange={e => setRol(e.target.value)}
              className="w-full border border-gray-300 pl-9 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            >
              <option value="">Seleccionar rol</option>
              <option value={2}>Mesero</option>
              <option value={3}>Cocinero</option>
              <option value={4}>Cajero</option>
            </select>
          </div>
        </div>

        {/* Estado */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Estado</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <ToggleRight size={16} />
            </span>
            <select
              value={estado}
              onChange={e => setEstado(e.target.value)}
              className="w-full border border-gray-300 pl-9 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-semibold transition"
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}