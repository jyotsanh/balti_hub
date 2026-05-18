import { Link } from 'react-router-dom';
import { Cloud, ExternalLink, Code2 } from 'lucide-react';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-card)]">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">

          {/* Brand */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 font-semibold text-[var(--color-primary)]">
              <Cloud className="h-5 w-5" />
              BaltiHub
            </div>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Simple, fast file storage for developers.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-[var(--color-foreground)]">Product</p>
            <Link
              to="/"
              className="text-sm text-[var(--color-muted-foreground)] transition-colors hover:text-[var(--color-primary)]"
            >
              Home
            </Link>
            <Link
              to="/dashboard"
              className="text-sm text-[var(--color-muted-foreground)] transition-colors hover:text-[var(--color-primary)]"
            >
              Dashboard
            </Link>
            <Link
              to="/register"
              className="text-sm text-[var(--color-muted-foreground)] transition-colors hover:text-[var(--color-primary)]"
            >
              Get Started
            </Link>
          </div>

          {/* Developer */}
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-[var(--color-foreground)]">Developer</p>
            <Link
              to="/developer"
              className="flex items-center gap-1.5 text-sm text-[var(--color-muted-foreground)] transition-colors hover:text-[var(--color-primary)]"
            >
              <Code2 className="h-3.5 w-3.5" />
              API Docs
            </Link>
            <a
              href="http://localhost:8050/api/v1/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-[var(--color-muted-foreground)] transition-colors hover:text-[var(--color-primary)]"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Swagger UI
            </a>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-8 border-t border-[var(--color-border)] pt-6 text-center text-sm text-[var(--color-muted-foreground)]">
          © {year} BaltiHub. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
