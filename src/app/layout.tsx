import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/providers/QueryProvider";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "NutriPlan - Votre Plan Alimentaire Personnalisé",
  description:
    "Créez votre plan alimentaire personnalisé basé sur vos besoins caloriques et vos objectifs de santé.",
  keywords: ["nutrition", "santé", "alimentation", "régime", "calories"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${plusJakarta.variable} font-sans antialiased`}>
        <QueryProvider>
          <main className="min-h-screen">{children}</main>
          <Toaster position="top-center" richColors />
        </QueryProvider>
      </body>
    </html>
  );
}
