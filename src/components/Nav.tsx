import { NavLink } from "react-router-dom";

const LINKS = [
  { to: "/", label: "Pulse" },
  { to: "/grid", label: "Grid" },
  { to: "/grands-prix", label: "Grands Prix" },
  { to: "/championship", label: "Championship" },
  { to: "/predictions", label: "The Model" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-void/75 backdrop-blur-2xl">
      <div className="h-px bg-ember" />
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-6 px-6 py-4">
        <NavLink to="/" className="flex items-baseline gap-3">
          <span className="font-serif text-[28px] leading-none tracking-tight text-paper">Paddock</span>
          <span className="hidden text-[10px] uppercase tracking-[0.34em] text-mute sm:inline">
            2026 Briefing
          </span>
        </NavLink>
        <nav className="hidden items-center gap-7 md:flex">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                `relative text-[11px] uppercase tracking-[0.22em] transition ${
                  isActive ? "text-paper" : "text-mute hover:text-paper"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {link.label}
                  {isActive && (
                    <span className="absolute -bottom-3 left-0 h-px w-full bg-amber" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <nav className="flex max-w-[58vw] gap-4 overflow-x-auto text-[10px] uppercase tracking-[0.18em] text-mute md:hidden">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) => (isActive ? "text-paper" : "whitespace-nowrap")}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
