import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Geist_Mono } from "next/font/google";
import "./globals.css";

/**
 * Typographie principale : Space Grotesk — style brutaliste et moderne.
 */
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

/**
 * Typographie monospace pour les éléments techniques.
 */
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Métadonnées SEO du site.
 */
export const metadata: Metadata = {
  title: "La France à l'Imposteur 🇫🇷",
  description:
    "Le jeu le plus crousty de France ! Trouve l'imposteur parmi tes potes. Inspiré du shitposting français et de la culture mème.",
  keywords: [
    "jeu",
    "imposteur",
    "undercover",
    "france",
    "mème",
    "crousty",
    "multijoueur",
    "jeu de société",
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "La France à l'Imposteur",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${spaceGrotesk.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-dark text-foreground">
        {children}
      </body>
    </html>
  );
}
