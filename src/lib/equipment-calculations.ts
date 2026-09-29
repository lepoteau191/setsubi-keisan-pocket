/**
 * 設備の概算計算ロジック。UIに依存させず、入力値の検証もここで行う。
 * 現場での一次判断を支援する目的であり、最終設計は仕様書・メーカー資料を優先する。
 */

const WATER_DENSITY_KG_M3 = 998;
const WATER_SPECIFIC_HEAT_KJ_KG_K = 4.186;
const GRAVITY = 9.80665;
const AIR_DENSITY_KG_M3 = 1.2;
const WATER_KINEMATIC_VISCOSITY_M2_S = 1.004e-6;
const AIR_KINEMATIC_VISCOSITY_M2_S = 1.5e-5;
const GALVANIZED_DUCT_ROUGHNESS_M = 0.00015;

function assertFinite(value: number, label: string) {
  if (!Number.isFinite(value)) throw new Error(`${label}を入力してください。`);
}

function assertNonNegative(value: number, label: string) {
  assertFinite(value, label);
  if (value < 0) throw new Error(`${label}は0以上で入力してください。`);
}

export type VentilationResult = {
  byPeople: number;
  byArea: number;
  byAirChanges: number;
  recommended: number;
  actualAirChanges: number;
};

export function calculateVentilation(
  people: number,
  airflowPerPerson: number,
  areaM2: number,
  airflowPerArea: number,
  volumeM3: number,
  airChangesPerHour: number,
  adoptedAirflow: number,
): VentilationResult {
  [
    [people, "在室人数"], [airflowPerPerson, "1人あたり外気量"], [areaM2, "床面積"],
    [airflowPerArea, "面積あたり外気量"], [airChangesPerHour, "目標換気回数"], [adoptedAirflow, "採用風量"],
  ].forEach(([value, label]) => assertNonNegative(value as number, label as string));
  assertFinite(volumeM3, "室内容積");
  if (volumeM3 <= 0) throw new Error("室内容積は0より大きく入力してください。");

  const byPeople = people * airflowPerPerson;
  const byArea = areaM2 * airflowPerArea;
  const byAirChanges = volumeM3 * airChangesPerHour;
  return {
    byPeople,
    byArea,
    byAirChanges,
    recommended: Math.max(byPeople, byArea, byAirChanges),
    actualAirChanges: adoptedAirflow / volumeM3,
  };
}

export type HeatLoadResult = {
  capacityKw: number;
  capacityKcalH: number;
  flowM3H: number;
};

/** Q = m × ρ × Cp × ΔT。流量 L/min を水の熱能力 kW に換算する。 */
export function calculateWaterHeatLoad(flowLMin: number, temperatureDifferenceC: number): HeatLoadResult {
  assertNonNegative(flowLMin, "水量");
  assertNonNegative(temperatureDifferenceC, "温度差");
  const capacityKw = (flowLMin / 60) * WATER_DENSITY_KG_M3 * WATER_SPECIFIC_HEAT_KJ_KG_K * temperatureDifferenceC / 1000;
  return {
    capacityKw,
    capacityKcalH: capacityKw * 859.8452278589857,
    flowM3H: flowLMin * 0.06,
  };
}

const DUCT_STANDARD_DIAMETERS_MM = [100, 125, 150, 175, 200, 225, 250, 275, 300, 325, 350, 375, 400, 450, 500, 550, 600, 650, 700, 750, 800, 900, 1000, 1100, 1200];

export type DuctResult = {
  requiredAreaM2: number;
  calculatedDiameterMm: number;
  recommendedDiameterMm: number;
  rectangularWidthMm: number;
  rectangularHeightMm: number;
  actualVelocity: number;
  pressureLossPaM: number;
  totalPressureLossPa: number;
};

