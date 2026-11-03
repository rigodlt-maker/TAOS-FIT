// Junta lo necesario para calcular tus medallas
import { hoyLocal } from "./entreno";
import { medallas } from "./medallas";
import { obtenerRepo } from "./sesion";

export async function misMedallas() {
  const repo = await obtenerRepo();
  const [series, medidas, registros, perfil] = await Promise.all([repo.series(), repo.medidas(), repo.registros(), repo.perfil()]);
  return medallas({ series, medidas, registros, perfil, hoy: hoyLocal() });
}
