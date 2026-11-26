"use client";
// 1.4.0 · «¿Dónde entrenas cada día?» sigue en vivo a las casillas de «Tus días de entreno» (sin tener que guardar primero)
import { useEffect, useRef, useState } from "react";
import { Label, Select } from "@/components/ui/campos";

const ORDEN = [1, 2, 3, 4, 5, 6, 0];

export function LugarPorDia({
  inicial,
  lugares,
  principal,
  opciones,
  dias,
}: {
  inicial: number[];
  lugares: Partial<Record<number, string>>;
  principal: string;
  opciones: { valor: string; titulo: string }[];
  dias: string[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [elegidos, setElegidos] = useState<number[]>(inicial);

  useEffect(() => {
    const form = ref.current?.closest("form");
    if (!form) return;
    const leer = () =>
      setElegidos(
        [...form.querySelectorAll<HTMLInputElement>('input[name="dias_entreno"]')].filter((i) => i.checked).map((i) => Number(i.value)),
      );
    leer();
    form.addEventListener("change", leer);
    return () => form.removeEventListener("change", leer);
  }, []);

  const visibles = ORDEN.filter((d) => elegidos.includes(d));
  return (
    <div ref={ref} id="lugares" className="grid scroll-mt-20 gap-2 text-sm font-medium">
      ¿Dónde entrenas cada día?
      <input type="hidden" name="_campos" value="lugar_por_dia" />
      {visibles.length === 0 ? (
        <span className="text-xs font-normal text-muted-foreground">Primero marca arriba tus días de entreno y aquí aparecen para elegir el lugar de cada uno.</span>
      ) : (
        <>
          <span className="text-xs font-normal text-muted-foreground">Tu rutina se arma para el lugar con más equipo; los días en casa se adaptan solos a lo que tienes ahí.</span>
          <div className="grid gap-2">
            {visibles.map((d) => (
              <Label key={d} className="grid grid-cols-[4rem_1fr] items-center gap-2 font-normal">
                {dias[d]}
                <Select name={`lugar_dia_${d}`} defaultValue={lugares[d] ?? principal}>
                  {opciones.map((o) => (
                    <option key={o.valor} value={o.valor}>
                      {o.titulo}
                    </option>
                  ))}
                </Select>
              </Label>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
