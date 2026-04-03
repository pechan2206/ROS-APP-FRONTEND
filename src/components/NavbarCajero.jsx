import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDownIcon } from "@heroicons/react/24/solid";

export default function NavbarCajero({ nombre = "Cajero", setRol }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
    window.location.reload();
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center">
        <h1
          onClick={() => navigate("/cajero/caja")}
          className="text-2xl font-bold text-gray-800 tracking-tight cursor-pointer"
        >
          Panel <span className="text-green-600">Cajero</span>
        </h1>

        <div className="flex items-center ml-auto space-x-8">
          <nav className="hidden md:flex items-center space-x-6 text-gray-700 font-medium">
            <button onClick={() => navigate("/cajero/caja")} className="hover:text-green-600 transition">Cobros</button>
            <button onClick={() => navigate("/cajero/reportes")} className="hover:text-green-600 transition">Reportes</button>
          </nav>

          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition"
            >
              <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold text-sm">
                {nombre[0]?.toUpperCase()}
              </div>
              <span className="font-medium text-gray-800 hidden sm:block">{nombre}</span>
              <ChevronDownIcon className="h-4 w-4 text-gray-600" />
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg py-2 z-50 border border-gray-100">
                <button
                  onClick={() => navigate("/cajero/perfil")}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Perfil
                </button>
                <hr className="my-1" />
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}