import type { Metadata } from 'next';
import './globals.css';
import { ActorProvider } from '../context/ActorContext';
import { Navbar } from '../components/Navbar';

export const metadata: Metadata = {
  title: 'CRUD Actores - Next.js',
  description: 'Solución del preparcial CRUD de Actores con Next.js y React',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="d-flex flex-column min-vh-100">
        <ActorProvider>
          <Navbar />
          <main className="flex-grow-1">{children}</main>
          <footer className="bg-light text-center py-3 border-top mt-auto text-muted small">
            <div className="container">
              CRUD de Actores - Preparcial Next.js &copy; {new Date().getFullYear()}
            </div>
          </footer>
        </ActorProvider>
      </body>
    </html>
  );
}
