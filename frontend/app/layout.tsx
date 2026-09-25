import type { Metadata } from 'next';
import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';
import { ActorProvider } from '../context/ActorContext';
import { Navbar } from '../components/Navbar';

export const metadata: Metadata = {
  title: 'CineArte7 - Gestión de Películas y Actores',
  description: 'Sistema CRUD completo para películas, actores y premios con Next.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        {/* Bootstrap 5.3.3 CDN como respaldo para asegurar renderizado impecable */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
          integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
          crossOrigin="anonymous"
        />
        {/* Bootstrap Icons */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
        />
        {/* Tipografía Google Fonts Inter */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="d-flex flex-column min-vh-100" style={{ fontFamily: "'Inter', sans-serif" }}>
        <ActorProvider>
          <Navbar />
          <main className="flex-grow-1">{children}</main>
          <footer className="py-4 mt-auto text-center border-top bg-white">
            <div className="container">
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 small text-muted">
                <div>
                  <span className="fw-bold text-dark">🎬 CineArte7</span> • Parcial 1 Web (ISIS3710)
                </div>
                <div>
                  CRUD Actores &amp; Películas con Next.js &bull; {new Date().getFullYear()}
                </div>
              </div>
            </div>
          </footer>
        </ActorProvider>
      </body>
    </html>
  );
}
