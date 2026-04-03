import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDownIcon } from "@heroicons/react/24/solid";

export default function Navbar({ nombre = "Juan" }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const foto = localStorage.getItem("foto");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
    window.location.reload();
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center">
        
        {/* Logo */}
        <h1
          onClick={() => navigate("/mesero/home")}
          className="text-2xl font-bold text-gray-800 tracking-tight cursor-pointer"
        >
          Restaurante <span className="text-blue-600">Pancho Paisa</span>
        </h1>

        <div className="flex items-center ml-auto space-x-8">
          
          {/* Navegación */}
          <nav className="hidden md:flex items-center space-x-6 text-gray-700 font-medium">
            <button onClick={() => navigate("/mesero/home")} className="hover:text-blue-600 transition">
              Inicio
            </button>
            <button onClick={() => navigate("/mesero/pedidos")} className="hover:text-blue-600 transition">
              Pedidos
            </button>
            <button onClick={() => navigate("/mesero/mesas")} className="hover:text-blue-600 transition">
              Mesas
            </button>
            <button onClick={() => navigate("/mesero/informes")} className="hover:text-blue-600 transition">
              Informes
            </button>
          </nav>

          {/* Usuario */}
          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition"
            >
              {/* FOTO o INICIAL */}
              {foto ? (
                <img
                  src={foto}
                  alt="foto"
                  onError={(e) => (e.target.style.display = "none")}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold text-sm">
                  {nombre[0]?.toUpperCase()}
                </div>
              )}

              <span className="font-medium text-gray-800 hidden sm:block">
                {nombre}
              </span>

              <ChevronDownIcon className="h-4 w-4 text-gray-600" />
            </button>

            {/* Dropdown */}
            {open && (
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg py-2 z-50 border border-gray-100">
                <button
                  onClick={() => navigate("/mesero/perfil")}
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