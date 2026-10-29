"use client";

import { Home, ListChecks, Play, TrendingUp, UserRound, Utensils } from "lucide-react";
import { usePathname } from "next/navigation";
import { BarraInferior, BotonFlotante } from "./taos/shell";

export function Navegacion({ aviso }: { aviso?: number }) {
  // En la bienvenida no hay a dónde ir todavía
  if (usePathname().startsWith("/bienvenida")) return null;
  return (
    <>
      <BotonFlotante href="/entrenar" etiqueta="Entrenar" icono={Play} ocultarEn={["/entrenar", "/bienvenida", "/perfil", "/personaje", "/mas", "/registro", "/comida", "/cuerpo"]} />
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
