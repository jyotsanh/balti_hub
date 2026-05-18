import { ExternalLink, Terminal, Key, Upload, User, Shield, AlertTriangle, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// ── Helpers ───────────────────────────────────────────────────────────────────

function Section({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-12 scroll-mt-20">
      {children}
    </section>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 border-b border-[var(--color-border)] pb-2 text-xl font-semibold">
      {children}
    </h2>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-2 mt-6 font-semibold text-[var(--color-foreground)]">{children}</h3>;
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <pre className="overflow-x-auto rounded-[var(--radius)] bg-[var(--color-foreground)] p-4 text-sm text-[var(--color-background)] leading-relaxed">
      <code>{children}</code>
    </pre>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-sm text-[var(--color-muted-foreground)]">{children}</p>;
}

interface EndpointProps {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  auth?: 'none' | 'user' | 'superuser';
  description: string;
}

const methodColors: Record<string, string> = {
  GET: 'bg-blue-100 text-blue-700',
  POST: 'bg-green-100 text-green-700',
  PATCH: 'bg-yellow-100 text-yellow-700',
  DELETE: 'bg-red-100 text-red-700',
};

function Endpoint({ method, path, auth = 'user', description }: EndpointProps) {
  return (
    <div className="mb-3 flex flex-col gap-1 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3 sm:flex-row sm:items-start sm:gap-4">
      <span className={`w-16 shrink-0 rounded px-2 py-0.5 text-center text-xs font-bold ${methodColors[method]}`}>
        {method}
      </span>
      <code className="flex-1 text-sm font-mono text-[var(--color-foreground)]">{path}</code>
      <div className="flex items-center gap-2">
        {auth === 'none' && <Badge variant="secondary">Public</Badge>}
        {auth === 'user' && <Badge>Auth required</Badge>}
        {auth === 'superuser' && <Badge variant="destructive">Superuser</Badge>}
        <span className="text-xs text-[var(--color-muted-foreground)]">{description}</span>
      </div>
    </div>
  );
}

// ── Sidebar nav ───────────────────────────────────────────────────────────────

const navItems = [
  { id: 'overview', label: 'Overview' },
  { id: 'auth', label: 'Authentication' },
  { id: 'errors', label: 'Errors & Rate Limits' },
  { id: 'login', label: 'Login' },
  { id: 'users', label: 'Users' },
  { id: 'blobs', label: 'Blobs' },
  { id: 'admin', label: 'Admin' },
  { id: 'interactive', label: 'Interactive Docs' },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export function DeveloperPage() {
  return (
    <div className="mx-auto flex max-w-7xl gap-8 px-4 py-10">
      {/* Sidebar */}
      <aside className="hidden w-52 shrink-0 lg:block">
        <div className="sticky top-6 flex flex-col gap-1">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)]">
            Contents
          </p>
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="rounded-[calc(var(--radius)-2px)] px-3 py-1.5 text-sm text-[var(--color-muted-foreground)] hover:bg-[var(--color-accent)] hover:text-[var(--color-foreground)]"
            >
              {item.label}
            </a>
          ))}
          <div className="mt-4 border-t border-[var(--color-border)] pt-4 flex flex-col gap-2">
            <a href="/docs" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                <ExternalLink className="h-3 w-3" />
                Swagger UI
              </Button>
            </a>
            <a href="/redoc" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                <ExternalLink className="h-3 w-3" />
                ReDoc
              </Button>
            </a>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="min-w-0 flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Developer API Reference</h1>
          <p className="mt-2 text-[var(--color-muted-foreground)]">
            Everything you need to integrate with the BaltiHub blob storage API.
          </p>
          {/* Mobile links */}
          <div className="mt-4 flex gap-2 lg:hidden">
            <a href="/docs" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="gap-1.5">
                <ExternalLink className="h-3.5 w-3.5" />
                Swagger UI
              </Button>
            </a>
            <a href="/redoc" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="gap-1.5">
                <ExternalLink className="h-3.5 w-3.5" />
                ReDoc
              </Button>
            </a>
          </div>
        </div>

        {/* ── Overview ───────────────────────────────────────────────────── */}
        <Section id="overview">
          <H2>Overview</H2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Base URL</CardTitle>
              </CardHeader>
              <CardContent>
                <code className="text-xs font-mono text-[var(--color-primary)]">https://your-domain/api/v1</code>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Format</CardTitle>
              </CardHeader>
              <CardContent>
                <code className="text-xs font-mono">application/json</code>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Auth scheme</CardTitle>
              </CardHeader>
              <CardContent>
                <code className="text-xs font-mono">Bearer &lt;JWT&gt;</code>
              </CardContent>
            </Card>
          </div>
          <P>
            BaltiHub is a REST API for storing and retrieving binary blobs (text, JSON, PDF files).
            All endpoints return JSON unless fetching a blob file (binary stream).
            The API version is <code className="font-mono text-xs bg-[var(--color-muted)] px-1 rounded">/api/v1</code>.
          </P>
        </Section>

        {/* ── Authentication ─────────────────────────────────────────────── */}
        <Section id="auth">
          <H2>
            <span className="flex items-center gap-2"><Key className="h-5 w-5 text-[var(--color-primary)]" /> Authentication</span>
          </H2>
          <P>
            BaltiHub uses JWT bearer tokens. Obtain a token by POSTing your credentials to{' '}
            <code className="font-mono text-xs bg-[var(--color-muted)] px-1 rounded">/api/v1/login/access-token</code>.
            Tokens are valid for <strong>8 days</strong>. Include the token in the{' '}
            <code className="font-mono text-xs bg-[var(--color-muted)] px-1 rounded">Authorization</code> header of every
            subsequent request.
          </P>

          <H3>Get a token</H3>
          <Code>{`curl -X POST https://your-domain/api/v1/login/access-token \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "username=you@example.com&password=yourpassword"`}</Code>

          <H3>Response</H3>
          <Code>{`{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}`}</Code>

          <H3>Using the token (curl)</H3>
          <Code>{`curl https://your-domain/api/v1/user/me \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`}</Code>

          <H3>Using the token (JavaScript / fetch)</H3>
          <Code>{`const BASE = "https://your-domain/api/v1";

// 1. Login
const form = new URLSearchParams({ username: "you@example.com", password: "secret" });
const { access_token } = await fetch(\`\${BASE}/login/access-token\`, {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: form,
}).then(r => r.json());

// 2. Authenticated request
const me = await fetch(\`\${BASE}/user/me\`, {
  headers: { Authorization: \`Bearer \${access_token}\` },
}).then(r => r.json());

console.log(me.email); // "you@example.com"`}</Code>

          <H3>Using the token (Python / httpx)</H3>
          <Code>{`import httpx

BASE = "https://your-domain/api/v1"

# 1. Login
r = httpx.post(f"{BASE}/login/access-token",
               data={"username": "you@example.com", "password": "secret"})
token = r.json()["access_token"]

# 2. Authenticated requests via a session
with httpx.Client(headers={"Authorization": f"Bearer {token}"}) as client:
    me = client.get(f"{BASE}/user/me").json()
    blobs = client.get(f"{BASE}/blob/").json()
    print(blobs)  # {"blobs": [...], "total": 2}`}</Code>
        </Section>

        {/* ── Errors & Rate limits ───────────────────────────────────────── */}
        <Section id="errors">
          <H2>
            <span className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-[var(--color-primary)]" /> Errors &amp; Rate Limits</span>
          </H2>

          <H3>Error format</H3>
          <P>All errors return a JSON body with an <code className="font-mono text-xs bg-[var(--color-muted)] px-1 rounded">error</code> string and an optional <code className="font-mono text-xs bg-[var(--color-muted)] px-1 rounded">details</code> field.</P>
          <Code>{`{
  "error": "Blob too large",
  "details": { "max_size_mb": 3 }
}`}</Code>

          <H3>Common HTTP status codes</H3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-left">
                  <th className="pb-2 pr-4 font-medium">Status</th>
                  <th className="pb-2 pr-4 font-medium">Meaning</th>
                  <th className="pb-2 font-medium">When</th>
                </tr>
              </thead>
              <tbody className="text-[var(--color-muted-foreground)]">
                {[
                  ['200', 'OK', 'Successful GET / PATCH'],
                  ['201', 'Created', 'Successful POST (new resource)'],
                  ['400', 'Bad Request', 'Malformed request body'],
                  ['401', 'Unauthorized', 'Missing or invalid JWT'],
                  ['403', 'Forbidden', 'Action not allowed (e.g. blob limit reached)'],
                  ['404', 'Not Found', 'Resource does not exist'],
                  ['413', 'Payload Too Large', 'File exceeds 3 MB'],
                  ['415', 'Unsupported Media Type', 'File type not allowed'],
                  ['422', 'Unprocessable Entity', 'Validation error (see details)'],
                  ['429', 'Too Many Requests', 'Rate limit hit — check Retry-After header'],
                  ['500', 'Internal Server Error', 'Unexpected server error'],
                ].map(([code, meaning, when]) => (
                  <tr key={code} className="border-b border-[var(--color-border)]">
                    <td className="py-2 pr-4 font-mono">{code}</td>
                    <td className="py-2 pr-4">{meaning}</td>
                    <td className="py-2">{when}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <H3>
            <span className="flex items-center gap-2"><Zap className="h-4 w-4" /> Rate limiting</span>
          </H3>
          <P>
            Each IP address is limited to <strong>20 requests per 60 seconds</strong>. When the limit is
            exceeded the server returns <strong>HTTP 429</strong> with a{' '}
            <code className="font-mono text-xs bg-[var(--color-muted)] px-1 rounded">Retry-After</code> header indicating
            how many seconds to wait before retrying.
          </P>
          <Code>{`HTTP/1.1 429 Too Many Requests
Retry-After: 42
Content-Type: application/json

{ "error": "Rate limit exceeded", "details": { "retry_after": 42 } }`}</Code>
        </Section>

        {/* ── Login ─────────────────────────────────────────────────────── */}
        <Section id="login">
          <H2>
            <span className="flex items-center gap-2"><Terminal className="h-5 w-5 text-[var(--color-primary)]" /> Login</span>
          </H2>
          <Endpoint method="POST" path="/api/v1/login/access-token" auth="none" description="OAuth2 password flow — returns JWT" />
          <P>
            The request body must be <code className="font-mono text-xs bg-[var(--color-muted)] px-1 rounded">application/x-www-form-urlencoded</code> (not JSON).
            Use <code className="font-mono text-xs bg-[var(--color-muted)] px-1 rounded">username</code> for the email field (OAuth2 convention).
          </P>
          <H3>Request body (form-encoded)</H3>
          <Code>{`username=you@example.com&password=yourpassword`}</Code>
          <H3>Response</H3>
          <Code>{`{
  "access_token": "eyJ...",
  "token_type": "bearer"
}`}</Code>
        </Section>

        {/* ── Users ─────────────────────────────────────────────────────── */}
        <Section id="users">
          <H2>
            <span className="flex items-center gap-2"><User className="h-5 w-5 text-[var(--color-primary)]" /> Users</span>
          </H2>
          <Endpoint method="POST" path="/api/v1/user" auth="none" description="Register a new account" />
          <Endpoint method="GET" path="/api/v1/user/me" auth="user" description="Get your own profile" />
          <Endpoint method="PATCH" path="/api/v1/user/me" auth="user" description="Update your profile" />
          <Endpoint method="DELETE" path="/api/v1/user/me" auth="user" description="Delete your account" />

          <H3>POST /api/v1/user — Register</H3>
          <Code>{`// Request body (JSON)
{
  "email": "you@example.com",     // required
  "password": "securepassword",   // required
  "first_name": "Jane",           // optional
  "last_name": "Doe"              // optional
}

// Response — User object
{
  "id": "507f1f77bcf86cd799439011",
  "uuid": "018f3c2a-1d5e-7e3f-b0a1-2c4d6e8f0a2b",
  "email": "you@example.com",
  "first_name": "Jane",
  "last_name": "Doe",
  "picture": null,
  "is_active": true,
  "is_superuser": false,
  "provider": null
}`}</Code>

          <H3>PATCH /api/v1/user/me — Update profile</H3>
          <P>All fields are optional. Only include what you want to change. Changing <code className="font-mono text-xs bg-[var(--color-muted)] px-1 rounded">password</code> hashes the new value automatically.</P>
          <Code>{`// Request body (JSON) — all fields optional
{
  "first_name": "Janet",
  "last_name": "Smith",
  "email": "new@example.com",
  "password": "newpassword123",
  "picture": "https://example.com/avatar.jpg"
}`}</Code>

          <H3>Example — update first name (curl)</H3>
          <Code>{`curl -X PATCH https://your-domain/api/v1/user/me \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"first_name": "Janet"}'`}</Code>
        </Section>

        {/* ── Blobs ─────────────────────────────────────────────────────── */}
        <Section id="blobs">
          <H2>
            <span className="flex items-center gap-2"><Upload className="h-5 w-5 text-[var(--color-primary)]" /> Blobs</span>
          </H2>

          <div className="mb-4 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-muted)] px-4 py-3 text-sm text-[var(--color-muted-foreground)]">
            <strong className="text-[var(--color-foreground)]">Limits per account:</strong>
            <ul className="mt-1 list-inside list-disc space-y-0.5">
              <li>Maximum <strong>5 blobs</strong> per user</li>
              <li>Maximum file size: <strong>3 MB</strong></li>
              <li>Allowed types: <code className="font-mono text-xs bg-[var(--color-muted)] px-1 rounded">text/plain</code>, <code className="font-mono text-xs bg-[var(--color-muted)] px-1 rounded">application/json</code>, <code className="font-mono text-xs bg-[var(--color-muted)] px-1 rounded">application/pdf</code></li>
            </ul>
          </div>

          <Endpoint method="POST" path="/api/v1/blob/upload" auth="user" description="Upload a file (multipart/form-data)" />
          <Endpoint method="GET" path="/api/v1/blob/" auth="user" description="List your blobs" />
          <Endpoint method="GET" path="/api/v1/blob/{blob_id}" auth="user" description="Download a blob (binary)" />
          <Endpoint method="DELETE" path="/api/v1/blob/{blob_id}" auth="user" description="Delete a blob" />

          <H3>Upload a blob</H3>
          <P>Send a <code className="font-mono text-xs bg-[var(--color-muted)] px-1 rounded">multipart/form-data</code> request with a <code className="font-mono text-xs bg-[var(--color-muted)] px-1 rounded">file</code> field.</P>
          <Code>{`curl -X POST https://your-domain/api/v1/blob/upload \\
  -H "Authorization: Bearer $TOKEN" \\
  -F "file=@/path/to/document.pdf"`}</Code>
          <H3>Upload response</H3>
          <Code>{`{
  "blob_id": "018f3c2a-1d5e-7e3f-b0a1-2c4d6e8f0a2c",
  "blob_url": "https://your-domain/api/v1/blob/018f3c2a-1d5e-7e3f-b0a1-2c4d6e8f0a2c",
  "file_metadata": {
    "file_name": "document.pdf",
    "file_size": 204800,
    "file_type": "application/pdf"
  }
}`}</Code>

          <H3>List blobs</H3>
          <Code>{`curl https://your-domain/api/v1/blob/ \\
  -H "Authorization: Bearer $TOKEN"

// Response
{
  "blobs": [
    "https://your-domain/api/v1/blob/018f3c2a-...",
    "https://your-domain/api/v1/blob/018f3c2b-..."
  ],
  "total": 2
}`}</Code>

          <H3>Download a blob</H3>
          <P>Returns the raw file binary with <code className="font-mono text-xs bg-[var(--color-muted)] px-1 rounded">Content-Type: application/octet-stream</code> and an <code className="font-mono text-xs bg-[var(--color-muted)] px-1 rounded">X-Blob-Size</code> header.</P>
          <Code>{`curl https://your-domain/api/v1/blob/{blob_id} \\
  -H "Authorization: Bearer $TOKEN" \\
  -o downloaded_file.pdf`}</Code>

          <H3>JavaScript — upload with progress</H3>
          <Code>{`async function uploadBlob(token, file, onProgress) {
  const form = new FormData();
  form.append("file", file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/v1/blob/upload");
    xhr.setRequestHeader("Authorization", \`Bearer \${token}\`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };

    xhr.onload = () =>
      xhr.status === 200
        ? resolve(JSON.parse(xhr.responseText))
        : reject(JSON.parse(xhr.responseText));

    xhr.send(form);
  });
}

// Usage
const result = await uploadBlob(token, fileInput.files[0], (pct) => {
  console.log(\`Upload: \${pct}%\`);
});
console.log(result.blob_id);`}</Code>
        </Section>

        {/* ── Admin ─────────────────────────────────────────────────────── */}
        <Section id="admin">
          <H2>
            <span className="flex items-center gap-2"><Shield className="h-5 w-5 text-[var(--color-primary)]" /> Admin <Badge variant="destructive" className="text-xs">Superuser only</Badge></span>
          </H2>
          <P>These endpoints require a superuser JWT. Regular user tokens receive <strong>403 Forbidden</strong>.</P>

          <Endpoint method="GET" path="/api/v1/admin" auth="superuser" description="List all users (paginated)" />
          <Endpoint method="GET" path="/api/v1/admin/{userid}" auth="superuser" description="Get a user by UUID" />
          <Endpoint method="PATCH" path="/api/v1/admin/{userid}" auth="superuser" description="Update a user" />
          <Endpoint method="DELETE" path="/api/v1/admin/{userid}" auth="superuser" description="Delete a user" />

          <H3>List users (with pagination)</H3>
          <Code>{`// Query params: limit (default 10), offset (default 0)
curl "https://your-domain/api/v1/admin?limit=5&offset=0" \\
  -H "Authorization: Bearer $SUPERUSER_TOKEN"

// Response
{
  "users": [
    {
      "id": "...",
      "uuid": "018f3c2a-...",
      "email": "user@example.com",
      "first_name": "Jane",
      "last_name": "Doe",
      "is_active": true,
      "is_superuser": false,
      "provider": null,
      "picture": null
    }
  ],
  "total": 42
}`}</Code>

          <H3>Update a user (e.g. deactivate)</H3>
          <Code>{`curl -X PATCH "https://your-domain/api/v1/admin/{userid}" \\
  -H "Authorization: Bearer $SUPERUSER_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"is_active": false}'`}</Code>
        </Section>

        {/* ── Interactive docs ───────────────────────────────────────────── */}
        <Section id="interactive">
          <H2>Interactive Docs</H2>
          <P>
            The backend automatically generates interactive API documentation. Use the Swagger UI to explore and test every
            endpoint directly in your browser — no client code needed.
          </P>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Swagger UI</CardTitle>
                <CardDescription>Try out API calls interactively, with request builder and live responses.</CardDescription>
              </CardHeader>
              <CardContent>
                <a href="/docs" target="_blank" rel="noopener noreferrer">
                  <Button className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Open Swagger UI
                  </Button>
                </a>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">ReDoc</CardTitle>
                <CardDescription>Clean, readable reference documentation generated from the OpenAPI schema.</CardDescription>
              </CardHeader>
              <CardContent>
                <a href="/redoc" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Open ReDoc
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>
        </Section>
      </div>
    </div>
  );
}
