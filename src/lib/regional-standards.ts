/**
 * 地域別の一次検討用プロファイル。
 * 自治体ごとに設計基準・改訂日・対象地区が異なるため、画面上で必ず確認・上書きできるようにする。
 */

export type RainfallProfile = {
  id: string;
  label: string;
  municipality: string;
  rainfallIntensityMmH: number;
  source: string;
  note: string;
  formula?: {
    numerator: number;
    offset: number;
    exponent: number;
    defaultDurationMinutes: number;
    label: string;
  };
};

export function calculateProfileRainfallIntensity(profile: RainfallProfile, durationMinutes: number) {
  if (!profile.formula) return profile.rainfallIntensityMmH;
  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) throw new Error("降雨継続時間は0より大きく入力してください。");
  const { numerator, offset, exponent } = profile.formula;
  return numerator / (durationMinutes ** exponent + offset);
}

export const RAINFALL_PROFILES: RainfallProfile[] = [
  {
    id: "custom",
    label: "独自指定（所管自治体の基準値を入力）",
    municipality: "",
    rainfallIntensityMmH: 50,
    source: "案件の所管自治体・協議資料",
    note: "地域・排水先・再現期間・流達時間に応じて入力してください。",
  },
  {
    id: "tokyo-23",
    label: "東京都23区（参考）",
    municipality: "東京都23区",
    rainfallIntensityMmH: 50,
    source: "東京都下水道局の計画降雨強度に関する公開資料",
    note: "対象地区・施設種別・最新の協議条件を必ず確認してください。",
  },
  {
    id: "yokohama-10y-60m",
    label: "横浜市・10年確率・60分（参考）",
    municipality: "横浜市",
    rainfallIntensityMmH: 57.9,
    source: "横浜市『雨水管理計画』の降雨強度式（10年確率・60分）",
    note: "雨水流出抑制・排水先・対象面積により条件が異なります。",
  },
  {
    id: "aichi-nagoya",
    label: "愛知県｜名古屋市（開発基準・参考）",
    municipality: "愛知県名古屋市",
    rainfallIntensityMmH: 50,
    source: "名古屋市『開発行為の許可等に関する運用基準』",
    note: "開発行為の標準値（50 mm/h）。緊急雨水整備事業などの対象地区・排水先は別条件です。",
  },
  {
    id: "mie-hokusei-kuwana",
    label: "三重県｜北勢・桑名区分（10年・60分・参考）",
    municipality: "三重県北勢（桑名市ほか）",
    rainfallIntensityMmH: 67,
    source: "三重県四日市建設事務所『排水施設設計時に用いる雨量数値』",
    note: "桑名市、木曽岬町、東員町、川越町、朝日町の区分です。北勢・亀山等は別の式・値となります。",
  },
  {
    id: "shizuoka-city",
    label: "静岡県｜静岡市（7年確率・参考）",
    municipality: "静岡県静岡市",
    rainfallIntensityMmH: 67,
    source: "静岡市『浸水対策推進プラン』に関する公開資料",
    note: "浸水対策地区の計画降雨強度です。開発許可・排水設備の条件は放流先管理者の指定を優先してください。",
  },
  {
    id: "gifu-city-5y",
    label: "岐阜県｜岐阜市（5年確率・式による）",
    municipality: "岐阜県岐阜市",
    rainfallIntensityMmH: 128,
    source: "岐阜市『技術基準』表8-2-1（5年確率）",
    note: "到達時間に応じた式で計算します。初期値は30分で、流域面積等により到達時間の基準が異なります。",
    formula: { numerator: 2477, offset: 6.6, exponent: 0.75, defaultDurationMinutes: 30, label: "I = 2477 / (t^0.75 + 6.6)" },
  },
  {
    id: "ishikawa-kanazawa",
    label: "石川県｜金沢市（計画降雨・参考）",
    municipality: "石川県金沢市",
    rainfallIntensityMmH: 50,
    source: "金沢市『総合治水対策実施計画』",
    note: "治水対策における従来からの計画降雨です。流域対策を含めた整備目標は別値のため、協議条件を確認してください。",
  },
  {
    id: "toyama-city-5y",
    label: "富山県｜富山市・合流区域以外（5年確率・式による）",
    municipality: "富山県富山市",
    rainfallIntensityMmH: 49,
    source: "富山市『盛土等防災対策に係る技術的基準』表8.5-3",
    note: "到達時間に応じた式で計算します。合流区域・大沢野・大山・八尾・婦中、工事規模で式・確率年が変わります。",
    formula: { numerator: 4900, offset: 40, exponent: 1, defaultDurationMinutes: 60, label: "I = 4900 / (t + 40)" },
  },
  {
    id: "fukui-city",
    label: "福井県｜福井市（5年確率・参考）",
    municipality: "福井県福井市",
    rainfallIntensityMmH: 43.1,
    source: "福井市『下水道雨水対策基本計画』",
    note: "下水道計画降雨の既往5年確率値です。放流先や開発条件では合理式・到達時間による別途協議が必要です。",
  },
  {
    id: "nagano-city-5y",
    label: "長野県｜長野市（5年確率・式による）",
    municipality: "長野県長野市",
    rainfallIntensityMmH: 106.69,
    source: "長野市『総合治水対策・水害の強いまちづくり』",
    note: "1 ha未満の開発等に示される10分値を初期値にしています。敷地規模・用途に応じて確率年と式を確認してください。",
    formula: { numerator: 2774, offset: 16, exponent: 1, defaultDurationMinutes: 10, label: "I = 2774 / (t + 16)" },
  },
];

