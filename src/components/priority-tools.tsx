"use client";

import { useMemo, useState } from "react";
import { CalculatorPanel, NumberField, ResultMetric } from "@/components/calculator-ui";
import {
  calculateCo2Ventilation,
  calculateEqualFrictionDuct,
  calculateLouver,
  type Co2VentilationResult,
  type EqualFrictionDuctResult,
  type LouverResult,
} from "@/lib/equipment-calculations";
import {
  calculateProfileRainfallIntensity,
  calculateRainwaterFlow,
  RAINFALL_PROFILES,
  STANDARD_FIXTURES,
  sumFixtureUnits,
  type RainwaterResult,
} from "@/lib/regional-standards";

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

const selectClassName = "min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-base font-bold text-slate-800 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100";

export function Co2VentilationTool() {
  const [people, setPeople] = useState("10");
  const [generation, setGeneration] = useState("0.30");
  const [outdoorCo2, setOutdoorCo2] = useState("420");
  const [targetCo2, setTargetCo2] = useState("1000");
  const calculation = useMemo<Calculation<Co2VentilationResult>>(
    () => calculateSafely(() => calculateCo2Ventilation(
      requiredNumber(people, "在室人数"), requiredNumber(generation, "CO₂発生量"),
      requiredNumber(outdoorCo2, "外気CO₂濃度"), requiredNumber(targetCo2, "目標室内CO₂濃度"),
    )),
    [people, generation, outdoorCo2, targetCo2],
  );

  return (
    <CalculatorPanel>
      <div>
        <p className="text-sm font-bold text-sky-700">換気・空気質</p>
        <h2 id="co2-ventilation" className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">CO₂基準必要換気量</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">在室者のCO₂発生量と目標濃度から、定常状態で必要となる外気量を概算します。</p>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(340px,1fr)_minmax(0,1fr)]">
        <div className="grid gap-4 rounded-3xl bg-slate-50 p-4 sm:grid-cols-2 sm:p-5">
          <NumberField id="co2-people" label="在室人数" value={people} onChange={(event) => setPeople(event.target.value)} unit="人" min={0} step="1" />
          <NumberField id="co2-generation" label="1人あたりCO₂発生量" value={generation} onChange={(event) => setGeneration(event.target.value)} unit="L/min・人" min={0.01} helper="活動量に応じて設定" />
          <NumberField id="co2-outdoor" label="外気CO₂濃度" value={outdoorCo2} onChange={(event) => setOutdoorCo2(event.target.value)} unit="ppm" min={0} step="1" />
          <NumberField id="co2-target" label="目標室内CO₂濃度" value={targetCo2} onChange={(event) => setTargetCo2(event.target.value)} unit="ppm" min={1} step="1" helper="初期値は一次確認の目安" />
        </div>
        {calculation.error ? <ErrorMessage message={calculation.error} /> : calculation.result && <div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <ResultMetric label="必要外気量（1人）" value={calculation.result.requiredPerPersonM3H.toFixed(1)} unit="m³/h・人" />
            <ResultMetric label="必要外気量（合計）" value={calculation.result.requiredTotalM3H.toFixed(0)} unit="m³/h" emphasis />
            <ResultMetric label="必要外気量（合計）" value={calculation.result.requiredTotalLMin.toFixed(0)} unit="L/min" />
            <ResultMetric label="内外濃度差" value={calculation.result.concentrationDifferencePpm.toFixed(0)} unit="ppm" />
          </div>
          <p className="mt-4 rounded-2xl bg-sky-50 px-4 py-3 text-sm leading-6 text-sky-900"><strong>前提：</strong>定常状態の物質収支による概算です。初期値の1,000 ppmは建築物環境衛生管理基準で用いられる値ですが、用途・対象建築物・設計条件に応じて必ず確認してください。</p>
        </div>}
      </div>
    </CalculatorPanel>
  );
}

