export function ProductPlaceholder({
  slug,
  name,
  className,
}: {
  slug: string;
  name: string;
  className?: string;
}) {
  const PALETTES = [
    ["#0f172a", "#334155"],
    ["#2b1a12", "#7c4a1e"],
    ["#1a2b2b", "#2f6d5a"],
    ["#2a0f2b", "#7c2f51"],
    ["#12183a", "#3b4a8f"],
    ["#3a1212", "#8f3b3b"],
    ["#2b2b12", "#6d6d2f"],
    ["#0d2440", "#1f5291"],
  ];

  function hashCode(input: string): number {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      hash = (hash * 31 + input.charCodeAt(i)) | 0;
    }
    return Math.abs(hash);
  }

  const [from, to] = PALETTES[hashCode(slug) % PALETTES.length];
  const initials = name
    .replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ ]/g, "")
    .split(" ")
    .filter((w) => w.length > 1)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  return (
    <div
      className={`placeholder ${className ?? ""}`}
      style={{ background: `linear-gradient(140deg, ${from} 0%, ${to} 100%)` }}
    >
      <svg viewBox="0 0 120 200" className="placeholder__bottle" aria-hidden="true">
        <rect x="52" y="102" width="16" height="46" rx="3" fill="#e9dcc3" />
        <rect x="49" y="88" width="22" height="18" rx="3" fill="#c9b37e" />
        <circle
          cx="60"
          cy="80"
          r="11"
          fill="none"
          stroke="#c9b37e"
          strokeWidth="2"
          strokeDasharray="4 3"
        />
        <path
          d="M20 158 Q60 118 100 158 L100 192 Q60 158 20 192 Z"
          fill="#d9c99d"
          opacity="0.9"
        />
        <circle cx="60" cy="196" r="7" fill="#d9c99d" opacity="0.55" />
      </svg>
      <span className="placeholder__initials">{initials}</span>
    </div>
  );
}
