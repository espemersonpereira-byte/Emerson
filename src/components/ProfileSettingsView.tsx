import React, { useRef, useState } from 'react';
import {
  AlertCircle,
  Bell,
  Camera,
  Check,
  Download,
  HelpCircle,
  Image as ImageIcon,
  Info,
  Layers,
  Monitor,
  Moon,
  Plus,
  RefreshCw,
  Ruler,
  Shield,
  Sliders,
  Sun,
  Trash2,
  Upload,
  User,
  Volume2,
  X,
  Zap,
} from 'lucide-react';
import {
  BodyMeasurementEntry,
  IronLogBackupFile,
  IronLogState,
  ProgressPhoto,
  ThemeMode,
  UserProfile,
} from '../types';
import {
  formatDateBR,
  playTimerAlert,
  validateBackupFile,
} from '../utils/workoutHelpers';
import { PWAInstallButton } from './PWAInstallBanner';
import { AppColorPicker } from './AppColorPicker';
import { compressImageFile } from '../utils/storageEngine';

interface ProfileSettingsViewProps {
  state: IronLogState;
  onUpdateProfile: (partial: Partial<UserProfile>) => void;
  onAddMeasurement: (entry: BodyMeasurementEntry) => void;
  onDeleteMeasurement: (id: string) => void;
  onAddPhoto: (photo: ProgressPhoto) => void;
  onDeletePhoto: (id: string) => void;
  onRestoreBackup: (backup: IronLogBackupFile, mode: 'replace' | 'merge') => void;
  onResetAllData: () => void;
  onOpenAvatarLightbox: () => void;
}

