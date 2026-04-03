import { useNavigate } from "react-router-dom";

export default function Logout({ setRol }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
    window.location.reload();
  };

  return (
    <button
      onClick={handleLogout}
      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
    >
      Cerrar sesión
    </button>
  );
}