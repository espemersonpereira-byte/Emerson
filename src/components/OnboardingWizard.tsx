import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  Edit3,
  Sun,
  Moon,
  Monitor,
  Upload,
} from 'lucide-react';
import { EquipmentType, ThemeMode, UserProfile } from '../types';
import { EQUIPMENT_TYPES } from '../data/exercises';
import { IronLogLogo } from './IronLogLogo';
import { AppColorPicker } from './AppColorPicker';
import { ProfilePhotoLightboxModal } from './ProfilePhotoLightboxModal';

interface OnboardingWizardProps {
  profile: UserProfile;
  onUpdateProfile: (partial: Partial<UserProfile>) => void;
  onComplete: () => void;
  onOpenRestoreBackup: () => void;
}

const GOAL_OPTIONS = [
  'Emagrecer',
  'Ganhar massa muscular',
  'Ganhar força',
  'Recomposição corporal',
  'Melhorar o condicionamento físico',
  'Manter o peso e a saúde',
];

const WEEK_DAYS = [
  { day: 1, short: 'Seg', full: 'Segunda' },
  { day: 2, short: 'Ter', full: 'Terça' },
  { day: 3, short: 'Qua', full: 'Quarta' },
  { day: 4, short: 'Qui', full: 'Quinta' },
  { day: 5, short: 'Sex', full: 'Sexta' },
  { day: 6, short: 'Sáb', full: 'Sábado' },
  { day: 0, short: 'Dom', full: 'Domingo' },
];

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  profile,
  onUpdateProfile,
  onComplete,
  onOpenRestoreBackup,
}) => {
  const [step, setStep] = useState<number>(() => {
    try {
      const savedStep = Number(localStorage.getItem('ironlog_onboarding_step_v1'));
      if (savedStep >= 1 && savedStep <= 6) return savedStep;
    } catch {
      // Ignore
    }
    return 1;
  });
  const [showCustomGoal, setShowCustomGoal] = useState<boolean>(Boolean(profile.customGoal));
  const [isAvatarLightboxOpen, setIsAvatarLightboxOpen] = useState<boolean>(false);

  const changeStep = (nextStep: number) => {
    const clamped = Math.min(6, Math.max(1, nextStep));
    setStep(clamped);
    try {
      localStorage.setItem('ironlog_onboarding_step_v1', String(clamped));
    } catch {
      // Ignore
    }
    onUpdateProfile({});
  };

  const toggleGoal = (goal: string) => {
    const exists = profile.goals.includes(goal);
    const next = exists
      ? profile.goals.filter((g) => g !== goal)
      : [...profile.goals, goal];
    onUpdateProfile({ goals: next });
  };

  const toggleDay = (day: number) => {
    const exists = profile.preferredDays.includes(day);
    const next = exists
      ? profile.preferredDays.filter((d) => d !== day)
      : [...profile.preferredDays, day];
    onUpdateProfile({
      preferredDays: next,
      targetDaysPerWeek: next.length || profile.targetDaysPerWeek,
    });
  };

  const toggleEquipment = (eq: EquipmentType) => {
    const exists = profile.availableEquipment.includes(eq);
    const next = exists
      ? profile.availableEquipment.filter((item) => item !== eq)
      : [...profile.availableEquipment, eq];
    onUpdateProfile({ availableEquipment: next });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A0B0E] text-slate-900 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-6 pt-safe pb-safe">
      {/* Top Progress Bar */}
      <div className="w-full max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => changeStep(step - 1)}
              className="min-h-[44px] px-3 -ml-2 rounded-xl flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>
          ) : (
            <div className="h-[44px]" />
          )}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono-num text-slate-500 dark:text-slate-400">
              Etapa {step} de 6
            </span>
            <button
              type="button"
              onClick={() => {
                try {
                  localStorage.removeItem('ironlog_onboarding_step_v1');
                } catch {
                  // Ignore
                }
                onComplete();
              }}
              className="text-xs font-bold text-orange-500 hover:underline"
            >
              Pular e entrar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-6 gap-1.5 mb-6">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-colors ${
                idx <= step ? 'bg-orange-500' : 'bg-slate-200 dark:bg-slate-800'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Step Content */}
      <div className="w-full max-w-xl mx-auto flex-1 flex flex-col justify-center py-2">
        {step === 1 && (
          <div className="text-center space-y-6 py-8">
            <div className="flex flex-col items-center gap-4">
              <IronLogLogo size="xl" showText={false} />
              <h1 className="font-display text-5xl font-bold tracking-wider text-slate-900 dark:text-white">
                IRON<span className="text-orange-500">LOG</span>
              </h1>
            </div>

            <div className="space-y-3 max-w-md mx-auto">
              <p className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                “Seu treino. Sua evolução. Seu ritmo.”
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Aplicativo pessoal de musculação com controle preciso de séries, sugestão inteligente da última carga, biblioteca biomecânica e privacidade total no seu dispositivo.
              </p>
            </div>

            <div className="pt-4 space-y-3 max-w-sm mx-auto">
              <button
                type="button"
                onClick={() => changeStep(2)}
                className="w-full min-h-[52px] rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-base shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-colors"
              >
                <span>COMEÇAR</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={onOpenRestoreBackup}
                className="w-full min-h-[48px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#13151B] hover:border-orange-500/50 text-slate-700 dark:text-slate-300 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Upload className="w-4 h-4 text-orange-500" />
                <span>Restaurar de um Backup existente</span>
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
                Cadastro Pessoal
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Personalize seu perfil. Todos os campos opcionais podem ser ajustados a qualquer momento.
              </p>
            </div>

            <div className="rounded-3xl bg-white dark:bg-[#13151B] border border-slate-200 dark:border-slate-800 p-5 space-y-4">
              {/* Avatar + Nome */}
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setIsAvatarLightboxOpen(true)}
                  className="relative w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-orange-500 flex items-center justify-center cursor-pointer overflow-hidden shrink-0 transition-all"
                  title="Toque para expandir ou escolher foto de perfil"
                >
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt="Foto de perfil"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera className="w-6 h-6 text-orange-500" />
                  )}
                </button>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Seu nome ou apelido
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => onUpdateProfile({ name: e.target.value })}
                    placeholder="Ex: Alex"
                    className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Idade / Altura / Peso */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Idade
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={110}
                    value={profile.age || ''}
                    onChange={(e) =>
                      onUpdateProfile({ age: e.target.value ? Number(e.target.value) : undefined })
                    }
                    placeholder="28"
                    className="w-full min-h-[44px] px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-mono-num text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Altura (cm)
                  </label>
                  <input
                    type="number"
                    min={100}
                    max={250}
                    value={profile.heightCm || ''}
                    onChange={(e) =>
                      onUpdateProfile({ heightCm: Number(e.target.value) || 0 })
                    }
                    placeholder="175"
                    className="w-full min-h-[44px] px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-mono-num text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Peso ({profile.weightUnit})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min={30}
                    max={350}
                    value={profile.currentWeightKg || ''}
                    onChange={(e) =>
                      onUpdateProfile({ currentWeightKg: Number(e.target.value) || 0 })
                    }
                    placeholder="76.5"
                    className="w-full min-h-[44px] px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-mono-num text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Unidade de peso & Sexo biológico opcional */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                    Unidade de peso
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-900">
                    {(['kg', 'lb'] as const).map((u) => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => onUpdateProfile({ weightUnit: u })}
                        className={`min-h-[40px] rounded-lg text-xs font-semibold transition-colors ${
                          profile.weightUnit === u
                            ? 'bg-orange-500 text-white shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {u === 'kg' ? 'Quilogramas (kg)' : 'Libras (lb)'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                    Sexo biológico (opcional)
                  </label>
                  <select
                    value={profile.biologicalSex || ''}
                    onChange={(e) =>
                      onUpdateProfile({
                        biologicalSex: e.target.value as UserProfile['biologicalSex'],
                      })
                    }
                    className="w-full min-h-[44px] px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="">Prefiro não informar</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
                Qual é o seu objetivo?
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Você pode selecionar mais de um objetivo principal para acompanhar sua evolução.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {GOAL_OPTIONS.map((goal) => {
                const selected = profile.goals.includes(goal);
                return (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => toggleGoal(goal)}
                    className={`min-h-[52px] px-4 py-3 rounded-2xl border text-left flex items-center justify-between transition-colors ${
                      selected
                        ? 'border-orange-500 bg-orange-500/10 text-slate-900 dark:text-white font-semibold'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#13151B] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <span className="text-sm">{goal}</span>
                    {selected && <Check className="w-4 h-4 text-orange-500 shrink-0" />}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setShowCustomGoal((prev) => !prev)}
                className={`min-h-[52px] px-4 py-3 rounded-2xl border text-left flex items-center justify-between transition-colors sm:col-span-2 ${
                  showCustomGoal || profile.customGoal
                    ? 'border-orange-500 bg-orange-500/10 text-slate-900 dark:text-white font-semibold'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#13151B] text-slate-700 dark:text-slate-300'
                }`}
              >
                <span className="text-sm">Objetivo personalizado</span>
                {(showCustomGoal || profile.customGoal) && (
                  <Check className="w-4 h-4 text-orange-500 shrink-0" />
                )}
              </button>
            </div>

            {showCustomGoal && (
              <div className="rounded-2xl bg-white dark:bg-[#13151B] border border-slate-200 dark:border-slate-800 p-4">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                  Descreva seu objetivo personalizado
                </label>
                <input
                  type="text"
                  value={profile.customGoal || ''}
                  onChange={(e) => onUpdateProfile({ customGoal: e.target.value })}
                  placeholder="Ex: Fortalecimento articular e hipertrofia de membros inferiores"
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                />
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
                Experiência de Treino
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Informe seu nível atual na musculação e sua frequência semanal planejada.
              </p>
            </div>

            <div className="space-y-2.5">
              {(
                [
                  {
                    level: 'Iniciante',
                    desc: 'Iniciando agora ou menos de 6 meses de treino consistente.',
                  },
                  {
                    level: 'Intermediário',
                    desc: 'De 6 meses a 2 anos de treino regular com domínio dos exercícios básicos.',
                  },
                  {
                    level: 'Avançado',
                    desc: 'Mais de 2 anos de treino estruturado com foco em progressão de cargas e volume.',
                  },
                ] as const
              ).map((item) => {
                const active = profile.experienceLevel === item.level;
                return (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => onUpdateProfile({ experienceLevel: item.level })}
                    className={`w-full p-4 rounded-2xl border text-left transition-colors flex items-center justify-between gap-3 ${
                      active
                        ? 'border-orange-500 bg-orange-500/10'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#13151B]'
                    }`}
                  >
                    <div>
                      <div className="text-base font-semibold text-slate-900 dark:text-white">
                        {item.level}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                        {item.desc}
                      </div>
                    </div>
                    {active && <Check className="w-5 h-5 text-orange-500 shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="rounded-3xl bg-white dark:bg-[#13151B] border border-slate-200 dark:border-slate-800 p-5">
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">
                Quantos dias por semana pretende treinar?
              </label>
              <div className="grid grid-cols-7 gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => onUpdateProfile({ targetDaysPerWeek: n })}
                    className={`min-h-[44px] rounded-xl font-mono-num text-sm font-bold transition-colors ${
                      profile.targetDaysPerWeek === n
                        ? 'bg-orange-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {n}d
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
                Preferências e Ambiente
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Configure seus dias habituais, local, equipamentos e aparência.
              </p>
            </div>

            <div className="rounded-3xl bg-white dark:bg-[#13151B] border border-slate-200 dark:border-slate-800 p-5 space-y-4">
              {/* Dias habituais */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Dias habituais de treino
                </label>
                <div className="grid grid-cols-7 gap-1.5">
                  {WEEK_DAYS.map((d) => {
                    const active = profile.preferredDays.includes(d.day);
                    return (
                      <button
                        key={d.day}
                        type="button"
                        onClick={() => toggleDay(d.day)}
                        className={`min-h-[44px] rounded-xl text-xs font-semibold transition-colors ${
                          active
                            ? 'bg-orange-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {d.short}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Duração e Local */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Duração aproximada
                  </label>
                  <select
                    value={profile.estimatedSessionMinutes}
                    onChange={(e) =>
                      onUpdateProfile({ estimatedSessionMinutes: Number(e.target.value) })
                    }
                    className="w-full min-h-[44px] px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white"
                  >
                    <option value={30}>30 minutos</option>
                    <option value={45}>45 minutos</option>
                    <option value={60}>60 minutos</option>
                    <option value={75}>75 minutos</option>
                    <option value={90}>90 minutos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Local de treino
                  </label>
                  <select
                    value={profile.trainingLocation}
                    onChange={(e) =>
                      onUpdateProfile({
                        trainingLocation: e.target.value as UserProfile['trainingLocation'],
                      })
                    }
                    className="w-full min-h-[44px] px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white"
                  >
                    <option value="Academia">Academia</option>
                    <option value="Treino em casa">Treino em casa</option>
                    <option value="Ambos">Ambos</option>
                  </select>
                </div>
              </div>

              {/* Equipamentos disponíveis */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Equipamentos disponíveis
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {EQUIPMENT_TYPES.map((eq) => {
                    const active = profile.availableEquipment.includes(eq);
                    return (
                      <button
                        key={eq}
                        type="button"
                        onClick={() => toggleEquipment(eq)}
                        className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                          active
                            ? 'bg-orange-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {eq}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Aparência (Modo claro, escuro ou automático) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Aparência do aplicativo
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'light', label: 'Claro', icon: Sun },
                      { id: 'dark', label: 'Escuro', icon: Moon },
                      { id: 'auto', label: 'Automático', icon: Monitor },
                    ] as { id: ThemeMode; label: string; icon: typeof Sun }[]
                  ).map((item) => {
                    const Icon = item.icon;
                    const active = profile.theme === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onUpdateProfile({ theme: item.id })}
                        className={`min-h-[44px] rounded-xl border flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors ${
                          active
                            ? 'border-orange-500 bg-orange-500/10 text-orange-500'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cor do aplicativo */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Cor principal do aplicativo
                </label>
                <AppColorPicker
                  currentAccent={profile.accentColor || 'orange'}
                  onSelectAccent={(accentColor) => onUpdateProfile({ accentColor })}
                  compact
                />
              </div>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
                Resumo da Configuração
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Revise seus dados antes de acessar sua divisão semanal de treinos.
              </p>
            </div>

            <div className="rounded-3xl bg-white dark:bg-[#13151B] border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800/80">
              <div className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Perfil Pessoal</div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                    {profile.name || 'Atleta IRONLOG'} · {profile.heightCm} cm ·{' '}
                    {profile.currentWeightKg} {profile.weightUnit}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => changeStep(2)}
                  className="min-h-[40px] px-3 rounded-xl text-xs font-medium text-orange-500 hover:bg-orange-500/10 flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>
              </div>

              <div className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Objetivos</div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                    {[...profile.goals, ...(profile.customGoal ? [profile.customGoal] : [])].join(
                      ' · '
                    ) || 'Ganhar massa muscular'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => changeStep(3)}
                  className="min-h-[40px] px-3 rounded-xl text-xs font-medium text-orange-500 hover:bg-orange-500/10 flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>
              </div>

              <div className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Experiência e Frequência
                  </div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                    {profile.experienceLevel} · {profile.targetDaysPerWeek} dias/semana
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => changeStep(4)}
                  className="min-h-[40px] px-3 rounded-xl text-xs font-medium text-orange-500 hover:bg-orange-500/10 flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>
              </div>

              <div className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Ambiente e Aparência
                  </div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                    {profile.trainingLocation} · ~{profile.estimatedSessionMinutes} min · Tema{' '}
                    {profile.theme === 'dark'
                      ? 'Escuro'
                      : profile.theme === 'light'
                      ? 'Claro'
                      : 'Automático'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => changeStep(5)}
                  className="min-h-[40px] px-3 rounded-xl text-xs font-medium text-orange-500 hover:bg-orange-500/10 flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Footer */}
      {step > 1 && (
        <div className="w-full max-w-xl mx-auto pt-4">
          {step < 6 ? (
            <button
              type="button"
              onClick={() => changeStep(step + 1)}
              className="w-full min-h-[52px] rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-base shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-colors"
            >
              <span>Continuar</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                try {
                  localStorage.removeItem('ironlog_onboarding_step_v1');
                } catch {
                  // Ignore
                }
                onComplete();
              }}
              className="w-full min-h-[54px] rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-base shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-colors"
            >
              <Check className="w-5 h-5" />
              <span>FINALIZAR CONFIGURAÇÃO</span>
            </button>
          )}
        </div>
      )}

      <ProfilePhotoLightboxModal
        isOpen={isAvatarLightboxOpen}
        profile={profile}
        onClose={() => setIsAvatarLightboxOpen(false)}
        onUpdateAvatar={(avatarUrl) => onUpdateProfile({ avatarUrl })}
      />
    </div>
  );
};
