import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "El Pegue Semanal",
  description: "Check-in semanal de pareja, basado en Gottman y Terry Real",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
