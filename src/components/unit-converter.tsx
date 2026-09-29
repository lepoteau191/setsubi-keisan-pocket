"use client";

import { useMemo, useState } from "react";
import { CalculatorPanel } from "@/components/calculator-ui";
import { convertUnit, UNIT_GROUPS, type UnitGroupId } from "@/lib/unit-conversions";

function format(value: number) {
  return new Intl.NumberFormat("ja-JP", { maximumFractionDigits: 4 }).format(value);
}

export function UnitConverter() {
  const [groupId, setGroupId] = useState<UnitGroupId>("pressure");
  const [fromId, setFromId] = useState("pa");
  const [toId, setToId] = useState("kpa");
  const [value, setValue] = useState("1000");
  const group = UNIT_GROUPS.find((item) => item.id === groupId) ?? UNIT_GROUPS[0];
  const fromUnit = group.units.find((item) => item.id === fromId) ?? group.units[0];
  const toUnit = group.units.find((item) => item.id === toId) ?? group.units[1] ?? group.units[0];
  const result = useMemo(
    () => value.trim() ? convertUnit(group.id, fromUnit.id, toUnit.id, Number(value)) : Number.NaN,
    [group.id, fromUnit.id, toUnit.id, value],
  );

  const selectClass = "min-h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 text-base font-bold text-slate-800 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100";

  return (
    <CalculatorPanel>
      <div>
        <p className="text-sm font-bold text-slate-600">単位換算</p>
        <h2 id="unit-converter" className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">設備系単位換算</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">変換したい単位を選ぶだけ。よく使う設備単位をまとめました。</p>
      </div>

      <div className="mt-6 grid gap-5 rounded-3xl bg-slate-50 p-4 sm:p-5 lg:grid-cols-[0.7fr_1fr_auto_1fr] lg:items-end">
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-700">換算の種類</span>
          <select
            value={group.id}
            onChange={(event) => {
              const nextGroup = UNIT_GROUPS.find((item) => item.id === event.target.value) ?? UNIT_GROUPS[0];
              setGroupId(nextGroup.id);
              setFromId(nextGroup.units[0].id);
              setToId((nextGroup.units[1] ?? nextGroup.units[0]).id);
            }}
            className={selectClass}
          >
            {UNIT_GROUPS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
          <span className="mt-1.5 block text-xs text-slate-500">{group.description}</span>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-700">変換元</span>
          <span className="flex overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm focus-within:border-sky-500 focus-within:ring-4 focus-within:ring-sky-100">
            <input type="number" inputMode="decimal" value={value} onChange={(event) => setValue(event.target.value)} className="min-h-12 min-w-0 flex-1 bg-transparent px-3 text-right text-lg font-bold text-slate-900 outline-none" />
            <select aria-label="変換元の単位" value={fromUnit.id} onChange={(event) => setFromId(event.target.value)} className="min-h-12 w-28 border-l border-slate-100 bg-slate-50 px-2 text-sm font-bold text-slate-700 outline-none">
              {group.units.map((unit) => <option key={unit.id} value={unit.id}>{unit.label}</option>)}
            </select>
          </span>
        </label>
        <button type="button" onClick={() => { setFromId(toUnit.id); setToId(fromUnit.id); }} className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-xl font-bold text-slate-600 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 focus:outline-none focus:ring-4 focus:ring-sky-100" aria-label="変換元と変換先を入れ替える">⇄</button>
        <div>
          <p className="mb-2 text-sm font-bold text-slate-700">変換結果</p>
          <div className="flex min-h-12 items-center justify-between gap-3 rounded-xl border border-sky-200 bg-sky-50 px-4">
            <strong className="text-xl tracking-tight text-sky-900">{Number.isFinite(result) ? format(result) : "-"}</strong>
            <select aria-label="変換先の単位" value={toUnit.id} onChange={(event) => setToId(event.target.value)} className="min-h-10 w-28 rounded-lg border border-sky-100 bg-white px-2 text-sm font-bold text-sky-800 outline-none focus:ring-2 focus:ring-sky-200">
              {group.units.map((unit) => <option key={unit.id} value={unit.id}>{unit.label}</option>)}
            </select>
          </div>
        </div>
      </div>
      <p className="mt-4 text-xs leading-5 text-slate-500">換算値は計算上の参考値です。仕様書・法規・メーカー資料で定められた単位や条件を優先してください。</p>
    </CalculatorPanel>
  );
}
