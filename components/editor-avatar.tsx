"use client";

import { useState } from "react";
import { INFERIORES, OPCIONES, PELOS, PIELES, ROPAS, TENIS, normalizarApariencia, type Apariencia } from "@/lib/avatar";
import type { Cuerpo, Medida } from "@/lib/tipos";
import { cn } from "@/lib/utils";
import { Avatar } from "./avatar";

function Colores({ colores, valor, alElegir, nombre }: { colores: string[]; valor: string; alElegir: (c: string) => void; nombre: string }) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={nombre}>
      {colores.map((c) => (
        <button
          key={c}
          type="button"
          role="radio"
          aria-checked={valor === c}
          aria-label={`${nombre} ${c}`}
          onClick={() => alElegir(c)}
          className={cn("size-10 rounded-full border-2", valor === c ? "border-primary ring-2 ring-primary/40" : "border-white/10")}
          style={{ background: c }}
        />
      ))}
    </div>
  );
}

function Botones<T extends string>({ opciones, valor, alElegir, columnas = 3 }: { opciones: Record<T, string>; valor: T; alElegir: (v: T) => void; columnas?: number }) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${columnas}, minmax(0, 1fr))` }}>
      {(Object.entries(opciones) as [T, string][]).map(([v, n]) => (
        <button key={v} type="button" onClick={() => alElegir(v)} className={cn("min-h-11 rounded-xl border px-1 text-xs", valor === v && "border-primary bg-primary/10 text-primary")}>
          {n}
        </button>
      ))}
    </div>
  );
}

const PESTANAS = ["Cara", "Pelo", "Ropa", "Extras"] as const;

// Personaliza tu personaje; el cuerpo lo dibujan tus medidas
export function EditorAvatar({ inicial, cuerpo, altura, nacimiento, medida }: { inicial: Apariencia | null; cuerpo: Cuerpo; altura: number; nacimiento: string; medida: Medida | null }) {
  const [a, setA] = useState<Apariencia>(normalizarApariencia(inicial, cuerpo));
  const [pestana, setPestana] = useState<(typeof PESTANAS)[number]>("Cara");
  const cambiar = (c: Partial<Apariencia>) => setA({ ...a, ...c });
  const muestra: Medida = medida ?? { id: "vista", fecha: "", peso_kg: cuerpo === "masculino" ? 75 : 60, cintura_cm: null, cadera_cm: null, pecho_cm: null, brazo_cm: null, muslo_cm: null, cuello_cm: null };
  const Titulo = ({ children }: { children: React.ReactNode }) => <span className="text-sm font-medium">{children}</span>;
  return (
    <div className="grid gap-4">
      {(Object.entries(a) as [string, unknown][]).map(([k, v]) => (k === "pecas" ? (v ? <input key={k} type="hidden" name="av_pecas" value="on" /> : null) : <input key={k} type="hidden" name={`av_${k}`} value={String(v)} />))}
      <div className="sticky top-16 z-10 -mx-4 flex justify-center bg-background/95 px-4 py-2 backdrop-blur">
        <Avatar perfil={{ cuerpo, altura_cm: altura || 170, nacimiento: nacimiento || "1995-01-01" }} medida={{ ...muestra, id: "vista" }} apariencia={a} className="h-64 w-32" />
      </div>
      <div className="grid grid-cols-4 gap-1 rounded-xl bg-muted p-1" role="tablist">
        {PESTANAS.map((p) => (
          <button key={p} type="button" role="tab" aria-selected={pestana === p} onClick={() => setPestana(p)} className={cn("min-h-10 rounded-lg text-sm", pestana === p && "bg-card font-semibold text-primary")}>
            {p}
          </button>
        ))}
      </div>
      {pestana === "Cara" && (
        <div className="grid gap-3">
          <Titulo>Tono de piel</Titulo>
          <Colores nombre="Piel" colores={PIELES} valor={PIELES[a.piel]} alElegir={(c) => cambiar({ piel: PIELES.indexOf(c) })} />
          <Titulo>Ojos</Titulo>
          <Botones opciones={OPCIONES.ojos} valor={a.ojos} alElegir={(ojos) => cambiar({ ojos })} />
          <Titulo>Cejas</Titulo>
          <Botones opciones={OPCIONES.cejas} valor={a.cejas} alElegir={(cejas) => cambiar({ cejas })} columnas={4} />
          <Titulo>Boca</Titulo>
          <Botones opciones={OPCIONES.boca} valor={a.boca} alElegir={(boca) => cambiar({ boca })} />
          <label className="flex min-h-11 items-center gap-3 text-sm">
            <input type="checkbox" checked={a.pecas} onChange={(e) => cambiar({ pecas: e.target.checked })} className="size-5 accent-[#d4af37]" /> Pecas
          </label>
          <Titulo>Complexión del dibujo</Titulo>
          <Botones opciones={OPCIONES.complexion} valor={a.complexion} alElegir={(complexion) => cambiar({ complexion })} />
        </div>
      )}
      {pestana === "Pelo" && (
        <div className="grid gap-3">
          <Titulo>Peinado</Titulo>
          <Botones opciones={OPCIONES.peinado} valor={a.peinado} alElegir={(peinado) => cambiar({ peinado })} />
          <Titulo>Color</Titulo>
          <Colores nombre="Pelo" colores={PELOS} valor={a.pelo} alElegir={(pelo) => cambiar({ pelo })} />
          <Titulo>Barba o bigote</Titulo>
          <Botones opciones={OPCIONES.vello} valor={a.vello} alElegir={(vello) => cambiar({ vello })} />
        </div>
      )}
      {pestana === "Ropa" && (
        <div className="grid gap-3">
          <Titulo>Arriba</Titulo>
          <Botones opciones={OPCIONES.prenda} valor={a.prenda} alElegir={(prenda) => cambiar({ prenda })} columnas={4} />
          <Colores nombre="Color de arriba" colores={ROPAS} valor={a.ropa} alElegir={(ropa) => cambiar({ ropa })} />
          <Titulo>Abajo</Titulo>
          <Botones opciones={OPCIONES.inferior} valor={a.inferior} alElegir={(inferior) => cambiar({ inferior })} />
          <Colores nombre="Color de abajo" colores={INFERIORES} valor={a.color_inferior} alElegir={(color_inferior) => cambiar({ color_inferior })} />
          <Titulo>Tenis</Titulo>
          <Colores nombre="Tenis" colores={TENIS} valor={a.tenis} alElegir={(tenis) => cambiar({ tenis })} />
        </div>
      )}
      {pestana === "Extras" && (
        <div className="grid gap-3">
          <Titulo>Lentes</Titulo>
          <Botones opciones={OPCIONES.lentes} valor={a.lentes} alElegir={(lentes) => cambiar({ lentes })} columnas={4} />
          <Titulo>Accesorio</Titulo>
          <Botones opciones={OPCIONES.accesorio} valor={a.accesorio} alElegir={(accesorio) => cambiar({ accesorio })} />
        </div>
      )}
    </div>
  );
}
