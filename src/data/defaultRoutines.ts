import { Routine, RoutineExerciseItem } from '../types';
import { DEFAULT_EXERCISES } from './exercises';

function createRoutineExercise(
  exerciseId: string,
  index: number,
  options?: {
    isSelectableSlot?: boolean;
    slotLabel?: string;
    customSetsCount?: number;
  }
): RoutineExerciseItem {
  const ex = DEFAULT_EXERCISES.find((e) => e.id === exerciseId) || DEFAULT_EXERCISES[0];
  const setsCount = options?.customSetsCount ?? 2; // Section 6: duas séries válidas por exercício
  const sets = Array.from({ length: setsCount }, (_, i) => ({
    id: `${exerciseId}_set_${index}_${i + 1}`,
    type: 'valid' as const,
    minReps: ex.defaultMinReps,
    maxReps: ex.defaultMaxReps,
    targetWeight: ex.defaultWeight,
    restSeconds: ex.defaultRestSeconds,
    technique: 'Normal',
    rpeTarget: 8,
  }));

  return {
    id: `re_${exerciseId}_${index}`,
    exerciseId: ex.id,
    sets,
    restSeconds: ex.defaultRestSeconds,
    notes: '',
    technique: 'Cadência controlada',
    rpeTarget: 8,
    isSelectableSlot: options?.isSelectableSlot,
    slotLabel: options?.slotLabel,
    slotCategory: options?.isSelectableSlot ? 'Abdômen' : undefined,
  };
}

export function getInitialRoutines(): Routine[] {
  return [
    {
      id: 'routine_mon_chest_triceps',
      name: 'PEITO + TRÍCEPS',
      subtitle: 'Segunda-feira',
      description: 'Foco em peitoral completo (superior, médio e inferior) e tríceps braquial com 2 séries válidas de alta intensidade.',
      daysOfWeek: [1],
      estimatedMinutes: 55,
      isDefault: true,
      exercises: [
        createRoutineExercise('peck_deck', 1),
        createRoutineExercise('incline_bench_press', 2),
        createRoutineExercise('flat_bench_press', 3),
        createRoutineExercise('high_cable_crossover', 4),
        createRoutineExercise('low_cable_crossover', 5),
        createRoutineExercise('french_press', 6),
        createRoutineExercise('triceps_pushdown', 7),
      ],
    },
    {
      id: 'routine_tue_quads_calves',
      name: 'QUADRÍCEPS + PANTURRILHA',
      subtitle: 'Terça-feira',
      description: 'Treino estruturado para volume e força de quadríceps, abdução de quadril, panturrilhas e condicionamento em bicicleta.',
      daysOfWeek: [2],
      estimatedMinutes: 65,
      isDefault: true,
      exercises: [
        createRoutineExercise('leg_extension', 1),
        createRoutineExercise('leg_press_45', 2),
        createRoutineExercise('squat', 3),
        createRoutineExercise('hip_abduction', 4),
        createRoutineExercise('seated_calf_raise', 5),
        createRoutineExercise('stationary_bike', 6),
      ],
    },
    {
      id: 'routine_wed_back_biceps_shoulder',
      name: 'COSTAS + BÍCEPS + OMBRO',
      subtitle: 'Quarta-feira',
      description: 'Trações verticais e horizontais para expansão e densidade dorsal, seguidas de bíceps e deltoide lateral.',
      daysOfWeek: [3],
      estimatedMinutes: 55,
      isDefault: true,
      exercises: [
        createRoutineExercise('lat_pulldown', 1),
        createRoutineExercise('seated_cable_row', 2),
        createRoutineExercise('t_bar_row', 3),
        createRoutineExercise('hammer_curl', 4),
        createRoutineExercise('ez_bar_curl', 5),
        createRoutineExercise('lateral_raise', 6),
      ],
    },
    {
      id: 'routine_thu_rest',
      name: 'DESCANSO E RECUPERAÇÃO',
      subtitle: 'Quinta-feira',
      description: 'Dia programado para recuperação muscular e do sistema nervoso central, mobilidade leve ou caminhada regenerativa.',
      daysOfWeek: [4],
      isRestDay: true,
      estimatedMinutes: 20,
      isDefault: true,
      exercises: [],
    },
    {
      id: 'routine_fri_shoulders_abs',
      name: 'OMBROS + ABDÔMEN',
      subtitle: 'Sexta-feira',
      description: 'Desenvolvimento completo das três porções do deltoide combinado com fortalecimento dinâmico e isométrico do core.',
      daysOfWeek: [5],
      estimatedMinutes: 50,
      isDefault: true,
      exercises: [
        createRoutineExercise('shoulder_press', 1),
        createRoutineExercise('front_raise', 2),
        createRoutineExercise('lateral_raise', 3),
        createRoutineExercise('reverse_pec_deck', 4),
        createRoutineExercise('abs_crunch', 5, {
          isSelectableSlot: true,
          slotLabel: 'Exercício abdominal 1 — selecionável',
        }),
        createRoutineExercise('abs_leg_raise', 6, {
          isSelectableSlot: true,
          slotLabel: 'Exercício abdominal 2 — selecionável',
        }),
        createRoutineExercise('plank', 7),
      ],
    },
    {
      id: 'routine_sat_hamstrings_glutes',
      name: 'POSTERIOR DE COXA + GLÚTEOS',
      subtitle: 'Sábado',
      description: 'Ênfase máxima na cadeia posterior, isquiotibiais e glúteos com exercícios multiarticulares e isolados.',
      daysOfWeek: [6],
      estimatedMinutes: 55,
      isDefault: true,
      exercises: [
        createRoutineExercise('seated_leg_curl', 1),
        createRoutineExercise('machine_squat', 2),
        createRoutineExercise('bulgarian_split_squat', 3),
        createRoutineExercise('hip_abduction', 4),
        createRoutineExercise('lying_leg_curl', 5),
        createRoutineExercise('hip_thrust', 6),
      ],
    },
    {
      id: 'routine_sun_rest',
      name: 'DESCANSO SEMANAL',
      subtitle: 'Domingo',
      description: 'Fechamento da semana, revisão de cargas e organização da próxima semana de treinos.',
      daysOfWeek: [0],
      isRestDay: true,
      estimatedMinutes: 0,
      isDefault: true,
      exercises: [],
    },
  ];
}
