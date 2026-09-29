"use client";

import { useMemo, useState } from "react";
import { CalculatorPanel, NumberField, ResultMetric } from "@/components/calculator-ui";
import {
  calculateDuct,
  calculatePipe,
  calculatePump,
  calculateVentilation,
  calculateWaterHeatLoad,
  type DuctResult,
  type HeatLoadResult,
  type PipeResult,
  type PumpResult,
  type VentilationResult,
} from "@/lib/equipment-calculations";

type Calculation<T> = { result: T | null; error: string | null };

function calculateSafely<T>(calculator: () => T): Calculation<T> {
  try {
    return { result: calculator(), error: null };
  } catch (error) {
    return { result: null, error: error instanceof Error ? error.message : "計算できませんでした。" };
  }
}

function requiredNumber(value: string, label: string) {
  if (!value.trim()) throw new Error(`${label}を入力してください。`);
  return Number(value);
}

function ErrorMessage({ message }: { message: string | null }) {
  return message ? <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-bold text-rose-700">{message}</div> : null;
}

export function VentilationTool() {
  const [people, setPeople] = useState("10");
  const [perPerson, setPerPerson] = useState("30");
  const [area, setArea] = useState("50");
  const [perArea, setPerArea] = useState("2");
  const [volume, setVolume] = useState("150");
  const [airChanges, setAirChanges] = useState("2");
  const [adoptedAirflow, setAdoptedAirflow] = useState("400");
  const calculation = useMemo<Calculation<VentilationResult>>(
    () => calculateSafely(() => calculateVentilation(
      requiredNumber(people, "在室人数"), requiredNumber(perPerson, "1人あたり外気量"),
      requiredNumber(area, "床面積"), requiredNumber(perArea, "面積あたり外気量"),
      requiredNumber(volume, "室内容積"), requiredNumber(airChanges, "目標換気回数"), requiredNumber(adoptedAirflow, "採用風量"),
    )),
    [people, perPerson, area, perArea, volume, airChanges, adoptedAirflow],
  );

  return (
    <CalculatorPanel>
      <div>
        <p className="text-sm font-bold text-sky-700">換気・風量</p>
        <h2 id="ventilation" className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">風量・換気回数計算</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">人数・面積・室容積の3つの見方で必要風量を比較し、採用風量の換気回数も確認します。</p>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(340px,1fr)_minmax(0,1fr)]">
        <div className="grid gap-4 rounded-3xl bg-slate-50 p-4 sm:grid-cols-2 sm:p-5">
          <NumberField id="vent-people" label="在室人数" value={people} onChange={(event) => setPeople(event.target.value)} unit="人" min={0} step="1" />
          <NumberField id="vent-per-person" label="1人あたり外気量" value={perPerson} onChange={(event) => setPerPerson(event.target.value)} unit="m³/h・人" min={0} />
          <NumberField id="vent-area" label="床面積" value={area} onChange={(event) => setArea(event.target.value)} unit="m²" min={0} />
          <NumberField id="vent-per-area" label="面積あたり外気量" value={perArea} onChange={(event) => setPerArea(event.target.value)} unit="m³/h・m²" min={0} />
          <NumberField id="vent-volume" label="室内容積" value={volume} onChange={(event) => setVolume(event.target.value)} unit="m³" min={0} />
          <NumberField id="vent-air-changes" label="目標換気回数" value={airChanges} onChange={(event) => setAirChanges(event.target.value)} unit="回/h" min={0} />
          <div className="sm:col-span-2"><NumberField id="vent-adopted-airflow" label="採用風量" value={adoptedAirflow} onChange={(event) => setAdoptedAirflow(event.target.value)} unit="m³/h" min={0} helper="設備で採用予定または実測の風量" /></div>
        </div>
        {calculation.error ? <ErrorMessage message={calculation.error} /> : calculation.result && <div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <ResultMetric label="人数基準" value={calculation.result.byPeople.toFixed(0)} unit="m³/h" />
            <ResultMetric label="面積基準" value={calculation.result.byArea.toFixed(0)} unit="m³/h" />
            <ResultMetric label="換気回数基準" value={calculation.result.byAirChanges.toFixed(0)} unit="m³/h" />
            <ResultMetric label="必要風量の目安" value={calculation.result.recommended.toFixed(0)} unit="m³/h" emphasis />
            <ResultMetric label="採用時の換気回数" value={calculation.result.actualAirChanges.toFixed(1)} unit="回/h" emphasis />
          </div>
          <p className="mt-4 rounded-2xl bg-sky-50 px-4 py-3 text-sm leading-6 text-sky-900"><strong>使い方：</strong>3つの基準のうち最も大きい値を必要風量の目安として表示します。法令・用途別基準・設計条件は別途確認してください。</p>
        </div>}
      </div>
    </CalculatorPanel>
  );
}

