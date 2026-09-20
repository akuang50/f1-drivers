import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSeason } from "../context/SeasonContext";

export function JumpSearch({
  autoFocus = false,
  onJump,
  className = "",
}: {
  autoFocus?: boolean;
  onJump?: () => void;
  className?: string;
}) {
  const { snapshot } = useSeason();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const hits = useMemo(() => {
    if (!snapshot || query.trim().length < 1) return [];
    const q = query.trim().toLowerCase();
    return snapshot.driverStandings
      .filter((row) => {
        const hay = [
          row.Driver.givenName,
          row.Driver.familyName,
          row.Driver.code,
          row.Driver.permanentNumber,
          `${row.Driver.givenName} ${row.Driver.familyName}`,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      })
      .slice(0, 7);
  }, [snapshot, query]);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  function go(id: string) {
    navigate(`/drivers/${id}`);
    setQuery("");
    setOpen(false);
    onJump?.();
  }

  return (
    <div className={`relative ${className}`}>
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActive(0);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((n) => Math.min(n + 1, hits.length - 1));
          }
          if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((n) => Math.max(n - 1, 0));
          }
          if (e.key === "Enter" && hits[active]) go(hits[active].Driver.driverId);
          if (e.key === "Escape") {
            setOpen(false);
            inputRef.current?.blur();
          }
        }}
        placeholder="Jump to a driver"
        className="w-full border border-line bg-transparent px-3 py-2 text-sm text-paper outline-none placeholder:text-mute/70 focus:border-amber"
        aria-label="Search drivers"
      />
      {open && hits.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full border border-line bg-void/95 backdrop-blur-xl">
          {hits.map((row, i) => (
            <li key={row.Driver.driverId}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => go(row.Driver.driverId)}
                className={`flex w-full items-baseline justify-between px-3 py-2 text-left ${
                  i === active ? "bg-paper/10" : ""
                }`}
              >
                <span className="font-serif text-lg">{row.Driver.familyName}</span>
                <span className="text-[10px] uppercase tracking-[0.16em] text-mute">
                  {row.Driver.code} · {row.Driver.permanentNumber}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
