import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Calendar,
  Dumbbell,
  Home,
  Library,
  Palette,
  Play,
  TrendingUp,
  User,
  X,
} from 'lucide-react';
import {
  ActiveWorkoutExercise,
  ActiveWorkoutSession,
  BodyMeasurementEntry,
  CompletedWorkoutSession,
  Exercise,
  IronLogBackupFile,
  IronLogState,
  ProgressPhoto,
  Routine,
  UserProfile,
} from './types';
import { DEFAULT_EXERCISES, EQUIPMENT_TYPES } from './data/exercises';
import { getInitialRoutines } from './data/defaultRoutines';
import { IronLogLogo } from './components/IronLogLogo';
import { OnboardingWizard } from './components/OnboardingWizard';
import { TodayDashboardView } from './components/TodayDashboardView';
import { RoutinesView } from './components/RoutinesView';
import { ExerciseLibraryView } from './components/ExerciseLibraryView';
import { EvolutionHistoryView } from './components/EvolutionHistoryView';
import { ProfileSettingsView } from './components/ProfileSettingsView';
import { WorkoutExecutionModal } from './components/WorkoutExecutionModal';
import { OfflineIndicator, PWAInstallButton } from './components/PWAInstallBanner';
import { ProfilePhotoLightboxModal } from './components/ProfilePhotoLightboxModal';
import { WorkoutCelebrationModal } from './components/WorkoutCelebrationModal';
import { AppColorPicker } from './components/AppColorPicker';
import { applyAccentColorToDOM } from './utils/themeColors';
import {
  getLastSessionForExercise,
  mergeIronLogStates,
  validateBackupFile,
} from './utils/workoutHelpers';
import {
  clearAllIronLogStorage,
  hasCompletedOnboardingFlag,
  hydrateBestIronLogState,
  loadSyncStateFromLocalStorage,
  persistIronLogState,
  SAFETY_BACKUP_KEY,
} from './utils/storageEngine';

