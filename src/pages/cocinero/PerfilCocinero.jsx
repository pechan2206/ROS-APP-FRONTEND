import PerfilPage from "../../components/PerfilPage";
export default function PerfilCocinero() {
  const nombre = localStorage.getItem("nombre") || "Cocinero";
  return <PerfilPage nombre={nombre} rol="cocinero" rutaInicio="/cocinero/cocina" />;
}