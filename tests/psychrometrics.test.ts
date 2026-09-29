import assert from "node:assert/strict";
import test from "node:test";
import { calculateAirState, calculateCondensation } from "../src/lib/psychrometrics";
import { convertUnit } from "../src/lib/unit-conversions";
import { calculateCo2Ventilation, calculateDuct, calculateEqualFrictionDuct, calculateLouver, calculatePipe, calculatePump, calculateVentilation, calculateWaterHeatLoad } from "../src/lib/equipment-calculations";
import { calculateProfileRainfallIntensity, calculateRainwaterFlow, RAINFALL_PROFILES, sumFixtureUnits } from "../src/lib/regional-standards";

test("26℃・50%RH の湿り空気状態を算出できる", () => {
  const result = calculateAirState(26, 50);

  assert.equal(result.dryBulb, 26);
  assert.equal(result.relativeHumidity, 50);
  assert.ok(Math.abs(result.absoluteHumidity - 10.5) < 0.2);
  assert.ok(Math.abs(result.dewPoint - 14.8) < 0.2);
  assert.ok(Math.abs(result.wetBulb - 18.7) < 0.3);
  assert.ok(Math.abs(result.enthalpy - 52.9) < 0.4);
});

test("露点を下回る表面温度を結露リスクとして判定できる", () => {
  const result = calculateCondensation(25, 50, 12);

  assert.equal(result.risk, "condensation");
  assert.ok(result.safetyMargin < 0);
  assert.ok(Math.abs(result.dewPoint - 13.9) < 0.2);
});

test("設備で用いる単位を変換できる", () => {
  assert.ok(Math.abs(convertUnit("pressure", "kpa", "mmaq", 1) - 101.9716) < 0.001);
  assert.equal(convertUnit("airflow", "m3min", "m3h", 1), 60);
  assert.ok(Math.abs(convertUnit("thermal", "kw", "kcalh", 1) - 859.8452) < 0.001);
  assert.equal(convertUnit("temperature", "celsius", "fahrenheit", 20), 68);
});

test("換気量を人数・面積・換気回数の基準で比較できる", () => {
  const result = calculateVentilation(10, 30, 50, 2, 150, 2, 400);

  assert.equal(result.byPeople, 300);
  assert.equal(result.byArea, 100);
  assert.equal(result.byAirChanges, 300);
  assert.equal(result.recommended, 300);
  assert.ok(Math.abs(result.actualAirChanges - 2.6667) < 0.001);
});

test("水量と温度差から熱量を算出できる", () => {
  const result = calculateWaterHeatLoad(100, 5);

  assert.ok(Math.abs(result.capacityKw - 34.81) < 0.02);
  assert.ok(Math.abs(result.capacityKcalH - 29930) < 20);
  assert.equal(result.flowM3H, 6);
});

test("ダクト・配管・ポンプの概算値を計算できる", () => {
  const duct = calculateDuct(1000, 5, 1.5, 30);
  const pipe = calculatePipe(100, 1.5, 30);
  const pump = calculatePump(6, 12, 35, 20, 10, 60);

  assert.equal(duct.recommendedDiameterMm, 275);
  assert.ok(duct.actualVelocity > 3 && duct.actualVelocity < 5);
  assert.equal(pipe.recommendedNominal, "40A");
  assert.ok(pipe.pressureLossKpa > 0);
  assert.ok(pump.requiredHeadM > 19 && pump.requiredHeadM < 20);
  assert.ok(pump.shaftPowerKw > pump.hydraulicPowerKw);
});

test("CO₂基準、ガラリ、等摩擦ダクトの計算ができる", () => {
  const co2 = calculateCo2Ventilation(10, 0.3, 420, 1000);
  const louver = calculateLouver(1000, 2.5, 50, 1.5);
  const duct = calculateEqualFrictionDuct(1000, 1, 1.5);

  assert.ok(Math.abs(co2.requiredPerPersonM3H - 31.03) < 0.02);
  assert.ok(Math.abs(co2.requiredTotalM3H - 310.34) < 0.1);
  assert.ok(Math.abs(louver.grossAreaM2 - 0.2222) < 0.001);
  assert.equal(louver.recommendedWidthMm, 600);
  assert.equal(louver.recommendedHeightMm, 400);
  assert.ok(duct.recommendedDiameterMm >= duct.calculatedDiameterMm);
  assert.ok(duct.actualFrictionPaM > 0);
});

