import { GreaseTrapTool } from "@/components/grease-trap-tool";
import { AbsoluteHumidityTool } from "@/components/absolute-humidity-tool";
import { AirStateTool } from "@/components/air-state-tool";
import { CondensationTool } from "@/components/condensation-tool";
import { FieldReportTool } from "@/components/field-report-tool";
import { DuctTool, HeatLoadTool, PipeTool, PumpTool, VentilationTool } from "@/components/engineering-tools";
import { Co2VentilationTool, EqualFrictionDuctTool, FixtureUnitsTool, LouverTool, RainwaterTool } from "@/components/priority-tools";
import { ToolCard } from "@/components/tool-card";
import { UnitConverter } from "@/components/unit-converter";
import { AVAILABLE_TOOLS, COMING_SOON_TOOLS } from "@/lib/tool-registry";

const airTools = AVAILABLE_TOOLS.filter((tool) => ["air-state", "condensation", "absolute-humidity"].includes(tool.id));
const unitTools = AVAILABLE_TOOLS.filter((tool) => tool.id === "unit-converter");
const engineeringTools = AVAILABLE_TOOLS.filter((tool) => ["ventilation", "co2-ventilation", "louver", "equal-friction-duct", "heat-load", "duct", "pipe", "fixture-units", "rainwater", "pump", "grease-trap"].includes(tool.id));
const fieldTools = AVAILABLE_TOOLS.filter((tool) => tool.id === "field-report");

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f6f9fa] text-slate-900">
      <div className="relative isolate border-b border-sky-100 bg-gradient-to-br from-sky-50 via-white to-teal-50">
        <div aria-hidden className="absolute -right-20 -top-32 -z-10 h-80 w-80 rounded-full bg-sky-200/40 blur-3xl" />
        <div aria-hidden className="absolute -bottom-36 left-1/3 -z-10 h-72 w-72 rounded-full bg-teal-100/60 blur-3xl" />
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <a href="#top" className="flex items-center gap-2.5 font-extrabold tracking-tight text-slate-900">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-sky-600 text-lg text-white shadow-sm">計</span>
            <span>設備計算ポケット</span>
          </a>
          <a href="#tools" className="rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:border-sky-300 hover:text-sky-700">ツール一覧</a>
        </header>

        <section id="top" className="mx-auto w-full max-w-6xl px-5 pb-14 pt-10 sm:px-8 sm:pb-20 sm:pt-14">
          <p className="inline-flex rounded-full border border-sky-100 bg-white/80 px-3 py-1.5 text-xs font-extrabold tracking-wide text-sky-700">VER. 2.2　現場で使う、設備の計算ポケット</p>
          <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[1.2] tracking-tight text-slate-950 sm:text-5xl">設備の「ちょっと計算」を、<br className="hidden sm:block" />すぐ答えに。</h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">設備技術者のための、現場ですぐ使える計算ツール集。温湿度、換気、熱量、ダクト・配管・給水・雨水まで、打ち合わせ中でも迷わず使えるように整えました。</p>
          <div className="mt-7 flex flex-wrap gap-3 text-sm font-bold text-slate-700">
            <span className="rounded-full bg-white px-3 py-2 shadow-sm">スマートフォン対応</span>
            <span className="rounded-full bg-white px-3 py-2 shadow-sm">入力と同時に計算</span>
            <span className="rounded-full bg-white px-3 py-2 shadow-sm">追加機能を順次公開</span>
          </div>
        </section>
      </div>

      <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <section id="tools" className="scroll-mt-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold text-sky-700">すぐ使えるツール</p>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">空調・温湿度</h2>
            </div>
            <p className="text-sm text-slate-500">カードを押すと計算ツールへ移動します</p>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {airTools.map((tool) => <ToolCard key={tool.id} tool={tool} />)}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">換気・熱・配管</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {engineeringTools.map((tool) => <ToolCard key={tool.id} tool={tool} />)}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">現場支援・単位換算</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {fieldTools.concat(unitTools).map((tool) => <ToolCard key={tool.id} tool={tool} />)}
          </div>
        </section>

        <div className="mt-16 space-y-6 sm:mt-20 sm:space-y-8">
          <AirStateTool />
          <CondensationTool />
          <AbsoluteHumidityTool />
          <VentilationTool />
          <Co2VentilationTool />
          <LouverTool />
          <EqualFrictionDuctTool />
          <HeatLoadTool />
          <DuctTool />
          <PipeTool />
          <FixtureUnitsTool />
          <RainwaterTool />
          <GreaseTrapTool />
          <PumpTool />
          <UnitConverter />
          <FieldReportTool />
        </div>

        <section className="mt-16 scroll-mt-5 sm:mt-20" aria-labelledby="coming-soon-title">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-card sm:p-7">
            <p className="text-sm font-bold text-slate-500">これから追加する機能</p>
            <h2 id="coming-soon-title" className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">Coming Soon</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">現場の声を受けながら、設備計算を少しずつ増やしていきます。「これがあれば便利」という機能も、今後の改善候補です。</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {COMING_SOON_TOOLS.map((tool) => <ToolCard key={tool.id} tool={tool} comingSoon />)}
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 rounded-[28px] bg-slate-900 p-6 text-white shadow-card sm:grid-cols-[0.9fr_1.1fr] sm:p-8" aria-labelledby="history-title">
          <div>
            <p className="text-sm font-bold text-sky-300">更新履歴</p>
            <h2 id="history-title" className="mt-1 text-2xl font-extrabold tracking-tight">現場の声で、育てていく。</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">設備の計算で「少し調べたい」と感じる場面を減らすため、継続して改善・拡張します。</p>
          </div>
          <ol className="space-y-3 border-l border-slate-700 pl-5 text-sm">
            <li><span className="font-bold text-sky-300">Ver. 2.2</span><span className="ml-3 text-slate-200">グリーストラップ選定・候補製品の性能確認を追加</span></li>
            <li><span className="font-bold text-sky-300">Ver. 2.1</span><span className="ml-3 text-slate-200">CO₂換気・ガラリ・等摩擦ダクト・給水負荷・地域別雨水計算を追加</span></li>
            <li><span className="font-bold text-sky-300">Ver. 2.0</span><span className="ml-3 text-slate-200">換気・熱量・ダクト・配管・ポンプ・現場メモを追加</span></li>
            <li><span className="font-bold text-sky-300">Ver. 1.2</span><span className="ml-3 text-slate-200">設備単位換算を追加</span></li>
            <li><span className="font-bold text-sky-300">Ver. 1.1</span><span className="ml-3 text-slate-200">露点・結露判定を追加</span></li>
            <li><span className="font-bold text-sky-300">Ver. 1.0</span><span className="ml-3 text-slate-200">空気線図・空気状態計算を公開</span></li>
          </ol>
        </section>
      </div>

      <footer className="border-t border-slate-200 bg-white px-5 py-8 text-center text-xs leading-5 text-slate-500">設備計算ポケット · 計算結果は概算・確認用途です。設計・施工時は仕様書、法規、メーカー資料を優先してください。</footer>
    </main>
  );
}
