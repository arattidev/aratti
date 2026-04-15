import type { ReactNode } from "react";

export const metadata = {
  title: "Aratti Backend",
  description: "Backend API for Aratti marketplace",
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
