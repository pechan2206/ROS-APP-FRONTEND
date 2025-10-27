import { useState } from "react";

function Auth({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Usuario de prueba
  const usuarioPrueba = {
    email: "admin@demo.com",
    password: "123456",
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (email === usuarioPrueba.email && password === usuarioPrueba.password) {
      onLogin(); // avisamos al App.jsx que el login fue exitoso
    } else {
      setError("Correo o contraseña incorrectos");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-sm bg-white shadow-lg rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">
          Iniciar sesión
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Correo
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ingresar
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Usuario de prueba: <br />
          <span className="text-gray-700 font-medium">
            admin@demo.com / 123456
          </span>
        </p>
      </div>
    </div>
  );
}

export default Auth;
