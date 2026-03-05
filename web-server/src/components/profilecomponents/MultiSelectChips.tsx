type Props = {
  title: string;
  options: readonly string[];
  selected: string[];
  error?: string;
  onToggle: (value: string) => void;
};

export const MultiSelectChips = ({
  title,
  options,
  selected,
  error,
  onToggle,
}: Props) => {
  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      {error && <div className="mt-2 text-sm text-error">{error}</div>}
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              className={`btn btn-sm ${active ? "btn-primary" : "btn-outline"}`}
              onClick={() => onToggle(opt)}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
};
