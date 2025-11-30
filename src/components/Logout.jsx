import { useNavigate } from "react-router-dom";

export default function Logout({ setRol }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // 1. Borrar token y rol
    localStorage.removeItem("token");
    localStorage.removeItem("rol");

    // 2. Actualizar estado global
    setRol(null);

    // 3. Redirigir al login
    navigate("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
    >
      Cerrar sesión
    </button>
  );
}
