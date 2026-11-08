'use client';

import { HelpCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { CsfPrefillBadge } from './CsfPrefillBadge';

interface CreateProfileIdentityFieldsProps {
  nombre: string;
  onNombreChange: (value: string) => void;
  rfc: string;
  onRfcChange: (value: string) => void;
  isNombreFromCsf?: boolean;
  isRfcFromCsf?: boolean;
}

export function CreateProfileIdentityFields({
  nombre,
  onNombreChange,
  rfc,
  onRfcChange,
  isNombreFromCsf = false,
  isRfcFromCsf = false,
}: CreateProfileIdentityFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="nombre">Nombre o Razón Social</Label>
          {isNombreFromCsf && <CsfPrefillBadge />}
        </div>
        <Input
          id="nombre"
          type="text"
          placeholder="Ej. Juan Pérez o Empresa S. A. de C.V."
          value={nombre}
          onChange={(e) => onNombreChange(e.target.value)}
          required
          minLength={2}
          maxLength={255}
          className={cn(isNombreFromCsf && 'border-primary/40 ring-primary/20 ring-1')}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="rfc">RFC</Label>
            {isRfcFromCsf && <CsfPrefillBadge />}
          </div>
          <a
            href="https://www.sat.gob.mx/aplicacion/operacion/31274/consulta-tu-clave-de-rfc-con-la-curp"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary flex items-center gap-1 text-sm hover:underline"
          >
            <HelpCircle className="h-4 w-4" />
            ¿No sabes tu RFC?
          </a>
        </div>
        <Input
          id="rfc"
          type="text"
          placeholder="ABCD123456XYZ"
          value={rfc}
          onChange={(e) => onRfcChange(e.target.value.toUpperCase())}
          required
          minLength={12}
          maxLength={13}
          pattern="[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}"
          className={cn(isRfcFromCsf && 'border-primary/40 ring-primary/20 ring-1')}
        />
        <p className="text-muted-foreground text-xs">
          Introduce los 12 o 13 caracteres de tu homoclave.
        </p>
      </div>
    </>
  );
}
