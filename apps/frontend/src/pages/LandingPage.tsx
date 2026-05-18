import { Link } from 'react-router-dom';
import { Cloud, Lock, Zap, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { Navigate } from 'react-router-dom';

const features: { icon: React.ReactNode; title: string; description: string; href?: string }[] = [
  {
    icon: <Cloud className="h-6 w-6 text-[var(--color-primary)]" />,
    title: 'Blob Storage',
    description: 'Upload and store up to 5 files (TXT, JSON, PDF) with up to 3 MB each.',
  },
  {
    icon: <Lock className="h-6 w-6 text-[var(--color-primary)]" />,
    title: 'Secure by Default',
    description: 'JWT authentication, bcrypt passwords, and security headers on every response.',
  },
  {
    icon: <Zap className="h-6 w-6 text-[var(--color-primary)]" />,
    title: 'Rate Limited',
    description: 'Fair-use rate limiting ensures the service stays fast for everyone.',
  },
  {
    icon: <FileText className="h-6 w-6 text-[var(--color-primary)]" />,
    title: 'Simple API',
    description: 'A clean REST API with full OpenAPI documentation at /docs.',
    href: '/developer',
  },
];

export function LandingPage() {
  const { token } = useAuth();
  if (token) return <Navigate to="/dashboard" replace />;

  return (
    <div className="flex flex-col items-center">
      {/* Hero */}
      <section className="flex flex-col items-center gap-6 py-24 px-4 text-center">
        <div className="flex items-center gap-2 text-5xl font-bold tracking-tight text-[var(--color-foreground)]">
          <Cloud className="h-12 w-12 text-[var(--color-primary)]" />
          BaltiHub
        </div>
        <p className="max-w-xl text-lg text-[var(--color-muted-foreground)]">
          A simple, secure blob storage service. Upload your files, access them anywhere, manage them with ease.
        </p>
        <div className="flex gap-3">
          <Button size="lg" asChild>
            <Link to="/register">Get started — it's free</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/login">Log in</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="w-full max-w-5xl grid grid-cols-1 gap-4 px-4 pb-24 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => {
          const card = (
            <Card key={f.title} className={f.href ? 'cursor-pointer transition-shadow hover:shadow-md' : ''}>
              <CardHeader>
                {f.icon}
                <CardTitle className="mt-3 text-base">{f.title}</CardTitle>
                <CardDescription>{f.description}</CardDescription>
              </CardHeader>
            </Card>
          );
          return f.href ? (
            <Link key={f.title} to={f.href}>
              {card}
            </Link>
          ) : card;
        })}
      </section>
    </div>
  );
}
