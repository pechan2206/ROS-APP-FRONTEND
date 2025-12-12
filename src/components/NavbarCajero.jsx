import { Link, useNavigate } from "react-router-dom";

export default function NavbarCajero({ nombre, setRol }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("rol");
    setRol(null);
    navigate("/login");
  };

  return (
    <nav className="bg-green-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo / Título */}
        <div className="text-2xl font-bold">💰 Caja - {nombre}</div>

        {/* Links de navegación */}
        <div className="flex gap-6 items-center">
          <Link
            to="/cajero/caja"
            className="hover:text-green-200 transition font-medium"
          >
            💵 Cobros
          </Link>

          {/* Botón de cerrar sesión */}
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-green-800 hover:bg-green-900 rounded-lg transition"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>
  );
}