import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Gestión de Inmuebles',
  description:
    'Aplicación para administrar el inventario de propiedades de una inmobiliaria.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-100 text-slate-800">
        <header className="border-b border-slate-200 bg-white shadow-sm">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-lg font-semibold text-blue-700">
              Inmobiliaria Humana
            </Link>
            <nav className="flex items-center gap-4 text-sm font-medium">
              <Link href="/" className="transition hover:text-blue-600">
                Inmuebles
              </Link>
              <Link href="/properties/new" className="transition hover:text-blue-600">
                Nuevo inmueble
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        <footer className="mt-12 border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} Humana Soluciones - Gestión de Inmuebles
        </footer>
      </body>
    </html>
  );
}
