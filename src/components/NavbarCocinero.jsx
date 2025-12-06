import { Link, useNavigate } from "react-router-dom";

export default function NavbarCocinero({ nombre, setRol }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("rol");
    setRol(null);
    navigate("/login");
  };

  return (
    <nav className="bg-orange-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo / Título */}
        <div className="text-2xl font-bold">🍳 Cocina - {nombre}</div>

        {/* Links de navegación */}
        <div className="flex gap-6 items-center">
          <Link
            to="/cocinero/cocina"
            className="hover:text-orange-200 transition font-medium"
          >
            📋 Pedidos
          </Link>

          {/* Botón de cerrar sesión */}
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-orange-800 hover:bg-orange-900 rounded-lg transition"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>
  );
}