/**
 * 湿り空気の状態値を扱う計算ロジック。
 * 飽和水蒸気圧は ASHRAE Fundamentals で用いられる式（温度: ℃、圧力: kPa）を使用する。
 * UI には依存させず、他の設備計算からも再利用できるようにする。
 */

export const STANDARD_ATMOSPHERIC_PRESSURE_KPA = 101.325;
const EPSILON = 0.62198;

export type AirState = {
  dryBulb: number;
  relativeHumidity: number;
  absoluteHumidity: number;
  dewPoint: number;
  wetBulb: number;
  enthalpy: number;
};

export type CondensationResult = {
  dewPoint: number;
  safetyMargin: number;
  risk: "condensation" | "caution" | "low";
};

function assertFinite(value: number, label: string) {
  if (!Number.isFinite(value)) {
    throw new Error(`${label}を入力してください。`);
  }
}

export function saturationVaporPressure(temperatureC: number): number {
  const temperatureK = temperatureC + 273.15;
  if (!Number.isFinite(temperatureK) || temperatureK <= 0) {
    return Number.NaN;
  }

  const lnPressure = temperatureC >= 0.01
    ? -5.8002206e3 / temperatureK
      + 1.3914993
      - 4.8640239e-2 * temperatureK
      + 4.1764768e-5 * temperatureK ** 2
      - 1.4452093e-8 * temperatureK ** 3
      + 6.5459673 * Math.log(temperatureK)
    : -5.6745359e3 / temperatureK
      + 6.3925247
      - 9.677843e-3 * temperatureK
      + 6.2215701e-7 * temperatureK ** 2
      + 2.0747825e-9 * temperatureK ** 3
      - 9.484024e-13 * temperatureK ** 4
      + 4.1635019 * Math.log(temperatureK);

  return Math.exp(lnPressure) / 1000;
}

export function humidityRatioFromDryBulbAndRh(
  dryBulbC: number,
  relativeHumidity: number,
  pressureKpa = STANDARD_ATMOSPHERIC_PRESSURE_KPA,
): number {
  const vaporPressure = saturationVaporPressure(dryBulbC) * relativeHumidity / 100;
  if (vaporPressure <= 0 || vaporPressure >= pressureKpa) {
    return Number.NaN;
  }
  return EPSILON * vaporPressure / (pressureKpa - vaporPressure);
}

function vaporPressureFromHumidityRatio(humidityRatio: number, pressureKpa: number): number {
  return pressureKpa * humidityRatio / (EPSILON + humidityRatio);
}

function solveByBisection(
  fn: (value: number) => number,
  min: number,
  max: number,
): number {
  let low = min;
  let high = max;
  let lowValue = fn(low);
  const highValue = fn(high);

  if (!Number.isFinite(lowValue) || !Number.isFinite(highValue) || lowValue * highValue > 0) {
    return Number.NaN;
  }

  for (let index = 0; index < 90; index += 1) {
    const middle = (low + high) / 2;
    const middleValue = fn(middle);
    if (Math.abs(middleValue) < 1e-10) {
      return middle;
    }
    if (lowValue * middleValue <= 0) {
      high = middle;
    } else {
      low = middle;
      lowValue = middleValue;
    }
  }
  return (low + high) / 2;
}

export function dewPointFromVaporPressure(vaporPressureKpa: number): number {
  return solveByBisection(
    (candidate) => saturationVaporPressure(candidate) - vaporPressureKpa,
    -80,
    100,
  );
}

function wetBulbFromState(dryBulbC: number, humidityRatio: number, pressureKpa: number): number {
  const vaporPressure = vaporPressureFromHumidityRatio(humidityRatio, pressureKpa);
  const equation = (wetBulbC: number) => {
    const psychrometerCoefficient = wetBulbC >= 0.01 ? 0.000662 : 0.000583;
    return saturationVaporPressure(wetBulbC)
      - psychrometerCoefficient * pressureKpa * (dryBulbC - wetBulbC)
      - vaporPressure;
  };

  return solveByBisection(equation, -80, dryBulbC);
}

export function calculateAirState(
  dryBulbC: number,
  relativeHumidity: number,
  pressureKpa = STANDARD_ATMOSPHERIC_PRESSURE_KPA,
): AirState {
  assertFinite(dryBulbC, "乾球温度");
  assertFinite(relativeHumidity, "相対湿度");
  if (dryBulbC < -80 || dryBulbC > 100) {
    throw new Error("乾球温度は -80〜100℃ の範囲で入力してください。");
  }
  if (relativeHumidity <= 0 || relativeHumidity > 100) {
    throw new Error("相対湿度は 0より大きく100以下で入力してください。");
  }
  if (!Number.isFinite(pressureKpa) || pressureKpa <= 1 || pressureKpa > 500) {
    throw new Error("空気の全圧は 1〜500kPa の範囲で入力してください。");
  }

  const humidityRatio = humidityRatioFromDryBulbAndRh(dryBulbC, relativeHumidity, pressureKpa);
  const vaporPressure = vaporPressureFromHumidityRatio(humidityRatio, pressureKpa);
  const dewPoint = dewPointFromVaporPressure(vaporPressure);
  const wetBulb = wetBulbFromState(dryBulbC, humidityRatio, pressureKpa);

  if (![humidityRatio, vaporPressure, dewPoint, wetBulb].every(Number.isFinite)) {
    throw new Error("入力条件から空気状態を計算できません。値を確認してください。");
  }

  return {
    dryBulb: dryBulbC,
    relativeHumidity,
    absoluteHumidity: humidityRatio * 1000,
    dewPoint,
    wetBulb,
    enthalpy: 1.006 * dryBulbC + humidityRatio * (2501 + 1.86 * dryBulbC),
  };
}

export function calculateCondensation(
  roomTemperatureC: number,
  relativeHumidity: number,
  surfaceTemperatureC: number,
): CondensationResult {
  assertFinite(surfaceTemperatureC, "対象物の表面温度");
  const airState = calculateAirState(roomTemperatureC, relativeHumidity);
  const safetyMargin = surfaceTemperatureC - airState.dewPoint;

  return {
    dewPoint: airState.dewPoint,
    safetyMargin,
    risk: safetyMargin < 0 ? "condensation" : safetyMargin < 2 ? "caution" : "low",
  };
}
