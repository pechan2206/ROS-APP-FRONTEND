import PerfilPage from "../../components/PerfilPage";
export default function PerfilAdmin() {
  const nombre = localStorage.getItem("nombre") || "Administrador";
  return <PerfilPage nombre={nombre} rol="admin" rutaInicio="/admin/dashboard" />;
}