import {
  DAYS,
  SLOTS,
  type SlotKey,
  type Weekday,
} from "../../profile/schedule";

type Props = {
  availability: Record<Weekday, SlotKey[]>;
  error?: string;
  toggleSlot: (day: Weekday, slot: SlotKey) => void;
};

export const AvailabilitySection = ({
  availability,
  error,
  toggleSlot,
}: Props) => {
  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold">Times available</h2>
      {error && <div className="mt-2 text-sm text-error">{error}</div>}

      <div className="mt-3 overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Day</th>
              {SLOTS.map((s) => (
                <th key={s.key}>{s.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS.map((d) => (
              <tr key={d.key}>
                <td className="font-semibold">{d.label}</td>
                {SLOTS.map((s) => {
                  const active = availability[d.key]?.includes(s.key) ?? false;
                  return (
                    <td key={s.key}>
                      <button
                        type="button"
                        className={[
                          "btn",
                          "btn-sm",
                          "w-full",
                          "h-9",
                          "min-h-9",
                          "border-2",
                          active ? "btn-primary" : "btn-outline",
                        ].join(" ")}
                        onClick={() => toggleSlot(d.key, s.key)}
                      >
                        Select
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