export function HeatLoadTool() {
  const [flow, setFlow] = useState("100");
  const [deltaT, setDeltaT] = useState("5");
  const calculation = useMemo<Calculation<HeatLoadResult>>(
    () => calculateSafely(() => calculateWaterHeatLoad(requiredNumber(flow, "水量"), requiredNumber(deltaT, "温度差"))),
    [flow, deltaT],
  );

  return (
    <CalculatorPanel>
      <div>
        <p className="text-sm font-bold text-amber-700">水側・熱量</p>
        <h2 id="heat-load" className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">水量・温度差・熱量計算</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">冷温水の水量と往還温度差から、必要能力をその場で概算します。</p>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(280px,0.75fr)_minmax(0,1.25fr)]">
        <div className="grid gap-4 rounded-3xl bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-1 sm:p-5">
          <NumberField id="heat-flow" label="水量" value={flow} onChange={(event) => setFlow(event.target.value)} unit="L/min" min={0} />
          <NumberField id="heat-delta-t" label="往還温度差" value={deltaT} onChange={(event) => setDeltaT(event.target.value)} unit="℃" min={0} />
        </div>
        {calculation.error ? <ErrorMessage message={calculation.error} /> : calculation.result && <div>
          <div className="grid grid-cols-2 gap-3 sm:max-w-xl sm:grid-cols-3">
            <ResultMetric label="熱量・能力" value={calculation.result.capacityKw.toFixed(1)} unit="kW" emphasis />
            <ResultMetric label="熱量・能力" value={calculation.result.capacityKcalH.toFixed(0)} unit="kcal/h" />
            <ResultMetric label="水量換算" value={calculation.result.flowM3H.toFixed(2)} unit="m³/h" />
          </div>
          <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900"><strong>計算式：</strong>水量 × 水密度 × 比熱 × 温度差。水の物性値を用いた概算で、ブラインなどは別途補正が必要です。</p>
        </div>}
      </div>
    </CalculatorPanel>
  );
}

