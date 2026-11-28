"use client";
// Cuando el plan ya quedó armado, se borra lo que la bienvenida guardó en este celular
import { useEffect } from "react";
import { CLAVE_BORRADOR } from "./bienvenida";

export function LimpiarBorradorBienvenida() {
  useEffect(() => {
    try {
      localStorage.removeItem(CLAVE_BORRADOR);
    } catch {
      // sin almacenamiento: no hay nada que borrar
    }
  }, []);
  return null;
}
