import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { EventProvider } from "@/components/EventProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "POLI EQ · 30 anos",
  description: "Churrasco de 30 anos de formados da turma de Engenharia Química da POLI.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <EventProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </EventProvider>
      </body>
    </html>
  );
}
