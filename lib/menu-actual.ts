// El menú vigente: el guardado o, si todavía no hay (o falta el SQL), el de esta semana calculado al momento
import type { Repo } from "./datos/repo";
import { menuDeLaSemana, type Menu } from "./menu";
import type { Medida, Perfil } from "./tipos";

export async function menuVigente(repo: Repo, p: Perfil, m: Medida | undefined): Promise<Menu | null> {
  const guardado = await repo.menuActivo().catch(() => null);
  if (guardado) return guardado;
  return m ? menuDeLaSemana(p, m, repo.usuario) : null;
}

// Índice del día en el menú (0 = lunes)
export const indiceDia = (fecha: string) => (new Date(`${fecha}T12:00:00Z`).getUTCDay() + 6) % 7;
