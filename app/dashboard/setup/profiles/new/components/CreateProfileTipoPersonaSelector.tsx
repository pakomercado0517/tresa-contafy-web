'use client';

import { User, Building2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { CsfPrefillBadge } from './CsfPrefillBadge';

interface CreateProfileTipoPersonaSelectorProps {
  tipoPersona: 'FISICA' | 'MORAL';
  onChange: (tipo: 'FISICA' | 'MORAL') => void;
  isFromCsf?: boolean;
}

export function CreateProfileTipoPersonaSelector({
  tipoPersona,
  onChange,
  isFromCsf = false,
}: CreateProfileTipoPersonaSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Label>Tipo de Persona</Label>
        {isFromCsf && <CsfPrefillBadge />}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onChange('FISICA')}
          className={cn(
            'relative rounded-lg border-2 p-4 transition-all',
            tipoPersona === 'FISICA'
              ? 'border-primary bg-primary/5'
              : 'border-border bg-background hover:border-primary/50',
            isFromCsf && tipoPersona === 'FISICA' && 'ring-primary/20 ring-1'
          )}
        >
          <div className="flex flex-col items-center gap-2">
            <User className="h-6 w-6" />
            <span className="text-sm font-medium">Persona Física</span>
          </div>
          {tipoPersona === 'FISICA' && (
            <div className="bg-primary absolute top-2 right-2 h-2 w-2 rounded-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => onChange('MORAL')}
          className={cn(
            'relative rounded-lg border-2 p-4 transition-all',
            tipoPersona === 'MORAL'
              ? 'border-primary bg-primary/5'
              : 'border-border bg-background hover:border-primary/50',
            isFromCsf && tipoPersona === 'MORAL' && 'ring-primary/20 ring-1'
          )}
        >
          <div className="flex flex-col items-center gap-2">
            <Building2 className="h-6 w-6" />
            <span className="text-sm font-medium">Persona Moral</span>
          </div>
          {tipoPersona === 'MORAL' && (
            <div className="bg-primary absolute top-2 right-2 h-2 w-2 rounded-full" />
          )}
        </button>
      </div>
    </div>
  );
}