function createInitialState(): IronLogState {
  const alreadyOnboarded = hasCompletedOnboardingFlag();
  const initialProfile: UserProfile = {
    onboardingCompleted: alreadyOnboarded,
    name: '',
    heightCm: 175,
    currentWeightKg: 76,
    biologicalSex: '',
    weightUnit: 'kg',
    lengthUnit: 'cm',
    goals: ['Ganhar massa muscular', 'Ganhar força'],
    experienceLevel: 'Intermediário',
    targetDaysPerWeek: 5,
    preferredDays: [1, 2, 3, 5, 6],
    estimatedSessionMinutes: 55,
    trainingLocation: 'Academia',
    availableEquipment: [...EQUIPMENT_TYPES],
    theme: 'dark',
    defaultRestSeconds: 90,
    soundEnabled: true,
    vibrationEnabled: true,
    defaultGymMode: false,
    startDate: '2026-10-01',
    reminders: {
      enabled: false,
      workoutTime: '18:30',
      inactivityReminderDays: 3,
      weeklyMeasurementReminder: true,
      periodicBackupReminder: true,
    },
  };

  // Seed reference session from 07/10/2026 (Section 20.1 example) so automatic load suggestions work immediately
  const initialReferenceSession: CompletedWorkoutSession = {
    id: 'sess_ref_2026_10_07',
    routineId: 'routine_mon_chest_triceps',
    routineName: 'PEITO + TRÍCEPS',
    date: '2026-10-07',
    startedAt: '2026-10-07T18:00:00.000Z',
    finishedAt: '2026-10-07T18:52:00.000Z',
    durationSeconds: 3120,
    totalValidSets: 14,
    totalVolumeKg: 4210,
    notes: 'Sessão de referência inicial — excelente controle de cadência.',
    personalRecords: [
      {
        exerciseId: 'incline_bench_press',
        exerciseName: 'Supino inclinado',
        recordType: 'max_weight',
        label: 'Maior Carga Registrada',
        valueText: '32 kg (10 reps)',
      },
    ],
    exercises: [
      {
        id: 'ref_ex_1',
        exerciseId: 'peck_deck',
        restSeconds: 90,
        notes: '',
        sets: [
          { id: 's_pd_1', type: 'valid', weight: 40, reps: 12, completed: true },
          { id: 's_pd_2', type: 'valid', weight: 45, reps: 12, completed: true },
        ],
      },
      {
        id: 'ref_ex_2',
        exerciseId: 'incline_bench_press',
        restSeconds: 120,
        notes: '',
        sets: [
          { id: 's_ibp_1', type: 'valid', weight: 30, reps: 12, completed: true },
          { id: 's_ibp_2', type: 'valid', weight: 32, reps: 10, completed: true },
        ],
      },
      {
        id: 'ref_ex_3',
        exerciseId: 'flat_bench_press',
        restSeconds: 120,
        notes: '',
        sets: [
          { id: 's_fbp_1', type: 'valid', weight: 40, reps: 10, completed: true },
          { id: 's_fbp_2', type: 'valid', weight: 42, reps: 10, completed: true },
        ],
      },
      {
        id: 'ref_ex_4',
        exerciseId: 'high_cable_crossover',
        restSeconds: 90,
        notes: '',
        sets: [
          { id: 's_hcc_1', type: 'valid', weight: 15, reps: 12, completed: true },
          { id: 's_hcc_2', type: 'valid', weight: 15, reps: 12, completed: true },
        ],
      },
      {
        id: 'ref_ex_5',
        exerciseId: 'low_cable_crossover',
        restSeconds: 90,
        notes: '',
        sets: [
          { id: 's_lcc_1', type: 'valid', weight: 10, reps: 12, completed: true },
          { id: 's_lcc_2', type: 'valid', weight: 12.5, reps: 12, completed: true },
        ],
      },
      {
        id: 'ref_ex_6',
        exerciseId: 'french_press',
        restSeconds: 90,
        notes: '',
        sets: [
          { id: 's_fp_1', type: 'valid', weight: 16, reps: 12, completed: true },
          { id: 's_fp_2', type: 'valid', weight: 18, reps: 10, completed: true },
        ],
      },
      {
        id: 'ref_ex_7',
        exerciseId: 'triceps_pushdown',
        restSeconds: 75,
        notes: '',
        sets: [
          { id: 's_tp_1', type: 'valid', weight: 25, reps: 12, completed: true },
          { id: 's_tp_2', type: 'valid', weight: 27.5, reps: 12, completed: true },
        ],
      },
    ],
  };

  return {
    profile: initialProfile,
    routines: getInitialRoutines(),
    customExercises: [],
    favoriteExerciseIds: ['incline_bench_press', 'squat', 'lat_pulldown', 'hip_thrust'],
    sessions: [initialReferenceSession],
    activeWorkout: null,
    measurements: [
      {
        id: 'meas_init_1',
        date: '2026-10-07',
        weightKg: 76,
        chestCm: 102,
        waistCm: 80,
        rightArmCm: 38.5,
        leftArmCm: 38.2,
      },
    ],
    photos: [],
  };
}

