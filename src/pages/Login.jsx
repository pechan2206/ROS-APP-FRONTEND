import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login({ setRol }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ correo: "", contrasena: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correo: form.correo,
          contrasena: form.contrasena,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Guardar token y rol
        localStorage.setItem("token", data.token);
        localStorage.setItem("rol", data.rol);
        setRol(data.rol);

        // Redirigir según rol
        if (data.rol === "Administrador") navigate("/admin/dashboard");
        else if (data.rol === "Mesero") navigate("/mesero/dashboard");
        else navigate("/usuario/dashboard");
      } else {
        setError(data.message || "Usuario o contraseña incorrectos");
      }
    } catch (err) {
      console.error(err);
      setError("Error de conexión con el servidor");
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
            <label className="block text-gray-700">Correo</label>
            <input
              type="email"
              name="correo"
              value={form.correo}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Contraseña</label>
            <input
              type="password"
              name="contrasena"
              value={form.contrasena}
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
              <strong>Admin:</strong> correo <code>admin@restaurante.com</code>{" "}
              / contraseña <code>12345</code>
            </li>
            <li>
              <strong>Mesero:</strong> correo <code>steven.andrade.stat@gmail.com</code>{" "}
              / contraseña <code>123456789</code>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
