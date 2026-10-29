import { ChefHat, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BotonAccion } from "@/components/formulario";
import { Titulo } from "@/components/taos/encabezado";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { nuevoMenu } from "@/lib/acciones";
import { alimentoPorId, porcion } from "@/lib/alimentos";
import { hoyLocal } from "@/lib/entreno";
import { DIAS_MENU, NOMBRE_COMIDA, macros, macrosDia, reemplazos } from "@/lib/menu";
import { indiceDia, menuVigente } from "@/lib/menu-actual";
import { calcularObjetivos } from "@/lib/nutricion";
import { obtenerRepo } from "@/lib/sesion";
import { cn } from "@/lib/utils";

const DIAS_CORTOS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function Barra({ nombre, valor, meta, unidad }: { nombre: string; valor: number; meta: number; unidad: string }) {
  return (
    <div className="grid gap-1 text-xs">
      <div className="flex justify-between">
        <span className="text-muted-foreground">{nombre}</span>
        <span>
          <strong>{Math.round(valor)}</strong>/{meta} {unidad}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, (valor / meta) * 100)}%` }} />
      </div>
    </div>
  );
}

function Falta({ titulo, texto, boton, href }: { titulo: string; texto: string; boton: string; href: string }) {
  return (
    <div className="grid gap-4">
      <Titulo detalle="Menú con tus alimentos, cuadrado a tus calorías.">Tu comida</Titulo>
      <Card>
        <CardTitle>{titulo}</CardTitle>
        <CardDescription className="mt-1">{texto}</CardDescription>
        <Link href={href} className="mt-4 flex min-h-12 items-center justify-center rounded-xl bg-primary font-semibold text-primary-foreground">
          {boton}
        </Link>
      </Card>
    </div>
  );
}

export default async function Comida({ searchParams }: { searchParams: Promise<{ dia?: string }> }) {
  const repo = await obtenerRepo();
  const [perfil, medidas] = await Promise.all([repo.perfil(), repo.medidas()]);
  if (!perfil) redirect("/bienvenida");
  const ultima = medidas.at(-1);
  // Sin peso no hay calorías: se explica en vez de mandar a otra pantalla sin aviso
  if (!ultima)
    return (
      <Falta titulo="Primero registra tu peso" texto="Tu menú se calcula con tu peso de hoy. Regístralo y vuelve aquí." boton="Registrar mi peso" href="/cuerpo" />
    );
  const metas = calcularObjetivos(perfil, ultima);
  const menu = await menuVigente(repo, perfil, ultima);
  if (!menu)
    return <Falta titulo="No pude armar tu menú" texto="Revisa en tu perfil qué alimentos excluiste: si quitas demasiados, no alcanzan para cuadrar tus comidas." boton="Revisar mi perfil" href="/perfil" />;
  const pedido = Number((await searchParams).dia);
  const d = Number.isInteger(pedido) && pedido >= 0 && pedido < 7 ? pedido : indiceDia(hoyLocal());
  const dia = menu.dias[d];
  const total = macrosDia(dia);
  const lote = menu.lotes?.find((l) => l.dias.includes(d));

  return (
    <div className="grid gap-4">
      <Titulo detalle="Menú con tus alimentos, cuadrado a tus calorías.">Tu comida</Titulo>

      <Card>
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            [metas.kcal.toLocaleString("es-MX"), "kcal"],
            [`${metas.proteina} g`, "proteína"],
            [`${metas.carbos} g`, "carbos"],
            [`${metas.grasa} g`, "grasa"],
          ].map(([v, n]) => (
            <div key={n}>
              <p className="text-lg font-semibold">{v}</p>
              <p className="text-xs text-muted-foreground">{n}</p>
            </div>
          ))}
        </div>
        <details className="mt-3 text-sm">
          <summary className="min-h-10 cursor-pointer text-primary">¿De dónde salen estos números?</summary>
          <ul className="mt-2 grid gap-3">
            {metas.explicaciones.map((e) => (
              <li key={e.titulo}>
                <p>
                  <strong>{e.titulo}:</strong> {e.valor}
                </p>
                <p className="font-mono text-xs text-muted-foreground">{e.formula}</p>
                <p className="text-xs text-muted-foreground">{e.porque}</p>
              </li>
            ))}
          </ul>
        </details>
      </Card>

      <nav className="grid grid-cols-7 gap-1" aria-label="Días">
        {DIAS_CORTOS.map((n, i) => (
          <Link key={n} href={`/comida?dia=${i}`} className={cn("flex min-h-11 items-center justify-center rounded-xl border text-sm", i === d && "border-primary bg-primary font-semibold text-primary-foreground")}>
            {n}
          </Link>
        ))}
      </nav>

      <Card>
        <CardTitle>{DIAS_MENU[d]}</CardTitle>
        <div className="mt-3 grid gap-2">
          <Barra nombre="Calorías" valor={total.kcal} meta={metas.kcal} unidad="kcal" />
          <Barra nombre="Proteína" valor={total.p} meta={metas.proteina} unidad="g" />
        </div>
      </Card>

      {lote && (
        <p className="flex gap-3 rounded-xl border px-4 py-3 text-sm">
          <ChefHat className="size-5 shrink-0 text-primary" />
          <span>
            Cocina por lote el <strong>{DIAS_MENU[lote.cocinar]}</strong>: la comida y la cena de {lote.dias.map((x) => DIAS_MENU[x]).join(", ")} son las mismas. Guárdalas en tuppers en
            el refri (hasta 4 días).
          </span>
        </p>
      )}

      {dia.comidas.map((c, n) => {
        const m = macros(c.items);
        return (
          <Card key={n}>
            <div className="mb-2 flex items-baseline justify-between">
              <CardTitle className="text-base">{NOMBRE_COMIDA[c.tipo]}</CardTitle>
              <span className="text-xs text-muted-foreground">
                {Math.round(m.kcal)} kcal · {Math.round(m.p)} g prot
              </span>
            </div>
            <ul className="grid gap-1">
              {c.items.map((it) => {
                const al = alimentoPorId(it.alimento)!;
                const alt = reemplazos(it, c.tipo, perfil.alimentos_excluidos);
                return (
                  <li key={it.alimento}>
                    <details className="group">
                      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 rounded-lg px-1 active:bg-muted">
                        <span>
                          {al.nombre} <span className="text-muted-foreground">· {porcion(al, it.gramos)}</span>
                        </span>
                        <span className="shrink-0 text-xs text-primary">{alt.length ? "Cambiar" : ""}</span>
                      </summary>
                      {alt.length > 0 && (
                        <p className="px-1 pb-2 text-xs text-muted-foreground">
                          O cámbialo por: {alt.map((r) => `${alimentoPorId(r.alimento)!.nombre} (${porcion(alimentoPorId(r.alimento)!, r.gramos)})`).join(" · ")}
                        </p>
                      )}
                    </details>
                  </li>
                );
              })}
            </ul>
          </Card>
        );
      })}

      <div className="grid grid-cols-2 gap-2">
        <Link href="/comida/lista" className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-primary-foreground">
          <ShoppingCart className="size-5" /> Lista del súper
        </Link>
        <BotonAccion accion={nuevoMenu} variant="outline" size="default" confirmar="¿Armar otro menú con otros alimentos?">
          Otro menú
        </BotonAccion>
      </div>
      <CardDescription className="text-center">
        ¿No te gusta algo o cocinas distinto? Cámbialo en <Link href="/perfil#comida" className="text-primary underline">Mi perfil › Comida</Link>. Los valores son aproximados; si
        tienes una condición médica, consulta a un profesional de la nutrición.
      </CardDescription>
    </div>
  );
}
