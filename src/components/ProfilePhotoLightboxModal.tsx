import React, { useRef } from 'react';
import { Camera, Trash2, User, UserCheck, X } from 'lucide-react';
import { UserProfile } from '../types';
import { compressImageFile } from '../utils/storageEngine';

interface ProfilePhotoLightboxModalProps {
  isOpen: boolean;
  profile: UserProfile;
  onClose: () => void;
  onUpdateAvatar: (newAvatarUrl: string | undefined) => void;
  onGoToProfile?: () => void;
}

export const ProfilePhotoLightboxModal: React.FC<ProfilePhotoLightboxModalProps> = ({
  isOpen,
  profile,
  onClose,
  onUpdateAvatar,
  onGoToProfile,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    try {
      const compressedDataUrl = await compressImageFile(file, 512, 0.84);
      onUpdateAvatar(compressedDataUrl);
    } catch {
      // Ignore error
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-[#13151B] border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-500">
              Foto de Perfil
            </span>
            <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              {profile.name || 'Atleta IRONLOG'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
            aria-label="Fechar foto expandida"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Expanded Photo Frame */}
        <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-900 border-2 border-orange-500/40 shadow-xl flex items-center justify-center group">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.name || 'Foto de Perfil'}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 text-slate-400 p-6 text-center">
              <div className="w-24 h-24 rounded-full bg-orange-500/15 border border-orange-500/30 flex items-center justify-center">
                <User className="w-12 h-12 text-orange-500" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Nenhuma foto definida ainda. Toque abaixo para escolher uma foto da sua galeria ou câmera.
              </p>
            </div>
          )}

          {/* Subtle bottom badge */}
          <div className="absolute bottom-3 left-3 right-3 px-3.5 py-2 rounded-2xl bg-black/65 backdrop-blur-md text-white flex items-center justify-between text-xs">
            <span className="font-semibold truncate">
              {profile.experienceLevel} · {profile.currentWeightKg} {profile.weightUnit}
            </span>
            <span className="text-orange-400 font-bold shrink-0">
              {profile.targetDaysPerWeek}x/sem
            </span>
          </div>
        </div>

        {/* Actions inside Expanded Photo */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full min-h-[50px] rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-colors"
          >
            <Camera className="w-4 h-4" />
            <span>{profile.avatarUrl ? 'Trocar Foto de Perfil' : 'Escolher Foto de Perfil'}</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex items-center gap-2.5">
            {profile.avatarUrl && (
              <button
                type="button"
                onClick={() => onUpdateAvatar(undefined)}
                className="flex-1 min-h-[44px] rounded-2xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Remover Foto</span>
              </button>
            )}

            {onGoToProfile && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onGoToProfile();
                }}
                className="flex-1 min-h-[44px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 hover:border-orange-500 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <UserCheck className="w-4 h-4 text-orange-500" />
                <span>Editar Perfil</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
