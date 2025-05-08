import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// Remove direct imports of SessionProvider and ThemeProvider if they were here
import { Providers } from "@/components/providers"; // Import the new Providers component

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = { // Ensure Metadata type is used if imported
  title: "R.A.I.O Dashboard",
  description: "Dashboard de Análise e Interações",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers> {/* Use the Providers component to wrap children */}
          {children}
        </Providers>
      </body>
    </html>
  );
}
