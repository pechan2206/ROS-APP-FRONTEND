export default function Loader({ mensaje = "Cargando..." }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-gray-600">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
      <p className="text-sm">{mensaje}</p>
    </div>
  );
}
