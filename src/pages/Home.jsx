import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const opciones = [
    { nombre: "Mesas", ruta: "/mesas", color: "bg-green-500" },
    { nombre: "Administración", ruta: "/administracion", color: "bg-blue-500" },
    { nombre: "Procesos", ruta: "/procesos", color: "bg-yellow-500" },
    { nombre: "Informes", ruta: "/informes", color: "bg-purple-500" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar nombre="Juan" />

      <main className="flex-grow">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <h2 className="text-3xl font-semibold text-gray-800 mb-8">
            Panel principal
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {opciones.map((op, i) => (
              <button
                key={i}
                onClick={() => navigate(op.ruta)}
                className={`${op.color} text-white py-10 rounded-2xl font-semibold shadow-md hover:opacity-90 transition transform hover:-translate-y-1`}
              >
                {op.nombre}
              </button>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
