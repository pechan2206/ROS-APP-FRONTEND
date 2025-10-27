import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Administracion() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar nombre="Juan" />

      <main className="flex-grow flex items-center justify-center">
        <h1 className="text-3xl font-bold text-gray-800">Administración</h1>
      </main>

      <Footer />
    </div>
  );
}
