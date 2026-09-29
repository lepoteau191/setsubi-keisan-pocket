import type { ChangeEventHandler, ReactNode } from "react";

export function NumberField({
  id,
  label,
  value,
  onChange,
  unit,
  min,
  max,
  step = "0.1",
  helper,
}: {
  id: string;
  label: string;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  unit: string;
  min?: number;
  max?: number;
  step?: string;
  helper?: string;
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>
      <span className="flex overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition focus-within:border-sky-500 focus-within:ring-4 focus-within:ring-sky-100">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          step={step}
          className="min-h-12 w-full min-w-0 appearance-none bg-transparent px-4 py-3 text-right text-lg font-bold text-slate-900 outline-none"
        />
        <span className="flex min-w-14 items-center justify-center border-l border-slate-100 bg-slate-50 px-2 text-sm font-bold text-slate-500">{unit}</span>
      </span>
      {helper && <span className="mt-1.5 block text-xs leading-5 text-slate-500">{helper}</span>}
    </label>
  );
}

export function ResultMetric({ label, value, unit, emphasis = false }: { label: string; value: string; unit: string; emphasis?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 ${emphasis ? "border-sky-200 bg-sky-50" : "border-slate-100 bg-slate-50/70"}`}>
      <p className="text-xs font-bold tracking-wide text-slate-500">{label}</p>
      <div className="mt-2 flex items-end gap-1.5">
        <strong className={`text-2xl leading-none tracking-tight ${emphasis ? "text-sky-800" : "text-slate-900"}`}>{value}</strong>
        <span className="text-xs font-bold text-slate-500">{unit}</span>
      </div>
    </div>
  );
}

export function CalculatorPanel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`scroll-mt-5 rounded-[28px] border border-slate-200 bg-white p-5 shadow-card sm:p-7 ${className}`}>{children}</section>;
}
