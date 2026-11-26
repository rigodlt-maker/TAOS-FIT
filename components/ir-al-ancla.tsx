"use client";
// Al llegar con un ancla (/perfil#clases), baja hasta esa parte aunque la pantalla haya cargado después
import { useEffect } from "react";

export function IrAlAncla() {
  useEffect(() => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (!id) return;
    const t = setTimeout(() => document.getElementById(id)?.scrollIntoView({ block: "start" }), 50);
    return () => clearTimeout(t);
  }, []);
  return null;
}