export default function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [isHydrating, setIsHydrating] = useState<boolean>(true);
  const isHydratedRef = useRef<boolean>(false);
  const [activeTab, setActiveTab] = useState<
    'today' | 'routines' | 'exercises' | 'evolution' | 'profile'
  >('today');
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState<boolean>(false);
  const [isAvatarLightboxOpen, setIsAvatarLightboxOpen] = useState<boolean>(false);
  const [isQuickColorModalOpen, setIsQuickColorModalOpen] = useState<boolean>(false);
  const [celebratingSession, setCelebratingSession] =
    useState<CompletedWorkoutSession | null>(null);
  const welcomeRestoreInputRef = useRef<HTMLInputElement | null>(null);

  const [state, setState] = useState<IronLogState>(() => {
    const syncLoaded = loadSyncStateFromLocalStorage();
    if (syncLoaded) {
      return syncLoaded;
    }
    return createInitialState();
  });

  const stateRef = useRef<IronLogState>(state);
  stateRef.current = state;

  // Hydrate from all 4 layers (localStorage + IndexedDB + CacheStorage + Server /api/state) on mount
  useEffect(() => {
    let mounted = true;
    hydrateBestIronLogState(createInitialState)
      .then((hydrated) => {
        if (!mounted) return;
        isHydratedRef.current = true;
        setState(hydrated);
        setIsHydrating(false);
        if (hydrated.activeWorkout) {
          setIsWorkoutModalOpen(true);
        }
      })
      .catch(() => {
        if (!mounted) return;
        isHydratedRef.current = true;
        setIsHydrating(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Splash Screen timer (Section 1)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
      if (stateRef.current.activeWorkout) {
        setIsWorkoutModalOpen(true);
      }
    }, 650);
    return () => clearTimeout(timer);
  }, []);

  // Persist state on every change ONLY after initial hydration completes
  useEffect(() => {
    if (!isHydratedRef.current) return;
    persistIronLogState(state);
  }, [state]);

  // Flush state immediately when user closes tab/app or switches away on iPhone
  useEffect(() => {
    const handleFlush = () => {
      if (!isHydratedRef.current) return;
      persistIronLogState(stateRef.current, { flushBeacon: true });
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleFlush();
      }
    };
    window.addEventListener('pagehide', handleFlush);
    window.addEventListener('beforeunload', handleFlush);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('pagehide', handleFlush);
      window.removeEventListener('beforeunload', handleFlush);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Apply Light / Dark / Auto theme (Section 2)
  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = (isDark: boolean) => {
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) {
        metaTheme.setAttribute('content', isDark ? '#0A0B0E' : '#F8FAFC');
      }
    };

    if (state.profile.theme === 'dark') {
      applyTheme(true);
    } else if (state.profile.theme === 'light') {
      applyTheme(false);
    } else {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mq.matches);
      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches);
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [state.profile.theme]);

  // Apply dynamic app accent color across the entire application
  useEffect(() => {
    applyAccentColorToDOM(state.profile.accentColor || 'orange');
  }, [state.profile.accentColor]);

  // Combined library of default + custom exercises
  const allExercises = useMemo<Exercise[]>(() => {
    const customMap = new Map<string, Exercise>();
    state.customExercises.forEach((c) => customMap.set(c.id, c));
    const mergedDefaults = DEFAULT_EXERCISES.map((d) => customMap.get(d.id) || d);
    const purelyCustom = state.customExercises.filter(
      (c) => !DEFAULT_EXERCISES.some((d) => d.id === c.id)
    );
    return [...purelyCustom, ...mergedDefaults];
  }, [state.customExercises]);

  const updateProfile = (partial: Partial<UserProfile>) => {
    setState((prev) => {
      const next: IronLogState = {
        ...prev,
        updatedAt: Date.now(),
        profile: { ...prev.profile, ...partial },
      };
      persistIronLogState(next);
      return next;
    });
  };

  // Start a planned routine with smart load suggestions from last session (20.1)
  const handleStartRoutine = (routine: Routine, forceGymMode?: boolean) => {
    const activeExercises: ActiveWorkoutExercise[] = routine.exercises.map((item) => {
      const lastPerf = getLastSessionForExercise(
        item.exerciseId,
        state.sessions,
        allExercises
      );
      let validIdx = 0;
      const sets = item.sets.map((s) => {
        if (s.type === 'warmup') {
          return {
            id: `act_set_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            type: 'warmup' as const,
            weight: s.targetWeight,
            reps: s.maxReps,
            completed: false,
          };
        }
        const prevSet = lastPerf
          ? lastPerf.validSets[validIdx] ||
            lastPerf.validSets[lastPerf.validSets.length - 1]
          : null;
        validIdx++;
        return {
          id: `act_set_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          type: 'valid' as const,
          weight: prevSet ? prevSet.weight : s.targetWeight,
          reps: prevSet ? prevSet.reps : s.maxReps,
          suggestedWeight: prevSet?.weight,
          suggestedReps: prevSet?.reps,
          completed: false,
        };
      });

      return {
        id: `act_ex_${item.id}_${Date.now()}`,
        exerciseId: item.exerciseId,
        restSeconds: item.restSeconds || state.profile.defaultRestSeconds || 90,
        notes: item.notes || '',
        technique: item.technique,
        sets,
      };
    });

    const newActive: ActiveWorkoutSession = {
      id: `active_${Date.now()}`,
      routineId: routine.id,
      routineName: routine.name,
      startedAt: new Date().toISOString(),
      currentExerciseIndex: 0,
      exercises: activeExercises,
      notes: '',
      gymMode: forceGymMode ?? state.profile.defaultGymMode,
      restTimer: {
        active: false,
        paused: false,
        targetEndTimestamp: null,
        remainingWhenPausedMs: 0,
        totalDurationSeconds: 90,
        exerciseId: null,
        exerciseName: null,
      },
    };

    setState((prev) => ({ ...prev, activeWorkout: newActive }));
    setIsWorkoutModalOpen(true);
  };

  // Start a Free Workout (Treino Livre)
  const handleStartFreeWorkout = () => {
    const starterExIds = ['incline_bench_press', 'lat_pulldown', 'squat'];
    const activeExercises: ActiveWorkoutExercise[] = starterExIds.map((exId, idx) => {
      const exDef = allExercises.find((e) => e.id === exId) || allExercises[0];
      const lastPerf = getLastSessionForExercise(exDef.id, state.sessions, allExercises);
      return {
        id: `free_ex_${idx}_${Date.now()}`,
        exerciseId: exDef.id,
        restSeconds: exDef.defaultRestSeconds,
        notes: '',
        sets: [0, 1].map((si) => ({
          id: `free_set_${idx}_${si}_${Date.now()}`,
          type: 'valid',
          weight: lastPerf?.validSets[si]?.weight ?? exDef.defaultWeight,
          reps: lastPerf?.validSets[si]?.reps ?? exDef.defaultMaxReps,
          completed: false,
        })),
      };
    });

    const freeSession: ActiveWorkoutSession = {
      id: `active_free_${Date.now()}`,
      routineName: 'TREINO LIVRE PERSONALIZADO',
      startedAt: new Date().toISOString(),
      currentExerciseIndex: 0,
      exercises: activeExercises,
      notes: '',
      gymMode: state.profile.defaultGymMode,
      restTimer: {
        active: false,
        paused: false,
        targetEndTimestamp: null,
        remainingWhenPausedMs: 0,
        totalDurationSeconds: 90,
        exerciseId: null,
        exerciseName: null,
      },
    };

    setState((prev) => ({ ...prev, activeWorkout: freeSession }));
    setIsWorkoutModalOpen(true);
  };

  // Repeat an old session from history without altering original record (Section 10)
  const handleRepeatSession = (oldSession: CompletedWorkoutSession) => {
    const clonedExercises: ActiveWorkoutExercise[] = oldSession.exercises.map(
      (ex, idx) => ({
        ...ex,
        id: `rep_ex_${idx}_${Date.now()}`,
        skipped: false,
        sets: ex.sets.map((s, si) => ({
          ...s,
          id: `rep_set_${idx}_${si}_${Date.now()}`,
          completed: false,
          completedAt: undefined,
        })),
      })
    );

    const newActive: ActiveWorkoutSession = {
      id: `active_repeat_${Date.now()}`,
      routineId: oldSession.routineId,
      routineName: oldSession.routineName,
      startedAt: new Date().toISOString(),
      currentExerciseIndex: 0,
      exercises: clonedExercises,
      notes: '',
      gymMode: state.profile.defaultGymMode,
      restTimer: {
        active: false,
        paused: false,
        targetEndTimestamp: null,
        remainingWhenPausedMs: 0,
        totalDurationSeconds: 90,
        exerciseId: null,
        exerciseName: null,
      },
    };

    setState((prev) => ({ ...prev, activeWorkout: newActive }));
    setIsWorkoutModalOpen(true);
  };

  // Log a Rest Day
  const handleLogRestDay = (dayTitle: string, note: string) => {
    const nowIso = new Date().toISOString();
    const restSession: CompletedWorkoutSession = {
      id: `rest_${Date.now()}`,
      routineName: `DESCANSO — ${dayTitle}`,
      date: nowIso.split('T')[0],
      startedAt: nowIso,
      finishedAt: nowIso,
      durationSeconds: 0,
      exercises: [],
      totalValidSets: 0,
      totalVolumeKg: 0,
      notes: note,
      personalRecords: [],
      isRestLog: true,
    };
    setState((prev) => ({
      ...prev,
      sessions: [restSession, ...prev.sessions],
    }));
  };

  // Backup Restore Handler (20.3)
  const handleRestoreBackup = (
    backup: IronLogBackupFile,
    mode: 'replace' | 'merge'
  ) => {
    try {
      localStorage.setItem(SAFETY_BACKUP_KEY, JSON.stringify(state));
    } catch {
      // Ignore quota
    }

    if (mode === 'replace') {
      setState({
        ...backup.data,
        profile: {
          ...backup.data.profile,
          onboardingCompleted: true,
        },
      });
    } else {
      setState((prev) => mergeIronLogStates(prev, backup.data));
    }
  };

  // =========================================================================
  // 1. TELA DE ABERTURA (SPLASH SCREEN — SEÇÃO 1)
  // =========================================================================
  if (showSplash || isHydrating) {
    return (
      <div className="min-h-screen bg-[#0A0B0E] text-white flex flex-col items-center justify-center p-6 select-none">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <IronLogLogo size="xl" showText={false} />
          <h1 className="font-display text-5xl font-bold tracking-widest">
            IRON<span className="text-orange-500">LOG</span>
          </h1>
          <p className="text-xs uppercase tracking-widest text-slate-400">
            Força · Disciplina · Evolução Física
          </p>
          <div className="w-36 h-1.5 rounded-full bg-slate-800 overflow-hidden mt-3">
            <div className="h-full w-2/3 bg-orange-500 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. CONFIGURAÇÃO INICIAL DO USUÁRIO (SEÇÃO 3)
  // =========================================================================
  if (!state.profile.onboardingCompleted) {
    return (
      <>
        <OnboardingWizard
          profile={state.profile}
          onUpdateProfile={updateProfile}
          onComplete={() => {
            setState((prev) => {
              const initMeas: BodyMeasurementEntry[] =
                prev.profile.currentWeightKg > 0 && prev.measurements.length === 0
                  ? [
                      {
                        id: `meas_${Date.now()}`,
                        date: new Date().toISOString().split('T')[0],
                        weightKg: prev.profile.currentWeightKg,
                      },
                    ]
                  : prev.measurements;
              const next: IronLogState = {
                ...prev,
                updatedAt: Date.now(),
                profile: { ...prev.profile, onboardingCompleted: true },
                measurements: initMeas,
              };
              persistIronLogState(next, { flushBeacon: true });
              return next;
            });
          }}
          onOpenRestoreBackup={() => welcomeRestoreInputRef.current?.click()}
        />
        <input
          ref={welcomeRestoreInputRef}
          type="file"
          accept=".json,application/json"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
              try {
                const parsed = JSON.parse(String(reader.result));
                const check = validateBackupFile(parsed);
                if (check.valid && check.backup) {
                  handleRestoreBackup(check.backup, 'replace');
                }
              } catch {
                // Invalid file ignored
              }
            };
            reader.readAsText(file);
          }}
          className="hidden"
        />
      </>
    );
  }

  const navItems = [
    { id: 'today', label: 'Início', icon: Home },
    { id: 'routines', label: 'Treinos', icon: Calendar },
    { id: 'exercises', label: 'Exercícios', icon: Library },
    { id: 'evolution', label: 'Evolução', icon: TrendingUp },
    { id: 'profile', label: 'Perfil', icon: User },
  ] as const;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A0B0E] text-slate-900 dark:text-slate-100 flex flex-col">
      <OfflineIndicator />

      {/* Top Navigation Bar (Strict 3-Zone Contract on Desktop + Compact Mobile App Bar) */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#13151B]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 h-14 flex items-center justify-between gap-8 pt-safe">
        {/* Zone 1: Brand Wordmark */}
        <button
          type="button"
          onClick={() => setActiveTab('today')}
          className="whitespace-nowrap shrink-0 flex items-center gap-2.5 focus:outline-none"
        >
          <IronLogLogo size="sm" />
        </button>

        {/* Zone 2: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`whitespace-nowrap shrink-0 py-1 transition-colors border-b-2 ${
                activeTab === item.id
                  ? 'border-orange-500 text-slate-900 dark:text-white font-semibold'
                  : 'border-transparent hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Quick Color Customizer + Primary Action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsQuickColorModalOpen(true)}
            className="min-h-[38px] px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:border-orange-500 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors"
            title="Mudar cor do aplicativo"
          >
            <Palette className="w-4 h-4 text-orange-500" />
            <span className="hidden sm:inline">Cor do App</span>
          </button>

          {state.activeWorkout ? (
            <button
              type="button"
              onClick={() => setIsWorkoutModalOpen(true)}
              className="min-h-[38px] px-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Retomar Treino</span>
            </button>
          ) : (
            <PWAInstallButton compact />
          )}
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-5 pb-28">
        {activeTab === 'today' && (
          <TodayDashboardView
            profile={state.profile}
            routines={state.routines}
            allExercises={allExercises}
            sessions={state.sessions}
            measurements={state.measurements}
            activeWorkout={state.activeWorkout}
            onStartRoutine={handleStartRoutine}
            onStartFreeWorkout={handleStartFreeWorkout}
            onResumeActiveWorkout={() => setIsWorkoutModalOpen(true)}
            onNavigateTab={setActiveTab}
            onLogRestDay={handleLogRestDay}
            onOpenAvatarLightbox={() => setIsAvatarLightboxOpen(true)}
          />
        )}

        {activeTab === 'routines' && (
          <RoutinesView
            routines={state.routines}
            allExercises={allExercises}
            sessions={state.sessions}
            weightUnit={state.profile.weightUnit}
            onUpdateRoutines={(next) =>
              setState((prev) => ({ ...prev, routines: next }))
            }
            onStartRoutine={(r) => handleStartRoutine(r)}
            onStartFreeWorkout={handleStartFreeWorkout}
            onLogRestDay={handleLogRestDay}
            onRestoreDefaultRoutines={() =>
              setState((prev) => ({ ...prev, routines: getInitialRoutines() }))
            }
          />
        )}

        {activeTab === 'exercises' && (
          <ExerciseLibraryView
            allExercises={allExercises}
            favoriteIds={state.favoriteExerciseIds}
            routines={state.routines}
            sessions={state.sessions}
            weightUnit={state.profile.weightUnit}
            onToggleFavorite={(exId) => {
              setState((prev) => {
                const exists = prev.favoriteExerciseIds.includes(exId);
                return {
                  ...prev,
                  favoriteExerciseIds: exists
                    ? prev.favoriteExerciseIds.filter((id) => id !== exId)
                    : [...prev.favoriteExerciseIds, exId],
                };
              });
            }}
            onSaveCustomExercise={(customEx) => {
              setState((prev) => {
                const exists = prev.customExercises.some((e) => e.id === customEx.id);
                return {
                  ...prev,
                  customExercises: exists
                    ? prev.customExercises.map((e) =>
                        e.id === customEx.id ? customEx : e
                      )
                    : [customEx, ...prev.customExercises],
                };
              });
            }}
            onDeleteOrArchiveCustomExercise={(exId) => {
              setState((prev) => {
                const usedInHistory = prev.sessions.some((s) =>
                  s.exercises.some((e) => e.exerciseId === exId)
                );
                if (usedInHistory) {
                  // Archive instead of deleting to preserve historical integrity (Section 9)
                  return {
                    ...prev,
                    customExercises: prev.customExercises.map((e) =>
                      e.id === exId ? { ...e, isArchived: true } : e
                    ),
                  };
                }
                return {
                  ...prev,
                  customExercises: prev.customExercises.filter((e) => e.id !== exId),
                };
              });
            }}
            onAddExerciseToRoutine={(routineId, exId) => {
              const exDef =
                allExercises.find((e) => e.id === exId) || DEFAULT_EXERCISES[0];
              setState((prev) => ({
                ...prev,
                routines: prev.routines.map((r) => {
                  if (r.id !== routineId) return r;
                  return {
                    ...r,
                    isRestDay: false,
                    exercises: [
                      ...r.exercises,
                      {
                        id: `re_${exId}_${Date.now()}`,
                        exerciseId: exId,
                        restSeconds: exDef.defaultRestSeconds,
                        notes: '',
                        technique: 'Cadência controlada',
                        rpeTarget: 8,
                        sets: [1, 2].map((n) => ({
                          id: `set_${exId}_${Date.now()}_${n}`,
                          type: 'valid',
                          minReps: exDef.defaultMinReps,
                          maxReps: exDef.defaultMaxReps,
                          targetWeight: exDef.defaultWeight,
                          restSeconds: exDef.defaultRestSeconds,
                        })),
                      },
                    ],
                  };
                }),
              }));
            }}
          />
        )}

        {activeTab === 'evolution' && (
          <EvolutionHistoryView
            sessions={state.sessions}
            measurements={state.measurements}
            allExercises={allExercises}
            weightUnit={state.profile.weightUnit}
            onRepeatSession={handleRepeatSession}
            onUpdateSessionInHistory={(updated) => {
              setState((prev) => ({
                ...prev,
                sessions: prev.sessions.map((s) =>
                  s.id === updated.id ? updated : s
                ),
              }));
            }}
            onDeleteSessionFromHistory={(sessionId) => {
              setState((prev) => ({
                ...prev,
                sessions: prev.sessions.filter((s) => s.id !== sessionId),
              }));
            }}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileSettingsView
            state={state}
            onUpdateProfile={updateProfile}
            onAddMeasurement={(entry) =>
              setState((prev) => ({
                ...prev,
                measurements: [entry, ...prev.measurements],
              }))
            }
            onDeleteMeasurement={(id) =>
              setState((prev) => ({
                ...prev,
                measurements: prev.measurements.filter((m) => m.id !== id),
              }))
            }
            onAddPhoto={(photo: ProgressPhoto) =>
              setState((prev) => ({
                ...prev,
                photos: [photo, ...prev.photos],
              }))
            }
            onDeletePhoto={(id) =>
              setState((prev) => ({
                ...prev,
                photos: prev.photos.filter((p) => p.id !== id),
              }))
            }
            onRestoreBackup={handleRestoreBackup}
            onResetAllData={() => {
              void clearAllIronLogStorage().then(() => {
                const fresh = createInitialState();
                fresh.profile.onboardingCompleted = false;
                fresh.updatedAt = undefined;
                setState(fresh);
              });
            }}
            onOpenAvatarLightbox={() => setIsAvatarLightboxOpen(true)}
          />
        )}
      </main>

      {/* Fixed Bottom Navigation Bar for iPhone & Mobile Ergonomics (Section 13) */}
      <nav
        aria-label="Navegação Principal"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#13151B]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe"
      >
        <div className="max-w-lg mx-auto grid grid-cols-5 items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`min-h-[48px] flex flex-col items-center justify-center transition-colors ${
                  active
                    ? 'text-orange-500 font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] tracking-tight mt-1 whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Workout Execution Modal (Standard + Modo Academia — Sections 7, 20.1 & 20.2) */}
      {isWorkoutModalOpen && state.activeWorkout && (
        <WorkoutExecutionModal
          session={state.activeWorkout}
          allExercises={allExercises}
          completedSessions={state.sessions}
          profile={state.profile}
          onUpdateSession={(updated) =>
            setState((prev) => ({ ...prev, activeWorkout: updated }))
          }
          onFinishWorkout={(completed) => {
            setState((prev) => ({
              ...prev,
              activeWorkout: null,
              sessions: [completed, ...prev.sessions],
            }));
            setIsWorkoutModalOpen(false);
            setCelebratingSession(completed);
            setActiveTab('evolution');
          }}
          onMinimizeOrExitPartial={() => {
            setIsWorkoutModalOpen(false);
          }}
          onDiscardWorkout={() => {
            setState((prev) => ({ ...prev, activeWorkout: null }));
            setIsWorkoutModalOpen(false);
          }}
        />
      )}

      {/* Expanded Profile Photo Lightbox Modal */}
      <ProfilePhotoLightboxModal
        isOpen={isAvatarLightboxOpen}
        profile={state.profile}
        onClose={() => setIsAvatarLightboxOpen(false)}
        onUpdateAvatar={(avatarUrl) => updateProfile({ avatarUrl })}
        onGoToProfile={
          activeTab !== 'profile' ? () => setActiveTab('profile') : undefined
        }
      />

      {/* Quick App Color Customizer Modal */}
      {isQuickColorModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          onClick={() => setIsQuickColorModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white dark:bg-[#13151B] border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-500">
                  Identidade Visual Personalizada
                </span>
                <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                  Mudar Cor do Aplicativo
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickColorModalOpen(false)}
                className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Ao escolher uma nova cor, todo o aplicativo — incluindo botões, abas, gráficos, anilhas do logotipo e músculos destacados — muda instantaneamente:
            </p>

            <AppColorPicker
              currentAccent={state.profile.accentColor || 'orange'}
              onSelectAccent={(accentColor) => updateProfile({ accentColor })}
            />

            <button
              type="button"
              onClick={() => setIsQuickColorModalOpen(false)}
              className="w-full min-h-[46px] rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-colors"
            >
              Concluído
            </button>
          </div>
        </div>
      )}

      {/* Workout Completion Fireworks & Congratulations Celebration Modal */}
      <WorkoutCelebrationModal
        session={celebratingSession}
        userName={state.profile.name}
        weightUnit={state.profile.weightUnit}
        soundEnabled={state.profile.soundEnabled}
        vibrationEnabled={state.profile.vibrationEnabled}
        onClose={() => setCelebratingSession(null)}
      />
    </div>
  );
}