export function DuctTool() {
  const [airflow, setAirflow] = useState("1000");
  const [velocity, setVelocity] = useState("5");
  const [aspectRatio, setAspectRatio] = useState("1.5");
  const [length, setLength] = useState("30");
  const calculation = useMemo<Calculation<DuctResult>>(
    () => calculateSafely(() => calculateDuct(requiredNumber(airflow, "風量"), requiredNumber(velocity, "目標風速"), requiredNumber(aspectRatio, "縦横比"), requiredNumber(length, "ダクト長さ"))),
    [airflow, velocity, aspectRatio, length],
  );

  return (
    <CalculatorPanel>
      <div>
        <p className="text-sm font-bold text-teal-700">ダクト</p>
        <h2 id="duct" className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">ダクトサイズ・圧損計算</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">風量と目標風速から、円形・角形ダクトの必要サイズと直管圧損の目安を確認します。</p>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(340px,1fr)_minmax(0,1fr)]">
        <div className="grid gap-4 rounded-3xl bg-slate-50 p-4 sm:grid-cols-2 sm:p-5">
          <NumberField id="duct-airflow" label="風量" value={airflow} onChange={(event) => setAirflow(event.target.value)} unit="m³/h" min={0} />
          <NumberField id="duct-velocity" label="目標風速" value={velocity} onChange={(event) => setVelocity(event.target.value)} unit="m/s" min={0.1} />
          <NumberField id="duct-aspect" label="角ダクト縦横比" value={aspectRatio} onChange={(event) => setAspectRatio(event.target.value)} unit="W/H" min={1} max={4} />
          <NumberField id="duct-length" label="直管長さ" value={length} onChange={(event) => setLength(event.target.value)} unit="m" min={0} />
        </div>
        {calculation.error ? <ErrorMessage message={calculation.error} /> : calculation.result && <div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <ResultMetric label="必要断面積" value={(calculation.result.requiredAreaM2 * 1_000_000).toFixed(0)} unit="mm²" />
            <ResultMetric label="計算上の円形径" value={calculation.result.calculatedDiameterMm.toFixed(0)} unit="mm" />
            <ResultMetric label="推奨丸ダクト" value={`φ${calculation.result.recommendedDiameterMm}`} unit="mm" emphasis />
            <ResultMetric label="角ダクト目安" value={`${Math.ceil(calculation.result.rectangularWidthMm / 10) * 10}×${Math.ceil(calculation.result.rectangularHeightMm / 10) * 10}`} unit="mm" emphasis />
            <ResultMetric label="採用丸ダクト風速" value={calculation.result.actualVelocity.toFixed(1)} unit="m/s" />
            <ResultMetric label="直管圧損（概算）" value={calculation.result.totalPressureLossPa.toFixed(0)} unit="Pa" />
          </div>
          <p className="mt-4 rounded-2xl bg-teal-50 px-4 py-3 text-sm leading-6 text-teal-900">圧損は円形ダクト・直管部の概算です。継手、フード、フィルター等の局部損失と材質・粗さは別途加算してください。</p>
        </div>}
      </div>
    </CalculatorPanel>
  );
}

export function PipeTool() {
  const [flow, setFlow] = useState("100");
  const [velocity, setVelocity] = useState("1.5");
  const [length, setLength] = useState("30");
  const calculation = useMemo<Calculation<PipeResult>>(
    () => calculateSafely(() => calculatePipe(requiredNumber(flow, "流量"), requiredNumber(velocity, "目標流速"), requiredNumber(length, "配管長さ"))),
    [flow, velocity, length],
  );

  return (
    <CalculatorPanel>
      <div>
        <p className="text-sm font-bold text-teal-700">水配管</p>
        <h2 id="pipe" className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">配管サイズ・圧力損失計算</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">水量と目標流速から呼び径の目安を出し、直管の圧力損失を概算します。</p>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(300px,0.8fr)_minmax(0,1.2fr)]">
        <div className="grid gap-4 rounded-3xl bg-slate-50 p-4 sm:grid-cols-3 lg:grid-cols-1 sm:p-5">
          <NumberField id="pipe-flow" label="流量" value={flow} onChange={(event) => setFlow(event.target.value)} unit="L/min" min={0} />
          <NumberField id="pipe-velocity" label="目標流速" value={velocity} onChange={(event) => setVelocity(event.target.value)} unit="m/s" min={0.1} />
          <NumberField id="pipe-length" label="直管長さ" value={length} onChange={(event) => setLength(event.target.value)} unit="m" min={0} />
        </div>
        {calculation.error ? <ErrorMessage message={calculation.error} /> : calculation.result && <div>
          <div className="grid grid-cols-2 gap-3 sm:max-w-2xl sm:grid-cols-4">
            <ResultMetric label="必要内径" value={calculation.result.requiredDiameterMm.toFixed(1)} unit="mm" />
            <ResultMetric label="推奨呼び径" value={calculation.result.recommendedNominal} unit="" emphasis />
            <ResultMetric label="採用内径" value={calculation.result.recommendedInsideDiameterMm.toFixed(1)} unit="mm" />
            <ResultMetric label="直管圧損（概算）" value={calculation.result.pressureLossKpa.toFixed(2)} unit="kPa" />
          </div>
          <p className="mt-4 rounded-2xl bg-teal-50 px-4 py-3 text-sm leading-6 text-teal-900">一般的な配管内径を基準にした水の直管圧損です。管種・スケジュール・局部損失・水温を含む最終選定は仕様に従ってください。</p>
        </div>}
      </div>
    </CalculatorPanel>
  );
}

