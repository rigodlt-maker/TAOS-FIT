import { cn } from "@/lib/utils";

// Botones grandes para elegir (funcionan sin JavaScript: son radios y casillas con estilo)
export function Tarjetas({
  name,
  opciones,
  valor,
  multiple = false,
  columnas = 2,
  requerido = false,
}: {
  name: string;
  opciones: { valor: string; titulo: string; detalle?: string; icono?: string }[];
  valor?: string | string[] | null;
  multiple?: boolean;
  columnas?: 1 | 2 | 3 | 4;
  requerido?: boolean;
}) {
  const elegido = (v: string) => (Array.isArray(valor) ? valor.includes(v) : valor === v);
  return (
    <div className={cn("grid gap-2", { 1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4" }[columnas])}>
      {multiple && <input type="hidden" name="_campos" value={name} />}
      {opciones.map((o) => (
        <label
          key={o.valor}
          className="flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border bg-background px-3 py-2 text-sm transition-colors select-none has-checked:border-primary has-checked:bg-primary/10 has-checked:text-primary has-focus-visible:outline-2 has-focus-visible:outline-primary"
        >
          <input type={multiple ? "checkbox" : "radio"} name={name} value={o.valor} defaultChecked={elegido(o.valor)} required={requerido && !multiple} className="sr-only" />
          {o.icono && <span className="text-xl leading-none">{o.icono}</span>}
          <span className="min-w-0">
            <span className="block font-medium">{o.titulo}</span>
            {o.detalle && <span className="block text-xs text-muted-foreground">{o.detalle}</span>}
          </span>
        </label>
      ))}
    </div>
  );
}

// Casilla única (sí/no) con aviso de que vino en el formulario
export function Casilla({ name, defaultChecked, children }: { name: string; defaultChecked?: boolean; children: React.ReactNode }) {
  return (
    <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border bg-background px-3 text-sm has-checked:border-primary has-checked:text-primary">
      <input type="hidden" name="_campos" value={name} />
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="size-5 accent-[#d4af37]" />
      {children}
    </label>
  );
}
