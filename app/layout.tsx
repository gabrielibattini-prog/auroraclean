import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import { BotaoWhatsApp } from "@/components/layout/BotaoWhatsApp";
import { Pronto } from "@/components/layout/Pronto";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Aurora Clean", template: "%s · Aurora Clean" },
  description:
    "Rede de prestadores qualificados em higienização e impermeabilização de estofados, no padrão Aurora Clean.",
  icons: { icon: "/logo.png" },
};

export const viewport: Viewport = {
  themeColor: "#616850",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={poppins.variable}>
      <body className="min-h-dvh antialiased">
        <Pronto>
          {children}
          <BotaoWhatsApp />
        </Pronto>
      </body>
    </html>
  );
}
