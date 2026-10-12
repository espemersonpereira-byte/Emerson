export type ThemeMode = 'light' | 'dark' | 'auto';
export type WeightUnit = 'kg' | 'lb';
export type LengthUnit = 'cm' | 'in';

export type MuscleGroup =
  | 'Peito'
  | 'Costas'
  | 'Ombros'
  | 'Bíceps'
  | 'Tríceps'
  | 'Quadríceps'
  | 'Posterior da coxa'
  | 'Glúteos'
  | 'Panturrilhas'
  | 'Abdômen'
  | 'Antebraços'
  | 'Cardio'
  | 'Corpo inteiro';

export type EquipmentType =
  | 'Máquinas'
  | 'Halteres'
  | 'Barras'
  | 'Polias'
  | 'Peso corporal'
  | 'Elásticos'
  | 'Equipamentos cardiovasculares';

export type ExerciseType = 'Composto' | 'Isolado' | 'Isométrico' | 'Cardio';

export type AnimationArchetype =
  | 'peck_deck'
  | 'incline_press'
  | 'flat_press'
  | 'cable_high'
  | 'cable_low'
  | 'french_press'
  | 'triceps_pushdown'
  | 'leg_extension'
  | 'leg_press'
  | 'squat'
  | 'abduction'
  | 'calf_raise'
  | 'bike'
  | 'lat_pulldown'
  | 'seated_row'
  | 't_bar_row'
  | 'curl_dumbbell'
  | 'curl_bar'
  | 'lateral_raise'
  | 'shoulder_press'
  | 'front_raise'
  | 'reverse_fly'
  | 'crunch'
  | 'leg_raise'
  | 'plank'
  | 'leg_curl_seated'
  | 'machine_squat'
  | 'bulgarian_squat'
  | 'leg_curl_lying'
  | 'hip_thrust'
  | 'deadlift'
  | 'pushup'
  | 'pullup'
  | 'dip'
  | 'lunge'
  | 'forearm_curl'
  | 'treadmill'
  | 'full_body';

export interface Exercise {
  id: string;
  name: string;
  primaryMuscle: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  equipment: EquipmentType;
  type: ExerciseType;
  metricMode: 'reps_weight' | 'duration_seconds' | 'duration_minutes';
  archetype: AnimationArchetype;
  description: string;
  initialPosition: string;
  stepByStep: string[];
  breathing: string;
  commonMistakes: string[];
  safetyTips: string[];
  defaultSets: number;
  defaultMinReps: number;
  defaultMaxReps: number;
  defaultWeight: number;
  defaultRestSeconds: number;
  notes?: string;
  mediaUrl?: string;
  isCustom?: boolean;
  isArchived?: boolean;
  /** If duplicated from another exercise and user opted to share history (20.1) */
  sharedHistoryExerciseId?: string;
}

export interface RoutineSetTemplate {
  id: string;
  type: 'warmup' | 'valid';
  minReps: number;
  maxReps: number;
  targetWeight: number;
  restSeconds: number;
  technique?: string;
  rpeTarget?: number;
  notes?: string;
}

export interface RoutineExerciseItem {
  id: string;
  exerciseId: string;
  sets: RoutineSetTemplate[];
  restSeconds: number;
  notes: string;
  technique?: string;
  rpeTarget?: number;
  /** For Friday selectable abs slots 1 & 2 */
  isSelectableSlot?: boolean;
  slotLabel?: string;
  slotCategory?: MuscleGroup;
}

export interface Routine {
  id: string;
  name: string;
  subtitle?: string;
  description: string;
  daysOfWeek: number[]; // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
  isRestDay?: boolean;
  estimatedMinutes: number;
  exercises: RoutineExerciseItem[];
  isDefault?: boolean;
}

export interface ActiveWorkoutSet {
  id: string;
  type: 'warmup' | 'valid';
  weight: number;
  reps: number;
  completed: boolean;
  completedAt?: string;
  suggestedWeight?: number;
  suggestedReps?: number;
  userEditedWeight?: boolean;
  userEditedReps?: boolean;
  rpe?: number;
}