export function LouverTool() {
  const [airflow, setAirflow] = useState("1000");
  const [faceVelocity, setFaceVelocity] = useState("2.5");
  const [freeArea, setFreeArea] = useState("50");
  const [aspectRatio, setAspectRatio] = useState("1.5");
  const calculation = useMemo<Calculation<LouverResult>>(
    () => calculateSafely(() => calculateLouver(
      requiredNumber(airflow, "風量"), requiredNumber(faceVelocity, "面風速"),
      requiredNumber(freeArea, "有効開口率"), requiredNumber(aspectRatio, "横縦比"),
    )),
    [airflow, faceVelocity, freeArea, aspectRatio],
  );

  return (
    <CalculatorPanel>
      <div>
        <p className="text-sm font-bold text-teal-700">外気・排気口</p>
        <h2 id="louver" className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">ガラリ必要開口寸法</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">必要風量、面風速、有効開口率からガラリの外形寸法を素早く概算します。</p>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(340px,1fr)_minmax(0,1fr)]">
        <div className="grid gap-4 rounded-3xl bg-slate-50 p-4 sm:grid-cols-2 sm:p-5">
          <NumberField id="louver-airflow" label="通過風量" value={airflow} onChange={(event) => setAirflow(event.target.value)} unit="m³/h" min={0} />
          <NumberField id="louver-velocity" label="目標面風速" value={faceVelocity} onChange={(event) => setFaceVelocity(event.target.value)} unit="m/s" min={0.1} />
          <NumberField id="louver-free-area" label="有効開口率" value={freeArea} onChange={(event) => setFreeArea(event.target.value)} unit="%" min={1} max={100} helper="製品カタログの値を優先" />
          <NumberField id="louver-aspect" label="横縦比" value={aspectRatio} onChange={(event) => setAspectRatio(event.target.value)} unit="W/H" min={0.1} />
        </div>
        {calculation.error ? <ErrorMessage message={calculation.error} /> : calculation.result && <div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <ResultMetric label="必要有効開口面積" value={(calculation.result.netAreaM2 * 10_000).toFixed(1)} unit="cm²" />
            <ResultMetric label="必要外形面積" value={(calculation.result.grossAreaM2 * 10_000).toFixed(1)} unit="cm²" />
            <ResultMetric label="正方形の場合" value={`${Math.ceil(calculation.result.squareSideMm / 50) * 50}`} unit="mm角" />
            <ResultMetric label="推奨外形寸法" value={`${calculation.result.recommendedWidthMm} × ${calculation.result.recommendedHeightMm}`} unit="mm" emphasis />
          </div>
          <p className="mt-4 rounded-2xl bg-teal-50 px-4 py-3 text-sm leading-6 text-teal-900">外形寸法は50 mm単位で切り上げています。防虫網、雨除け、ダンパー、ルーバー形状による圧損は製品選定時に必ず確認してください。</p>
        </div>}
      </div>
    </CalculatorPanel>
  );
}

