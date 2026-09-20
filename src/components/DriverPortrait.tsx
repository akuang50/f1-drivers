import { useState } from "react";

export function DriverPortrait({
  src,
  name,
  color,
  className = "",
}: {
  src?: string;
  name: string;
  color: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(!src);
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join("");

  return (
    <div className={`relative overflow-hidden bg-panel ${className}`}>
      {!failed && src ? (
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-[1.04]"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="grid h-full w-full place-items-center font-display text-6xl text-paper/35">
          {initials}
        </div>
      )}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `linear-gradient(180deg, transparent 42%, ${color}22 100%), linear-gradient(90deg, rgb(8 9 13 / 0.25), transparent 40%)`,
        }}
      />
    </div>
  );
}
