import { Casilla, Tarjetas } from "@/components/opciones";
import { Input, Label, Select } from "@/components/ui/campos";
import { ALIMENTOS, EXCLUSIONES } from "@/lib/alimentos";
import { DIAS_SEMANA, NOMBRES_ACTIVIDAD, NOMBRES_GENERO, NOMBRES_LUGAR, NOMBRES_NIVEL, NOMBRES_OBJETIVO, type Perfil } from "@/lib/tipos";

const lista = (o: Record<string, string>) => Object.entries(o).map(([valor, titulo]) => ({ valor, titulo }));

export function CamposTu({ p }: { p: Perfil }) {
  return (
    <div className="grid gap-4">
      <Label>
        Tu nombre
        <Input name="nombre" defaultValue={p.nombre} required autoComplete="given-name" />
      </Label>
      <div className="grid gap-2 text-sm font-medium">
        Género
        <Tarjetas name="genero" valor={p.genero} opciones={lista(NOMBRES_GENERO)} />
      </div>
      <div className="grid gap-2 text-sm font-medium">
        Fórmula para tus cálculos
        <span className="text-xs font-normal text-muted-foreground">Solo cuenta si elegiste No binario o Prefiero no decirlo: elige la que se parezca más a tu cuerpo.</span>
        <Tarjetas name="cuerpo" valor={p.cuerpo} opciones={[{ valor: "masculino", titulo: "Masculina" }, { valor: "femenino", titulo: "Femenina" }]} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Label>
          Nacimiento
          <Input name="nacimiento" type="date" defaultValue={p.nacimiento} required />
        </Label>
        <Label>
          Altura (cm)
          <Input name="altura_cm" inputMode="decimal" defaultValue={p.altura_cm} required />
        </Label>
      </div>
      <div className="grid gap-2 text-sm font-medium">
        Fuera del gym, tu día es…
        <Tarjetas name="actividad" valor={p.actividad} columnas={1} opciones={lista(NOMBRES_ACTIVIDAD)} />
      </div>
    </div>
  );
}

export function CamposMeta({ p }: { p: Perfil }) {
  return (
    <div className="grid gap-4">
      <Tarjetas name="objetivo" valor={p.objetivo} opciones={lista(NOMBRES_OBJETIVO)} />
      <div className="grid grid-cols-2 gap-3">
        <Label>
          Peso meta (kg)
          <Input name="meta_peso_kg" inputMode="decimal" defaultValue={p.meta_peso_kg ?? ""} placeholder="Opcional" />
        </Label>
        <Label>
          Para cuándo
          <Input name="fecha_meta" type="date" defaultValue={p.fecha_meta ?? ""} />
        </Label>
      </div>
    </div>
  );
}

export function CamposEntreno({ p }: { p: Perfil }) {
  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Label>
          Nivel
          <Select name="nivel" defaultValue={p.nivel}>
            {lista(NOMBRES_NIVEL).map((o) => (
              <option key={o.valor} value={o.valor}>
                {o.titulo}
              </option>
            ))}
          </Select>
        </Label>
        <Label>
          Dónde entrenas
          <Select name="lugar" defaultValue={p.lugar}>
            {lista(NOMBRES_LUGAR).map((o) => (
              <option key={o.valor} value={o.valor}>
                {o.titulo}
              </option>
            ))}
          </Select>
        </Label>
      </div>
      <div className="grid gap-2 text-sm font-medium">
        Tus días de entreno
        <span className="text-xs font-normal text-muted-foreground">Si eliges días, te recuerdo esos días. Si varía, déjalos vacíos.</span>
        <Tarjetas name="dias_entreno" multiple columnas={4} valor={p.dias_entreno.map(String)} opciones={[1, 2, 3, 4, 5, 6, 0].map((d) => ({ valor: String(d), titulo: DIAS_SEMANA[d] }))} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Label>
          Días por semana
          <Select name="dias_semana" defaultValue={p.dias_semana}>
            {[2, 3, 4, 5, 6].map((d) => (
              <option key={d} value={d}>
                {d} días
              </option>
            ))}
          </Select>
        </Label>
        <Label>
          Minutos
          <Select name="minutos_sesion" defaultValue={p.minutos_sesion}>
            {[30, 45, 60, 75, 90, 120].map((m) => (
              <option key={m} value={m}>
                {m} min
              </option>
            ))}
          </Select>
        </Label>
        <Label className="col-span-2">
          Hora de entreno (recordatorios)
          <Input name="hora_entreno" type="time" defaultValue={p.hora_entreno ?? ""} />
        </Label>
      </div>
      <Casilla name="barra_dominadas" defaultChecked={p.barra_dominadas}>
        Tengo barra para dominadas
      </Casilla>
      <div className="grid gap-2 text-sm font-medium">
        ¿Te molesta alguna zona?
        <Tarjetas
          name="lesiones"
          multiple
          valor={p.lesiones}
          opciones={[
            { valor: "rodilla", titulo: "Rodilla" },
            { valor: "hombro", titulo: "Hombro" },
            { valor: "espalda_baja", titulo: "Espalda baja" },
            { valor: "muneca", titulo: "Muñeca" },
          ]}
        />
      </div>
      <div className="grid gap-2 text-sm font-medium">
        Priorizar (máximo 2)
        <Tarjetas
          name="enfasis"
          multiple
          columnas={3}
          valor={p.enfasis}
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
    </div>
  );
}

export function CamposComida({ p }: { p: Perfil }) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-2 text-sm font-medium">
        No como…
        <Tarjetas name="alimentos_excluidos" multiple valor={p.alimentos_excluidos} opciones={EXCLUSIONES.map((e) => ({ valor: e.id, titulo: e.nombre }))} />
      </div>
      <div className="grid gap-2 text-sm font-medium">
        Lo que sí como seguido
        <input type="hidden" name="_campos" value="alimentos_habituales" />
        <div className="flex flex-wrap gap-2">
          {ALIMENTOS.map((a) => (
            <label key={a.id} className="flex min-h-11 cursor-pointer items-center rounded-full border px-3 text-sm font-normal select-none has-checked:border-primary has-checked:bg-primary/10 has-checked:text-primary">
              <input type="checkbox" name="alimentos_habituales" value={a.id} defaultChecked={p.alimentos_habituales.includes(a.id)} className="sr-only" />
              {a.nombre}
            </label>
          ))}
        </div>
      </div>
      <div className="grid gap-2 text-sm font-medium">
        Veces que cocinas por semana
        <Tarjetas name="veces_cocina" valor={String(p.veces_cocina)} columnas={4} opciones={["1", "2", "3", "4", "5", "6", "7"].map((v) => ({ valor: v, titulo: v === "7" ? "Diario" : v }))} />
      </div>
      <Label>
        Día de tu registro semanal
        <Select name="dia_registro" defaultValue={p.dia_registro}>
          {[0, 1, 2, 3, 4, 5, 6].map((d) => (
            <option key={d} value={d}>
              {["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"][d]}
            </option>
          ))}
        </Select>
      </Label>
    </div>
  );
}
