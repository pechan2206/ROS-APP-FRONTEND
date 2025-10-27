import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    // 🔹 Usuarios simulados
    const usuarios = [
      { nombre: "Carlos", rol: "admin", usuario: "admin", clave: "1234" },
      { nombre: "Juan", rol: "mesero", usuario: "mesero", clave: "1234" },
    ];

    const user = usuarios.find(
      (u) => u.usuario === usuario && u.clave === clave
    );

    if (user) {
      localStorage.setItem("rol", user.rol);
      localStorage.setItem("nombre", user.nombre);

      if (user.rol === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/mesero/home");
      }
    } else {
      setError("Usuario o contraseña incorrectos");
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gray-50">
      {/* Formulario */}
      <form
        onSubmit={handleLogin}
        className="bg-white shadow-xl rounded-2xl p-8 w-96 border border-gray-100"
      >
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Iniciar Sesión
        </h2>

        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}

        <div className="mb-4">
          <label className="block text-gray-600 mb-1">Usuario</label>
          <input
            type="text"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-600 mb-1">Contraseña</label>
          <input
            type="password"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Ingresar
        </button>
      </form>

      {/* 🔹 Usuarios flotantes */}
      <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-md border border-gray-200 shadow-lg rounded-xl p-4 text-sm text-gray-600 space-y-1">
        <p className="font-semibold text-gray-800 mb-1 text-center">
          Usuarios de prueba
        </p>
        <p>
          👨‍🍳 <strong>Mesero:</strong> <span className="text-blue-600">mesero / 1234</span>
        </p>
        <p>
          💼 <strong>Admin:</strong> <span className="text-blue-600">admin / 1234</span>
        </p>
      </div>
    </div>
  );
}
