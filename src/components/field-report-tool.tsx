"use client";

import { useEffect, useMemo, useState } from "react";
import { CalculatorPanel, NumberField, ResultMetric } from "@/components/calculator-ui";
import { calculateCondensation, type CondensationResult } from "@/lib/psychrometrics";

const STORAGE_KEY = "setsubi-pocket-field-report-v1";

type FieldReport = {
  projectName: string;
  measurementPlace: string;
  roomTemperature: string;
  relativeHumidity: string;
  surfaceTemperature: string;
  note: string;
  savedAt?: string;
};

const emptyReport: FieldReport = {
  projectName: "",
  measurementPlace: "",
  roomTemperature: "26",
  relativeHumidity: "50",
  surfaceTemperature: "18",
  note: "",
};

const reportMessages = {
  condensation: "結露する可能性があります。対象物の表面温度が露点温度を下回っています。",
  caution: "結露余裕が小さい状態です。表面温度低下・湿度上昇時は注意が必要です。",
  low: "現状では結露リスクは低いです。表面温度に2℃以上の余裕があります。",
};

function calculate(report: FieldReport): { result: CondensationResult | null; error: string | null } {
  if (![report.roomTemperature, report.relativeHumidity, report.surfaceTemperature].every((value) => value.trim())) {
    return { result: null, error: "室温・相対湿度・表面温度を入力してください。" };
  }
  try {
    return {
      result: calculateCondensation(Number(report.roomTemperature), Number(report.relativeHumidity), Number(report.surfaceTemperature)),
      error: null,
    };
  } catch (error) {
    return { result: null, error: error instanceof Error ? error.message : "計算できませんでした。" };
  }
}

