import { Link, useNavigate } from 'react-router-dom';
import { Cloud, LayoutDashboard, User, Shield, LogOut, Menu, X, Code2 } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/');
  }

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { to: '/profile', label: 'Profile', icon: <User className="h-4 w-4" /> },
    { to: '/developer', label: 'API Docs', icon: <Code2 className="h-4 w-4" /> },
    ...(user?.is_superuser
      ? [{ to: '/admin', label: 'Admin', icon: <Shield className="h-4 w-4" /> }]
      : []),
  ];

  return (
    <nav className="border-b border-[var(--color-border)] bg-[var(--color-card)]">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2 font-semibold text-[var(--color-primary)]">
          <Cloud className="h-5 w-5" />
          BaltiHub
        </Link>

        {/* Desktop nav */}
        {user && (
          <div className="hidden items-center gap-1 sm:flex">
            {links.map((l) => (
              <Button key={l.to} variant="ghost" size="sm" asChild>
                <Link to={l.to} className="flex items-center gap-1.5">
                  {l.icon}
                  {l.label}
                </Link>
              </Button>
            ))}
            <Button variant="ghost" size="sm" onClick={handleLogout} className="flex items-center gap-1.5">
              <LogOut className="h-4 w-4" />
              Log out
            </Button>
          </div>
        )}

        {!user && (
          <div className="hidden items-center gap-2 sm:flex">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/developer" className="flex items-center gap-1.5">
                <Code2 className="h-4 w-4" />
                API Docs
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Log in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/register">Sign up</Link>
            </Button>
          </div>
        )}

        {/* Mobile hamburger */}
        <button
          className="sm:hidden"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          'overflow-hidden transition-all sm:hidden',
          menuOpen ? 'max-h-96' : 'max-h-0',
        )}
      >
        <div className="flex flex-col gap-1 border-t border-[var(--color-border)] px-4 py-3">
          {user
            ? [
                ...links.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    className="flex items-center gap-2 rounded-[var(--radius)] px-3 py-2 text-sm hover:bg-[var(--color-accent)]"
                    onClick={() => setMenuOpen(false)}
                  >
                    {l.icon}
                    {l.label}
                  </Link>
                )),
                <button
                  key="logout"
                  onClick={() => { setMenuOpen(false); handleLogout(); }}
                  className="flex items-center gap-2 rounded-[var(--radius)] px-3 py-2 text-sm hover:bg-[var(--color-accent)]"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>,
              ]
            : [
                <Link key="login" to="/login" className="rounded-[var(--radius)] px-3 py-2 text-sm hover:bg-[var(--color-accent)]" onClick={() => setMenuOpen(false)}>
                  Log in
                </Link>,
                <Link key="reg" to="/register" className="rounded-[var(--radius)] px-3 py-2 text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-accent)]" onClick={() => setMenuOpen(false)}>
                  Sign up
                </Link>,
              ]}
        </div>
      </div>
    </nav>
  );
}
