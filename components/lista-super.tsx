"use client";

import { useEffect, useState } from "react";

// Lista del súper con palomitas que se recuerdan en este celular durante la semana
export function ListaSuper({ semana, secciones }: { semana: string; secciones: { seccion: string; cosas: { id: string; nombre: string; texto: string }[] }[] }) {
  const clave = `taofit-lista-${semana}`;
  const [listo, setListo] = useState<string[]>([]);
  useEffect(() => {
    try {
      setListo(JSON.parse(localStorage.getItem(clave) ?? "[]"));
    } catch {
      setListo([]);
    }
  }, [clave]);
  const cambiar = (id: string) => {
    const nuevo = listo.includes(id) ? listo.filter((x) => x !== id) : [...listo, id];
    setListo(nuevo);
    try {
      localStorage.setItem(clave, JSON.stringify(nuevo));
    } catch {}
  };
  const texto = secciones.map((s) => `${s.seccion}\n${s.cosas.map((c) => `• ${c.nombre}: ${c.texto}`).join("\n")}`).join("\n\n");
  return (
    <div className="grid gap-4">
      {secciones.map((s) => (
        <section key={s.seccion} className="rounded-2xl border bg-card p-4">
          <h2 className="mb-2 font-semibold">{s.seccion}</h2>
          <ul className="grid gap-1">
            {s.cosas.map((c) => (
              <li key={c.id}>
                <label className="flex min-h-11 cursor-pointer items-center gap-3">
                  <input type="checkbox" checked={listo.includes(c.id)} onChange={() => cambiar(c.id)} className="size-5 accent-[#d4af37]" />
                  <span className={listo.includes(c.id) ? "text-muted-foreground line-through" : ""}>
                    {c.nombre} <span className="text-muted-foreground">· {c.texto}</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <button
        type="button"
        className="min-h-12 rounded-xl border font-semibold active:bg-muted"
        onClick={async () => {
          if (navigator.share) await navigator.share({ title: "Lista del súper", text: texto }).catch(() => {});
          else await navigator.clipboard.writeText(texto).catch(() => {});
        }}
      >
        Compartir o copiar la lista
      </button>
    </div>
  );
}
