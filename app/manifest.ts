import type { MetadataRoute } from "next";
import { supabaseConfigurado } from "@/lib/supabase/config";

export default function manifest(): MetadataRoute.Manifest {
  // Apps de demostración (sin base de datos): ícono a lápiz y "Demo" en el nombre, para no confundirlas con la app real
  const demo = !supabaseConfigurado();
  const ico = demo ? "/demo/icono" : "/icono";
  return {
    name: demo ? "Tao Fit (demo)" : "Tao Fit",
    short_name: demo ? "Tao Fit demo" : "Tao Fit",
    description: "Tu entrenador: rutina a tu medida, avatar y progreso",
    start_url: "/",
    display: "standalone",
    background_color: "#060606",
    theme_color: "#060606",
    lang: "es-MX",
    icons: [
      { src: `${ico}-192.png`, sizes: "192x192", type: "image/png" },
      { src: `${ico}-512.png`, sizes: "512x512", type: "image/png" },
      { src: `${ico}-maskable-512.png`, sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    // Atajos: al dejar presionado el ícono de la app (Android) aparecen estos accesos directos
    shortcuts: [
      { name: "Entrenar hoy", short_name: "Entrenar", url: "/entrenar" },
      { name: "Entrenar en casa", short_name: "En casa", url: "/entrenar?casa=1" },
      { name: "Comida de hoy", short_name: "Comida", url: "/comida" },
      { name: "Registro semanal", short_name: "Registro", url: "/registro" },
    ],
  };
}
