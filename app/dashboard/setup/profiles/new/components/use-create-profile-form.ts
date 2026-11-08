'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { createProfileAction } from '../../../actions';
import { getRegimenesFiscalesClient } from '@/lib/api/sat.client';
import {
  canCreateProfile,
  getRemainingProfiles,
  getProfileLimit,
  getRecommendedUpgradePlan,
} from '@/lib/utils/subscription';
import type { ParsedCsfData } from '@/lib/csf';
import type { Plan, Subscription } from '@/lib/types/subscription';

const SETUP_PATH = '/dashboard/setup';

interface UseCreateProfileFormOptions {
  currentProfileCount: number;
  plan: Plan;
  subscription?: Subscription | null;
}

export interface CsfPrefillFlags {
  nombre: boolean;
  rfc: boolean;
  tipoPersona: boolean;
  regimenes: boolean;
}

export function useCreateProfileForm({
  currentProfileCount,
  plan,
  subscription,
}: UseCreateProfileFormOptions) {
  const router = useRouter();
  const [tipoPersona, setTipoPersona] = useState<'FISICA' | 'MORAL'>('FISICA');
  const [nombre, setNombreState] = useState('');
  const [rfc, setRfcState] = useState('');
  const [regimenesFiscales, setRegimenesFiscales] = useState<string[]>([]);
  const [regimenToAdd, setRegimenToAdd] = useState('');
  const [regimenesSinMatch, setRegimenesSinMatch] = useState<string[]>([]);
  const [csfPrefill, setCsfPrefill] = useState<CsfPrefillFlags | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: regimenesData, isLoading: isLoadingRegimenes } = useQuery({
    queryKey: ['regimenes-fiscales', tipoPersona],
    queryFn: () => getRegimenesFiscalesClient(tipoPersona),
  });

  const regimenesOptions = useMemo(() => regimenesData?.data ?? [], [regimenesData?.data]);
  const regimenesFiscalesSet = useMemo(() => new Set(regimenesFiscales), [regimenesFiscales]);
  const availableToAdd = useMemo(
    () => regimenesOptions.filter((r) => !regimenesFiscalesSet.has(r.clave)),
    [regimenesOptions, regimenesFiscalesSet]
  );

  const canCreate = canCreateProfile(currentProfileCount, plan, subscription);
  const remainingProfiles = getRemainingProfiles(currentProfileCount, plan, subscription);
  const limit = getProfileLimit(plan, subscription);
  const recommendedPlan = getRecommendedUpgradePlan(plan);

  const clearPrefillFlag = (flag: keyof CsfPrefillFlags) => {
    setCsfPrefill((prev) => (prev ? { ...prev, [flag]: false } : prev));
  };

  const setNombre = (value: string) => {
    setNombreState(value);
    clearPrefillFlag('nombre');
  };

  const setRfc = (value: string) => {
    setRfcState(value);
    clearPrefillFlag('rfc');
  };

  const handleAddRegimen = () => {
    if (regimenToAdd && !regimenesFiscales.includes(regimenToAdd)) {
      setRegimenesFiscales((prev) => [...prev, regimenToAdd].sort());
      setRegimenToAdd('');
      clearPrefillFlag('regimenes');
    }
  };

  const handleRemoveRegimen = (clave: string) => {
    setRegimenesFiscales((prev) => prev.filter((c) => c !== clave));
    clearPrefillFlag('regimenes');
  };

  const handleTipoPersonaChange = (nuevoTipo: 'FISICA' | 'MORAL') => {
    if (nuevoTipo === tipoPersona) return;
    setTipoPersona(nuevoTipo);
    setRegimenesFiscales([]);
    setRegimenToAdd('');
    setRegimenesSinMatch([]);
    setCsfPrefill((prev) =>
      prev ? { ...prev, tipoPersona: false, regimenes: false } : prev
    );
  };

  const applyCsfData = (data: ParsedCsfData) => {
    setError(null);
    setTipoPersona(data.tipoPersona);
    setNombreState(data.nombre);
    setRfcState(data.rfc.toUpperCase());
    setRegimenesFiscales([...data.regimenesFiscales].sort());
    setRegimenToAdd('');
    setRegimenesSinMatch([...data.regimenesSinMatch]);
    setCsfPrefill({
      nombre: true,
      rfc: true,
      tipoPersona: true,
      regimenes: data.regimenesFiscales.length > 0,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('nombre', nombre);
      formData.append('rfc', rfc.toUpperCase());
      formData.append('tipo_persona', tipoPersona);
      regimenesFiscales.forEach((clave) => formData.append('regimenes_fiscales', clave));

      const result = await createProfileAction(formData);

      if (result.error) {
        setError(result.error);
        setIsLoading(false);
        return;
      }

      router.push(SETUP_PATH);
    } catch {
      setError('Error al crear el perfil. Intenta nuevamente.');
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push(SETUP_PATH);
  };

  const isSubmitDisabled = isLoading || !nombre || !rfc || !canCreate;

  return {
    currentProfileCount,
    plan,
    subscription,
    tipoPersona,
    handleTipoPersonaChange,
    nombre,
    setNombre,
    rfc,
    setRfc,
    regimenesFiscales,
    regimenToAdd,
    setRegimenToAdd,
    handleAddRegimen,
    handleRemoveRegimen,
    regimenesOptions,
    availableToAdd,
    isLoadingRegimenes,
    regimenesSinMatch,
    csfPrefill,
    canCreate,
    remainingProfiles,
    limit,
    recommendedPlan,
    error,
    isLoading,
    handleSubmit,
    handleCancel,
    applyCsfData,
    isSubmitDisabled,
  };
}
