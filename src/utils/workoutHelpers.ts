import {
  ActiveWorkoutExercise,
  ActiveWorkoutSet,
  CompletedWorkoutSession,
  Exercise,
  IronLogBackupFile,
  IronLogState,
  PersonalRecordBadge,
} from '../types';
import { DEFAULT_EXERCISES } from '../data/exercises';

export function resolveHistoryExerciseId(exerciseId: string, allExercises: Exercise[]): string {
  const found = allExercises.find((e) => e.id === exerciseId);
  if (found?.sharedHistoryExerciseId) {
    return found.sharedHistoryExerciseId;
  }
  return exerciseId;
}

export interface LastExercisePerformance {
  sessionId: string;
  date: string; // YYYY-MM-DD
  formattedDate: string; // DD/MM/YYYY
  routineName: string;
  validSets: ActiveWorkoutSet[];
  totalVolumeKg: number;
  maxWeightKg: number;
}

export function formatDateBR(isoOrDate: string): string {
  if (!isoOrDate) return '';
  const clean = isoOrDate.split('T')[0];
  const parts = clean.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  const d = new Date(isoOrDate);
  if (isNaN(d.getTime())) return isoOrDate;
  return d.toLocaleDateString('pt-BR');
}

export function getLastSessionForExercise(
  exerciseId: string,
  sessions: CompletedWorkoutSession[],
  allExercises: Exercise[],
  excludeSessionId?: string
): LastExercisePerformance | null {
  const targetCanonicalId = resolveHistoryExerciseId(exerciseId, allExercises);

  // Sort sessions descending by finishedAt or date
  const sorted = [...sessions]
    .filter((s) => !s.isRestLog && s.id !== excludeSessionId)
    .sort((a, b) => {
      const tA = new Date(a.finishedAt || a.date).getTime();
      const tB = new Date(b.finishedAt || b.date).getTime();
      return tB - tA;
    });

  for (const session of sorted) {
    const matchingEx = session.exercises.find((exItem) => {
      const itemCanonical = resolveHistoryExerciseId(exItem.exerciseId, allExercises);
      return itemCanonical === targetCanonicalId && !exItem.skipped;
    });

    if (matchingEx) {
      const completedValidSets = matchingEx.sets.filter(
        (s) => s.type === 'valid' && s.completed
      );
      if (completedValidSets.length > 0) {
        const totalVolumeKg = completedValidSets.reduce(
          (acc, s) => acc + (Number(s.weight) || 0) * (Number(s.reps) || 0),
          0
        );
        const maxWeightKg = completedValidSets.reduce(
          (max, s) => Math.max(max, Number(s.weight) || 0),
          0
        );
        return {
          sessionId: session.id,
          date: session.date,
          formattedDate: formatDateBR(session.date),
          routineName: session.routineName,
          validSets: completedValidSets,
          totalVolumeKg,
          maxWeightKg,
        };
      }
    }
  }

  return null;
}

export interface ExerciseRecordSummary {
  maxWeight: { weight: number; reps: number; date: string } | null;
  maxSetVolume: { volume: number; weight: number; reps: number; date: string } | null;
  maxSessionVolume: { volume: number; date: string; setsCount: number } | null;
  bestRepsByWeight: Record<number, { reps: number; date: string }>;
}

