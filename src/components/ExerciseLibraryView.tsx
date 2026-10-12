import React, { useState } from 'react';
import {
  ChevronRight,
  Heart,
  Plus,
  Search,
  X,
} from 'lucide-react';
import {
  AnimationArchetype,
  CompletedWorkoutSession,
  EquipmentType,
  Exercise,
  ExerciseType,
  MuscleGroup,
  Routine,
  WeightUnit,
} from '../types';
import { EQUIPMENT_TYPES, MUSCLE_GROUPS } from '../data/exercises';
import { ExerciseAnimator } from './ExerciseAnimator';
import { ExerciseDetailModal } from './ExerciseDetailModal';
import {
  getExerciseRecords,
  getLastSessionForExercise,
} from '../utils/workoutHelpers';

interface ExerciseLibraryViewProps {
  allExercises: Exercise[];
  favoriteIds: string[];
  routines: Routine[];
  sessions: CompletedWorkoutSession[];
  weightUnit: WeightUnit;
  onToggleFavorite: (exerciseId: string) => void;
  onSaveCustomExercise: (exercise: Exercise) => void;
  onDeleteOrArchiveCustomExercise: (exerciseId: string) => void;
  onAddExerciseToRoutine: (routineId: string, exerciseId: string) => void;
}

export const ExerciseLibraryView: React.FC<ExerciseLibraryViewProps> = ({
  allExercises,
  favoriteIds,
  routines,
  sessions,
  weightUnit,
  onToggleFavorite,
  onSaveCustomExercise,
  onDeleteOrArchiveCustomExercise,
  onAddExerciseToRoutine,
}) => {
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | 'Todos'>('Todos');
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentType | 'Todos'>('Todos');
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  const [detailExercise, setDetailExercise] = useState<Exercise | null>(null);

  // Create / Edit / Duplicate Modal state
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [shareHistoryWithSourceId, setShareHistoryWithSourceId] = useState<string | undefined>(
    undefined
  );

  // Form fields
  const [formName, setFormName] = useState('');
  const [formPrimary, setFormPrimary] = useState<MuscleGroup>('Peito');
  const [formSecondary, setFormSecondary] = useState<MuscleGroup[]>([]);
  const [formEquipment, setFormEquipment] = useState<EquipmentType>('Halteres');
  const [formType, setFormType] = useState<ExerciseType>('Composto');
  const [formMetricMode, setFormMetricMode] = useState<
    'reps_weight' | 'duration_seconds' | 'duration_minutes'
  >('reps_weight');
  const [formDescription, setFormDescription] = useState('');
  const [formInitialPosition, setFormInitialPosition] = useState('');
  const [formSteps, setFormSteps] = useState('');
  const [formBreathing, setFormBreathing] = useState('');
  const [formMistakes, setFormMistakes] = useState('');
  const [formSafety, setFormSafety] = useState('');
  const [formSets, setFormSets] = useState(2);
  const [formMinReps, setFormMinReps] = useState(8);
  const [formMaxReps, setFormMaxReps] = useState(12);
  const [formWeight, setFormWeight] = useState(20);
  const [formRest, setFormRest] = useState(90);
  const [formNotes, setFormNotes] = useState('');
  const [formMediaUrl, setFormMediaUrl] = useState('');

  const openCreateModal = () => {
    setEditingExercise(null);
    setShareHistoryWithSourceId(undefined);
    setFormName('');
    setFormPrimary('Peito');
    setFormSecondary([]);
    setFormEquipment('Halteres');
    setFormType('Composto');
    setFormMetricMode('reps_weight');
    setFormDescription('Exercício personalizado focado em controle motor e hipertrofia.');
    setFormInitialPosition('Posicione-se com estabilidade articular e coluna neutra.');
    setFormSteps('Execute a fase concêntrica com controle.\nSustente 1 segundo no pico de contração.\nRetorne devagar na fase excêntrica.');
    setFormBreathing('Expire durante o esforço e inspire no retorno.');
    setFormMistakes('Usar impulso excessivo do tronco.');
    setFormSafety('Respeite a amplitude articular confortável.');
    setFormSets(2);
    setFormMinReps(8);
    setFormMaxReps(12);
    setFormWeight(20);
    setFormRest(90);
    setFormNotes('');
    setFormMediaUrl('');
    setShowFormModal(true);
  };

  const openEditOrDuplicateModal = (ex: Exercise, duplicate: boolean) => {
    setEditingExercise(duplicate ? null : ex);
    setShareHistoryWithSourceId(duplicate ? ex.id : ex.sharedHistoryExerciseId);
    setFormName(duplicate ? `${ex.name} (Personalizado)` : ex.name);
    setFormPrimary(ex.primaryMuscle);
    setFormSecondary(ex.secondaryMuscles || []);
    setFormEquipment(ex.equipment);
    setFormType(ex.type);
    setFormMetricMode(ex.metricMode);
    setFormDescription(ex.description);
    setFormInitialPosition(ex.initialPosition);
    setFormSteps(ex.stepByStep.join('\n'));
    setFormBreathing(ex.breathing);
    setFormMistakes(ex.commonMistakes.join('\n'));
    setFormSafety(ex.safetyTips.join('\n'));
    setFormSets(ex.defaultSets);
    setFormMinReps(ex.defaultMinReps);
    setFormMaxReps(ex.defaultMaxReps);
    setFormWeight(ex.defaultWeight);
    setFormRest(ex.defaultRestSeconds);
    setFormNotes(ex.notes || '');
    setFormMediaUrl(ex.mediaUrl || '');
    setShowFormModal(true);
  };

  const inferArchetype = (muscle: MuscleGroup, equip: EquipmentType): AnimationArchetype => {
    if (muscle === 'Peito') return equip === 'Polias' ? 'cable_high' : 'flat_press';
    if (muscle === 'Costas') return equip === 'Polias' ? 'lat_pulldown' : 't_bar_row';
    if (muscle === 'Ombros') return 'shoulder_press';
    if (muscle === 'Bíceps') return 'curl_dumbbell';
    if (muscle === 'Tríceps') return 'triceps_pushdown';
    if (muscle === 'Quadríceps') return equip === 'Máquinas' ? 'leg_extension' : 'squat';
    if (muscle === 'Posterior da coxa') return 'leg_curl_seated';
    if (muscle === 'Glúteos') return 'hip_thrust';
    if (muscle === 'Panturrilhas') return 'calf_raise';
    if (muscle === 'Abdômen') return 'crunch';
    if (muscle === 'Cardio') return 'bike';
    return 'full_body';
  };

  const handleSaveExerciseForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const newEx: Exercise = {
      id: editingExercise ? editingExercise.id : `custom_ex_${Date.now()}`,
      name: formName.trim(),
      primaryMuscle: formPrimary,
      secondaryMuscles: formSecondary,
      equipment: formEquipment,
      type: formType,
      metricMode: formMetricMode,
      archetype: editingExercise
        ? editingExercise.archetype
        : inferArchetype(formPrimary, formEquipment),
      description: formDescription.trim() || 'Exercício personalizado.',
      initialPosition: formInitialPosition.trim() || 'Postura firme e alinhada.',
      stepByStep: formSteps
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      breathing: formBreathing.trim() || 'Expire na contração, inspire no retorno.',
      commonMistakes: formMistakes
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      safetyTips: formSafety
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      defaultSets: Math.max(1, Number(formSets) || 2),
      defaultMinReps: Math.max(1, Number(formMinReps) || 8),
      defaultMaxReps: Math.max(1, Number(formMaxReps) || 12),
      defaultWeight: Math.max(0, Number(formWeight) || 0),
      defaultRestSeconds: Math.max(15, Number(formRest) || 90),
      notes: formNotes.trim(),
      mediaUrl: formMediaUrl.trim(),
      isCustom: true,
      sharedHistoryExerciseId: shareHistoryWithSourceId,
    };

    onSaveCustomExercise(newEx);
    setShowFormModal(false);
    setDetailExercise(newEx);
  };

  const visibleExercises = allExercises
    .filter((e) => !e.isArchived)
    .filter((e) => {
      if (onlyFavorites && !favoriteIds.includes(e.id)) return false;
      if (selectedMuscle !== 'Todos' && e.primaryMuscle !== selectedMuscle) return false;
      if (selectedEquipment !== 'Todos' && e.equipment !== selectedEquipment) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = e.name.toLowerCase().includes(q);
        const matchMuscle = e.primaryMuscle.toLowerCase().includes(q);
        const matchEquip = e.equipment.toLowerCase().includes(q);
        return matchName || matchMuscle || matchEquip;
      }
      return true;
    });

  return (
    <div className="space-y-5">
      {/* Header & Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
            Biblioteca de Exercícios
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {visibleExercises.length} exercícios disponíveis com demonstração biomecânica e histórico individual
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="min-h-[44px] px-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-orange-500/20 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Exercício Personalizado</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="rounded-3xl bg-white dark:bg-[#13151B] border border-slate-200 dark:border-slate-800 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, músculo ou equipamento..."
              className="w-full min-h-[44px] pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
            />
          </div>
          <button
            type="button"
            onClick={() => setOnlyFavorites((prev) => !prev)}
            className={`min-h-[44px] px-3.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 ${
              onlyFavorites
                ? 'border-orange-500 bg-orange-500/15 text-orange-500'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Heart className={`w-4 h-4 ${onlyFavorites ? 'fill-orange-500 text-orange-500' : ''}`} />
            <span>Favoritos</span>
          </button>
        </div>

        {/* Muscle Filter Rail */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {(['Todos', ...MUSCLE_GROUPS] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setSelectedMuscle(m)}
              className={`min-h-[36px] px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                selectedMuscle === m
                  ? 'bg-orange-500 text-white font-semibold'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Equipment Filter Rail */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {(['Todos', ...EQUIPMENT_TYPES] as const).map((eq) => (
            <button
              key={eq}
              type="button"
              onClick={() => setSelectedEquipment(eq)}
              className={`min-h-[34px] px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                selectedEquipment === eq
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {eq}
            </button>
          ))}
        </div>
      </div>

      {/* Exercise Cards Grid (Hevy Visual Organization) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {visibleExercises.map((ex) => {
          const isFav = favoriteIds.includes(ex.id);
          const records = getExerciseRecords(ex.id, sessions, allExercises);
          const lastPerf = getLastSessionForExercise(ex.id, sessions, allExercises);
          return (
            <div
              key={ex.id}
              onClick={() => setDetailExercise(ex)}
              className="group rounded-3xl bg-white dark:bg-[#13151B] border border-slate-200 dark:border-slate-800 hover:border-orange-500/60 p-4 flex flex-col justify-between gap-3 cursor-pointer transition-colors"
            >
              <div className="flex items-start gap-3.5">
                <ExerciseAnimator
                  exercise={ex}
                  compact
                  className="w-20 h-20 rounded-2xl shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white truncate group-hover:text-orange-500 transition-colors">
                      {ex.name}
                    </h3>
                    <div className="flex items-center gap-0.5 -mr-1.5 -mt-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(ex.id);
                        }}
                        className="min-h-[34px] min-w-[34px] flex items-center justify-center rounded-xl text-slate-400 hover:text-orange-500"
                        title="Favoritar exercício"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            isFav ? 'fill-orange-500 text-orange-500' : ''
                          }`}
                        />
                      </button>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-orange-500 transition-colors" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    {ex.primaryMuscle}
                    {ex.secondaryMuscles.length > 0
                      ? ` (+${ex.secondaryMuscles.join(', ')})`
                      : ''}{' '}
                    · {ex.type} · {ex.equipment}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-1">
                    {ex.stepByStep[0] || ex.description}
                  </p>
                  <p className="text-xs font-mono-num text-slate-700 dark:text-slate-300 mt-1.5">
                    {ex.defaultSets} séries ·{' '}
                    {ex.metricMode === 'reps_weight'
                      ? `${ex.defaultMinReps}–${ex.defaultMaxReps} reps`
                      : `${ex.defaultMaxReps} ${
                          ex.metricMode === 'duration_seconds' ? 'seg' : 'min'
                        }`}{' '}
                    · {ex.defaultRestSeconds}s
                  </p>
                </div>
              </div>

              {(lastPerf || records.maxWeight) && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-mono-num text-slate-500 dark:text-slate-400">
                  {lastPerf ? (
                    <span>
                      Última:{' '}
                      <strong className="text-slate-800 dark:text-slate-200">
                        {lastPerf.maxWeightKg} {weightUnit}
                      </strong>
                    </span>
                  ) : (
                    <span>Sem treino recente</span>
                  )}
                  {records.maxWeight && (
                    <span className="text-orange-500 font-semibold">
                      PR: {records.maxWeight.weight} {weightUnit} ({records.maxWeight.reps}r)
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* =====================================================================
          TELA INDIVIDUAL DO EXERCÍCIO ESTILO HEVY (RESUMO / EVOLUÇÃO / HISTÓRICO / INSTRUÇÕES)
      ====================================================================== */}
      <ExerciseDetailModal
        exercise={detailExercise}
        allExercises={allExercises}
        sessions={sessions}
        routines={routines}
        favoriteIds={favoriteIds}
        weightUnit={weightUnit}
        onClose={() => setDetailExercise(null)}
        onToggleFavorite={onToggleFavorite}
        onEditExercise={(ex, duplicate) => openEditOrDuplicateModal(ex, duplicate)}
        onDeleteOrArchiveCustomExercise={onDeleteOrArchiveCustomExercise}
        onAddExerciseToRoutine={onAddExerciseToRoutine}
      />

      {/* =====================================================================
          MODAL DE CRIAÇÃO / EDIÇÃO / DUPLICAÇÃO DE EXERCÍCIO PERSONALIZADO (SEÇÃO 9 & 20.1)
      ====================================================================== */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveExerciseForm}
            className="w-full max-w-xl rounded-3xl bg-white dark:bg-[#13151B] border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-4 shadow-2xl my-auto max-h-[92vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                {editingExercise ? 'Editar Exercício' : 'Novo Exercício Personalizado'}
              </h3>
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Nome do Exercício *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ex: Supino articulado convergente"
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Grupo Muscular
                  </label>
                  <select
                    value={formPrimary}
                    onChange={(e) => setFormPrimary(e.target.value as MuscleGroup)}
                    className="w-full min-h-[44px] px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                  >
                    {MUSCLE_GROUPS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Equipamento
                  </label>
                  <select
                    value={formEquipment}
                    onChange={(e) => setFormEquipment(e.target.value as EquipmentType)}
                    className="w-full min-h-[44px] px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                  >
                    {EQUIPMENT_TYPES.map((eq) => (
                      <option key={eq} value={eq}>
                        {eq}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Tipo de Exercício
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as ExerciseType)}
                    className="w-full min-h-[44px] px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="Composto">Composto</option>
                    <option value="Isolado">Isolado</option>
                    <option value="Isométrico">Isométrico</option>
                    <option value="Cardio">Cardio</option>
                  </select>
                </div>
              </div>

              {/* Requisito 20.1 — Compartilhar ou não histórico do exercício original ao criar cópia */}
              {shareHistoryWithSourceId !== undefined && (
                <div className="p-3.5 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      Compartilhar histórico de cargas com o exercício original?
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-300">
                      Permite receber sugestões automáticas da última carga do exercício base.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(shareHistoryWithSourceId)}
                    onChange={(e) =>
                      setShareHistoryWithSourceId(
                        e.target.checked ? detailExercise?.id : undefined
                      )
                    }
                    className="w-5 h-5 accent-orange-500"
                  />
                </div>
              )}

              {/* Séries, Repetições, Carga e Descanso Padrão */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Séries Padrão
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={formSets}
                    onChange={(e) => setFormSets(Number(e.target.value))}
                    className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-mono-num"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Reps (Máx)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formMaxReps}
                    onChange={(e) => setFormMaxReps(Number(e.target.value))}
                    className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-mono-num"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Carga ({weightUnit})
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min={0}
                    value={formWeight}
                    onChange={(e) => setFormWeight(Number(e.target.value))}
                    className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-mono-num"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Descanso (seg)
                  </label>
                  <input
                    type="number"
                    min={15}
                    step={15}
                    value={formRest}
                    onChange={(e) => setFormRest(Number(e.target.value))}
                    className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-mono-num"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Descrição e Instruções de Execução
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Passo a passo (uma instrução por linha)
                </label>
                <textarea
                  rows={3}
                  value={formSteps}
                  onChange={(e) => setFormSteps(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Observações pessoais
                  </label>
                  <input
                    type="text"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Ajuste de banco, pegada..."
                    className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    URL de Imagem / Demonstração (opcional)
                  </label>
                  <input
                    type="url"
                    value={formMediaUrl}
                    onChange={(e) => setFormMediaUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="min-h-[44px] px-4 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="min-h-[44px] px-5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold"
              >
                Salvar Exercício
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