/** 円形ダクトを基準に、Darcy-Weisbach式（摩擦係数0.02の概算）で直管圧損を算出。 */
export function calculateDuct(
  airflowM3H: number,
  targetVelocityMS: number,
  aspectRatio: number,
  ductLengthM: number,
): DuctResult {
  assertNonNegative(airflowM3H, "風量");
  assertFinite(targetVelocityMS, "目標風速");
  assertFinite(aspectRatio, "縦横比");
  assertNonNegative(ductLengthM, "ダクト長さ");
  if (targetVelocityMS <= 0) throw new Error("目標風速は0より大きく入力してください。");
  if (aspectRatio < 1 || aspectRatio > 4) throw new Error("縦横比は1〜4の範囲で入力してください。");

  const airflowM3S = airflowM3H / 3600;
  const requiredAreaM2 = airflowM3S / targetVelocityMS;
  const calculatedDiameterMm = Math.sqrt(4 * requiredAreaM2 / Math.PI) * 1000;
  const recommendedDiameterMm = DUCT_STANDARD_DIAMETERS_MM.find((diameter) => diameter >= calculatedDiameterMm)
    ?? DUCT_STANDARD_DIAMETERS_MM[DUCT_STANDARD_DIAMETERS_MM.length - 1];
  const recommendedArea = Math.PI * (recommendedDiameterMm / 1000) ** 2 / 4;
  const actualVelocity = airflowM3S / recommendedArea;
  const pressureLossPaM = recommendedDiameterMm === 0
    ? 0
    : 0.02 * (AIR_DENSITY_KG_M3 * actualVelocity ** 2 / 2) / (recommendedDiameterMm / 1000);
  const rectangularWidthMm = Math.sqrt(requiredAreaM2 * aspectRatio) * 1000;
  const rectangularHeightMm = Math.sqrt(requiredAreaM2 / aspectRatio) * 1000;

  return {
    requiredAreaM2,
    calculatedDiameterMm,
    recommendedDiameterMm,
    rectangularWidthMm,
    rectangularHeightMm,
    actualVelocity,
    pressureLossPaM,
    totalPressureLossPa: pressureLossPaM * ductLengthM,
  };
}

const PIPE_SIZES = [
  { nominal: "15A", insideDiameterMm: 16.1 }, { nominal: "20A", insideDiameterMm: 21.6 },
  { nominal: "25A", insideDiameterMm: 27.6 }, { nominal: "32A", insideDiameterMm: 35.7 },
  { nominal: "40A", insideDiameterMm: 41.6 }, { nominal: "50A", insideDiameterMm: 52.9 },
  { nominal: "65A", insideDiameterMm: 67.9 }, { nominal: "80A", insideDiameterMm: 80.7 },
  { nominal: "100A", insideDiameterMm: 105.3 }, { nominal: "125A", insideDiameterMm: 130.8 }, { nominal: "150A", insideDiameterMm: 155.2 },
];

export type PipeResult = {
  requiredDiameterMm: number;
  recommendedNominal: string;
  recommendedInsideDiameterMm: number;
  actualVelocity: number;
  pressureLossKpa: number;
};

/** 水配管の直管圧損を Darcy-Weisbach 式で概算（乱流はBlasius近似）。 */
export function calculatePipe(
  flowLMin: number,
  targetVelocityMS: number,
  lengthM: number,
): PipeResult {
  assertNonNegative(flowLMin, "流量");
  assertFinite(targetVelocityMS, "目標流速");
  assertNonNegative(lengthM, "配管長さ");
  if (targetVelocityMS <= 0) throw new Error("目標流速は0より大きく入力してください。");

  const flowM3S = flowLMin / 60000;
  const requiredDiameterM = Math.sqrt(4 * flowM3S / (Math.PI * targetVelocityMS));
  const requiredDiameterMm = requiredDiameterM * 1000;
  const selected = PIPE_SIZES.find((size) => size.insideDiameterMm >= requiredDiameterMm)
    ?? PIPE_SIZES[PIPE_SIZES.length - 1];
  const diameterM = selected.insideDiameterMm / 1000;
  const actualVelocity = flowM3S / (Math.PI * diameterM ** 2 / 4);
  const reynoldsNumber = actualVelocity * diameterM / WATER_KINEMATIC_VISCOSITY_M2_S;
  const frictionFactor = reynoldsNumber <= 0 ? 0 : reynoldsNumber < 2300 ? 64 / reynoldsNumber : 0.3164 / reynoldsNumber ** 0.25;
  const pressureLossPa = frictionFactor * (lengthM / diameterM) * (WATER_DENSITY_KG_M3 * actualVelocity ** 2 / 2);

  return {
    requiredDiameterMm,
    recommendedNominal: selected.nominal,
    recommendedInsideDiameterMm: selected.insideDiameterMm,
    actualVelocity,
    pressureLossKpa: pressureLossPa / 1000,
  };
}

