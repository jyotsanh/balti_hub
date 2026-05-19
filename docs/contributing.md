# Contributing

Thank you for your interest in contributing to BaltiHub. This document describes the conventions and workflow used in this project.

---

## Getting Started

1. Fork the repository and clone your fork.
2. Follow [development.md](development.md) to get the project running locally.
3. Create a branch for your change (see naming conventions below).
4. Make your changes, then open a pull request against `main`.

---

## Branch Naming

| Type | Pattern | Example |
|---|---|---|
| Feature | `feat/<short-description>` | `feat/blob-pagination` |
| Bug fix | `fix/<short-description>` | `fix/admin-list-response` |
| Documentation | `docs/<short-description>` | `docs/api-reference` |
| Refactor | `refactor/<short-description>` | `refactor/blob-service` |
| Chore | `chore/<short-description>` | `chore/update-dependencies` |

---

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <short summary>

[optional body]
```

**Types:** `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `style`

**Scope** (optional): the affected area — `backend`, `frontend`, `auth`, `blob`, `admin`, `docker`, etc.

**Examples:**

```
feat(blob): add pagination to list blobs endpoint
fix(auth): handle expired token on refresh
docs(api): document blob upload constraints
chore(deps): bump beanie to 2.2.0
```

---

## Code Conventions

### Backend (Python)

- Python **3.12+** required.
- Follow **PEP 8**. Use a formatter (e.g. `ruff format`) before committing.
- Type hints are required on all function signatures.
- New routes must have a `response_model` declared.
- New environment variables must be added to `src/config/config.py` and documented in [environment.md](environment.md).
- Do not commit secrets or `.env` files.

### Frontend (TypeScript)

- All new files must use **TypeScript** (`.ts` / `.tsx`). No plain `.js`.
- Follow the existing ESLint configuration (`eslint.config.js`). Run `npm run lint` before committing.
- New API calls belong in `src/api/` in the appropriate domain file.
- New shared types belong in `src/types/index.ts`.
- Page-level components go in `src/pages/`, reusable components go in `src/components/`.

---

## Pull Request Guidelines

- Keep PRs focused — one concern per PR.
- Fill in the PR description: what the change does, why it is needed, and how to test it.
- Reference related issues with `Closes #<issue-number>` if applicable.
- Ensure the application still starts correctly end-to-end before requesting review.
- PRs that add or modify API endpoints must update [docs/api.md](api.md).
- PRs that add environment variables must update [docs/environment.md](environment.md).

---

## Project Structure

Refer to [architecture.md](architecture.md) for the full breakdown of where code lives and why. In summary:

| Location | What goes there |
|---|---|
| `apps/backend/src/models/` | Beanie ODM document definitions |
| `apps/backend/src/schemas/` | Pydantic request/response schemas |
| `apps/backend/src/routes/` | FastAPI route handlers |
| `apps/backend/src/service/` | Business logic, external service clients |
| `apps/backend/src/middleware/` | Starlette middleware |
| `apps/frontend/src/api/` | Axios API call functions |
| `apps/frontend/src/pages/` | Route-level page components |
| `apps/frontend/src/components/` | Shared/reusable UI components |
| `apps/frontend/src/types/` | Shared TypeScript type definitions |
| `docs/` | Project documentation |

---

## Reporting Issues

When filing a bug report, include:

- Steps to reproduce the issue.
- Expected behaviour vs actual behaviour.
- Backend version / commit hash.
- Relevant log output from `docker compose logs` or the development server.
