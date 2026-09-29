"use client";

import { useState } from "react";
import { CalculatorPanel, NumberField, ResultMetric } from "@/components/calculator-ui";
import { calculateGreaseTrap, checkGreaseTrap, formatGreaseRequirement, GREASE_TRAP_EXAMPLE, GREASE_TRAP_LABELS, type GreaseTrapInput } from "@/lib/grease-trap";

const fields: { key: keyof GreaseTrapInput; unit: string; max?: number }[] = [
  { key: "meals", unit: "食/日" }, { key: "hours", unit: "h/日", max: 24 },
  { key: "greaseDays", unit: "日" }, { key: "residueDays", unit: "日" },
  { key: "waterPerMeal", unit: "L/食" }, { key: "peakFactor", unit: "倍" },
  { key: "greasePerMeal", unit: "g/食" }, { key: "residuePerMeal", unit: "g/食" },
];
const exampleValues = () => Object.fromEntries(Object.entries(GREASE_TRAP_EXAMPLE).map(([key, value]) => [key, String(value)])) as Record<keyof GreaseTrapInput, string>;

export function GreaseTrapTool() {
  const [values, setValues] = useState(exampleValues);
  const [allowedFlow, setAllowedFlow] = useState("");
  const [allowedMass, setAllowedMass] = useState("");
  let result: ReturnType<typeof calculateGreaseTrap> | null = null;
  let error = "";
  try {
    for (const { key } of fields) if (!values[key].trim()) throw new Error(`${GREASE_TRAP_LABELS[key]}を入力してください。`);
    result = calculateGreaseTrap(Object.fromEntries(fields.map(({ key }) => [key, Number(values[key])])) as GreaseTrapInput);
  } catch (e) { error = e instanceof Error ? e.message : "入力を確認してください。"; }
  let comparison: ReturnType<typeof checkGreaseTrap> | null = null;
  let comparisonError = "";
  if (result && (allowedFlow.trim() || allowedMass.trim())) {
    try {
      if (!allowedFlow.trim() || !allowedMass.trim()) throw new Error("候補製品の性能を2項目とも入力してください。");
      comparison = checkGreaseTrap(result, Number(allowedFlow), Number(allowedMass));
    } catch (e) { comparisonError = e instanceof Error ? e.message : "製品性能を確認してください。"; }
  }
  return <CalculatorPanel>
    <p className="text-sm font-bold text-teal-700">厨房排水・利用人数法</p>
    <h2 id="grease-trap" className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">グリーストラップ選定</h2>
    <p className="mt-2 text-sm leading-6 text-slate-600">1日の食数と清掃周期から必要性能を概算し、候補製品の許容流入流量と標準阻集グリース質量を照合します。</p>
    <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">SHASE-S217-2016を引用したメーカー資料に基づく計算です。初期値は洋食店の例です。食種に応じて原単位を変更してください。2025年版への適合判定には対応していません。</p>
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <div className="rounded-3xl bg-slate-50 p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-bold text-slate-800">計算条件</h3>
          <button type="button" onClick={() => setValues(exampleValues())} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-sky-700">洋食店の例に戻す</button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">{fields.map(({ key, unit, max }) => <NumberField key={key} id={`grease-${key}`} label={GREASE_TRAP_LABELS[key]} value={values[key]} onChange={(event) => setValues({ ...values, [key]: event.target.value })} unit={unit} min={key === "peakFactor" ? 1 : 0.1} max={max} step="any" />)}</div>
      </div>
      <div aria-live="polite">
        {error && <p role="alert" className="rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-700">{error}</p>}
        {result && <>
          <div className="grid grid-cols-2 gap-3">
            <ResultMetric label="必要な許容流入流量" value={formatGreaseRequirement(result.flow)} unit="L/min以上" emphasis />
            <ResultMetric label="必要な標準阻集グリース質量" value={formatGreaseRequirement(result.mass)} unit="kg以上" emphasis />
            <ResultMetric label="油脂量の内訳" value={result.grease.toFixed(1)} unit="kg" />
            <ResultMetric label="残さ量の内訳" value={result.residue.toFixed(1)} unit="kg" />
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-500">必要性能は小数第1位へ切り上げ表示。質量は油脂と残さの合計です。槽の実容量（L）だけでは選定できません。</p>
        </>}
        <div className="mt-5 rounded-2xl border border-slate-200 p-4">
          <h3 className="font-bold text-slate-800">候補製品の性能を確認（任意）</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">メーカーのカタログに記載された性能を入力してください。</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField id="grease-allowed-flow" label="製品の許容流入流量" value={allowedFlow} onChange={(e) => setAllowedFlow(e.target.value)} unit="L/min" min={0.1} step="any" />
            <NumberField id="grease-allowed-mass" label="製品の標準阻集グリース質量" value={allowedMass} onChange={(e) => setAllowedMass(e.target.value)} unit="kg" min={0.1} step="any" />
          </div>
          {comparisonError && <p className="mt-3 text-sm text-rose-700">{comparisonError}</p>}
          {comparison && <div className={`mt-4 rounded-xl p-3 text-sm ${comparison.suitable ? "bg-teal-50 text-teal-900" : "bg-rose-50 text-rose-800"}`}>
            <p className="font-bold">{comparison.suitable ? "入力した2つの性能条件を満たします" : "性能不足：候補製品を見直してください"}</p>
            <p className="mt-1">流入流量：{comparison.flowOk ? "条件を満たす" : "不足"} ／ 阻集質量：{comparison.massOk ? "条件を満たす" : "不足"}</p>
          </div>}
        </div>
      </div>
    </div>
    <details className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
      <summary className="cursor-pointer font-bold text-slate-700">計算式・出典・選定時の確認事項</summary>
      <p className="mt-3">流入流量 Q = 食数 × 1食あたり使用水量 ÷（厨房使用時間 × 60）× ピーク流量倍率</p>
      <p>油脂量 Gu = 食数 × 油脂原単位 × 油脂清掃周期 ÷ 1,000</p>
      <p>残さ量 Gb = 食数 × 残さ原単位 × 残さ清掃周期 ÷ 1,000 ／ 必要質量 G = Gu + Gb</p>
      <p className="mt-2">出典：<a href="https://www.chubu-net.co.jp/kenzai/pdf/2026/11-greasetrap.pdf#page=3" target="_blank" rel="noreferrer" className="font-bold text-sky-700 underline">中部コーポレーション 2026年カタログ p.273（SHASE-S217-2016）</a></p>
      <p className="mt-2">工場製造阻集器の概算・確認用途です。設計・施工時は採用する規格年、自治体の基準、メーカー資料を確認し、設置方式・配管口径・清掃スペースも含めて選定してください。</p>
    </details>
  </CalculatorPanel>;
}
