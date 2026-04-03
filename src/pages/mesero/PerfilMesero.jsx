import PerfilPage from "../../components/PerfilPage";
export default function PerfilMesero() {
  const nombre = localStorage.getItem("nombre") || "Mesero";
  return <PerfilPage nombre={nombre} rol="mesero" rutaInicio="/mesero/home" />;
}