test("給水負荷単位と屋根雨水排水量を算出できる", () => {
  const units = sumFixtureUnits({ "toilet-valve-public": 2, "lavatory-private": 3 });
  const rain = calculateRainwaterFlow(100, 0.9, 50);

  assert.equal(units, 23);
  assert.equal(rain.effectiveAreaM2, 90);
  assert.ok(Math.abs(rain.flowLps - 1.25) < 0.0001);
  assert.ok(Math.abs(rain.flowM3H - 4.5) < 0.0001);
});

test("地域プロファイルの降雨強度式を継続時間から計算できる", () => {
  const gifu = RAINFALL_PROFILES.find((profile) => profile.id === "gifu-city-5y");
  const toyama = RAINFALL_PROFILES.find((profile) => profile.id === "toyama-city-5y");
  const nagano = RAINFALL_PROFILES.find((profile) => profile.id === "nagano-city-5y");

  assert.ok(gifu && toyama && nagano);
  assert.ok(Math.abs(calculateProfileRainfallIntensity(gifu, 30) - 128) < 1);
  assert.equal(calculateProfileRainfallIntensity(toyama, 60), 49);
  assert.ok(Math.abs(calculateProfileRainfallIntensity(nagano, 10) - 106.69) < 0.01);
});

// メーカー掲載例（洋食400食/日）と性能照合の回帰テスト。
import { calculateGreaseTrap, checkGreaseTrap, formatGreaseRequirement, GREASE_TRAP_EXAMPLE } from "../src/lib/grease-trap";

test("グリーストラップはメーカーの洋食400食の例と一致する", () => {
  const result = calculateGreaseTrap(GREASE_TRAP_EXAMPLE);
  assert.ok(Math.abs(result.flow - 155.5555556) < 1e-6);
  assert.equal(result.grease, 22.4);
  assert.equal(result.residue, 36);
  assert.equal(result.mass, 58.4);
  assert.equal(formatGreaseRequirement(result.flow), "155.6");
  assert.equal(formatGreaseRequirement(result.mass), "58.4");
  assert.equal(formatGreaseRequirement(58.401), "58.5");
});

test("グリーストラップは流量と阻集質量の両方を満たす場合のみ適合する", () => {
  const result = calculateGreaseTrap(GREASE_TRAP_EXAMPLE);
  assert.equal(checkGreaseTrap(result, result.flow, result.mass).suitable, true);
  assert.deepEqual(checkGreaseTrap(result, 155.55, 60), { flowOk: false, massOk: true, suitable: false });
  assert.deepEqual(checkGreaseTrap(result, 160, 58.39), { flowOk: true, massOk: false, suitable: false });
  assert.equal(checkGreaseTrap(result, 160, 60).suitable, true);
});

test("清掃周期変更は対応する質量にのみ反映する", () => {
  const base = calculateGreaseTrap(GREASE_TRAP_EXAMPLE);
  const changed = calculateGreaseTrap({ ...GREASE_TRAP_EXAMPLE, greaseDays: 14 });
  assert.equal(changed.grease, base.grease * 2);
  assert.equal(changed.residue, base.residue);
  assert.equal(changed.flow, base.flow);
});

test("グリーストラップは不正値・時間超過・演算オーバーフローを拒否する", () => {
  for (const key of Object.keys(GREASE_TRAP_EXAMPLE)) {
    for (const value of [0, -1, NaN, Infinity]) {
      assert.throws(() => calculateGreaseTrap({ ...GREASE_TRAP_EXAMPLE, [key]: value }));
    }
  }
  assert.throws(() => calculateGreaseTrap({ ...GREASE_TRAP_EXAMPLE, hours: 25 }));
  assert.throws(() => calculateGreaseTrap({ ...GREASE_TRAP_EXAMPLE, peakFactor: 0.5 }));
  assert.throws(() => calculateGreaseTrap({ ...GREASE_TRAP_EXAMPLE, meals: Number.MAX_VALUE }));
  const result = calculateGreaseTrap(GREASE_TRAP_EXAMPLE);
  assert.throws(() => checkGreaseTrap(result, NaN, 60));
  assert.throws(() => checkGreaseTrap(result, 160, 0));
});
