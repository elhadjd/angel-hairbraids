"use client";

export function RevenueChart({
  data,
}: {
  data: { label: string; value: number }[];
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const w = 560;
  const h = 180;
  const points = data.map((d, i) => {
    const x = (i / Math.max(data.length - 1, 1)) * (w - 24) + 12;
    const y = h - 28 - (d.value / max) * (h - 48);
    return `${x},${y}`;
  });

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-6 w-full">
      <polyline
        fill="none"
        stroke="#C4A574"
        strokeWidth="2"
        points={points.join(" ")}
      />
      {data.map((d, i) => {
        const x = (i / Math.max(data.length - 1, 1)) * (w - 24) + 12;
        const y = h - 28 - (d.value / max) * (h - 48);
        return (
          <g key={d.label}>
            <circle cx={x} cy={y} r="3.5" fill="#C4A574" />
            <text x={x} y={h - 8} textAnchor="middle" fill="#D9D0C3" fontSize="11">
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function ServiceBars({
  items,
}: {
  items: { name: string; count: number }[];
}) {
  const max = Math.max(...items.map((i) => i.count), 1);
  if (items.length === 0) {
    return <p className="mt-6 text-sm text-ivory/50">No completed services yet.</p>;
  }
  return (
    <ul className="mt-6 space-y-4">
      {items.map((item) => (
        <li key={item.name}>
          <div className="mb-1 flex justify-between text-sm">
            <span>{item.name}</span>
            <span className="text-gold">{item.count}</span>
          </div>
          <div className="h-px bg-gold/20">
            <div
              className="h-px bg-gold"
              style={{ width: `${(item.count / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
