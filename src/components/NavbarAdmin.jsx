import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import Logout from "./Logout";

export default function NavbarAdmin({ nombre = "Administrador", setRol }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // 🔹 Función de cierre de sesión unificada
  const handleLogout = () => {
    localStorage.clear(); // borra rol, nombre, etc.
    navigate("/"); // vuelve al login
    window.location.reload(); // 🔁 reinicia el enrutador para evitar pantalla blanca
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center">
        <h1
          onClick={() => navigate("/admin/dashboard")}
          className="text-2xl font-bold text-gray-800 tracking-tight cursor-pointer"
        >
          🧾 Panel <span className="text-blue-600">Administrador</span>
        </h1>

        <div className="flex items-center ml-auto space-x-8">
          <nav className="hidden md:flex items-center space-x-6 text-gray-700 font-medium">
            <button onClick={() => navigate("/admin/dashboard")} className="hover:text-blue-600">
              Inicio
            </button>
            <button onClick={() => navigate("/admin/mesas")} className="hover:text-blue-600">
              Mesas
            </button>
            <button onClick={() => navigate("/admin/reportes")} className="hover:text-blue-600">
              Reportes
            </button>
          </nav>

          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                {nombre[0]}
              </div>
              <span className="font-medium text-gray-800 hidden sm:block">{nombre}</span>
              <ChevronDownIcon className="h-4 w-4 text-gray-600" />
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg py-2 z-50 border border-gray-100">
                <button
                  onClick={() => navigate("/admin/perfil")}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Perfil
                </button>
                <hr className="my-1" />
                <Logout setRol={setRol} />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