export function FieldReportTool() {
  const [report, setReport] = useState<FieldReport>(emptyReport);
  const [status, setStatus] = useState("測定値を入力して、保存または共有できます。");
  const { result, error } = useMemo(() => calculate(report), [report]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored) as FieldReport;
      if (parsed && typeof parsed === "object") {
        setReport({ ...emptyReport, ...parsed });
        setStatus(parsed.savedAt ? `この端末に保存済み（${new Date(parsed.savedAt).toLocaleString("ja-JP")}）` : "この端末に保存済みの測定メモを読み込みました。");
      }
    } catch {
      setStatus("保存済みのメモを読み込めませんでした。新規入力は利用できます。");
    }
  }, []);

  const update = <Key extends keyof FieldReport>(key: Key, value: FieldReport[Key]) => setReport((current) => ({ ...current, [key]: value }));
  const summary = result ? [
    "設備計算ポケット｜現場測定サマリー",
    `案件名：${report.projectName || "未入力"}`,
    `測定場所：${report.measurementPlace || "未入力"}`,
    `室温：${Number(report.roomTemperature).toFixed(1)}℃`,
    `相対湿度：${Number(report.relativeHumidity).toFixed(1)}%`,
    `対象物表面温度：${Number(report.surfaceTemperature).toFixed(1)}℃`,
    `露点温度：${result.dewPoint.toFixed(1)}℃`,
    `安全余裕温度：${result.safetyMargin >= 0 ? "+" : ""}${result.safetyMargin.toFixed(1)}℃`,
    `判定：${reportMessages[result.risk]}`,
    report.note ? `メモ：${report.note}` : "",
    "※概算・確認用途です。設計・施工時は仕様書、法規、メーカー資料を優先してください。",
  ].filter(Boolean).join("\n") : "";

  const save = () => {
    const saved = { ...report, savedAt: new Date().toISOString() };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
      setReport(saved);
      setStatus("この端末のブラウザに保存しました。外部には送信していません。");
    } catch {
      setStatus("保存できませんでした。ブラウザの保存設定を確認してください。");
    }
  };

  const copy = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setStatus("説明用サマリーをコピーしました。メールやチャットに貼り付けられます。");
    } catch {
      setStatus("コピーできませんでした。ブラウザのクリップボード許可を確認してください。");
    }
  };

  const share = async () => {
    if (!summary || !navigator.share) return;
    try {
      await navigator.share({ title: "現場測定サマリー", text: summary });
      setStatus("共有画面を開きました。");
    } catch {
      // The user may simply close the platform share sheet.
    }
  };

  return (
    <div id="field-report" className="scroll-mt-5">
      <CalculatorPanel>
        <div className="no-print">
          <p className="text-sm font-bold text-slate-600">現場支援</p>
          <h2 id="field-report-title" className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">現場測定メモ・説明シート</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">温湿度測定と結露判定をひとつにまとめ、保存・コピー・印刷／PDF化できます。</p>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(340px,0.9fr)_minmax(0,1.1fr)]">
          <div className="no-print rounded-3xl bg-slate-50 p-4 sm:p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2"><span className="mb-2 block text-sm font-bold text-slate-700">案件名・客先名</span><input value={report.projectName} onChange={(event) => update("projectName", event.target.value)} placeholder="例：◯◯ビル 空調改修" className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-base font-bold text-slate-900 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100" /></label>
              <label className="block sm:col-span-2"><span className="mb-2 block text-sm font-bold text-slate-700">測定場所・対象物</span><input value={report.measurementPlace} onChange={(event) => update("measurementPlace", event.target.value)} placeholder="例：北側サッシ、給気ダクト" className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-base font-bold text-slate-900 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100" /></label>
              <NumberField id="report-room-temperature" label="室温" value={report.roomTemperature} onChange={(event) => update("roomTemperature", event.target.value)} unit="℃" min={-80} max={100} />
              <NumberField id="report-relative-humidity" label="相対湿度" value={report.relativeHumidity} onChange={(event) => update("relativeHumidity", event.target.value)} unit="%" min={0.1} max={100} />
              <div className="sm:col-span-2"><NumberField id="report-surface-temperature" label="対象物の表面温度" value={report.surfaceTemperature} onChange={(event) => update("surfaceTemperature", event.target.value)} unit="℃" min={-80} max={100} /></div>
              <label className="block sm:col-span-2"><span className="mb-2 block text-sm font-bold text-slate-700">補足メモ</span><textarea value={report.note} onChange={(event) => update("note", event.target.value)} rows={3} placeholder="測定時の状況、写真番号、次の対応など" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100" /></label>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" onClick={save} className="min-h-11 rounded-xl bg-slate-900 px-4 text-sm font-bold text-white transition hover:bg-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-200">この端末に保存</button>
              <button type="button" onClick={() => { setReport(emptyReport); setStatus("入力を初期化しました。保存済みのメモは残っています。"); }} className="min-h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-slate-100">入力を初期化</button>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6" aria-live="polite">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-xs font-bold tracking-wide text-slate-500">説明用サマリー</p><h3 className="mt-1 text-xl font-extrabold tracking-tight text-slate-900">{report.projectName || "現場測定結果"}</h3><p className="mt-1 text-sm text-slate-500">{report.measurementPlace || "測定場所・対象物を入力してください"}</p></div>
              {result && <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${result.risk === "low" ? "bg-emerald-50 text-emerald-700" : result.risk === "caution" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"}`}>{result.risk === "low" ? "低リスク" : result.risk === "caution" ? "注意" : "結露の可能性"}</span>}
            </div>
            {error ? <div className="mt-5 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-bold text-rose-700">{error}</div> : result && <>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <ResultMetric label="露点温度" value={result.dewPoint.toFixed(1)} unit="℃" emphasis />
                <ResultMetric label="安全余裕温度" value={`${result.safetyMargin >= 0 ? "+" : ""}${result.safetyMargin.toFixed(1)}`} unit="℃" emphasis={result.risk === "low"} />
              </div>
              <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">{reportMessages[result.risk]}</p>
              {report.note && <p className="mt-3 text-sm leading-6 text-slate-600"><strong>メモ：</strong>{report.note}</p>}
              <div className="no-print mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-5">
                <button type="button" onClick={copy} className="min-h-11 rounded-xl bg-sky-600 px-4 text-sm font-bold text-white transition hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-100">サマリーをコピー</button>
                {typeof navigator !== "undefined" && "share" in navigator && <button type="button" onClick={share} className="min-h-11 rounded-xl border border-sky-200 bg-sky-50 px-4 text-sm font-bold text-sky-800 transition hover:bg-sky-100 focus:outline-none focus:ring-4 focus:ring-sky-100">共有</button>}
                <button type="button" onClick={() => window.print()} className="min-h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100">印刷・PDF保存</button>
              </div>
            </>}
            <p className="no-print mt-5 text-xs leading-5 text-slate-500">{status}</p>
          </div>
        </div>
      </CalculatorPanel>
    </div>
  );
}
