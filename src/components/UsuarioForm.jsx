import { useState } from "react";
import { usuarioService } from "../services/usuarioService";

export default function UsuarioForm({ onClose, onSave, usuario }) {
  const [nombre, setNombre] = useState(usuario?.nombre || "");
  const [apellido, setApellido] = useState(usuario?.apellido || "");
  const [correo, setCorreo] = useState(usuario?.correo || "");
  const [telefono, setTelefono] = useState(usuario?.telefono || "");
  const [rol, setRol] = useState(usuario?.rol?.idRol || "");
  const [estado, setEstado] = useState(usuario?.estado || "Activo");
  const [contrasena, setContrasena] = useState(""); // siempre vacío al editar
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
        ...(contrasena && { contrasena }) // solo enviar si se escribió
      };

      if (usuario?.idUsuario) {
        await usuarioService.actualizar(usuario.idUsuario, nuevoUsuario);
      } else {
        await usuarioService.guardar(nuevoUsuario);
      }

      onSave();
      onClose();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.mensaje) {
        setError(err.response.data.mensaje);
      } else {
        setError(err.message || "Error al guardar usuario");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {usuario ? "Editar Usuario" : "Nuevo Usuario"}
        </h2>
        {error && <p className="text-red-600 mb-2">{error}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            placeholder="Nombre"
            className="border px-3 py-2 rounded"
            required
          />
          <input
            value={apellido}
            onChange={e => setApellido(e.target.value)}
            placeholder="Apellido"
            className="border px-3 py-2 rounded"
          />
          <input
            type="email"
            value={correo}
            onChange={e => setCorreo(e.target.value)}
            placeholder="Correo"
            className="border px-3 py-2 rounded"
            required
          />
          <input
            type="password"
            value={contrasena}
            onChange={e => setContrasena(e.target.value)}
            placeholder={usuario ? "Nueva contraseña (opcional)" : "Contraseña"}
            className="border px-3 py-2 rounded"
            minLength={6}
            required={!usuario} // obligatorio solo si es nuevo usuario
          />
          <input
            value={telefono}
            onChange={e => setTelefono(e.target.value)}
            placeholder="Teléfono"
            className="border px-3 py-2 rounded"
            pattern="3\d{9}"
            title="El teléfono debe iniciar con 3 y tener 10 dígitos"
            required
          />
          <select
            value={rol}
            onChange={e => setRol(e.target.value)}
            className="border px-3 py-2 rounded"
            required
          >
            <option value="">Seleccionar rol</option>
            <option value={2}>Mesero</option>
            <option value={3}>Cajero</option>
            <option value={4}>Cocinero</option>
          </select>
          <select
            value={estado}
            onChange={e => setEstado(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
