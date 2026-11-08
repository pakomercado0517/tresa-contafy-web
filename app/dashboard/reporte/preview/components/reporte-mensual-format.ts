export function formatReporteCurrency(amount: number | null | undefined): string {
  const safeAmount =
    typeof amount === 'number' && Number.isFinite(amount) ? amount : 0;
  return `$${safeAmount.toLocaleString('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatReportePercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}
