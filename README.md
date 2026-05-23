# VibeLearn

A Vibe Coding learning platform with a Vite-based frontend and an Express API.

## Local development

Install dependencies and verify the repository locally:

```bash
npm ci
npm run build
node --check api/index.js
docker compose config
```

## Git hooks

This repository uses tracked Git hooks under `.githooks/`.

After cloning, `npm install` will automatically configure `core.hooksPath` via the `prepare` script in `package.json`.

If you need to reconfigure hooks manually:

```bash
git config core.hooksPath .githooks
```

### Validation commands

- Pre-commit: `npm run build && node --check api/index.js`
- Pre-push: `npm run validate`

The hook-based validation catches build issues, API syntax errors, and Docker Compose configuration problems before code is committed or pushed.
