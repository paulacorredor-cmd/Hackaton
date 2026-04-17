import type { Metadata } from 'next';
import ClientProviders from '@/app/components/ClientProviders';
import './globals.css';

export const metadata: Metadata = {
  title: 'Seguros Bolívar — Developer Portal',
  description:
    'Portal de desarrolladores para APIs de Seguros Bolívar. Explora, prueba e integra APIs de seguros bajo el estándar Open Insurance colombiano.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="font-inter min-h-screen bg-bolivar-white">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