export type FixtureDefinition = {
  id: string;
  label: string;
  unit: number;
};

/** 横浜市の給水用具給水負荷単位表（国土交通省設計基準・SHASE-S 206引用）を基準値として採用。 */
export const STANDARD_FIXTURES: FixtureDefinition[] = [
  { id: "toilet-valve-public", label: "大便器（洗浄弁・公衆用）", unit: 10 },
  { id: "toilet-valve-private", label: "大便器（洗浄弁・私室用）", unit: 6 },
  { id: "toilet-tank-public", label: "大便器（洗浄タンク・公衆用）", unit: 5 },
  { id: "toilet-tank-private", label: "大便器（洗浄タンク・私室用）", unit: 3 },
  { id: "urinal-valve", label: "小便器（洗浄弁）", unit: 5 },
  { id: "urinal-tank", label: "小便器（洗浄タンク）", unit: 3 },
  { id: "lavatory-public", label: "洗面器（公衆用）", unit: 2 },
  { id: "lavatory-private", label: "洗面器（私室用）", unit: 1 },
  { id: "hand-wash-public", label: "手洗器（公衆用）", unit: 1 },
  { id: "hand-wash-private", label: "手洗器（私室用）", unit: 0.5 },
  { id: "kitchen-sink", label: "台所流し", unit: 3 },
  { id: "shower-private", label: "シャワー（私室用）", unit: 2 },
  { id: "bathtub-private", label: "浴槽（私室用）", unit: 2 },
  { id: "watering", label: "散水・車庫", unit: 5 },
];

export function sumFixtureUnits(counts: Record<string, number>) {
  return STANDARD_FIXTURES.reduce((total, fixture) => {
    const count = counts[fixture.id] ?? 0;
    if (!Number.isFinite(count) || count < 0) throw new Error(`${fixture.label}の台数は0以上で入力してください。`);
    return total + fixture.unit * count;
  }, 0);
}

export type RainwaterResult = {
  flowLps: number;
  flowM3H: number;
  effectiveAreaM2: number;
};

/** 合理式 Q = C × I × A / 360。ここではAをm²で受け、結果をL/sへ換算して返す。 */
export function calculateRainwaterFlow(
  roofAreaM2: number,
  runoffCoefficient: number,
  rainfallIntensityMmH: number,
): RainwaterResult {
  if (![roofAreaM2, runoffCoefficient, rainfallIntensityMmH].every(Number.isFinite)) throw new Error("数値を入力してください。");
  if (roofAreaM2 <= 0) throw new Error("屋根面積は0より大きく入力してください。");
  if (runoffCoefficient <= 0 || runoffCoefficient > 1) throw new Error("流出係数は0より大きく1以下で入力してください。");
  if (rainfallIntensityMmH <= 0) throw new Error("降雨強度は0より大きく入力してください。");
  const effectiveAreaM2 = roofAreaM2 * runoffCoefficient;
  const flowLps = effectiveAreaM2 * rainfallIntensityMmH / 3600;
  return { flowLps, flowM3H: flowLps * 3.6, effectiveAreaM2 };
}