export function EqualFrictionDuctTool() {
  const [airflow, setAirflow] = useState("1000");
  const [friction, setFriction] = useState("1.0");
  const [aspectRatio, setAspectRatio] = useState("1.5");
  const calculation = useMemo<Calculation<EqualFrictionDuctResult>>(
    () => calculateSafely(() => calculateEqualFrictionDuct(
      requiredNumber(airflow, "風量"), requiredNumber(friction, "目標摩擦損失"), requiredNumber(aspectRatio, "角ダクト縦横比"),
    )),
    [airflow, friction, aspectRatio],
  );

  return (
    <CalculatorPanel>
      <div>
        <p className="text-sm font-bold text-teal-700">ダクト</p>
        <h2 id="equal-friction-duct" className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">等摩擦法ダクトサイズ計算</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">指定した摩擦損失にそろえる円形ダクト径を求め、丸・角ダクトの寸法目安を表示します。</p>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(300px,0.8fr)_minmax(0,1.2fr)]">
        <div className="grid gap-4 rounded-3xl bg-slate-50 p-4 sm:grid-cols-3 lg:grid-cols-1 sm:p-5">
          <NumberField id="equal-duct-airflow" label="風量" value={airflow} onChange={(event) => setAirflow(event.target.value)} unit="m³/h" min={0} />
          <NumberField id="equal-duct-friction" label="目標摩擦損失" value={friction} onChange={(event) => setFriction(event.target.value)} unit="Pa/m" min={0.01} />
          <NumberField id="equal-duct-aspect" label="角ダクト縦横比" value={aspectRatio} onChange={(event) => setAspectRatio(event.target.value)} unit="W/H" min={1} max={4} />
        </div>
        {calculation.error ? <ErrorMessage message={calculation.error} /> : calculation.result && <div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <ResultMetric label="計算上の円形径" value={calculation.result.calculatedDiameterMm.toFixed(0)} unit="mm" />
            <ResultMetric label="推奨丸ダクト" value={`φ${calculation.result.recommendedDiameterMm}`} unit="mm" emphasis />
            <ResultMetric label="角ダクト目安" value={`${calculation.result.rectangularWidthMm} × ${calculation.result.rectangularHeightMm}`} unit="mm" emphasis />
            <ResultMetric label="採用丸ダクト風速" value={calculation.result.actualVelocityMS.toFixed(1)} unit="m/s" />
            <ResultMetric label="採用丸ダクト摩擦損失" value={calculation.result.actualFrictionPaM.toFixed(2)} unit="Pa/m" />
          </div>
          <p className="mt-4 rounded-2xl bg-teal-50 px-4 py-3 text-sm leading-6 text-teal-900">亜鉛めっき鋼板の粗さを仮定した直管部の概算です。角ダクトの等価径、継手・分岐・器具の局部損失は別途確認してください。</p>
        </div>}
      </div>
    </CalculatorPanel>
  );
}

const WATER_PROFILES = [
  { id: "standard", label: "標準（全国の一次検討）", note: "国土交通省・SHASE-S 206を引用する横浜市の表を標準値として仮適用します。" },
  { id: "tokyo", label: "東京都", note: "所管水道局の最新の給水装置設計基準と照合してください。" },
  { id: "yokohama", label: "横浜市", note: "横浜市の給水装置工事設計・施工指針に掲載される表を基準にしています。" },
  { id: "aichi", label: "愛知県", note: "名古屋市など所管水道事業体の最新の給水装置工事基準と照合してください。" },
  { id: "mie", label: "三重県", note: "市町・水道事業体ごとの最新の給水装置工事基準と照合してください。" },
  { id: "shizuoka", label: "静岡県", note: "市町・水道事業体ごとの最新の給水装置工事基準と照合してください。" },
  { id: "gifu", label: "岐阜県", note: "市町・水道事業体ごとの最新の給水装置工事基準と照合してください。" },
  { id: "ishikawa", label: "石川県", note: "市町・水道事業体ごとの最新の給水装置工事基準と照合してください。" },
  { id: "toyama", label: "富山県", note: "市町・水道事業体ごとの最新の給水装置工事基準と照合してください。" },
  { id: "fukui", label: "福井県", note: "市町・水道事業体ごとの最新の給水装置工事基準と照合してください。" },
  { id: "nagano", label: "長野県", note: "市町・水道事業体ごとの最新の給水装置工事基準と照合してください。" },
  { id: "osaka", label: "大阪市", note: "大阪市水道局の最新の設計施工基準と照合してください。" },
  { id: "other", label: "その他の地域", note: "所管水道事業体の負荷単位表へ照合し、差異があれば器具数・設計条件を見直してください。" },
];

