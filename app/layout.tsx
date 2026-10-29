import type { Metadata, Viewport } from "next";
import { RegistrarSW } from "@/components/registrar-sw";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tao Fit",
  description: "Tu entrenador: rutina a tu medida, avatar con tus medidas y progreso",
  appleWebApp: { capable: true, title: "Tao Fit", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#060606" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-MX">
      <body className="min-h-screen font-sans antialiased">
        {children}
        <RegistrarSW />
      </body>
    </html>
  );
}
