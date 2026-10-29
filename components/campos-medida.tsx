import { Input, Label } from "@/components/ui/campos";
import type { Medida } from "@/lib/tipos";

const CAMPOS = [
  ["cintura_cm", "Cintura", "A la altura del ombligo, sin meter la panza"],
  ["cuello_cm", "Cuello", "Debajo de la manzana de Adán"],
  ["pecho_cm", "Pecho", "Por la parte más ancha, con los brazos abajo"],
  ["cadera_cm", "Cadera", "Por la parte más ancha de los glúteos"],
  ["brazo_cm", "Brazo", "Bíceps relajado, en la parte más gruesa"],
  ["muslo_cm", "Muslo", "Justo debajo del glúteo"],
] as const;

// Peso obligatorio; las demás medidas son opcionales pero hacen el avatar y el % de grasa más precisos
export function CamposMedida({ anterior, conFecha = true }: { anterior?: Medida | null; conFecha?: boolean }) {
  return (
    <div className="grid gap-3">
      <div className="grid grid-cols-2 gap-3">
        <Label>
          Peso (kg)
          <Input name="peso_kg" inputMode="decimal" required placeholder={anterior ? String(anterior.peso_kg) : "75"} />
        </Label>
        {conFecha && (
          <Label>
            Fecha
            <Input name="fecha" type="date" defaultValue={new Intl.DateTimeFormat("en-CA", { timeZone: "America/Mexico_City" }).format(new Date())} />
          </Label>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Medidas en centímetros con una cinta métrica, en la mañana y sin apretar. Cintura y cuello dan tu % de grasa
        {" "}(en mujeres también cadera).
      </p>
      <div className="grid grid-cols-2 gap-3">
        {CAMPOS.map(([campo, nombre, ayuda]) => (
          <Label key={campo}>
            {nombre}
            <Input name={campo} inputMode="decimal" placeholder={anterior?.[campo] != null ? String(anterior[campo]) : "cm"} />
            <span className="text-xs font-normal text-muted-foreground">{ayuda}</span>
          </Label>
        ))}
      </div>
    </div>
  );
}
