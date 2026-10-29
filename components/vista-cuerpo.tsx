"use client";

// Vista previa en vivo: mientras escribes tus medidas, tu personaje cambia de cuerpo al instante
import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/avatar";
import type { Apariencia } from "@/lib/avatar";
import type { Medida, Perfil } from "@/lib/tipos";

const CAMPOS = ["cintura_cm", "cadera_cm", "pecho_cm", "brazo_cm", "muslo_cm", "cuello_cm"] as const;

export function VistaPreviaCuerpo({
  perfil,
  anterior,
}: {
  perfil: Pick<Perfil, "cuerpo" | "altura_cm" | "nacimiento"> & { avatar?: Apariencia | null };
  anterior?: Medida | null;
}) {
  const caja = useRef<HTMLDivElement>(null);
  const [medida, setMedida] = useState<Medida>(
    anterior ?? { id: "vista", fecha: "", peso_kg: 70, cintura_cm: null, cadera_cm: null, pecho_cm: null, brazo_cm: null, muslo_cm: null, cuello_cm: null },
  );
  const [cambio, setCambio] = useState(false);

  useEffect(() => {
    const form = caja.current?.closest("form");
    if (!form) return;
    const leer = () => {
      const datos = new FormData(form);
      const num = (k: string) => {
        const v = Number(String(datos.get(k) ?? "").replace(",", "."));
        return v > 0 ? v : null;
      };
      const nueva: Medida = { id: "vista", fecha: "", peso_kg: num("peso_kg") ?? anterior?.peso_kg ?? 70, cintura_cm: null, cadera_cm: null, pecho_cm: null, brazo_cm: null, muslo_cm: null, cuello_cm: null };
      for (const c of CAMPOS) nueva[c] = num(c) ?? anterior?.[c] ?? null;
      setMedida(nueva);
      setCambio(CAMPOS.some((c) => num(c) !== null) || num("peso_kg") !== null);
    };
    form.addEventListener("input", leer);
    form.addEventListener("reset", () => setTimeout(leer));
    return () => form.removeEventListener("input", leer);
  }, [anterior]);

  return (
    <div ref={caja} className="flex items-center gap-4 rounded-2xl border bg-background p-3">
      <Avatar perfil={perfil} medida={medida} antes={cambio ? anterior : null} className="h-44 w-auto shrink-0" titulo="Vista previa de tu personaje" />
      <div className="grid gap-1 text-sm">
        <p className="font-semibold">{cambio ? "Así quedaría tu personaje" : "Tu personaje hoy"}</p>
        <p className="text-muted-foreground">
          {cambio ? "Cambia en vivo con cada medida que escribes. La silueta punteada es cómo estaba antes." : "Escribe tus medidas abajo y míralo cambiar al instante."}
        </p>
        <p className="text-xs text-muted-foreground">Cara, pelo y ropa se eligen en “Mi personaje”.</p>
      </div>
    </div>
  );
}
