import { humidityRatioFromDryBulbAndRh, type AirState } from "@/lib/psychrometrics";

const chart = { width: 680, height: 360, left: 54, right: 18, top: 22, bottom: 42 };
const temperatureRange = { min: -10, max: 50 };
const humidityRange = { min: 0, max: 30 };

function xForTemperature(value: number) {
  const plotWidth = chart.width - chart.left - chart.right;
  return chart.left + (value - temperatureRange.min) / (temperatureRange.max - temperatureRange.min) * plotWidth;
}

function yForHumidity(value: number) {
  const plotHeight = chart.height - chart.top - chart.bottom;
  return chart.height - chart.bottom - (value - humidityRange.min) / (humidityRange.max - humidityRange.min) * plotHeight;
}

function relativeHumidityPath(relativeHumidity: number) {
  const points = Array.from({ length: 61 }, (_, index) => temperatureRange.min + index);
  return points.reduce<string>((path, temperature) => {
    const humidity = humidityRatioFromDryBulbAndRh(temperature, relativeHumidity) * 1000;
    if (!Number.isFinite(humidity) || humidity < humidityRange.min || humidity > humidityRange.max) {
      return path;
    }
    return `${path}${path ? " L" : "M"}${xForTemperature(temperature).toFixed(1)} ${yForHumidity(humidity).toFixed(1)}`;
  }, "");
}

export function PsychrometricChart({ state }: { state: AirState | null }) {
  const pointIsInRange = state !== null
    && state.dryBulb >= temperatureRange.min
    && state.dryBulb <= temperatureRange.max
    && state.absoluteHumidity >= humidityRange.min
    && state.absoluteHumidity <= humidityRange.max;
  const pointX = state ? xForTemperature(state.dryBulb) : 0;
  const pointY = state ? yForHumidity(state.absoluteHumidity) : 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
        <div>
          <h3 className="font-bold text-slate-900">空気線図</h3>
          <p className="mt-0.5 text-xs text-slate-500">青い点が現在の空気状態です</p>
        </div>
        {state && <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-700">現在位置</span>}
      </div>
      <div className="p-2 sm:p-3">
        <svg viewBox={`0 0 ${chart.width} ${chart.height}`} className="h-auto w-full" role="img" aria-label="温度と絶対湿度を表示する簡易空気線図">
          <rect x={chart.left} y={chart.top} width={chart.width - chart.left - chart.right} height={chart.height - chart.top - chart.bottom} rx="8" fill="#f8fbfd" />
          {Array.from({ length: 7 }, (_, index) => temperatureRange.min + index * 10).map((temperature) => (
            <g key={temperature}>
              <line x1={xForTemperature(temperature)} x2={xForTemperature(temperature)} y1={chart.top} y2={chart.height - chart.bottom} stroke="#dbe5eb" strokeWidth="1" />
              <text x={xForTemperature(temperature)} y={chart.height - 18} textAnchor="middle" fontSize="11" fill="#64748b">{temperature}</text>
            </g>
          ))}
          {Array.from({ length: 7 }, (_, index) => humidityRange.min + index * 5).map((humidity) => (
            <g key={humidity}>
              <line x1={chart.left} x2={chart.width - chart.right} y1={yForHumidity(humidity)} y2={yForHumidity(humidity)} stroke="#dbe5eb" strokeWidth="1" />
              <text x={chart.left - 9} y={yForHumidity(humidity) + 4} textAnchor="end" fontSize="11" fill="#64748b">{humidity}</text>
            </g>
          ))}
          {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((humidity) => {
            const path = relativeHumidityPath(humidity);
            return path ? <path key={humidity} d={path} fill="none" stroke={humidity === 100 ? "#0284c7" : "#a9cfe0"} strokeWidth={humidity === 100 ? "1.5" : "1"} /> : null;
          })}
          <text x={(chart.left + chart.width - chart.right) / 2} y={chart.height - 3} textAnchor="middle" fontSize="11" fill="#475569">乾球温度（℃）</text>
          <text x="14" y={(chart.top + chart.height - chart.bottom) / 2} textAnchor="middle" fontSize="11" fill="#475569" transform={`rotate(-90 14 ${(chart.top + chart.height - chart.bottom) / 2})`}>絶対湿度（g/kg&apos;）</text>
          {state && pointIsInRange && <g>
            <circle cx={pointX} cy={pointY} r="8" fill="#0ea5e9" fillOpacity="0.2" />
            <circle cx={pointX} cy={pointY} r="4.5" fill="#0284c7" stroke="white" strokeWidth="2" />
          </g>}
        </svg>
      </div>
      {state && !pointIsInRange && <p className="border-t border-amber-100 bg-amber-50 px-4 py-2 text-xs text-amber-800">入力値がこの簡易線図の表示範囲外です。</p>}
    </div>
  );
}