export function getExerciseRecords(
  exerciseId: string,
  sessions: CompletedWorkoutSession[],
  allExercises: Exercise[],
  excludeSessionId?: string
): ExerciseRecordSummary {
  const targetCanonicalId = resolveHistoryExerciseId(exerciseId, allExercises);
  let maxWeight: ExerciseRecordSummary['maxWeight'] = null;
  let maxSetVolume: ExerciseRecordSummary['maxSetVolume'] = null;
  let maxSessionVolume: ExerciseRecordSummary['maxSessionVolume'] = null;
  const bestRepsByWeight: Record<number, { reps: number; date: string }> = {};

  for (const session of sessions) {
    if (session.isRestLog || session.id === excludeSessionId) continue;
    for (const exItem of session.exercises) {
      if (exItem.skipped) continue;
      if (resolveHistoryExerciseId(exItem.exerciseId, allExercises) !== targetCanonicalId) continue;

      const validCompleted = exItem.sets.filter((s) => s.type === 'valid' && s.completed);
      if (validCompleted.length === 0) continue;

      let sessionVol = 0;
      for (const s of validCompleted) {
        const w = Number(s.weight) || 0;
        const r = Number(s.reps) || 0;
        const setVol = w * r;
        sessionVol += setVol;

        if (!maxWeight || w > maxWeight.weight || (w === maxWeight.weight && r > maxWeight.reps)) {
          maxWeight = { weight: w, reps: r, date: session.date };
        }
        if (!maxSetVolume || setVol > maxSetVolume.volume) {
          maxSetVolume = { volume: setVol, weight: w, reps: r, date: session.date };
        }
        if (!bestRepsByWeight[w] || r > bestRepsByWeight[w].reps) {
          bestRepsByWeight[w] = { reps: r, date: session.date };
        }
      }

      if (!maxSessionVolume || sessionVol > maxSessionVolume.volume) {
        maxSessionVolume = {
          volume: sessionVol,
          date: session.date,
          setsCount: validCompleted.length,
        };
      }
    }
  }

  return { maxWeight, maxSetVolume, maxSessionVolume, bestRepsByWeight };
}

export function detectNewPersonalRecords(
  exercises: ActiveWorkoutExercise[],
  previousSessions: CompletedWorkoutSession[],
  allExercises: Exercise[],
  unit: string
): PersonalRecordBadge[] {
  const badges: PersonalRecordBadge[] = [];

  for (const exItem of exercises) {
    if (exItem.skipped) continue;
    const validCompleted = exItem.sets.filter((s) => s.type === 'valid' && s.completed);
    if (validCompleted.length === 0) continue;

    const exDef =
      allExercises.find((e) => e.id === exItem.exerciseId) ||
      DEFAULT_EXERCISES.find((e) => e.id === exItem.exerciseId);
    if (!exDef || exDef.metricMode !== 'reps_weight') continue;

    const historyRecords = getExerciseRecords(exItem.exerciseId, previousSessions, allExercises);
    let currentMaxWeight = 0;
    let currentMaxWeightReps = 0;
    let currentMaxSetVol = 0;
    let currentMaxSetVolDetail = '';
    let currentSessionVol = 0;

    for (const s of validCompleted) {
      const w = Number(s.weight) || 0;
      const r = Number(s.reps) || 0;
      const vol = w * r;
      currentSessionVol += vol;

      if (w > currentMaxWeight) {
        currentMaxWeight = w;
        currentMaxWeightReps = r;
      }
      if (vol > currentMaxSetVol) {
        currentMaxSetVol = vol;
        currentMaxSetVolDetail = `${w} ${unit} × ${r}`;
      }

      // Check max reps at a previously used weight
      const prevBestAtWeight = historyRecords.bestRepsByWeight[w];
      if (w > 0 && prevBestAtWeight && r > prevBestAtWeight.reps) {
        badges.push({
          exerciseId: exItem.exerciseId,
          exerciseName: exDef.name,
          recordType: 'max_reps_at_weight',
          label: 'Recorde de Repetições na Carga',
          valueText: `${r} reps com ${w} ${unit}`,
          previousValueText: `Anterior: ${prevBestAtWeight.reps} reps`,
        });
      }
    }

    if (currentMaxWeight > 0) {
      if (!historyRecords.maxWeight || currentMaxWeight > historyRecords.maxWeight.weight) {
        badges.push({
          exerciseId: exItem.exerciseId,
          exerciseName: exDef.name,
          recordType: 'max_weight',
          label: 'Maior Carga Registrada',
          valueText: `${currentMaxWeight} ${unit} (${currentMaxWeightReps} reps)`,
          previousValueText: historyRecords.maxWeight
            ? `Anterior: ${historyRecords.maxWeight.weight} ${unit}`
            : 'Primeiro registro',
        });
      }
    }

    if (currentMaxSetVol > 0 && historyRecords.maxSetVolume && currentMaxSetVol > historyRecords.maxSetVolume.volume) {
      badges.push({
        exerciseId: exItem.exerciseId,
        exerciseName: exDef.name,
        recordType: 'max_set_volume',
        label: 'Maior Volume em Série Única',
        valueText: `${currentMaxSetVol} ${unit} (${currentMaxSetVolDetail})`,
        previousValueText: `Anterior: ${historyRecords.maxSetVolume.volume} ${unit}`,
      });
    }

    if (
      currentSessionVol > 0 &&
      historyRecords.maxSessionVolume &&
      currentSessionVol > historyRecords.maxSessionVolume.volume
    ) {
      badges.push({
        exerciseId: exItem.exerciseId,
        exerciseName: exDef.name,
        recordType: 'max_session_volume',
        label: 'Maior Volume no Exercício',
        valueText: `${currentSessionVol} ${unit}`,
        previousValueText: `Anterior: ${historyRecords.maxSessionVolume.volume} ${unit}`,
      });
    }
  }

  return badges;
}

