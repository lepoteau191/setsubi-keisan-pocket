export type UnitGroupId = "pressure" | "airflow" | "thermal" | "temperature";

type Unit = {
  id: string;
  label: string;
  toBase: (value: number) => number;
  fromBase: (value: number) => number;
};

export type UnitGroup = {
  id: UnitGroupId;
  label: string;
  description: string;
  units: Unit[];
};

const linearUnit = (id: string, label: string, factor: number): Unit => ({
  id,
  label,
  toBase: (value) => value * factor,
  fromBase: (value) => value / factor,
});

/** 基準単位: 圧力 Pa、風量 m³/h、熱量 kW、温度 ℃ */
export const UNIT_GROUPS: UnitGroup[] = [
  {
    id: "pressure",
    label: "圧力",
    description: "Pa / kPa / MPa / mmAq",
    units: [
      linearUnit("pa", "Pa", 1),
      linearUnit("kpa", "kPa", 1000),
      linearUnit("mpa", "MPa", 1_000_000),
      linearUnit("mmaq", "mmAq", 9.80665),
    ],
  },
  {
    id: "airflow",
    label: "風量・流量",
    description: "m³/h / m³/min / L/min",
    units: [
      linearUnit("m3h", "m³/h", 1),
      linearUnit("m3min", "m³/min", 60),
      linearUnit("lmin", "L/min", 0.06),
    ],
  },
  {
    id: "thermal",
    label: "熱量・能力",
    description: "kW / kcal/h",
    units: [
      linearUnit("kw", "kW", 1),
      linearUnit("kcalh", "kcal/h", 1 / 859.8452278589857),
    ],
  },
  {
    id: "temperature",
    label: "温度",
    description: "℃ / ℉",
    units: [
      {
        id: "celsius",
        label: "℃",
        toBase: (value) => value,
        fromBase: (value) => value,
      },
      {
        id: "fahrenheit",
        label: "℉",
        toBase: (value) => (value - 32) * 5 / 9,
        fromBase: (value) => value * 9 / 5 + 32,
      },
    ],
  },
];

export function convertUnit(groupId: UnitGroupId, fromId: string, toId: string, value: number): number {
  const group = UNIT_GROUPS.find((item) => item.id === groupId);
  const from = group?.units.find((item) => item.id === fromId);
  const to = group?.units.find((item) => item.id === toId);
  if (!group || !from || !to || !Number.isFinite(value)) {
    return Number.NaN;
  }
  return to.fromBase(from.toBase(value));
}
