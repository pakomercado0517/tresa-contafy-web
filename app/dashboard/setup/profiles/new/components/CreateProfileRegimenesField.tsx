'use client';

import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { CsfPrefillBadge } from './CsfPrefillBadge';

interface RegimenCatalogItem {
  clave: string;
  descripcion: string;
}

interface CreateProfileRegimenesFieldProps {
  regimenesFiscales: string[];
  regimenToAdd: string;
  onRegimenToAddChange: (value: string) => void;
  onAddRegimen: () => void;
  onRemoveRegimen: (clave: string) => void;
  regimenesOptions: RegimenCatalogItem[];
  availableToAdd: RegimenCatalogItem[];
  isLoadingRegimenes: boolean;
  isFromCsf?: boolean;
  regimenesSinMatch?: string[];
}

export function CreateProfileRegimenesField({
  regimenesFiscales,
  regimenToAdd,
  onRegimenToAddChange,
  onAddRegimen,
  onRemoveRegimen,
  regimenesOptions,
  availableToAdd,
  isLoadingRegimenes,
  isFromCsf = false,
  regimenesSinMatch = [],
}: CreateProfileRegimenesFieldProps) {
  const regimenLabel =
    regimenesFiscales.length !== 1 ? 'Régimenes Fiscales' : 'Régimen Fiscal';

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label>{regimenLabel}</Label>
        {isFromCsf && <CsfPrefillBadge />}
      </div>
      <p className="text-muted-foreground text-xs">
        Selecciona los regímenes que aplican a este perfil. Puedes agregar varios.
      </p>
      <div className="flex gap-2">
        <Select
          value={regimenToAdd}
          onValueChange={onRegimenToAddChange}
          disabled={isLoadingRegimenes || availableToAdd.length === 0}
        >
          <SelectTrigger className="flex-1">
            <SelectValue
              placeholder={
                isLoadingRegimenes
                  ? 'Cargando regímenes...'
                  : availableToAdd.length === 0
                    ? 'Todos agregados'
                    : 'Agregar régimen...'
              }
            />
          </SelectTrigger>
          <SelectContent>
            {availableToAdd.map((item) => (
              <SelectItem key={item.clave} value={item.clave}>
                {item.clave} - {item.descripcion}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="button" variant="outline" onClick={onAddRegimen} disabled={!regimenToAdd}>
          Añadir
        </Button>
      </div>
      {regimenesFiscales.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {regimenesFiscales.map((clave) => {
            const item = regimenesOptions.find((r) => r.clave === clave);
            const label = item ? `${item.clave} - ${item.descripcion}` : clave;
            return (
              <span
                key={clave}
                className={cn(
                  'bg-primary/10 inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm',
                  isFromCsf && 'ring-primary/25 ring-1'
                )}
              >
                {label}
                <button
                  type="button"
                  onClick={() => onRemoveRegimen(clave)}
                  className="hover:bg-primary/20 ml-1 rounded p-0.5"
                  aria-label={`Quitar ${clave}`}
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      )}

      {regimenesSinMatch.length > 0 && (
        <div
          className="mt-2 rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-900 dark:text-amber-100"
          role="status"
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="space-y-1">
              <p className="font-medium">
                Detectamos régimen{regimenesSinMatch.length > 1 ? 'es' : ''} en la CSF que no
                reconocimos
              </p>
              <ul className="list-inside list-disc text-xs opacity-90">
                {regimenesSinMatch.map((description) => (
                  <li key={description}>{description}</li>
                ))}
              </ul>
              <p className="text-xs opacity-90">
                Agrégalos manualmente desde el catálogo si aplican a este perfil.
              </p>
            </div>
          </div>
        </div>
      )}

      {isLoadingRegimenes && (
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando catálogo de regímenes...
        </div>
      )}
    </div>
  );
}
