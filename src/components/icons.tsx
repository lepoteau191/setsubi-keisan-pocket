import type { ToolIconName } from "@/lib/tool-registry";

type ToolIconProps = {
  name: ToolIconName;
  className?: string;
};

export function ToolIcon({ name, className = "" }: ToolIconProps) {
  const common = {
    className: `h-6 w-6 ${className}`,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    viewBox: "0 0 24 24",
    "aria-hidden": true,
  };

  switch (name) {
    case "air":
      return <svg {...common}><path d="M3 8h10a3 3 0 1 0-3-3" /><path d="M3 12h15a3 3 0 1 1-3 3" /><path d="M3 16h6" /></svg>;
    case "droplet":
      return <svg {...common}><path d="M12 3s-6 6.7-6 11a6 6 0 0 0 12 0c0-4.3-6-11-6-11Z" /><path d="M9.5 15.5c.4 1.1 1.2 1.8 2.5 2" /></svg>;
    case "gauge":
      return <svg {...common}><path d="M4 14a8 8 0 1 1 16 0" /><path d="m12 14 3.6-4.2" /><path d="M12 18h.01" /><path d="M6.3 10.5 5 9.8M17.7 10.5 19 9.8M12 7V5.5" /></svg>;
    case "convert":
      return <svg {...common}><path d="M7 7h11l-3-3" /><path d="M18 7l-3 3" /><path d="M17 17H6l3 3" /><path d="m6 17 3-3" /></svg>;
    case "duct":
      return <svg {...common}><rect x="3" y="7" width="18" height="10" rx="2" /><path d="M7 7V5M12 7V5M17 7V5M7 17v2M12 17v2M17 17v2" /></svg>;
    case "pipe":
      return <svg {...common}><path d="M5 4v5a3 3 0 0 0 3 3h8a3 3 0 0 1 3 3v5" /><path d="M3 4h4M17 20h4" /><path d="M12 9v6" /></svg>;
    case "pump":
      return <svg {...common}><circle cx="11" cy="12" r="5" /><path d="M16 12h5v5" /><path d="M3 12h3M11 7V4M8 14l6-4" /></svg>;
    case "vent":
      return <svg {...common}><circle cx="12" cy="12" r="2" /><path d="M12 10c-1-4 1-6 4-6 1 3-.6 5-4 6ZM10.3 13c-3.7 1.8-6 .4-7.2-2.4 2.7-1.6 5-.8 7.2 2.4ZM13.7 13c3.7 1.8 6 .4 7.2-2.4-2.7-1.6-5-.8-7.2 2.4ZM12 14c-1 4 1 6 4 6 1-3-.6-5-4-6Z" /></svg>;
    case "thermal":
      return <svg {...common}><path d="M12 3v10" /><path d="M8.5 6.5A5 5 0 1 0 15 14V6.5a3.5 3.5 0 0 0-7 0Z" /><path d="M12 17.5v.01" /></svg>;
    case "clipboard":
      return <svg {...common}><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4.5V3h6v1.5" /><path d="M9 10h6M9 14h6M9 18h3" /></svg>;
    case "sparkles":
      return <svg {...common}><path d="m12 3 1.3 4.7L18 9l-4.7 1.3L12 15l-1.3-4.7L6 9l4.7-1.3L12 3Z" /><path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15ZM5 15l.6 1.5L7 17l-1.4.5L5 19l-.6-1.5L3 17l1.4-.5L5 15Z" /></svg>;
  }
}
