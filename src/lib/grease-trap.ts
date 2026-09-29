/** 利用人数法。出典: 中部コーポレーション2026カタログ p.273 (SHASE-S217-2016)。
 * https://www.chubu-net.co.jp/kenzai/pdf/2026/11-greasetrap.pdf
 * 食数 N [人/日], 水量 W [L/人], 厨房時間 t [h/日], 倍率 k,
 * 油脂・残さ原単位 [g/人], 清掃周期 [日]。2025年版への適合を保証するものではない。
 */
export type GreaseTrapInput = {
  meals: number;
  waterPerMeal: number;
  hours: number;
  peakFactor: number;
  greasePerMeal: number;
  residuePerMeal: number;
  greaseDays: number;
  residueDays: number;
};

export const GREASE_TRAP_EXAMPLE: GreaseTrapInput = {
  meals: 400, waterPerMeal: 80, hours: 12, peakFactor: 3.5,
  greasePerMeal: 8, residuePerMeal: 3, greaseDays: 7, residueDays: 30,
};

export const GREASE_TRAP_LABELS: Record<keyof GreaseTrapInput, string> = {
  meals: "1日あたりの食数（延べ人数）", waterPerMeal: "1食あたりの使用水量",
  hours: "1日あたりの厨房使用時間", peakFactor: "ピーク流量倍率",
  greasePerMeal: "1食あたりの油脂量", residuePerMeal: "1食あたりの残さ量",
  greaseDays: "油脂の清掃周期", residueDays: "残さの清掃周期",
};

function positive(value: number, label: string) {
  if (!Number.isFinite(value) || value <= 0) throw new Error(`${label}は0より大きい有限の数値を入力してください。`);
}

export function calculateGreaseTrap(input: GreaseTrapInput) {
  for (const key of Object.keys(GREASE_TRAP_LABELS) as (keyof GreaseTrapInput)[]) positive(input[key], GREASE_TRAP_LABELS[key]);
  if (input.hours > 24) throw new Error("厨房使用時間は24時間以内にしてください。");
  if (input.peakFactor < 1) throw new Error("ピーク流量倍率は1以上にしてください。");
  const flow = input.meals * input.waterPerMeal / (input.hours * 60) * input.peakFactor;
  const grease = input.meals * input.greasePerMeal * input.greaseDays / 1000;
  const residue = input.meals * input.residuePerMeal * input.residueDays / 1000;
  const mass = grease + residue;
  if (![flow, grease, residue, mass].every((value) => Number.isFinite(value) && value > 0)) throw new Error("計算可能な範囲を超えています。入力値を見直してください。");
  return { flow, grease, residue, mass };
}

export function checkGreaseTrap(result: ReturnType<typeof calculateGreaseTrap>, allowedFlow: number, allowedMass: number) {
  positive(allowedFlow, "製品の許容流入流量");
  positive(allowedMass, "製品の標準阻集グリース質量");
  // 判定は表示用に丸める前の値で行う。
  const flowOk = allowedFlow >= result.flow;
  const massOk = allowedMass >= result.mass;
  return { flowOk, massOk, suitable: flowOk && massOk };
}

/** 必要性能が過小表示されないよう小数第1位へ切り上げる。 */
export function formatGreaseRequirement(value: number) {
  const scaled = value * 10;
  return (Math.ceil(scaled - Math.min(1e-9, Number.EPSILON * Math.abs(scaled) * 4)) / 10).toFixed(1);
}