export const ProfileSettingsView: React.FC<ProfileSettingsViewProps> = ({
  state,
  onUpdateProfile,
  onAddMeasurement,
  onDeleteMeasurement,
  onAddPhoto,
  onDeletePhoto,
  onRestoreBackup,
  onResetAllData,
  onOpenAvatarLightbox,
}) => {
  const { profile, measurements, photos } = state;
  const [subTab, setSubTab] = useState<'profile' | 'measurements' | 'photos' | 'settings'>(
    'profile'
  );

  // Backup Export & Restore States (20.3)
  const [includeMediaInBackup, setIncludeMediaInBackup] = useState(true);
  const [backupSuccessMessage, setBackupSuccessMessage] = useState<string | null>(null);
  const [backupErrorMessage, setBackupErrorMessage] = useState<string | null>(null);
  const [pendingRestoreBackup, setPendingRestoreBackup] =
    useState<IronLogBackupFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Body Measurements Form State
  const [mDate, setMDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [mWeight, setMWeight] = useState<string>(String(profile.currentWeightKg || ''));
  const [mWaist, setMWaist] = useState<string>('');
  const [mAbdomen, setMAbdomen] = useState<string>('');
  const [mChest, setMChest] = useState<string>('');
  const [mHips, setMHips] = useState<string>('');
  const [mRightArm, setMRightArm] = useState<string>('');
  const [mLeftArm, setMLeftArm] = useState<string>('');
  const [mRightThigh, setMRightThigh] = useState<string>('');
  const [mLeftThigh, setMLeftThigh] = useState<string>('');
  const [mRightCalf, setMRightCalf] = useState<string>('');
  const [mLeftCalf, setMLeftCalf] = useState<string>('');

  // Progress Photos Compare State
  const [photoLabel, setPhotoLabel] = useState('Frente — Relaxado');
  const [comparePhotoIds, setComparePhotoIds] = useState<string[]>([]);

  // Reset confirmation
  const [confirmResetModal, setConfirmResetModal] = useState(false);

  const handleSaveMeasurement = (e: React.FormEvent) => {
    e.preventDefault();
    const num = (v: string) => (v.trim() !== '' ? Number(v) : undefined);
    const weightVal = num(mWeight);
    const entry: BodyMeasurementEntry = {
      id: `meas_${Date.now()}`,
      date: mDate || new Date().toISOString().split('T')[0],
      weightKg: weightVal,
      waistCm: num(mWaist),
      abdomenCm: num(mAbdomen),
      chestCm: num(mChest),
      hipsCm: num(mHips),
      rightArmCm: num(mRightArm),
      leftArmCm: num(mLeftArm),
      rightThighCm: num(mRightThigh),
      leftThighCm: num(mLeftThigh),
      rightCalfCm: num(mRightCalf),
      leftCalfCm: num(mLeftCalf),
    };
    onAddMeasurement(entry);
    if (weightVal && weightVal > 0) {
      onUpdateProfile({ currentWeightKg: weightVal });
    }
    setMWaist('');
    setMAbdomen('');
    setMChest('');
    setMHips('');
    setMRightArm('');
    setMLeftArm('');
    setMRightThigh('');
    setMLeftThigh('');
    setMRightCalf('');
    setMLeftCalf('');
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    try {
      const compressed = await compressImageFile(file, 960, 0.82);
      const newPhoto: ProgressPhoto = {
        id: `photo_${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        dataUrl: compressed,
        label: photoLabel || 'Evolução Corporal',
        weightKg: profile.currentWeightKg,
      };
      onAddPhoto(newPhoto);
    } catch {
      // Ignore error
    }
  };

  // =========================================================================
  // 20.3 — EXPORTAR BACKUP
  // =========================================================================
  const handleExportBackup = async () => {
    setBackupErrorMessage(null);
    setBackupSuccessMessage(null);

    const exportDate = new Date().toISOString().split('T')[0];
    const exportPayload: IronLogState = {
      ...state,
      photos: includeMediaInBackup ? state.photos : [],
      profile: {
        ...state.profile,
        reminders: {
          ...state.profile.reminders,
          lastBackupDate: exportDate,
        },
      },
    };

    const backupFileObj: IronLogBackupFile = {
      app: 'IRONLOG',
      schemaVersion: '1.2.0',
      exportedAt: new Date().toISOString(),
      includesMedia: includeMediaInBackup,
      summary: {
        routinesCount: exportPayload.routines.length,
        customExercisesCount: exportPayload.customExercises.length,
        sessionsCount: exportPayload.sessions.length,
        measurementsCount: exportPayload.measurements.length,
        photosCount: exportPayload.photos.length,
      },
      data: exportPayload,
    };

    const jsonString = JSON.stringify(backupFileObj, null, 2);
    const fileName = `IRONLOG_BACKUP_${exportDate}.json`;
    const blob = new Blob([jsonString], { type: 'application/json' });

    // Try native Web Share API with file (iOS Safari -> Save to Files / iCloud Drive)
    try {
      const file = new File([blob], fileName, { type: 'application/json' });
      if (
        typeof navigator !== 'undefined' &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          title: `Backup IRONLOG (${exportDate})`,
          text: 'Arquivo de backup pessoal do aplicativo IRONLOG.',
          files: [file],
        });
        onUpdateProfile({
          reminders: { ...profile.reminders, lastBackupDate: exportDate },
        });
        setBackupSuccessMessage(
          `Backup ${fileName} compartilhado e validado com sucesso!`
        );
        return;
      }
    } catch {
      // Fallback to direct download if share sheet was dismissed or unsupported
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    onUpdateProfile({
      reminders: { ...profile.reminders, lastBackupDate: exportDate },
    });
    setBackupSuccessMessage(
      `Backup ${fileName} exportado com sucesso! Guarde-o no app Arquivos ou iCloud Drive.`
    );
  };

  // =========================================================================
  // 20.3 — RESTAURAR BACKUP (VALIDAÇÃO E PREVIEW)
  // =========================================================================
  const handleSelectBackupFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBackupErrorMessage(null);
    setBackupSuccessMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const check = validateBackupFile(parsed);
        if (!check.valid || !check.backup) {
          setBackupErrorMessage(
            check.error ||
              'Arquivo de backup inválido. Seus dados atuais permanecem intactos.'
          );
          return;
        }
        setPendingRestoreBackup(check.backup);
      } catch {
        setBackupErrorMessage(
          'O arquivo selecionado não é um JSON válido ou está corrompido. Seus dados atuais foram preservados.'
        );
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') {
          onUpdateProfile({
            reminders: { ...profile.reminders, enabled: true },
          });
        }
      } catch {
        // Fallback
      }
    }
    onUpdateProfile({
      reminders: { ...profile.reminders, enabled: !profile.reminders.enabled },
    });
  };

  return (
    <div className="space-y-5">
      {/* Header & Section Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
            Perfil, Medidas e Configurações
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Dados corporais, fotos privadas de evolução, aparência e sistema de backup completo
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-200/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar">
          {(
            [
              { id: 'profile', label: 'Perfil', icon: User },
              { id: 'measurements', label: 'Medidas', icon: Ruler },
              { id: 'photos', label: 'Fotos', icon: ImageIcon },
              { id: 'settings', label: 'Configurações & Backup', icon: Sliders },
            ] as const
          ).map((t) => {
            const Icon = t.icon;
            const active = subTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSubTab(t.id)}
                className={`min-h-[38px] px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                  active
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =====================================================================
          ABA 1: PERFIL DO USUÁRIO (SEÇÃO 12)
      ====================================================================== */}
      {subTab === 'profile' && (
        <div className="rounded-3xl bg-white dark:bg-[#13151B] border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onOpenAvatarLightbox}
              className="relative w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-orange-500 flex items-center justify-center cursor-pointer overflow-hidden shrink-0 group transition-all"
              title="Toque para expandir ou trocar foto de perfil"
            >
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <Camera className="w-7 h-7 text-orange-500" />
              )}
              <span className="absolute bottom-0 inset-x-0 bg-black/65 text-[9px] font-bold text-white py-0.5 text-center">
                Expandir
              </span>
            </button>

            <div className="flex-1">
              <div className="text-xs font-semibold text-orange-500">
                Início no IRONLOG: {formatDateBR(profile.startDate)}
              </div>
              <h2 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
                {profile.name || 'Atleta IRONLOG'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {profile.experienceLevel} · Meta: {profile.targetDaysPerWeek} dias/semana ·{' '}
                {profile.trainingLocation}
              </p>
              <button
                type="button"
                onClick={onOpenAvatarLightbox}
                className="mt-1.5 text-xs font-bold text-orange-500 hover:underline inline-flex items-center gap-1"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Ver foto ampliada / Trocar foto</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Nome</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => onUpdateProfile({ name: e.target.value })}
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Idade</label>
              <input
                type="number"
                value={profile.age || ''}
                onChange={(e) =>
                  onUpdateProfile({
                    age: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-mono-num"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Altura ({profile.lengthUnit})
              </label>
              <input
                type="number"
                value={profile.heightCm}
                onChange={(e) =>
                  onUpdateProfile({ heightCm: Number(e.target.value) || 0 })
                }
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-mono-num"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Peso Atual ({profile.weightUnit})
              </label>
              <input
                type="number"
                step="0.1"
                value={profile.currentWeightKg}
                onChange={(e) =>
                  onUpdateProfile({ currentWeightKg: Number(e.target.value) || 0 })
                }
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-mono-num"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Nível de Experiência
              </label>
              <select
                value={profile.experienceLevel}
                onChange={(e) =>
                  onUpdateProfile({
                    experienceLevel: e.target.value as UserProfile['experienceLevel'],
                  })
                }
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm"
              >
                <option value="Iniciante">Iniciante</option>
                <option value="Intermediário">Intermediário</option>
                <option value="Avançado">Avançado</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Objetivo Principal
              </label>
              <input
                type="text"
                value={profile.goals.join(', ')}
                onChange={(e) =>
                  onUpdateProfile({
                    goals: e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm"
              />
            </div>
          </div>

          {/* Quick App Color Customizer inside Profile Tab */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-orange-500">
                Cor Principal do Aplicativo
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Escolha a cor de destaque que personaliza todos os botões, gráficos, ícones e logotipo do IRONLOG:
              </p>
            </div>
            <AppColorPicker
              currentAccent={profile.accentColor || 'orange'}
              onSelectAccent={(accentColor) => onUpdateProfile({ accentColor })}
            />
          </div>
        </div>
      )}

      {/* =====================================================================
          ABA 2: REGISTRO E HISTÓRICO DE MEDIDAS CORPORAIS (SEÇÃO 12)
      ====================================================================== */}
      {subTab === 'measurements' && (
        <div className="space-y-5">
          <form
            onSubmit={handleSaveMeasurement}
            className="rounded-3xl bg-white dark:bg-[#13151B] border border-slate-200 dark:border-slate-800 p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Registrar Novas Medidas Corporais
              </h3>
              <input
                type="date"
                value={mDate}
                onChange={(e) => setMDate(e.target.value)}
                className="min-h-[38px] px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono-num"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: `Peso (${profile.weightUnit})`, val: mWeight, set: setMWeight },
                { label: `Peito (${profile.lengthUnit})`, val: mChest, set: setMChest },
                { label: `Cintura (${profile.lengthUnit})`, val: mWaist, set: setMWaist },
                { label: `Abdômen (${profile.lengthUnit})`, val: mAbdomen, set: setMAbdomen },
                { label: `Quadril (${profile.lengthUnit})`, val: mHips, set: setMHips },
                { label: `Braço Dir. (${profile.lengthUnit})`, val: mRightArm, set: setMRightArm },
                { label: `Braço Esq. (${profile.lengthUnit})`, val: mLeftArm, set: setMLeftArm },
                { label: `Coxa Dir. (${profile.lengthUnit})`, val: mRightThigh, set: setMRightThigh },
                { label: `Coxa Esq. (${profile.lengthUnit})`, val: mLeftThigh, set: setMLeftThigh },
                { label: `Panturrilha Dir.`, val: mRightCalf, set: setMRightCalf },
                { label: `Panturrilha Esq.`, val: mLeftCalf, set: setMLeftCalf },
              ].map((field, idx) => (
                <div key={idx}>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    {field.label}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={field.val}
                    onChange={(e) => field.set(e.target.value)}
                    placeholder="—"
                    className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono-num"
                  />
                </div>
              ))}
            </div>

            <button
              type="submit"
              className="min-h-[46px] px-5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Registro de Medidas</span>
            </button>
          </form>

          {/* Measurements History */}
          <div className="space-y-3">
            {measurements.map((m) => (
              <div
                key={m.id}
                className="rounded-3xl bg-white dark:bg-[#13151B] border border-slate-200 dark:border-slate-800 p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono-num font-bold text-orange-500">
                    {formatDateBR(m.date)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onDeleteMeasurement(m.id)}
                    className="min-h-[34px] min-w-[34px] text-slate-400 hover:text-rose-500 flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs font-mono-num text-slate-700 dark:text-slate-300">
                  {m.weightKg && <span>Peso: <strong>{m.weightKg} {profile.weightUnit}</strong></span>}
                  {m.chestCm && <span>Peito: <strong>{m.chestCm} {profile.lengthUnit}</strong></span>}
                  {m.waistCm && <span>Cintura: <strong>{m.waistCm} {profile.lengthUnit}</strong></span>}
                  {m.abdomenCm && <span>Abdômen: <strong>{m.abdomenCm} {profile.lengthUnit}</strong></span>}
                  {m.hipsCm && <span>Quadril: <strong>{m.hipsCm} {profile.lengthUnit}</strong></span>}
                  {m.rightArmCm && <span>Braço D: <strong>{m.rightArmCm} {profile.lengthUnit}</strong></span>}
                  {m.leftArmCm && <span>Braço E: <strong>{m.leftArmCm} {profile.lengthUnit}</strong></span>}
                  {m.rightThighCm && <span>Coxa D: <strong>{m.rightThighCm} {profile.lengthUnit}</strong></span>}
                  {m.leftThighCm && <span>Coxa E: <strong>{m.leftThighCm} {profile.lengthUnit}</strong></span>}
                  {m.rightCalfCm && <span>Pant. D: <strong>{m.rightCalfCm} {profile.lengthUnit}</strong></span>}
                  {m.leftCalfCm && <span>Pant. E: <strong>{m.leftCalfCm} {profile.lengthUnit}</strong></span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          ABA 3: FOTOS PRIVADAS DE EVOLUÇÃO CORPORAL E COMPARAÇÃO (SEÇÃO 12)
      ====================================================================== */}
      {subTab === 'photos' && (
        <div className="space-y-5">
          <div className="rounded-3xl bg-white dark:bg-[#13151B] border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Galeria Privada de Evolução Corporal
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Suas fotos ficam salvas exclusivamente no seu dispositivo e nunca são compartilhadas.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={photoLabel}
                  onChange={(e) => setPhotoLabel(e.target.value)}
                  placeholder="Pose (ex: Frente, Costas)"
                  className="min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                />
                <label className="min-h-[42px] px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0">
                  <Plus className="w-4 h-4" />
                  <span>Anexar Foto</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Side-by-Side Photo Comparison View when 2 photos selected */}
            {comparePhotoIds.length === 2 && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-orange-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-500">
                    Comparação Lado a Lado
                  </span>
                  <button
                    type="button"
                    onClick={() => setComparePhotoIds([])}
                    className="text-xs text-slate-500 hover:text-white"
                  >
                    Limpar seleção
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {comparePhotoIds.map((pid) => {
                    const p = photos.find((x) => x.id === pid);
                    if (!p) return null;
                    return (
                      <div key={p.id} className="space-y-1.5">
                        <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                          <img
                            src={p.dataUrl}
                            alt={p.label}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="text-xs font-mono-num font-bold text-center">
                          {formatDateBR(p.date)} · {p.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {photos.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-8 text-center">
                Nenhuma foto de evolução anexada ainda. Selecione duas fotos quando desejar comparar sua evolução entre datas.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                {photos.map((p) => {
                  const isSelectedForCompare = comparePhotoIds.includes(p.id);
                  return (
                    <div
                      key={p.id}
                      className={`rounded-2xl overflow-hidden border bg-slate-50 dark:bg-slate-900 flex flex-col justify-between ${
                        isSelectedForCompare
                          ? 'border-orange-500 ring-2 ring-orange-500/30'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="aspect-[3/4] bg-slate-950 overflow-hidden relative">
                        <img
                          src={p.dataUrl}
                          alt={p.label}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-2.5 space-y-2">
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {p.label}
                          </div>
                          <div className="text-[11px] font-mono-num text-slate-500">
                            {formatDateBR(p.date)}
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              if (isSelectedForCompare) {
                                setComparePhotoIds(
                                  comparePhotoIds.filter((id) => id !== p.id)
                                );
                              } else if (comparePhotoIds.length < 2) {
                                setComparePhotoIds([...comparePhotoIds, p.id]);
                              } else {
                                setComparePhotoIds([comparePhotoIds[1], p.id]);
                              }
                            }}
                            className={`flex-1 min-h-[32px] rounded-lg text-[11px] font-semibold ${
                              isSelectedForCompare
                                ? 'bg-orange-500 text-white'
                                : 'bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {isSelectedForCompare ? 'Selecionada' : 'Comparar'}
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeletePhoto(p.id)}
                            className="min-h-[32px] min-w-[32px] rounded-lg text-slate-400 hover:text-rose-500 flex items-center justify-center"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          ABA 4: CONFIGURAÇÕES COMPLETAS & BACKUP / RESTAURAÇÃO (SEÇÕES 14, 16 E 20.3)
      ====================================================================== */}
      {subTab === 'settings' && (
        <div className="space-y-5">
          {/* 20.3 — SISTEMA DE BACKUP, EXPORTAÇÃO E RESTAURAÇÃO */}
          <div className="rounded-3xl bg-white dark:bg-[#13151B] border-2 border-orange-500/40 p-5 sm:p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-orange-500">
                  Proteção e Portabilidade de Dados
                </span>
                <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
                  Backup, Exportação e Restauração
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  Gere um arquivo estruturado JSON com seu perfil, rotinas, exercícios personalizados, histórico completo de cargas, recordes e medidas para salvar no app Arquivos do iPhone ou iCloud Drive.
                </p>
              </div>
              {profile.reminders.lastBackupDate && (
                <span className="text-[11px] font-mono-num text-emerald-500 font-semibold shrink-0">
                  Último backup: {formatDateBR(profile.reminders.lastBackupDate)}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Incluir fotos de evolução no arquivo de backup ({photos.length} fotos)
              </span>
              <input
                type="checkbox"
                checked={includeMediaInBackup}
                onChange={(e) => setIncludeMediaInBackup(e.target.checked)}
                className="w-5 h-5 accent-orange-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleExportBackup}
                className="min-h-[50px] px-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
              >
                <Download className="w-4 h-4" />
                <span>EXPORTAR BACKUP</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="min-h-[50px] px-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:border-orange-500 text-slate-900 dark:text-white text-sm font-bold flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4 text-orange-500" />
                <span>RESTAURAR BACKUP</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleSelectBackupFile}
                className="hidden"
              />
            </div>

            {backupSuccessMessage && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{backupSuccessMessage}</span>
              </div>
            )}

            {backupErrorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{backupErrorMessage}</span>
              </div>
            )}
          </div>

          {/* Aparência, Unidades, Descanso e Modo Academia */}
          <div className="rounded-3xl bg-white dark:bg-[#13151B] border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Aparência, Unidades e Preferências de Treino
            </h3>

            {/* Theme Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2">
                Tema do aplicativo
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {(
                  [
                    { id: 'light', label: 'Modo Claro', icon: Sun },
                    { id: 'dark', label: 'Modo Escuro', icon: Moon },
                    { id: 'auto', label: 'Automático', icon: Monitor },
                  ] as { id: ThemeMode; label: string; icon: typeof Sun }[]
                ).map((t) => {
                  const Icon = t.icon;
                  const active = profile.theme === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => onUpdateProfile({ theme: t.id })}
                      className={`min-h-[46px] rounded-2xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                        active
                          ? 'border-orange-500 bg-orange-500 text-white'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* App Color Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2">
                Cor de destaque de todo o aplicativo
              </label>
              <AppColorPicker
                currentAccent={profile.accentColor || 'orange'}
                onSelectAccent={(accentColor) => onUpdateProfile({ accentColor })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  Unidade de peso
                </label>
                <select
                  value={profile.weightUnit}
                  onChange={(e) =>
                    onUpdateProfile({
                      weightUnit: e.target.value as UserProfile['weightUnit'],
                    })
                  }
                  className="w-full min-h-[44px] px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold"
                >
                  <option value="kg">Quilogramas (kg)</option>
                  <option value="lb">Libras (lb)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  Unidade de altura e medidas
                </label>
                <select
                  value={profile.lengthUnit}
                  onChange={(e) =>
                    onUpdateProfile({
                      lengthUnit: e.target.value as UserProfile['lengthUnit'],
                    })
                  }
                  className="w-full min-h-[44px] px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold"
                >
                  <option value="cm">Centímetros (cm)</option>
                  <option value="in">Polegadas (in)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  Tempo padrão de descanso
                </label>
                <select
                  value={profile.defaultRestSeconds}
                  onChange={(e) =>
                    onUpdateProfile({ defaultRestSeconds: Number(e.target.value) })
                  }
                  className="w-full min-h-[44px] px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono-num font-semibold"
                >
                  <option value={45}>45 segundos</option>
                  <option value={60}>60 segundos</option>
                  <option value={75}>75 segundos</option>
                  <option value={90}>90 segundos</option>
                  <option value={120}>120 segundos</option>
                  <option value={150}>150 segundos</option>
                  <option value={180}>180 segundos</option>
                </select>
              </div>
            </div>

            {/* Toggles: Modo Academia Padrão, Som, Vibração */}
            <div className="space-y-2.5 pt-2">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-orange-500 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      Iniciar treinos no Modo Academia por padrão
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Interface rápida com números grandes e conclusão de série com 1 toque
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={profile.defaultGymMode}
                  onChange={(e) =>
                    onUpdateProfile({ defaultGymMode: e.target.checked })
                  }
                  className="w-5 h-5 accent-orange-500"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Volume2 className="w-5 h-5 text-orange-500 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      Alerta sonoro e vibração no fim do descanso
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Sinal acústico sintetizado quando o cronômetro chega a zero
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => playTimerAlert(true, true)}
                    className="min-h-[34px] px-2.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-[11px] font-semibold"
                  >
                    Testar
                  </button>
                  <input
                    type="checkbox"
                    checked={profile.soundEnabled}
                    onChange={(e) =>
                      onUpdateProfile({
                        soundEnabled: e.target.checked,
                        vibrationEnabled: e.target.checked,
                      })
                    }
                    className="w-5 h-5 accent-orange-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notificações, Lembretes e Instalação PWA no iOS (Seções 16 & 17) */}
          <div className="rounded-3xl bg-white dark:bg-[#13151B] border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-orange-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Lembretes e Instalação no iPhone
                </h3>
              </div>
              <button
                type="button"
                onClick={requestNotificationPermission}
                className={`min-h-[38px] px-3.5 rounded-xl text-xs font-bold ${
                  profile.reminders.enabled
                    ? 'bg-emerald-500/15 text-emerald-500'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                }`}
              >
                {profile.reminders.enabled ? 'Lembretes Ativos' : 'Ativar Lembretes'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Horário habitual de treino
                </label>
                <input
                  type="time"
                  value={profile.reminders.workoutTime}
                  onChange={(e) =>
                    onUpdateProfile({
                      reminders: { ...profile.reminders, workoutTime: e.target.value },
                    })
                  }
                  className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono-num"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Alerta após dias sem treinar
                </label>
                <select
                  value={profile.reminders.inactivityReminderDays}
                  onChange={(e) =>
                    onUpdateProfile({
                      reminders: {
                        ...profile.reminders,
                        inactivityReminderDays: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                >
                  <option value={2}>Após 2 dias</option>
                  <option value={3}>Após 3 dias</option>
                  <option value={5}>Após 5 dias</option>
                </select>
              </div>
            </div>

            <PWAInstallButton />

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1.5 leading-relaxed">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                <Info className="w-4 h-4 text-orange-500" />
                <span>Compatibilidade iOS / Safari e Funcionamento Offline</span>
              </div>
              <p>
                • <strong>Cronômetro em segundo plano:</strong> O IRONLOG calcula o descanso por carimbo de horário real (timestamp), recuperando o segundo exato ao desbloquear o iPhone.
              </p>
              <p>
                • <strong>Notificações no iOS:</strong> No Safari do iPhone, alertas nativos exigem que o web app esteja adicionado à Tela de Início (iOS 16.4+) e com permissão concedida.
              </p>
              <p>
                • <strong>Privacidade 100% local:</strong> Nenhum dado pessoal, foto ou carga é enviado para servidores externos.
              </p>
            </div>
          </div>

          {/* Zona de Reinicialização com Confirmação */}
          <div className="rounded-3xl bg-white dark:bg-[#13151B] border border-rose-500/30 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-rose-500">
                Reinicializar Configurações e Dados
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Apaga os registros locais e restaura o aplicativo para o estado original de fábrica.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setConfirmResetModal(true)}
              className="min-h-[44px] px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-bold shrink-0"
            >
              Redefinir Aplicativo
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL DE INSPEÇÃO E RESTAURAÇÃO DE BACKUP (20.3)
      ====================================================================== */}
      {pendingRestoreBackup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#13151B] border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                Confirmar Restauração de Backup
              </h3>
              <button
                type="button"
                onClick={() => setPendingRestoreBackup(null)}
                className="min-h-[40px] min-w-[40px] flex items-center justify-center text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Data do backup:</span>
                <strong className="font-mono-num">
                  {formatDateBR(pendingRestoreBackup.exportedAt)}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Versão do arquivo:</span>
                <strong className="font-mono-num">
                  v{pendingRestoreBackup.schemaVersion}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Rotinas incluídas:</span>
                <strong className="font-mono-num">
                  {pendingRestoreBackup.data.routines.length}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Exercícios personalizados:</span>
                <strong className="font-mono-num">
                  {pendingRestoreBackup.data.customExercises.length}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sessões registradas:</span>
                <strong className="font-mono-num">
                  {pendingRestoreBackup.data.sessions.length}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mídias / Fotos incluídas:</span>
                <strong className="font-mono-num">
                  {pendingRestoreBackup.data.photos?.length || 0} fotos
                </strong>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Um backup de segurança automático do estado atual será salvo antes da operação. Escolha como deseja restaurar:
            </p>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  onRestoreBackup(pendingRestoreBackup, 'replace');
                  setPendingRestoreBackup(null);
                  setBackupSuccessMessage(
                    'Backup restaurado com sucesso (Substituição completa)!'
                  );
                }}
                className="w-full min-h-[48px] px-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>1. Substituir os dados atuais</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onRestoreBackup(pendingRestoreBackup, 'merge');
                  setPendingRestoreBackup(null);
                  setBackupSuccessMessage(
                    'Backup mesclado com sucesso sem duplicar registros!'
                  );
                }}
                className="w-full min-h-[48px] px-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold flex items-center justify-center gap-2"
              >
                <Layers className="w-4 h-4 text-orange-500" />
                <span>2. Mesclar com os dados atuais (Sem duplicar)</span>
              </button>

              <button
                type="button"
                onClick={() => setPendingRestoreBackup(null)}
                className="w-full min-h-[42px] rounded-xl text-xs font-semibold text-slate-500"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Reset Modal */}
      {confirmResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#13151B] border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="font-display text-2xl font-bold text-rose-500">
              Confirmar Redefinição Total?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Todos os treinos realizados, medidas e personalizações serão apagados. Recomendamos exportar um backup antes de continuar.
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmResetModal(false)}
                className="min-h-[44px] rounded-xl bg-slate-100 dark:bg-slate-900 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetAllData();
                  setConfirmResetModal(false);
                }}
                className="min-h-[44px] rounded-xl bg-rose-600 text-white text-xs font-bold"
              >
                Apagar e Reiniciar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
