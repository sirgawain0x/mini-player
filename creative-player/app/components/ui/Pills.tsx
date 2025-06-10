"use client";

type PillOption = {
  label: string;
  value: string;
};

type PillsProps = {
  options: PillOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function Pills({
  options,
  value,
  onChange,
  className = "",
}: PillsProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
            value === option.value
              ? "bg-[var(--app-accent)] text-[var(--app-background)] border-[var(--app-accent)] shadow-sm"
              : "bg-[var(--app-card-bg)] text-[var(--app-foreground-muted)] border-[var(--app-card-border)] hover:bg-[var(--app-accent-light)] hover:text-[var(--app-accent)] hover:border-[var(--app-accent)]"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
