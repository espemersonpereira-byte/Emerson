import express from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const PORT = 3000;
const LOCAL_STATE_FILE = path.resolve(process.cwd(), '.ironlog_persistent_state.json');
const TMP_STATE_FILE = '/tmp/ironlog_persistent_state.json';

interface PersistedEnvelope {
  updatedAt: number;
  onboardingStep?: number;
  state: Record<string, any>;
}

function isValidStateObject(obj: any): boolean {
  return Boolean(
    obj &&
      typeof obj === 'object' &&
      obj.profile &&
      typeof obj.profile === 'object' &&
      Array.isArray(obj.routines)
  );
}

function isStateUserConfigured(state: any): boolean {
  if (!state || !state.profile) return false;
  if (state.profile.onboardingCompleted) return true;
  if (typeof state.profile.name === 'string' && state.profile.name.trim().length > 0) return true;
  if (typeof state.profile.avatarUrl === 'string' && state.profile.avatarUrl.length > 0) return true;
  if (typeof state.profile.accentColor === 'string' && state.profile.accentColor !== 'orange') return true;
  if (Array.isArray(state.sessions) && state.sessions.length > 1) return true;
  if (Array.isArray(state.customExercises) && state.customExercises.length > 0) return true;
  if (state.activeWorkout) return true;
  if (Number(state.updatedAt) > 0) return true;
  return false;
}

function readPersistedEnvelope(): PersistedEnvelope | null {
  const candidates: PersistedEnvelope[] = [];

  for (const filePath of [LOCAL_STATE_FILE, TMP_STATE_FILE]) {
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && isValidStateObject(parsed.state)) {
          candidates.push({
            updatedAt: Number(parsed.updatedAt) || Number(parsed.state.updatedAt) || 0,
            onboardingStep: Number(parsed.onboardingStep) || 1,
            state: parsed.state,
          });
        } else if (isValidStateObject(parsed)) {
          candidates.push({
            updatedAt: Number(parsed.updatedAt) || 0,
            onboardingStep: 1,
            state: parsed,
          });
        }
      }
    } catch {
      // Ignore corrupted candidate
    }
  }

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => {
    const aDone = Boolean(a.state?.profile?.onboardingCompleted);
    const bDone = Boolean(b.state?.profile?.onboardingCompleted);
    if (aDone !== bDone) return bDone ? 1 : -1;
    const aConf = isStateUserConfigured(a.state);
    const bConf = isStateUserConfigured(b.state);
    if (aConf !== bConf) return bConf ? 1 : -1;
    return b.updatedAt - a.updatedAt;
  });

  return candidates[0];
}

function writePersistedEnvelope(envelope: PersistedEnvelope): void {
  const payload = JSON.stringify(envelope);
  for (const filePath of [LOCAL_STATE_FILE, TMP_STATE_FILE]) {
    try {
      fs.writeFileSync(filePath, payload, 'utf-8');
    } catch {
      // Ignore write error on read-only path
    }
  }
}

function clearPersistedEnvelopes(): void {
  for (const filePath of [LOCAL_STATE_FILE, TMP_STATE_FILE]) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch {
      // Ignore
    }
  }
}

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '50mb' }));
  app.use(express.text({ type: 'text/plain', limit: '50mb' }));

  // GET /api/state — Returns persisted state from disk
  app.get('/api/state', (_req, res) => {
    const existing = readPersistedEnvelope();
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    if (!existing) {
      res.json({ ok: true, state: null, updatedAt: 0, onboardingStep: 1 });
      return;
    }
    res.json({
      ok: true,
      state: existing.state,
      updatedAt: existing.updatedAt,
      onboardingStep: existing.onboardingStep || 1,
    });
  });

  // POST /api/state — Saves user state to disk
  app.post('/api/state', (req, res) => {
    try {
      const body =
        typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const incomingState = body?.state ?? body;
      const incomingStep = Number(body?.onboardingStep) || 1;
      const forceReset = Boolean(body?.forceReset);

      if (!isValidStateObject(incomingState)) {
        res.status(400).json({ ok: false, error: 'Invalid state payload' });
        return;
      }

      const existing = readPersistedEnvelope();
      const existingConfigured = existing ? isStateUserConfigured(existing.state) : false;
      const incomingConfigured = isStateUserConfigured(incomingState);

      // Never allow an uninitialized blank state to overwrite a configured state unless forceReset is true
      if (existing && existingConfigured && !incomingConfigured && !forceReset) {
        res.json({
          ok: true,
          ignored: true,
          state: existing.state,
          updatedAt: existing.updatedAt,
        });
        return;
      }

      const existingCompleted = Boolean(existing?.state?.profile?.onboardingCompleted);
      const incomingCompleted = Boolean(incomingState?.profile?.onboardingCompleted);

      const updatedAt = Number(incomingState.updatedAt) || Date.now();
      const mergedState = {
        ...incomingState,
        updatedAt,
        profile: {
          ...incomingState.profile,
          onboardingCompleted:
            incomingCompleted || (existingCompleted && !forceReset),
          name:
            incomingState.profile?.name ||
            (!forceReset ? existing?.state?.profile?.name : '') ||
            '',
          avatarUrl:
            incomingState.profile?.avatarUrl !== undefined
              ? incomingState.profile.avatarUrl
              : existing?.state?.profile?.avatarUrl,
        },
        photos:
          Array.isArray(incomingState.photos) && incomingState.photos.length > 0
            ? incomingState.photos
            : !forceReset
            ? existing?.state?.photos || []
            : [],
      };

      writePersistedEnvelope({
        updatedAt,
        onboardingStep: incomingStep,
        state: mergedState,
      });

      res.json({ ok: true, updatedAt });
    } catch {
      res.status(500).json({ ok: false, error: 'Failed to persist state' });
    }
  });

  // POST /api/state/reset — Explicitly clears server state when user clicks "Apagar Todos os Dados"
  app.post('/api/state/reset', (_req, res) => {
    clearPersistedEnvelopes();
    res.json({ ok: true });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: null,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`IRONLOG server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
