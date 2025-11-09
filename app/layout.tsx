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
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
              <Link href="/" className="text-lg font-semibold text-slate-900">
                Inmobiliaria Humana
              </Link>
              <nav className="flex items-center gap-3 text-sm font-medium text-slate-600">
                <Link href="/" className="rounded-lg px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900">
                  Inmuebles
                </Link>
                <Link
                  href="/properties/new"
                  className="rounded-lg px-3 py-2 text-slate-900 transition hover:bg-slate-100"
                >
                  Nuevo inmueble
                </Link>
              </nav>
            </div>
          </header>
          <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">{children}</main>
          <footer className="border-t border-slate-200/80 bg-white/80 py-6 text-center text-sm text-slate-500">
            © {new Date().getFullYear()} Humana Soluciones — Gestión de Inmuebles
          </footer>
        </div>
      </body>
    </html>
  );
}
