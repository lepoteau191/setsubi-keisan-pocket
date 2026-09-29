"use client";

import { useMemo, useState } from "react";
import { CalculatorPanel, NumberField, ResultMetric } from "@/components/calculator-ui";
import { PsychrometricChart } from "@/components/psychrometric-chart";
import { calculateAirState, type AirState } from "@/lib/psychrometrics";

const presets = [
  { label: "室内標準", dryBulb: "26", relativeHumidity: "50" },
  { label: "夏外気", dryBulb: "35", relativeHumidity: "60" },
  { label: "冬外気", dryBulb: "5", relativeHumidity: "40" },
  { label: "冷房吹出", dryBulb: "14", relativeHumidity: "85" },
];

function format(value: number) {
  return value.toFixed(1);
}

function calculate(dryBulb: string, relativeHumidity: string): { state: AirState | null; error: string | null } {
  if (!dryBulb.trim() || !relativeHumidity.trim()) {
    return { state: null, error: "乾球温度と相対湿度を入力してください。" };
  }
  try {
    return { state: calculateAirState(Number(dryBulb), Number(relativeHumidity)), error: null };
  } catch (error) {
    return { state: null, error: error instanceof Error ? error.message : "計算できませんでした。" };
  }
}

export function AirStateTool() {
  const [dryBulb, setDryBulb] = useState("26");
  const [relativeHumidity, setRelativeHumidity] = useState("50");
  const { state, error } = useMemo(() => calculate(dryBulb, relativeHumidity), [dryBulb, relativeHumidity]);

  return (
    <CalculatorPanel>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold text-sky-700">空調・温湿度</p>
          <h2 id="air-state" className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">空気線図・空気状態計算</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">温度と湿度を入れるだけ。空気がどれだけ水分と熱を持つかを確認できます。</p>
        </div>
        <span className="w-fit rounded-full bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-700">標準大気圧 101.325 kPa</span>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.2fr)]">
        <div className="rounded-3xl bg-slate-50 p-4 sm:p-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <NumberField id="air-dry-bulb" label="乾球温度" value={dryBulb} onChange={(event) => setDryBulb(event.target.value)} unit="℃" min={-80} max={100} />
            <NumberField id="air-relative-humidity" label="相対湿度" value={relativeHumidity} onChange={(event) => setRelativeHumidity(event.target.value)} unit="%" min={0.1} max={100} />
          </div>
          <div className="mt-5">
            <p className="text-xs font-bold tracking-wide text-slate-500">よく使う条件</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => { setDryBulb(preset.dryBulb); setRelativeHumidity(preset.relativeHumidity); }}
                  className="min-h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 transition hover:border-sky-300 hover:bg-sky-50 focus:outline-none focus:ring-4 focus:ring-sky-100"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
          <p className="mt-5 text-xs leading-5 text-slate-500">入力すると自動で計算します。空気線図は現場での説明に使える簡易表示です。</p>
        </div>

        <div>
          {error ? (
            <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-bold text-rose-700">{error}</div>
          ) : state ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <ResultMetric label="乾球温度" value={format(state.dryBulb)} unit="℃" />
              <ResultMetric label="相対湿度" value={format(state.relativeHumidity)} unit="%" />
              <ResultMetric label="絶対湿度" value={format(state.absoluteHumidity)} unit="g/kg'" emphasis />
              <ResultMetric label="露点温度" value={format(state.dewPoint)} unit="℃" emphasis />
              <ResultMetric label="湿球温度" value={format(state.wetBulb)} unit="℃" />
              <ResultMetric label="エンタルピー" value={format(state.enthalpy)} unit="kJ/kg'" />
            </div>
          ) : null}
          {state && <div className="mt-4 rounded-2xl bg-sky-50 px-4 py-3 text-sm leading-6 text-sky-900"><strong>見方：</strong>絶対湿度は空気1kg（乾き空気）に含まれる水分量、露点温度は結露が始まりやすい温度です。</div>}
        </div>
      </div>

      <div className="mt-6">
        <PsychrometricChart state={state} />
      </div>
    </CalculatorPanel>
  );
}
