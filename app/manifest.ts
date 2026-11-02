import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tao Fit",
    short_name: "Tao Fit",
    description: "Tu entrenador: rutina a tu medida, avatar y progreso",
    start_url: "/",
    display: "standalone",
    background_color: "#060606",
    theme_color: "#060606",
    lang: "es-MX",
    icons: [
      { src: "/icono-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icono-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icono-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    // Atajos: al dejar presionado el ícono de la app (Android) aparecen estos accesos directos
    shortcuts: [
      { name: "Entrenar hoy", short_name: "Entrenar", url: "/entrenar" },
      { name: "Comida de hoy", short_name: "Comida", url: "/comida" },
      { name: "Registro semanal", short_name: "Registro", url: "/registro" },
    ],
  };
}
