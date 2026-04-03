import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDownIcon } from "@heroicons/react/24/solid";

export default function NavbarAdmin({ nombre = "Administrador", setRol }) {
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
          onClick={() => navigate("/admin/dashboard")}
          className="text-2xl font-bold text-gray-800 tracking-tight cursor-pointer"
        >
          Panel <span className="text-blue-600">Administrador</span>
        </h1>

        <div className="flex items-center ml-auto space-x-8">
          <nav className="hidden md:flex items-center space-x-6 text-gray-700 font-medium">
            <button onClick={() => navigate("/admin/dashboard")} className="hover:text-blue-600 transition">Inicio</button>
            <button onClick={() => navigate("/admin/usuarios")} className="hover:text-blue-600 transition">Usuarios</button>
            <button onClick={() => navigate("/admin/clientes")} className="hover:text-blue-600 transition">Clientes</button>
            <button onClick={() => navigate("/admin/productos")} className="hover:text-blue-600 transition">Productos</button>
            <button onClick={() => navigate("/admin/proveedores")} className="hover:text-blue-600 transition">Proveedores</button>
            <button onClick={() => navigate("/admin/reportes")} className="hover:text-blue-600 transition">Reportes</button>
          </nav>

          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
                {nombre[0]?.toUpperCase()}
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