export type PumpResult = {
  pressureHeadM: number;
  residualPressureHeadM: number;
  requiredHeadM: number;
  hydraulicPowerKw: number;
  shaftPowerKw: number;
};

/** H = 実揚程 + 配管損失圧力水頭 + 末端残圧水頭。ポンプ効率は軸動力の概算にのみ使用。 */
export function calculatePump(
  flowM3H: number,
  staticHeadM: number,
  pipeLossKpa: number,
  residualPressureKpa: number,
  safetyMarginPercent: number,
  efficiencyPercent: number,
): PumpResult {
  [
    [flowM3H, "流量"], [staticHeadM, "実揚程"], [pipeLossKpa, "配管損失"],
    [residualPressureKpa, "末端残圧"], [safetyMarginPercent, "安全率"],
  ].forEach(([value, label]) => assertNonNegative(value as number, label as string));
  assertFinite(efficiencyPercent, "ポンプ効率");
  if (efficiencyPercent <= 0 || efficiencyPercent > 100) throw new Error("ポンプ効率は0より大きく100以下で入力してください。");

  const pressureHeadM = pipeLossKpa * 1000 / (WATER_DENSITY_KG_M3 * GRAVITY);
  const residualPressureHeadM = residualPressureKpa * 1000 / (WATER_DENSITY_KG_M3 * GRAVITY);
  const requiredHeadM = (staticHeadM + pressureHeadM + residualPressureHeadM) * (1 + safetyMarginPercent / 100);
  const hydraulicPowerKw = WATER_DENSITY_KG_M3 * GRAVITY * (flowM3H / 3600) * requiredHeadM / 1000;
  return {
    pressureHeadM,
    residualPressureHeadM,
    requiredHeadM,
    hydraulicPowerKw,
    shaftPowerKw: hydraulicPowerKw / (efficiencyPercent / 100),
  };
}

export type Co2VentilationResult = {
  requiredPerPersonM3H: number;
  requiredTotalM3H: number;
  requiredTotalLMin: number;
  concentrationDifferencePpm: number;
};

/** 定常状態の物質収支 Q = G / (Ci - Co)。CO₂発生量は L/min・人、濃度は ppm。 */
export function calculateCo2Ventilation(
  people: number,
  co2GenerationLMinPerson: number,
  outdoorCo2Ppm: number,
  targetCo2Ppm: number,
): Co2VentilationResult {
  assertNonNegative(people, "在室人数");
  assertFinite(co2GenerationLMinPerson, "1人あたりCO₂発生量");
  assertFinite(outdoorCo2Ppm, "外気CO₂濃度");
  assertFinite(targetCo2Ppm, "目標室内CO₂濃度");
  if (co2GenerationLMinPerson <= 0) throw new Error("1人あたりCO₂発生量は0より大きく入力してください。");
  if (outdoorCo2Ppm < 0 || targetCo2Ppm <= outdoorCo2Ppm) throw new Error("目標室内CO₂濃度は外気CO₂濃度より大きく入力してください。");

  const concentrationDifferencePpm = targetCo2Ppm - outdoorCo2Ppm;
  const requiredPerPersonLMin = co2GenerationLMinPerson / (concentrationDifferencePpm * 1e-6);
  return {
    requiredPerPersonM3H: requiredPerPersonLMin * 0.06,
    requiredTotalM3H: requiredPerPersonLMin * people * 0.06,
    requiredTotalLMin: requiredPerPersonLMin * people,
    concentrationDifferencePpm,
  };
}

export type LouverResult = {
  netAreaM2: number;
  grossAreaM2: number;
  squareSideMm: number;
  recommendedWidthMm: number;
  recommendedHeightMm: number;
};

