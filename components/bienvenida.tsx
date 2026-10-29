"use client";

import { ChevronLeft } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { empezar } from "@/lib/acciones";
import { ALIMENTOS, EXCLUSIONES } from "@/lib/alimentos";
import { DIAS_SEMANA, NOMBRES_ACTIVIDAD, NOMBRES_GENERO, type Resultado } from "@/lib/tipos";
import { cn } from "@/lib/utils";
import { Tarjetas } from "./opciones";
import { Button } from "./ui/button";
import { Input, Label } from "./ui/campos";

const PASOS = ["Tú", "Tu cuerpo", "Tu meta", "Tu entreno", "Cuidados", "Tu comida"];
const GRUPOS_COMIDA: [string, string][] = [
  ["proteina", "Proteínas"],
  ["carbo", "Tortillas, cereales y más"],
  ["fruta", "Frutas"],
  ["verdura", "Verduras"],
  ["grasa", "Grasas buenas"],
];

// Revisa los campos del paso antes de avanzar (los pasos ocultos no pueden usar "required" del navegador)
function revisarPaso(paso: number, f: FormData): string | null {
  const t = (c: string) => String(f.get(c) ?? "").trim();
  if (paso === 0) {
    if (!t("nombre")) return "Escribe cómo te llamas.";
    if ((t("genero") === "no_binario" || t("genero") === "prefiero_no_decir") && !t("cuerpo")) return "Elige qué fórmula usar para tus cálculos.";
  }
  if (paso === 1) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(t("nacimiento"))) return "Escribe tu fecha de nacimiento.";
    const altura = Number(t("altura_cm").replace(",", "."));
    if (!altura || altura < 100 || altura > 250) return "Escribe tu altura en centímetros, por ejemplo 172.";
    const peso = Number(t("peso_kg").replace(",", "."));
    if (!peso || peso < 25 || peso > 350) return "Escribe tu peso en kilos, por ejemplo 78.5.";
  }
  if (paso === 3 && f.getAll("dias_entreno").length === 1) return "Elige al menos 2 días (o ninguno si varía).";
  return null;
}

// Cada paso se queda montado (oculto) para que el formulario mande todo al final
function Paso({ n, actual, titulo, detalle, children }: { n: number; actual: number; titulo: string; detalle?: string; children: React.ReactNode }) {
  return (
    <section className={cn("grid gap-4", actual !== n && "hidden")} aria-hidden={actual !== n}>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{titulo}</h1>
        {detalle && <p className="mt-1 text-sm text-muted-foreground">{detalle}</p>}
      </div>
      {children}
    </section>
  );
}