export function playTimerAlert(soundEnabled: boolean, vibrationEnabled: boolean) {
  if (vibrationEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([220, 100, 220, 100, 350]);
    } catch {
      // Ignore on unsupported iOS browsers
    }
  }

  if (soundEnabled && typeof window !== 'undefined') {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const notes = [880, 1108.73, 1318.51]; // A5, C#6, E6 athletic chime
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.14);
        gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.14);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.14 + 0.32);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.14);
        osc.stop(ctx.currentTime + idx * 0.14 + 0.34);
      });
    } catch {
      // AudioContext blocked or unavailable
    }
  }
}

export function formatDurationSeconds(sec: number): string {
  const safe = Math.max(0, Math.floor(sec));
  const hrs = Math.floor(safe / 3600);
  const mins = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  if (hrs > 0) {
    return `${hrs}h ${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function validateBackupFile(raw: unknown): {
  valid: boolean;
  error?: string;
  backup?: IronLogBackupFile;
} {
  if (!raw || typeof raw !== 'object') {
    return { valid: false, error: 'O arquivo selecionado não é um objeto JSON válido.' };
  }
  const obj = raw as Record<string, unknown>;
  if (obj.app !== 'IRONLOG') {
    return {
      valid: false,
      error: 'Este arquivo não pertence ao aplicativo IRONLOG (identificador inválido).',
    };
  }
  if (typeof obj.schemaVersion !== 'string' || typeof obj.exportedAt !== 'string') {
    return {
      valid: false,
      error: 'Cabeçalho de versão ou data de exportação ausente no arquivo de backup.',
    };
  }
  const data = obj.data as Record<string, unknown> | undefined;
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Estrutura de dados interna ausente ou corrompida.' };
  }
  if (
    !data.profile ||
    !Array.isArray(data.routines) ||
    !Array.isArray(data.customExercises) ||
    !Array.isArray(data.sessions) ||
    !Array.isArray(data.measurements)
  ) {
    return {
      valid: false,
      error: 'O backup está incompleto: faltam tabelas obrigatórias (perfil, rotinas, sessões ou medidas).',
    };
  }

  return {
    valid: true,
    backup: obj as unknown as IronLogBackupFile,
  };
}

export function mergeIronLogStates(current: IronLogState, incoming: IronLogState): IronLogState {
  const mergeById = <T extends { id: string }>(existingList: T[], newList: T[]): T[] => {
    const map = new Map<string, T>();
    existingList.forEach((item) => map.set(item.id, item));
    newList.forEach((item) => {
      if (!map.has(item.id)) {
        map.set(item.id, item);
      }
    });
    return Array.from(map.values());
  };

  const mergedFavs = Array.from(
    new Set([...(current.favoriteExerciseIds || []), ...(incoming.favoriteExerciseIds || [])])
  );

  return {
    profile: {
      ...incoming.profile,
      ...current.profile,
      onboardingCompleted: true,
    },
    routines: mergeById(current.routines || [], incoming.routines || []),
    customExercises: mergeById(current.customExercises || [], incoming.customExercises || []),
    favoriteExerciseIds: mergedFavs,
    sessions: mergeById(current.sessions || [], incoming.sessions || []),
    activeWorkout: current.activeWorkout || incoming.activeWorkout || null,
    measurements: mergeById(current.measurements || [], incoming.measurements || []),
    photos: mergeById(current.photos || [], incoming.photos || []),
  };
}
