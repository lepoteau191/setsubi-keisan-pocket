"use client";

import { useMemo, useState } from "react";
import { CalculatorPanel, NumberField, ResultMetric } from "@/components/calculator-ui";
import { calculateCondensation, type CondensationResult } from "@/lib/psychrometrics";

function calculate(roomTemperature: string, relativeHumidity: string, surfaceTemperature: string): { result: CondensationResult | null; error: string | null } {
  if (![roomTemperature, relativeHumidity, surfaceTemperature].every((value) => value.trim())) {
    return { result: null, error: "室温・相対湿度・表面温度を入力してください。" };
  }
  try {
    return { result: calculateCondensation(Number(roomTemperature), Number(relativeHumidity), Number(surfaceTemperature)), error: null };
  } catch (error) {
    return { result: null, error: error instanceof Error ? error.message : "計算できませんでした。" };
  }
}

const messages = {
  condensation: {
    label: "結露する可能性があります",
    detail: "対象物の表面温度が露点温度を下回っています。断熱・表面温度・室内湿度を確認してください。",
    className: "border-rose-200 bg-rose-50 text-rose-800",
  },
  caution: {
    label: "結露余裕が小さい状態です",
    detail: "現状では結露していませんが、表面温度の低下や湿度上昇で結露する可能性があります。",
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
  low: {
    label: "現状では結露リスクは低いです",
    detail: "表面温度が露点温度より2℃以上高く、一定の安全余裕があります。",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
};

export function CondensationTool() {
  const [roomTemperature, setRoomTemperature] = useState("26");
  const [relativeHumidity, setRelativeHumidity] = useState("50");
  const [surfaceTemperature, setSurfaceTemperature] = useState("18");
  const { result, error } = useMemo(
    () => calculate(roomTemperature, relativeHumidity, surfaceTemperature),
    [roomTemperature, relativeHumidity, surfaceTemperature],
  );
  const message = result ? messages[result.risk] : null;

  return (
    <CalculatorPanel>
      <div>
        <p className="text-sm font-bold text-teal-700">空調・温湿度</p>
        <h2 id="condensation" className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">露点・結露判定</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">測定した温湿度と表面温度から、客先でも伝わる言葉で結露リスクを表示します。</p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.2fr)]">
        <div className="grid gap-4 rounded-3xl bg-slate-50 p-4 sm:grid-cols-3 lg:grid-cols-1 sm:p-5">
          <NumberField id="cond-room-temperature" label="室温" value={roomTemperature} onChange={(event) => setRoomTemperature(event.target.value)} unit="℃" min={-80} max={100} />
          <NumberField id="cond-relative-humidity" label="相対湿度" value={relativeHumidity} onChange={(event) => setRelativeHumidity(event.target.value)} unit="%" min={0.1} max={100} />
          <NumberField id="cond-surface-temperature" label="対象物の表面温度" value={surfaceTemperature} onChange={(event) => setSurfaceTemperature(event.target.value)} unit="℃" min={-80} max={100} helper="放射温度計・接触温度計の測定値" />
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-bold text-rose-700">{error}</div>
        ) : result && message ? (
          <div>
            <div className={`rounded-3xl border p-5 ${message.className}`}>
              <p className="text-xs font-bold tracking-wider">判定結果</p>
              <h3 className="mt-2 text-2xl font-extrabold tracking-tight">{message.label}</h3>
              <p className="mt-2 text-sm leading-6">{message.detail}</p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <ResultMetric label="露点温度" value={result.dewPoint.toFixed(1)} unit="℃" emphasis />
              <ResultMetric label="安全余裕温度" value={`${result.safetyMargin >= 0 ? "+" : ""}${result.safetyMargin.toFixed(1)}`} unit="℃" emphasis={result.risk === "low"} />
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">安全余裕温度 ＝ 表面温度 − 露点温度。目安として +2℃ 以上を低リスク、0〜+2℃ を注意としています。</p>
          </div>
        ) : null}
      </div>
    </CalculatorPanel>
  );
}
