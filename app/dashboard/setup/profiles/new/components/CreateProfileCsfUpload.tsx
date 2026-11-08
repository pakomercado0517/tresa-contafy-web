'use client';

import { useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, FileText, Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CsfParseError, parseCsfPdf, type ParsedCsfData } from '@/lib/csf';

interface CreateProfileCsfUploadProps {
  disabled?: boolean;
  onParsed: (data: ParsedCsfData) => void;
}

export function CreateProfileCsfUpload({ disabled = false, onParsed }: CreateProfileCsfUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [hasParsedSuccess, setHasParsedSuccess] = useState(false);

  const processFile = useCallback(
    async (file: File) => {
      setError(null);
      setHasParsedSuccess(false);
      setIsParsing(true);
      setFileName(file.name);

      try {
        const parsed = await parseCsfPdf(file);
        onParsed(parsed);
        setHasParsedSuccess(true);
        toast.success('Constancia leída', {
          description: 'Revisa los datos antes de crear el perfil.',
        });
      } catch (err) {
        setHasParsedSuccess(false);
        const message =
          err instanceof CsfParseError
            ? err.message
            : 'No se pudo leer la constancia. Intenta de nuevo o completa los datos manualmente.';
        setError(message);
        toast.error('No se pudo leer el PDF', { description: message });
      } finally {
        setIsParsing(false);
        if (inputRef.current) {
          inputRef.current.value = '';
        }
      }
    },
    [onParsed]
  );

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      if (disabled || isParsing) return;
      const file = Array.from(files)[0];
      if (!file) return;
      void processFile(file);
    },
    [disabled, isParsing, processFile]
  );

  return (
    <div className="border-border bg-muted/30 space-y-3 rounded-lg border border-dashed p-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-sm font-medium">Prefill desde Constancia de Situación Fiscal</h3>
          <p className="text-muted-foreground text-xs">
            Sube el PDF digital descargado del SAT (no foto ni escaneo). Los campos quedarán
            editables para que los revises.
          </p>
        </div>
        <Link
          href="/dashboard/certification"
          className="text-primary shrink-0 text-xs hover:underline"
        >
          ¿Cómo obtener tu CSF?
        </Link>
      </div>

      <div
        role="button"
        tabIndex={disabled || isParsing ? -1 : 0}
        aria-disabled={disabled || isParsing}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled && !isParsing) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => {
          if (!disabled && !isParsing) inputRef.current?.click();
        }}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled && !isParsing) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        className={cn(
          'border-border bg-background flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border px-4 py-6 text-center transition-colors',
          isDragging && 'border-primary bg-primary/5',
          (disabled || isParsing) && 'cursor-not-allowed opacity-60'
        )}
      >
        {isParsing ? (
          <>
            <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            <p className="text-sm font-medium">Leyendo constancia…</p>
            {fileName && <p className="text-muted-foreground text-xs">{fileName}</p>}
          </>
        ) : (
          <>
            <Upload className="text-muted-foreground h-8 w-8" />
            <p className="text-sm font-medium md:hidden">Selecciona el PDF de tu CSF</p>
            <p className="hidden text-sm font-medium md:block">
              Arrastra tu CSF aquí o selecciona el PDF
            </p>
            <p className="text-muted-foreground text-xs">Máximo 10 MB · solo .pdf</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || isParsing}
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
            >
              <FileText className="mr-2 h-4 w-4" />
              Seleccionar PDF
            </Button>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        disabled={disabled || isParsing}
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
        }}
      />

      {hasParsedSuccess && fileName && (
        <div
          className="border-primary/20 bg-primary/5 text-foreground flex items-start gap-2 rounded-md border p-3 text-sm"
          role="status"
        >
          <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">Datos cargados desde CSF — revisa el formulario</p>
            <p className="text-muted-foreground text-xs">{fileName}</p>
          </div>
        </div>
      )}

      {error && (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
