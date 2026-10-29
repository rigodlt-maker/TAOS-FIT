"use client";

// Chat sencillo con Tao: manda la pregunta a /api/tao y muestra la respuesta (va dentro de la hoja de Tao)
import { ArrowUp, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Markdown } from "../markdown";

type Mensaje = { pregunta: string; respuesta: string | null };

export function ChatTao({ ejemplos, placeholder = "Pregúntale a Tao…" }: { ejemplos: string[]; placeholder?: string }) {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [texto, setTexto] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const final = useRef<HTMLDivElement>(null);

  // Llaves: en Chrome nuevo scrollIntoView devuelve una promesa y React la trataría como función de limpieza
  useEffect(() => {
    final.current?.scrollIntoView({ block: "end" });
  }, [mensajes]);

  async function enviar(pregunta: string) {
    pregunta = pregunta.trim();
    if (!pregunta || ocupado) return;
    setTexto("");
    setOcupado(true);
    setMensajes((m) => [...m, { pregunta, respuesta: null }]);
    let respuesta: string;
    try {
      const r = await fetch("/api/tao", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pregunta }) });
      if (r.redirected || r.status === 401) respuesta = "Tu sesión se cerró. Recarga la app y vuelve a entrar.";
      else respuesta = ((await r.json().catch(() => null)) as { respuesta?: string } | null)?.respuesta ?? `Algo falló (error ${r.status}). Intenta de nuevo.`;
    } catch {
      respuesta = "No me pude conectar. Revisa tu internet e intenta de nuevo.";
    }
    setMensajes((m) => m.map((x, i) => (i === m.length - 1 ? { ...x, respuesta } : x)));
    setOcupado(false);
  }

  return (
    <div className="grid gap-3">
      {mensajes.length === 0 && (
        <div className="flex flex-wrap gap-2">
          {ejemplos.map((e) => (
            <button key={e} type="button" onClick={() => enviar(e)} className="min-h-11 rounded-full border bg-card px-4 text-sm active:bg-muted">
              {e}
            </button>
          ))}
        </div>
      )}
      {mensajes.map((m, i) => (
        <div key={i} className="grid gap-2">
          <p className="max-w-[85%] justify-self-end rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-primary-foreground">{m.pregunta}</p>
          <div className="max-w-[95%] rounded-2xl rounded-bl-sm border bg-card px-4 py-3 text-[15px]">
            {m.respuesta === null ? <Loader2 className="size-5 animate-spin text-muted-foreground" /> : <Markdown texto={m.respuesta} />}
          </div>
        </div>
      ))}
      <div ref={final} />
      <form
        className="sticky bottom-0 -mx-4 flex items-center gap-2 border-t bg-background/95 px-4 py-3 backdrop-blur"
        onSubmit={(e) => {
          e.preventDefault();
          enviar(texto);
        }}
      >
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          maxLength={300}
          placeholder={placeholder}
          aria-label="Tu pregunta"
          className="h-12 w-full min-w-0 rounded-full border bg-card px-5 text-base focus-visible:outline-2 focus-visible:outline-primary"
        />
        <button
          type="submit"
          disabled={ocupado || !texto.trim()}
          aria-label="Preguntar"
          className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-50"
        >
          {ocupado ? <Loader2 className="size-5 animate-spin" /> : <ArrowUp className="size-5" />}
        </button>
      </form>
    </div>
  );
}