export function PumpTool() {
  const [flow, setFlow] = useState("6");
  const [staticHead, setStaticHead] = useState("12");
  const [pipeLoss, setPipeLoss] = useState("35");
  const [residualPressure, setResidualPressure] = useState("20");
  const [margin, setMargin] = useState("10");
  const [efficiency, setEfficiency] = useState("60");
  const calculation = useMemo<Calculation<PumpResult>>(
    () => calculateSafely(() => calculatePump(
      requiredNumber(flow, "流量"), requiredNumber(staticHead, "実揚程"), requiredNumber(pipeLoss, "配管損失"),
      requiredNumber(residualPressure, "末端残圧"), requiredNumber(margin, "安全率"), requiredNumber(efficiency, "ポンプ効率"),
    )),
    [flow, staticHead, pipeLoss, residualPressure, margin, efficiency],
  );

  return (
    <CalculatorPanel>
      <div>
        <p className="text-sm font-bold text-sky-700">ポンプ</p>
        <h2 id="pump" className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">ポンプ揚程計算</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">実揚程、配管損失、末端残圧から必要揚程を整理し、動力の概算も確認します。</p>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(360px,1fr)_minmax(0,1fr)]">
        <div className="grid gap-4 rounded-3xl bg-slate-50 p-4 sm:grid-cols-2 sm:p-5">
          <NumberField id="pump-flow" label="流量" value={flow} onChange={(event) => setFlow(event.target.value)} unit="m³/h" min={0} />
          <NumberField id="pump-static-head" label="実揚程" value={staticHead} onChange={(event) => setStaticHead(event.target.value)} unit="m" min={0} />
          <NumberField id="pump-pipe-loss" label="配管損失" value={pipeLoss} onChange={(event) => setPipeLoss(event.target.value)} unit="kPa" min={0} />
          <NumberField id="pump-residual-pressure" label="末端残圧" value={residualPressure} onChange={(event) => setResidualPressure(event.target.value)} unit="kPa" min={0} />
          <NumberField id="pump-margin" label="安全率" value={margin} onChange={(event) => setMargin(event.target.value)} unit="%" min={0} />
          <NumberField id="pump-efficiency" label="想定ポンプ効率" value={efficiency} onChange={(event) => setEfficiency(event.target.value)} unit="%" min={1} max={100} />
        </div>
        {calculation.error ? <ErrorMessage message={calculation.error} /> : calculation.result && <div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <ResultMetric label="配管損失水頭" value={calculation.result.pressureHeadM.toFixed(1)} unit="m" />
            <ResultMetric label="末端残圧水頭" value={calculation.result.residualPressureHeadM.toFixed(1)} unit="m" />
            <ResultMetric label="必要揚程" value={calculation.result.requiredHeadM.toFixed(1)} unit="m" emphasis />
            <ResultMetric label="水動力" value={calculation.result.hydraulicPowerKw.toFixed(2)} unit="kW" />
            <ResultMetric label="軸動力の目安" value={calculation.result.shaftPowerKw.toFixed(2)} unit="kW" emphasis />
          </div>
          <p className="mt-4 rounded-2xl bg-sky-50 px-4 py-3 text-sm leading-6 text-sky-900">ポンプ選定では、この結果に加えて実際のポンプ曲線、NPSH、運転点、インバータ制御などを必ず確認してください。</p>
        </div>}
      </div>
    </CalculatorPanel>
  );
}
