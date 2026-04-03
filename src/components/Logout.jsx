import { useNavigate } from "react-router-dom";

export default function Logout({ setRol }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("rol");
    setRol(null);
    navigate("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
    >
      Cerrar sesión
    </button>
  );
}