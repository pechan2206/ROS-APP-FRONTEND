import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login({ setRol }) {
  const navigate = useNavigate();

  // Usuarios de prueba
  const usuarios = [
    { usuario: "admin", contraseña: "admin123", rol: "admin" },
    { usuario: "mesero", contraseña: "mesero123", rol: "mesero" },
  ];

  const [form, setForm] = useState({ usuario: "", contraseña: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const user = usuarios.find(
      (u) =>
        u.usuario === form.usuario && u.contraseña === form.contraseña
    );
    if (user) {
      localStorage.setItem("rol", user.rol);
      setRol(user.rol);
      navigate(`/${user.rol}`);
    } else {
      setError("Usuario o contraseña incorrectos");
    }
  };

  const irARegistro = () => {
    navigate("/register");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-md w-96">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Iniciar Sesión
        </h2>

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700">Usuario</label>
            <input
              type="text"
              name="usuario"
              value={form.usuario}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Contraseña</label>
            <input
              type="password"
              name="contraseña"
              value={form.contraseña}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Entrar
          </button>
        </form>

        <button
          onClick={irARegistro}
          className="w-full mt-4 text-blue-600 hover:underline text-sm"
        >
          ¿No tienes cuenta? Regístrate
        </button>

        {/* 🔹 Usuarios de prueba visibles */}
        <div className="mt-6 border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">
            Usuarios de prueba:
          </h3>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>
              <strong>Admin:</strong> usuario <code>admin</code> / contraseña{" "}
              <code>admin123</code>
            </li>
            <li>
              <strong>Mesero:</strong> usuario <code>mesero</code> / contraseña{" "}
              <code>mesero123</code>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