export function Bienvenida() {
  const [paso, setPaso] = useState(0);
  const [genero, setGenero] = useState("");
  const [aviso, setAviso] = useState<string | null>(null);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [pendiente, iniciar] = useTransition();
  const ref = useRef<HTMLFormElement>(null);
  const ultimo = paso === PASOS.length - 1;

  const siguiente = () => {
    const error = revisarPaso(paso, new FormData(ref.current!));
    setAviso(error);
    if (!error) {
      setPaso(paso + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <form
      ref={ref}
      className="grid gap-6 pb-6"
      onChange={(e) => {
        const t = e.target as unknown as HTMLInputElement;
        if (t.name === "genero") setGenero(t.value);
      }}
      action={(f) => iniciar(async () => setResultado(await empezar(f)))}
    >
      <div className="grid gap-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Paso {paso + 1} de {PASOS.length}: {PASOS[paso]}
          </span>
          {paso > 0 && (
            <button type="button" onClick={() => setPaso(paso - 1)} className="flex min-h-10 items-center gap-1 px-2 text-primary">
              <ChevronLeft className="size-4" /> Atrás
            </button>
          )}
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${((paso + 1) / PASOS.length) * 100}%` }} />
        </div>
      </div>

      <Paso n={0} actual={paso} titulo="¡Hola! Soy tu entrenador 💪" detalle="En 2 minutos armo tu rutina, tu menú y tu personaje. Todo se puede cambiar después.">
        <Label>
          ¿Cómo te llamas?
          <Input name="nombre" autoComplete="given-name" placeholder="Tu nombre" />
        </Label>
        <div className="grid gap-2 text-sm font-medium">
          Género
          <Tarjetas name="genero" valor="hombre" opciones={Object.entries(NOMBRES_GENERO).map(([valor, titulo]) => ({ valor, titulo }))} />
        </div>
        {(genero === "no_binario" || genero === "prefiero_no_decir") && (
          <div className="grid gap-2 rounded-2xl border p-3 text-sm">
            <span className="font-medium">Para calcular calorías y % de grasa, ¿qué fórmula usamos?</span>
            <span className="text-xs text-muted-foreground">Las fórmulas científicas solo existen para cuerpo masculino o femenino. Elige la que se parezca más a tu cuerpo; no cambia cómo te nombramos.</span>
            <Tarjetas name="cuerpo" opciones={[{ valor: "masculino", titulo: "Masculina" }, { valor: "femenino", titulo: "Femenina" }]} />
          </div>
        )}
      </Paso>

      <Paso n={1} actual={paso} titulo="Tu cuerpo hoy" detalle="Con esto calculo tus calorías y dibujo tu personaje.">
        <div className="grid grid-cols-2 gap-3">
          <Label className="col-span-2">
            Fecha de nacimiento
            <Input name="nacimiento" type="date" />
          </Label>
          <Label>
            Altura (cm)
            <Input name="altura_cm" inputMode="decimal" placeholder="172" />
          </Label>
          <Label>
            Peso (kg)
            <Input name="peso_kg" inputMode="decimal" placeholder="75.5" />
          </Label>
        </div>
        <details className="rounded-2xl border p-3 text-sm">
          <summary className="min-h-10 cursor-pointer font-medium text-primary">Agregar medidas con cinta (opcional, más preciso)</summary>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {[
              ["cintura_cm", "Cintura", "Al nivel del ombligo"],
              ["cuello_cm", "Cuello", "Debajo de la manzana"],
              ["cadera_cm", "Cadera", "Lo más ancho"],
              ["pecho_cm", "Pecho", "Lo más ancho"],
              ["brazo_cm", "Brazo", "Bíceps relajado"],
              ["muslo_cm", "Muslo", "Bajo el glúteo"],
            ].map(([c, n, a]) => (
              <Label key={c}>
                {n} (cm)
                <Input name={c} inputMode="decimal" placeholder={a} />
              </Label>
            ))}
          </div>
        </details>
      </Paso>

      <Paso n={2} actual={paso} titulo="¿Qué quieres lograr?">
        <Tarjetas
          name="objetivo"
          valor="hipertrofia"
          columnas={1}
          opciones={[
            { valor: "grasa", titulo: "Bajar grasa", detalle: "Verme más definido sin perder músculo", icono: "🔥" },
            { valor: "hipertrofia", titulo: "Ganar músculo", detalle: "Crecer y verme más grande", icono: "💪" },
            { valor: "fuerza", titulo: "Ganar fuerza", detalle: "Levantar más peso", icono: "🏋️" },
            { valor: "resistencia", titulo: "Resistencia y salud", detalle: "Más energía y condición", icono: "🫀" },
          ]}
        />
        <div className="grid grid-cols-2 gap-3 rounded-2xl border p-3">
          <p className="col-span-2 text-sm font-medium">Tu meta medible (opcional)</p>
          <Label>
            Peso meta (kg)
            <Input name="meta_peso_kg" inputMode="decimal" placeholder="72" />
          </Label>
          <Label>
            Para cuándo
            <Input name="fecha_meta" type="date" />
          </Label>
        </div>
      </Paso>

      <Paso n={3} actual={paso} titulo="Tu entreno">
        <div className="grid gap-2 text-sm font-medium">
          Tu experiencia
          <Tarjetas
            name="nivel"
            valor="principiante"
            columnas={3}
            opciones={[
              { valor: "principiante", titulo: "Empiezo", detalle: "< 6 meses" },
              { valor: "intermedio", titulo: "Intermedio", detalle: "6 meses – 2 años" },
              { valor: "avanzado", titulo: "Avanzado", detalle: "+2 años" },
            ]}
          />
        </div>
        <div className="grid gap-2 text-sm font-medium">
          ¿Dónde entrenas?
          <Tarjetas
            name="lugar"
            valor="gimnasio"
            columnas={3}
            opciones={[
              { valor: "gimnasio", titulo: "Gimnasio", icono: "🏢" },
              { valor: "casa_mancuernas", titulo: "Casa con pesas", icono: "🏠" },
              { valor: "casa_sin_equipo", titulo: "Sin equipo", icono: "🤸" },
            ]}
          />
        </div>
        <div className="grid gap-2 text-sm font-medium">
          ¿Qué días entrenas?
          <span className="text-xs font-normal text-muted-foreground">Toca tus días. Si varía, déjalo vacío y elige cuántos abajo.</span>
          <Tarjetas name="dias_entreno" multiple columnas={4} opciones={[1, 2, 3, 4, 5, 6, 0].map((d) => ({ valor: String(d), titulo: DIAS_SEMANA[d] }))} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Label>
            Días por semana
            <select name="dias_semana" defaultValue="3" className="min-h-12 rounded-xl border bg-background px-3">
              {[2, 3, 4, 5, 6].map((d) => (
                <option key={d} value={d}>
                  {d} días
                </option>
              ))}
            </select>
          </Label>
          <Label>
            Minutos por sesión
            <select name="minutos_sesion" defaultValue="60" className="min-h-12 rounded-xl border bg-background px-3">
              {[30, 45, 60, 75, 90, 120].map((m) => (
                <option key={m} value={m}>
                  {m} min
                </option>
              ))}
            </select>
          </Label>
          <Label className="col-span-2">
            ¿A qué hora entrenas? (para recordarte)
            <Input name="hora_entreno" type="time" defaultValue="07:00" />
          </Label>
        </div>
        <label className="flex min-h-12 items-center gap-3 rounded-xl border px-3 text-sm">
          <input type="hidden" name="_campos" value="barra_dominadas" />
          <input type="checkbox" name="barra_dominadas" className="size-5 accent-[#d4af37]" /> Tengo barra para dominadas
        </label>
        <div className="grid gap-2 text-sm font-medium">
          Fuera del gym, tu día es…
          <Tarjetas name="actividad" valor="ligera" columnas={1} opciones={Object.entries(NOMBRES_ACTIVIDAD).map(([valor, titulo]) => ({ valor, titulo }))} />
        </div>
      </Paso>

      <Paso n={4} actual={paso} titulo="Cuidados" detalle="Para no proponerte ejercicios que te lastimen y darle más a lo que quieres mejorar.">
        <div className="grid gap-2 text-sm font-medium">
          ¿Te molesta alguna zona?
          <Tarjetas
            name="lesiones"
            multiple
            opciones={[
              { valor: "rodilla", titulo: "Rodilla" },
              { valor: "hombro", titulo: "Hombro" },
              { valor: "espalda_baja", titulo: "Espalda baja" },
              { valor: "muneca", titulo: "Muñeca" },
            ]}
          />
        </div>
        <div className="grid gap-2 text-sm font-medium">
          ¿Qué quieres priorizar? (máximo 2)
          <Tarjetas
            name="enfasis"
            multiple
            columnas={3}
            opciones={[
              ["pecho", "Pecho"],
              ["espalda", "Espalda"],
              ["hombros", "Hombros"],
              ["brazos", "Brazos"],
              ["piernas", "Piernas"],
              ["gluteo", "Glúteo"],
              ["abdomen", "Abdomen"],
            ].map(([valor, titulo]) => ({ valor, titulo }))}
          />
        </div>
      </Paso>

      <Paso n={5} actual={paso} titulo="Tu comida" detalle="Armo tu menú con lo que ya comes. Toca lo que sí te gusta.">
        <div className="grid gap-2 text-sm font-medium">
          ¿Algo que no comes?
          <Tarjetas name="alimentos_excluidos" multiple opciones={EXCLUSIONES.map((e) => ({ valor: e.id, titulo: e.nombre }))} />
        </div>
        <input type="hidden" name="_campos" value="alimentos_habituales" />
        {GRUPOS_COMIDA.map(([grupo, nombre]) => (
          <div key={grupo} className="grid gap-2 text-sm font-medium">
            {nombre}
            <div className="flex flex-wrap gap-2">
              {ALIMENTOS.filter((a) => a.grupo === grupo).map((a) => (
                <label key={a.id} className="flex min-h-11 cursor-pointer items-center rounded-full border px-3 text-sm font-normal select-none has-checked:border-primary has-checked:bg-primary/10 has-checked:text-primary">
                  <input type="checkbox" name="alimentos_habituales" value={a.id} className="sr-only" />
                  {a.nombre}
                </label>
              ))}
            </div>
          </div>
        ))}
        <div className="grid gap-2 text-sm font-medium">
          ¿Cuántas veces cocinas a la semana?
          <span className="text-xs font-normal text-muted-foreground">Si son 3 o menos, te organizo el menú para cocinar por lotes.</span>
          <Tarjetas name="veces_cocina" valor="7" columnas={4} opciones={["1", "2", "3", "4", "5", "6", "7"].map((v) => ({ valor: v, titulo: v === "7" ? "Diario" : v }))} />
        </div>
      </Paso>

      {aviso && <p className="rounded-xl border border-destructive px-4 py-3 text-sm text-destructive">{aviso}</p>}
      {resultado && !resultado.ok && <p className="rounded-xl border border-destructive px-4 py-3 text-sm text-destructive">{resultado.mensaje}</p>}
      <div className="sticky bottom-[calc(1rem+env(safe-area-inset-bottom))] z-40">
        {/* Botones distintos (con key) para que el toque en "Siguiente" nunca envíe el formulario al cambiar de paso */}
        {ultimo ? (
          <Button key="armar" type="submit" size="lg" className="w-full" disabled={pendiente}>
            {pendiente ? "Armando tu plan…" : "Armar mi plan ✨"}
          </Button>
        ) : (
          <Button key="siguiente" type="button" size="lg" className="w-full" onClick={siguiente}>
            Siguiente
          </Button>
        )}
      </div>
    </form>
  );
}
