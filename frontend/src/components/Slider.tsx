import type { DomainMeta } from '@/lib/types';

interface Props {
  domain: DomainMeta;
  value: number;
  onChange: (v: number) => void;
}

export default function DomainSlider({ domain, value, onChange }: Props) {
  const tone =
    value >= 75
      ? 'text-emerald-600'
      : value >= 50
        ? 'text-amber-600'
        : 'text-rose-600';

  return (
    <div className="rounded-lg border border-ink-200 bg-ink-50/60 p-3.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ink-800">{domain.label}</p>
          <p className="mt-0.5 text-xs leading-snug text-ink-500">
            {domain.description}
          </p>
        </div>
        <span className={`gov-chip bg-white border border-ink-200 ${tone}`}>
          {value}/100
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 w-full accent-brand-600"
        aria-label={`${domain.label} self-rating`}
      />
    </div>
  );
}