export function FixtureUnitsTool() {
  const [profileId, setProfileId] = useState("standard");
  const [counts, setCounts] = useState<Record<string, string>>({});
  const [adjustment, setAdjustment] = useState("0");
  const profile = WATER_PROFILES.find((item) => item.id === profileId) ?? WATER_PROFILES[0];
  const calculation = useMemo<Calculation<{ baseUnits: number; adjustedUnits: number }>>(
    () => calculateSafely(() => {
      const parsedCounts = Object.fromEntries(Object.entries(counts).map(([key, value]) => [key, value.trim() ? Number(value) : 0]));
      const baseUnits = sumFixtureUnits(parsedCounts);
      const adjustmentRate = requiredNumber(adjustment, "地域・案件の調整率");
      if (adjustmentRate < -100) throw new Error("地域・案件の調整率は-100%以上で入力してください。");
      return { baseUnits, adjustedUnits: baseUnits * (1 + adjustmentRate / 100) };
    }),
    [counts, adjustment],
  );

  return (
    <CalculatorPanel>
      <div>
        <p className="text-sm font-bold text-teal-700">給水</p>
        <h2 id="fixture-units" className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">給水器具負荷単位集計</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">器具数を入力して給水負荷単位を合計。地域を選び、所管水道局の設計条件へ合わせて一次検討できます。</p>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(340px,1fr)_minmax(0,1fr)]">
        <div className="rounded-3xl bg-slate-50 p-4 sm:p-5">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">地域プロファイル</span>
            <select className={selectClassName} value={profileId} onChange={(event) => setProfileId(event.target.value)}>
              {WATER_PROFILES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </label>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {STANDARD_FIXTURES.map((fixture) => (
              <label key={fixture.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2.5">
                <span className="min-w-0 flex-1 text-xs font-bold leading-5 text-slate-700">{fixture.label}<br /><span className="text-slate-400">{fixture.unit} 単位 / 台</span></span>
                <input aria-label={`${fixture.label}の台数`} type="number" inputMode="numeric" min="0" step="1" value={counts[fixture.id] ?? ""} onChange={(event) => setCounts((current) => ({ ...current, [fixture.id]: event.target.value }))} className="h-10 w-16 rounded-lg border border-slate-200 px-2 text-right font-bold outline-none focus:border-sky-500" />
                <span className="text-xs font-bold text-slate-500">台</span>
              </label>
            ))}
          </div>
          <div className="mt-4"><NumberField id="fixture-adjustment" label="地域・案件の調整率（任意）" value={adjustment} onChange={(event) => setAdjustment(event.target.value)} unit="%" min={-100} helper="所管水道局・設計仕様で補正が指定された場合のみ入力" /></div>
        </div>
        {calculation.error ? <ErrorMessage message={calculation.error} /> : calculation.result && <div>
          <div className="grid grid-cols-2 gap-3 sm:max-w-xl">
            <ResultMetric label="合計負荷単位" value={calculation.result.baseUnits.toFixed(1)} unit="単位" emphasis />
            <ResultMetric label="調整後の目安" value={calculation.result.adjustedUnits.toFixed(1)} unit="単位" />
          </div>
          <p className="mt-4 rounded-2xl bg-teal-50 px-4 py-3 text-sm leading-6 text-teal-900"><strong>{profile.label}：</strong>{profile.note}</p>
          <p className="mt-3 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">負荷単位からの同時使用流量・管径選定は、水道局ごとの方式、給水方式、建物用途で変わります。この画面は器具負荷単位の集計までを扱い、最終設計は所管水道局の最新版で確認してください。</p>
        </div>}
      </div>
    </CalculatorPanel>
  );
}

export function RainwaterTool() {
  const [profileId, setProfileId] = useState("tokyo-23");
  const initialProfile = RAINFALL_PROFILES.find((item) => item.id === "tokyo-23") ?? RAINFALL_PROFILES[0];
  const [municipality, setMunicipality] = useState(initialProfile.municipality);
  const [intensity, setIntensity] = useState(String(initialProfile.rainfallIntensityMmH));
  const [duration, setDuration] = useState(String(initialProfile.formula?.defaultDurationMinutes ?? 60));
  const [roofArea, setRoofArea] = useState("100");
  const [runoffCoefficient, setRunoffCoefficient] = useState("0.9");
  const profile = RAINFALL_PROFILES.find((item) => item.id === profileId) ?? RAINFALL_PROFILES[0];
  const calculation = useMemo<Calculation<RainwaterResult>>(
    () => calculateSafely(() => calculateRainwaterFlow(requiredNumber(roofArea, "屋根面積"), requiredNumber(runoffCoefficient, "流出係数"), requiredNumber(intensity, "計画降雨強度"))),
    [roofArea, runoffCoefficient, intensity],
  );

  function selectProfile(nextProfileId: string) {
    const next = RAINFALL_PROFILES.find((item) => item.id === nextProfileId) ?? RAINFALL_PROFILES[0];
    const nextDuration = next.formula?.defaultDurationMinutes ?? 60;
    setProfileId(nextProfileId);
    setMunicipality(next.municipality);
    setDuration(String(nextDuration));
    setIntensity(String(calculateProfileRainfallIntensity(next, nextDuration)));
  }

  function updateDuration(nextDuration: string) {
    setDuration(nextDuration);
    if (profile.formula && nextDuration.trim()) {
      try {
        setIntensity(String(calculateProfileRainfallIntensity(profile, Number(nextDuration))));
      } catch {
        // 入力中の不完全な値は、結果エリアの入力エラーで案内する。
      }
    }
  }

  return (
    <CalculatorPanel>
      <div>
        <p className="text-sm font-bold text-sky-700">雨水・排水</p>
        <h2 id="rainwater" className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">屋根雨水排水量計算</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">地域の計画降雨強度、屋根面積、流出係数から、合理式で雨水排水量を概算します。</p>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(340px,1fr)_minmax(0,1fr)]">
        <div className="grid gap-4 rounded-3xl bg-slate-50 p-4 sm:grid-cols-2 sm:p-5">
          <label className="block sm:col-span-2">
            <span className="mb-2 block text-sm font-bold text-slate-700">地域・計画降雨強度プロファイル</span>
            <select className={selectClassName} value={profileId} onChange={(event) => selectProfile(event.target.value)}>
              {RAINFALL_PROFILES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">対象地域・案件名</span>
            <input value={municipality} onChange={(event) => setMunicipality(event.target.value)} placeholder="例：○○市" className={selectClassName} />
          </label>
          <NumberField id="rain-intensity" label="計画降雨強度" value={intensity} onChange={(event) => setIntensity(event.target.value)} unit="mm/h" min={0.1} helper="選択地域の所管基準値を入力可能" />
          {profile.formula && <NumberField id="rain-duration" label="降雨継続時間" value={duration} onChange={(event) => updateDuration(event.target.value)} unit="min" min={0.1} helper={`${profile.formula.label} で再計算`} />}
          <NumberField id="rain-roof-area" label="屋根水平投影面積" value={roofArea} onChange={(event) => setRoofArea(event.target.value)} unit="m²" min={0.1} />
          <NumberField id="rain-coefficient" label="流出係数" value={runoffCoefficient} onChange={(event) => setRunoffCoefficient(event.target.value)} unit="C" min={0.01} max={1} helper="屋根仕上げ・貯留条件に合わせて設定" />
        </div>
        {calculation.error ? <ErrorMessage message={calculation.error} /> : calculation.result && <div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <ResultMetric label="有効集水面積" value={calculation.result.effectiveAreaM2.toFixed(1)} unit="m²" />
            <ResultMetric label="計画雨水排水量" value={calculation.result.flowLps.toFixed(2)} unit="L/s" emphasis />
            <ResultMetric label="計画雨水排水量" value={calculation.result.flowM3H.toFixed(2)} unit="m³/h" />
          </div>
          <p className="mt-4 rounded-2xl bg-sky-50 px-4 py-3 text-sm leading-6 text-sky-900"><strong>{municipality || "選択地域"}の参照情報：</strong>{profile.source}<br />{profile.note}</p>
          <p className="mt-3 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">排水管・ドレン・オーバーフローの最終選定には、地域の下水道条例、排水先、再現期間、屋根形状、詰まり・越流対策などを必ず反映してください。</p>
        </div>}
      </div>
    </CalculatorPanel>
  );
}
