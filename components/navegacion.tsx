"use client";

import { Home, ListChecks, Play, TrendingUp, UserRound, Utensils } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEnCurso } from "./continuar-entreno";
import { BarraInferior, BotonFlotante } from "./taos/shell";

export function Navegacion({ aviso }: { aviso?: number }) {
  // Si dejaste un entrenamiento a medias, el botón te regresa a donde ibas
  const enCurso = useEnCurso();
  // En la bienvenida no hay a dónde ir todavía
  if (usePathname().startsWith("/bienvenida")) return null;
  return (
    <>
      <BotonFlotante href={enCurso?.url ?? "/entrenar"} etiqueta={enCurso ? "Continuar" : "Entrenar"} icono={Play} ocultarEn={["/entrenar", "/bienvenida", "/perfil", "/personaje", "/mas", "/registro", "/comida", "/cuerpo"]} />
      <BarraInferior
        secciones={[
          { ruta: "/", nombre: "Hoy", icono: Home },
          { ruta: "/rutina", nombre: "Rutina", icono: ListChecks, tambien: ["/entrenar"] },
          { ruta: "/comida", nombre: "Comida", icono: Utensils },
          { ruta: "/progreso", nombre: "Progreso", icono: TrendingUp, insignia: aviso, tambien: ["/registro"] },
          { ruta: "/mas", nombre: "Yo", icono: UserRound, tambien: ["/perfil", "/personaje", "/cuerpo", "/ejercicios"] },
        ]}
      />
    </>
  );
}
