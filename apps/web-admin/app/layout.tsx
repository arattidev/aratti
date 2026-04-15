import type { ReactNode } from "react";

import "./globals.css";

export const metadata = {
  title: "Aratti Console",
  description: "Business and admin panel for Aratti",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es-AR">
      <body>{children}</body>
    </html>
  );
}
