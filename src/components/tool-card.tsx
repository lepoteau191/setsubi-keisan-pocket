import { ToolIcon } from "@/components/icons";
import type { ToolCardDefinition } from "@/lib/tool-registry";

const tones = {
  sky: "bg-sky-50 text-sky-700 ring-sky-100",
  teal: "bg-teal-50 text-teal-700 ring-teal-100",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  slate: "bg-slate-100 text-slate-600 ring-slate-200",
};

export function ToolCard({ tool, comingSoon = false }: { tool: ToolCardDefinition; comingSoon?: boolean }) {
  const content = (
    <>
      <span className={`mb-5 inline-flex h-11 w-11 items-center justify-center rounded-2xl ring-1 ${tones[tool.tone]}`}>
        <ToolIcon name={tool.icon} />
      </span>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold tracking-tight text-slate-900">{tool.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{tool.description}</p>
        </div>
        {comingSoon ? (
          <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold tracking-wide text-slate-500">COMING SOON</span>
        ) : (
          <span aria-hidden className="mt-1 text-lg text-slate-400">→</span>
        )}
      </div>
    </>
  );

  if (comingSoon) {
    return <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 p-5">{content}</div>;
  }

  return (
    <a
      href={`#${tool.id}`}
      className="group block rounded-3xl border border-slate-200 bg-white p-5 shadow-card transition duration-200 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-sky-100"
    >
      {content}
    </a>
  );
}
