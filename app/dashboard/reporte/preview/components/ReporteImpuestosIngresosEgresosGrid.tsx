'use client';

import { formatReporteCurrency } from './reporte-mensual-format';

export interface ImpuestosIngresosBlock {
  total: number;
  impuestoTrasladado: number;
  retencionesIva: number;
  retencionesIsr: number;
  totalLabel: string;
}

export interface ImpuestosEgresosBlock {
  total: number;
  ivaAcreditable: number;
  retencionesIva: number;
  retencionesIsr: number;
  totalLabel: string;
}

interface ReporteImpuestosIngresosEgresosGridProps {
  ingresos: ImpuestosIngresosBlock;
  egresos: ImpuestosEgresosBlock;
}

function MoneyRow({
  label,
  value,
  valueClassName = 'font-medium text-gray-900',
  wrapValue = false,
}: {
  label: string;
  value: number | null | undefined;
  valueClassName?: string;
  wrapValue?: boolean;
}) {
  const formatted = formatReporteCurrency(value ?? 0);
  return (
    <div className="flex justify-between gap-2 text-sm">
      <span className="text-gray-600">{label}</span>
      <span className={valueClassName}>{wrapValue ? `(${formatted})` : formatted}</span>
    </div>
  );
}

export function ReporteImpuestosIngresosEgresosGrid({
  ingresos,
  egresos,
}: ReporteImpuestosIngresosEgresosGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-md border border-gray-200 bg-white p-3">
        <p className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
          Ingresos
        </p>
        <div className="space-y-2">
          <MoneyRow label={ingresos.totalLabel} value={ingresos.total ?? 0} />
          <MoneyRow
            label="Impuesto trasladado"
            value={ingresos.impuestoTrasladado ?? 0}
          />
          <MoneyRow label="Retenciones IVA" value={ingresos.retencionesIva ?? 0} />
          <MoneyRow label="Retenciones ISR" value={ingresos.retencionesIsr ?? 0} />
        </div>
      </div>

      <div className="rounded-md border border-gray-200 bg-white p-3">
        <p className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
          Egresos
        </p>
        <div className="space-y-2">
          <MoneyRow
            label={egresos.totalLabel}
            value={egresos.total ?? 0}
            valueClassName="font-medium text-red-600"
            wrapValue
          />
          <MoneyRow label="IVA acreditable" value={egresos.ivaAcreditable ?? 0} />
          <MoneyRow label="Retenciones IVA" value={egresos.retencionesIva ?? 0} />
          <MoneyRow label="Retenciones ISR" value={egresos.retencionesIsr ?? 0} />
        </div>
      </div>
    </div>
  );
}
