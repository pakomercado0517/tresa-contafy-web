'use client';

import { BarChart3 } from 'lucide-react';
import type { ReporteMensualData } from './reporte-mensual-types';
import { formatReporteCurrency } from './reporte-mensual-format';
import { ReporteImpuestosIngresosEgresosGrid } from './ReporteImpuestosIngresosEgresosGrid';

interface ReporteMensualEstadoDevengadoSectionProps {
  data: Pick<
    ReporteMensualData,
    | 'ingresosDevengados'
    | 'egresosDevengados'
    | 'utilidadOperativa'
    | 'retencionesIva'
    | 'retencionesIsr'
    | 'impuestoTrasladado'
    | 'ivaAcreditable'
    | 'retencionesIvaEgresos'
    | 'retencionesIsrEgresos'
  >;
  margen: number;
}

export function ReporteMensualEstadoDevengadoSection({
  data,
  margen,
}: ReporteMensualEstadoDevengadoSectionProps) {
  return (
    <section className="px-6 pb-8">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-bold tracking-wide text-gray-700 uppercase">
          <BarChart3 className="h-4 w-4" />
          Estado de resultados (modelo devengado)
        </h3>
        <span className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
          Basado en fecha de emisión CFDI
        </span>
      </div>
      <div className="mt-4 space-y-3 rounded-lg border border-gray-200 bg-gray-50/50 p-4">
        <ReporteImpuestosIngresosEgresosGrid
          ingresos={{
            total: data.ingresosDevengados ?? 0,
            totalLabel: 'Ingresos devengados (ventas totales)',
            impuestoTrasladado: data.impuestoTrasladado ?? 0,
            retencionesIva: data.retencionesIva ?? 0,
            retencionesIsr: data.retencionesIsr ?? 0,
          }}
          egresos={{
            total: data.egresosDevengados ?? 0,
            totalLabel: 'Egresos devengados (costos y gastos)',
            ivaAcreditable: data.ivaAcreditable ?? 0,
            retencionesIva: data.retencionesIvaEgresos ?? 0,
            retencionesIsr: data.retencionesIsrEgresos ?? 0,
          }}
        />
        <div className="border-t border-gray-200 pt-3">
          <div className="flex justify-between">
            <span className="font-bold text-emerald-700">Utilidad operativa</span>
            <span className="text-xl font-bold text-emerald-700">
              {formatReporteCurrency(data.utilidadOperativa ?? 0)}
            </span>
          </div>
          <p className="mt-1 text-right text-sm text-gray-500">
            Margen de operación: {margen.toFixed(1)}%
          </p>
        </div>
      </div>
    </section>
  );
}
