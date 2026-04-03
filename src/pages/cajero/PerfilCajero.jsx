import PerfilPage from "../../components/PerfilPage";
export default function PerfilCajero() {
  const nombre = localStorage.getItem("nombre") || "Cajero";
  return <PerfilPage nombre={nombre} rol="cajero" rutaInicio="/cajero/caja" />;
}