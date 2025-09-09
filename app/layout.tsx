import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true
});

export const metadata: Metadata = {
  title: 'AI-Karangué 2025 | Lancement de la Révolution de Sécurité Routière Sénégalaise',
  description: 'Découvrez AI-Karangué, la première solution sénégalaise qui révolutionne la sécurité routière. Lancement officiel le 20 septembre 2025 au CICAD, Dakar. Réservez votre place gratuitement.',
  keywords: 'AI-Karangué, sécurité routière Sénégal, innovation technologique africaine, transport intelligent, Art\'Beau-Rescence, CICAD Dakar, lancement technologique 2025',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  )
}