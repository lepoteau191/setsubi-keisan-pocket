export type ToolIconName = "air" | "droplet" | "gauge" | "convert" | "duct" | "pipe" | "pump" | "vent" | "thermal" | "clipboard" | "sparkles";

export type ToolCardDefinition = {
  id: string;
  title: string;
  description: string;
  icon: ToolIconName;
  tone: "sky" | "teal" | "amber" | "slate";
};

export const AVAILABLE_TOOLS: ToolCardDefinition[] = [
  { id: "grease-trap", title: "グリーストラップ選定", description: "食数・清掃周期から必要性能と候補製品を確認", icon: "droplet", tone: "teal" },
  {
    id: "air-state",
    title: "空気線図・空気状態計算",
    description: "温度と湿度から、空気の状態をひと目で確認",
    icon: "air",
    tone: "sky",
  },
  {
    id: "condensation",
    title: "露点・結露判定",
    description: "測定値から結露リスクと安全余裕をその場で説明",
    icon: "droplet",
    tone: "teal",
  },
  {
    id: "absolute-humidity",
    title: "絶対湿度計算",
    description: "温度・相対湿度を、空気中の水分量に換算",
    icon: "gauge",
    tone: "amber",
  },
  {
    id: "unit-converter",
    title: "設備単位換算",
    description: "圧力・流量・熱量・温度を迷わず変換",
    icon: "convert",
    tone: "slate",
  },
  {
    id: "ventilation",
    title: "風量・換気回数計算",
    description: "人数・面積・室容積から必要風量を確認",
    icon: "vent",
    tone: "sky",
  },
  {
    id: "co2-ventilation",
    title: "CO₂基準必要換気量",
    description: "目標CO₂濃度から必要な外気量を概算",
    icon: "gauge",
    tone: "sky",
  },
  {
    id: "louver",
    title: "ガラリ必要開口寸法",
    description: "風量・面風速から外形寸法をすばやく確認",
    icon: "vent",
    tone: "teal",
  },
  {
    id: "equal-friction-duct",
    title: "等摩擦法ダクトサイズ",
    description: "目標摩擦損失にそろえたダクト寸法を概算",
    icon: "duct",
    tone: "teal",
  },
  {
    id: "heat-load",
    title: "水量・温度差・熱量",
    description: "水量と温度差から冷暖房能力を概算",
    icon: "thermal",
    tone: "amber",
  },
  {
    id: "duct",
    title: "ダクトサイズ・圧損",
    description: "風量・風速から推奨サイズと直管圧損を確認",
    icon: "duct",
    tone: "teal",
  },
  {
    id: "pipe",
    title: "配管サイズ・圧力損失",
    description: "水量・流速・長さから管径と圧損を概算",
    icon: "pipe",
    tone: "teal",
  },
  {
    id: "fixture-units",
    title: "給水器具負荷単位集計",
    description: "地域の確認条件を添えて給水負荷を集計",
    icon: "pipe",
    tone: "teal",
  },
  {
    id: "rainwater",
    title: "屋根雨水排水量",
    description: "地域の計画降雨強度から排水量を概算",
    icon: "droplet",
    tone: "sky",
  },
  {
    id: "pump",
    title: "ポンプ揚程計算",
    description: "実揚程・損失・残圧から必要揚程を整理",
    icon: "pump",
    tone: "sky",
  },
  {
    id: "field-report",
    title: "現場測定メモ・説明シート",
    description: "測定値と結露判定を保存・コピー・印刷",
    icon: "clipboard",
    tone: "slate",
  },
];

export const COMING_SOON_TOOLS: ToolCardDefinition[] = [
  { id: "outside-load", title: "外気負荷計算", description: "外気条件と室内条件から必要能力を確認", icon: "air", tone: "slate" },
  { id: "fan", title: "ファン静圧概算", description: "系統の圧損を積み上げて必要静圧を整理", icon: "vent", tone: "slate" },
  { id: "mixing", title: "混合空気・加湿除湿", description: "空気状態の変化をさらに詳しく確認", icon: "droplet", tone: "slate" },
  { id: "ai", title: "AI設備業務支援", description: "現場の判断を支える機能を準備中", icon: "sparkles", tone: "slate" },
];
