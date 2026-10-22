import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Maandamano 3D: Nairobi Pulse | Gen Z Protest Simulator",
  description: "Experience the tension and solidarity of Gen Z urban protests in Nairobi CBD. Real-time 3D multiplayer action featuring Parliament, KICC, placards, and political chaos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased overflow-hidden select-none bg-black">
        {children}
      </body>
    </html>
  );
}
