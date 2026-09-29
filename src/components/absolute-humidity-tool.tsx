"use client";

import { useMemo, useState } from "react";
import { CalculatorPanel, NumberField, ResultMetric } from "@/components/calculator-ui";
import { calculateAirState, type AirState } from "@/lib/psychrometrics";

function calculate(temperature: string, relativeHumidity: string): { state: AirState | null; error: string | null } {
  if (!temperature.trim() || !relativeHumidity.trim()) {
    return { state: null, error: "温度と相対湿度を入力してください。" };
  }
  try {
    return { state: calculateAirState(Number(temperature), Number(relativeHumidity)), error: null };
  } catch (error) {
    return { state: null, error: error instanceof Error ? error.message : "計算できませんでした。" };
  }
}

export function AbsoluteHumidityTool() {
  const [temperature, setTemperature] = useState("26");
  const [relativeHumidity, setRelativeHumidity] = useState("50");
  const { state, error } = useMemo(() => calculate(temperature, relativeHumidity), [temperature, relativeHumidity]);
  const amount = state ? Math.min(100, state.absoluteHumidity / 25 * 100) : 0;

  return (
    <CalculatorPanel>
      <div>
        <p className="text-sm font-bold text-amber-700">空調・温湿度</p>
        <h2 id="absolute-humidity" className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">絶対湿度計算</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">相対湿度だけでは見えにくい「空気中の水分量」を、温度と一緒に確認します。</p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.2fr)]">
        <div className="grid gap-4 rounded-3xl bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-1 sm:p-5">
          <NumberField id="absolute-temperature" label="乾球温度" value={temperature} onChange={(event) => setTemperature(event.target.value)} unit="℃" min={-80} max={100} />
          <NumberField id="absolute-relative-humidity" label="相対湿度" value={relativeHumidity} onChange={(event) => setRelativeHumidity(event.target.value)} unit="%" min={0.1} max={100} />
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-bold text-rose-700">{error}</div>
        ) : state ? (
          <div>
            <div className="grid grid-cols-2 gap-3 sm:max-w-md">
              <ResultMetric label="絶対湿度" value={state.absoluteHumidity.toFixed(1)} unit="g/kg'" emphasis />
              <ResultMetric label="露点温度" value={state.dewPoint.toFixed(1)} unit="℃" />
            </div>
            <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
              <div className="flex items-end justify-between gap-3">
                <p className="text-sm font-bold text-amber-900">空気に含まれる水分量</p>
                <p className="text-xs font-bold text-amber-700">目安 0〜25 g/kg&apos;</p>
              </div>
              <div className="mt-3 h-4 overflow-hidden rounded-full bg-amber-100">
                <div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-500 transition-all duration-300" style={{ width: `${amount}%` }} />
              </div>
              <p className="mt-3 text-sm leading-6 text-amber-900">この空気 1kg（乾き空気）には、約 <strong>{state.absoluteHumidity.toFixed(1)}g</strong> の水分が含まれています。温度が違う場所どうしの比較にも便利です。</p>
            </div>
          </div>
        ) : null}
      </div>
    </CalculatorPanel>
  );
}