export interface ActiveWorkoutExercise {
  id: string;
  exerciseId: string;
  sets: ActiveWorkoutSet[];
  restSeconds: number;
  notes: string;
  technique?: string;
  skipped?: boolean;
}

export interface RestTimerState {
  active: boolean;
  paused: boolean;
  targetEndTimestamp: number | null;
  remainingWhenPausedMs: number;
  totalDurationSeconds: number;
  exerciseId: string | null;
  exerciseName: string | null;
}

export interface ActiveWorkoutSession {
  id: string;
  routineId?: string;
  routineName: string;
  startedAt: string;
  currentExerciseIndex: number;
  exercises: ActiveWorkoutExercise[];
  notes: string;
  gymMode: boolean;
  restTimer: RestTimerState;
}

export interface PersonalRecordBadge {
  exerciseId: string;
  exerciseName: string;
  recordType: 'max_weight' | 'max_reps_at_weight' | 'max_set_volume' | 'max_session_volume';
  label: string;
  valueText: string;
  previousValueText?: string;
}

export interface CompletedWorkoutSession {
  id: string;
  routineId?: string;
  routineName: string;
  date: string; // YYYY-MM-DD
  startedAt: string;
  finishedAt: string;
  durationSeconds: number;
  exercises: ActiveWorkoutExercise[];
  totalValidSets: number;
  totalVolumeKg: number;
  notes: string;
  personalRecords: PersonalRecordBadge[];
  isRestLog?: boolean;
  restActivityType?: string;
}

export interface BodyMeasurementEntry {
  id: string;
  date: string; // YYYY-MM-DD
  weightKg?: number;
  waistCm?: number;
  abdomenCm?: number;
  chestCm?: number;
  hipsCm?: number;
  rightArmCm?: number;
  leftArmCm?: number;
  rightThighCm?: number;
  leftThighCm?: number;
  rightCalfCm?: number;
  leftCalfCm?: number;
  notes?: string;
}

export interface ProgressPhoto {
  id: string;
  date: string;
  dataUrl: string;
  label: string;
  weightKg?: number;
  notes?: string;
}

export interface ReminderSettings {
  enabled: boolean;
  workoutTime: string; // e.g. "18:30"
  inactivityReminderDays: number;
  weeklyMeasurementReminder: boolean;
  periodicBackupReminder: boolean;
  lastBackupDate?: string;
}

export interface UserProfile {
  onboardingCompleted: boolean;
  name: string;
  avatarUrl?: string;
  age?: number;
  birthDate?: string;
  heightCm: number;
  currentWeightKg: number;
  biologicalSex?: 'Masculino' | 'Feminino' | 'Prefiro não informar' | '';
  weightUnit: WeightUnit;
  lengthUnit: LengthUnit;
  goals: string[];
  customGoal?: string;
  experienceLevel: 'Iniciante' | 'Intermediário' | 'Avançado';
  targetDaysPerWeek: number;
  preferredDays: number[]; // [1,2,3,5,6]
  estimatedSessionMinutes: number;
  trainingLocation: 'Academia' | 'Treino em casa' | 'Ambos';
  availableEquipment: EquipmentType[];
  theme: ThemeMode;
  accentColor?: string;
  defaultRestSeconds: number;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  defaultGymMode: boolean;
  startDate: string;
  reminders: ReminderSettings;
}

export interface IronLogState {
  updatedAt?: number;
  profile: UserProfile;
  routines: Routine[];
  customExercises: Exercise[];
  favoriteExerciseIds: string[];
  sessions: CompletedWorkoutSession[];
  activeWorkout: ActiveWorkoutSession | null;
  measurements: BodyMeasurementEntry[];
  photos: ProgressPhoto[];
}

export interface IronLogBackupFile {
  app: 'IRONLOG';
  schemaVersion: string;
  exportedAt: string;
  includesMedia: boolean;
  summary: {
    routinesCount: number;
    customExercisesCount: number;
    sessionsCount: number;
    measurementsCount: number;
    photosCount: number;
  };
  data: IronLogState;
}
