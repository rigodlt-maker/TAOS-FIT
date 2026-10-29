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
        {process.env.NEXT_PUBLIC_TAOS_MODIFICADA === "1" && (
          <div role="alert" style={{ background: "#2a2100", color: "#f0d27a", fontSize: 13, lineHeight: 1.4, padding: "8px 16px", textAlign: "center", borderBottom: "1px solid #d4af37" }}>
            ⚠️ Esta copia de la app fue modificada: puede no funcionar como se diseñó y no tiene soporte de TAOS.
          </div>
        )}
        {children}
        <RegistrarSW />
      </body>
    </html>
  );
}