/** 必要有効面積 = 風量 / 面風速、必要外形面積 = 有効面積 / 有効開口率。 */
export function calculateLouver(
  airflowM3H: number,
  faceVelocityMS: number,
  freeAreaRatioPercent: number,
  aspectRatio: number,
): LouverResult {
  assertNonNegative(airflowM3H, "風量");
  assertFinite(faceVelocityMS, "面風速");
  assertFinite(freeAreaRatioPercent, "有効開口率");
  assertFinite(aspectRatio, "縦横比");
  if (faceVelocityMS <= 0) throw new Error("面風速は0より大きく入力してください。");
  if (freeAreaRatioPercent <= 0 || freeAreaRatioPercent > 100) throw new Error("有効開口率は0より大きく100以下で入力してください。");
  if (aspectRatio <= 0) throw new Error("縦横比は0より大きく入力してください。");

  const netAreaM2 = airflowM3H / 3600 / faceVelocityMS;
  const grossAreaM2 = netAreaM2 / (freeAreaRatioPercent / 100);
  const widthM = Math.sqrt(grossAreaM2 * aspectRatio);
  const heightM = Math.sqrt(grossAreaM2 / aspectRatio);
  return {
    netAreaM2,
    grossAreaM2,
    squareSideMm: Math.sqrt(grossAreaM2) * 1000,
    recommendedWidthMm: Math.ceil(widthM * 1000 / 50) * 50,
    recommendedHeightMm: Math.ceil(heightM * 1000 / 50) * 50,
  };
}

function ductPressureGradientPaM(airflowM3S: number, diameterM: number) {
  const areaM2 = Math.PI * diameterM ** 2 / 4;
  const velocityMS = airflowM3S / areaM2;
  const reynoldsNumber = velocityMS * diameterM / AIR_KINEMATIC_VISCOSITY_M2_S;
  if (reynoldsNumber <= 0) return 0;
  const frictionFactor = reynoldsNumber < 2300
    ? 64 / reynoldsNumber
    : 0.25 / Math.log10(GALVANIZED_DUCT_ROUGHNESS_M / (3.7 * diameterM) + 5.74 / reynoldsNumber ** 0.9) ** 2;
  return frictionFactor * (AIR_DENSITY_KG_M3 * velocityMS ** 2 / 2) / diameterM;
}

export type EqualFrictionDuctResult = {
  calculatedDiameterMm: number;
  recommendedDiameterMm: number;
  rectangularWidthMm: number;
  rectangularHeightMm: number;
  actualVelocityMS: number;
  actualFrictionPaM: number;
};

/** 等摩擦法。亜鉛めっき鋼板の粗さを仮定し、指定摩擦損失となる円形ダクト径を数値計算する。 */
export function calculateEqualFrictionDuct(
  airflowM3H: number,
  targetFrictionPaM: number,
  aspectRatio: number,
): EqualFrictionDuctResult {
  assertFinite(airflowM3H, "風量");
  assertFinite(targetFrictionPaM, "目標摩擦損失");
  assertFinite(aspectRatio, "縦横比");
  if (airflowM3H <= 0) throw new Error("風量は0より大きく入力してください。");
  if (targetFrictionPaM <= 0) throw new Error("目標摩擦損失は0より大きく入力してください。");
  if (aspectRatio < 1 || aspectRatio > 4) throw new Error("縦横比は1〜4の範囲で入力してください。");

  const airflowM3S = airflowM3H / 3600;
  let low = 0.05;
  let high = 2;
  for (let index = 0; index < 80; index += 1) {
    const middle = (low + high) / 2;
    if (ductPressureGradientPaM(airflowM3S, middle) > targetFrictionPaM) {
      low = middle;
    } else {
      high = middle;
    }
  }
  const calculatedDiameterMm = ((low + high) / 2) * 1000;
  const recommendedDiameterMm = DUCT_STANDARD_DIAMETERS_MM.find((diameter) => diameter >= calculatedDiameterMm)
    ?? DUCT_STANDARD_DIAMETERS_MM[DUCT_STANDARD_DIAMETERS_MM.length - 1];
  const recommendedDiameterM = recommendedDiameterMm / 1000;
  const recommendedAreaM2 = Math.PI * recommendedDiameterM ** 2 / 4;
  const rectangularAreaM2 = Math.PI * ((low + high) / 2) ** 2 / 4;
  return {
    calculatedDiameterMm,
    recommendedDiameterMm,
    rectangularWidthMm: Math.ceil(Math.sqrt(rectangularAreaM2 * aspectRatio) * 1000 / 50) * 50,
    rectangularHeightMm: Math.ceil(Math.sqrt(rectangularAreaM2 / aspectRatio) * 1000 / 50) * 50,
    actualVelocityMS: airflowM3S / recommendedAreaM2,
    actualFrictionPaM: ductPressureGradientPaM(airflowM3S, recommendedDiameterM),
  };
}
