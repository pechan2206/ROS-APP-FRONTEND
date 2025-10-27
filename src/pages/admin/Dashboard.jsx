export default function Dashboard() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Panel general</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-100 p-4 rounded-lg shadow">
          <p className="text-gray-700 font-semibold">Mesas activas</p>
          <p className="text-3xl font-bold text-green-600">12</p>
        </div>
        <div className="bg-blue-100 p-4 rounded-lg shadow">
          <p className="text-gray-700 font-semibold">Pedidos en curso</p>
          <p className="text-3xl font-bold text-blue-600">8</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-lg shadow">
          <p className="text-gray-700 font-semibold">Meseros activos</p>
          <p className="text-3xl font-bold text-yellow-600">4</p>
        </div>
      </div>
    </div>
  );
}
