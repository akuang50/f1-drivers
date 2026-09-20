import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { JumpSearch } from "./JumpSearch";

const LINKS = [
  { to: "/", label: "Pulse" },
  { to: "/grid", label: "Grid" },
  { to: "/grands-prix", label: "Grands Prix" },
  { to: "/championship", label: "Championship" },
  { to: "/predictions", label: "The Model" },
];

export function Nav() {
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA") {
        e.preventDefault();
        setMenu(true);
      }
      if (e.key === "Escape") setMenu(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menu ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menu]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-void/75 backdrop-blur-2xl">
      <div className="h-px bg-ember" />
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-6 px-6 py-4">
        <NavLink to="/" className="flex items-baseline gap-3" onClick={() => setMenu(false)}>
          <span className="font-serif text-[28px] leading-none tracking-tight text-paper">Paddock</span>
          <span className="hidden text-[10px] uppercase tracking-[0.34em] text-mute sm:inline">
            2026 Briefing
          </span>
        </NavLink>
        <nav className="hidden items-center gap-7 lg:flex">
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
                  {isActive && <span className="absolute -bottom-3 left-0 h-px w-full bg-amber" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="hidden w-56 lg:block">
          <JumpSearch />
        </div>
        <button
          type="button"
          className="text-[11px] uppercase tracking-[0.22em] text-paper lg:hidden"
          onClick={() => setMenu(true)}
          aria-expanded={menu}
          aria-label="Open menu"
        >
          Menu
        </button>
      </div>

      {menu && (
        <div className="fixed inset-0 z-50 bg-void/96 px-6 py-8 backdrop-blur-xl lg:hidden">
          <div className="mx-auto flex max-w-[1200px] items-center justify-between">
            <p className="font-serif text-2xl">Paddock</p>
            <button
              type="button"
              className="text-[11px] uppercase tracking-[0.22em] text-mute"
              onClick={() => setMenu(false)}
            >
              Close
            </button>
          </div>
          <div className="mx-auto mt-10 max-w-[1200px]">
            <JumpSearch autoFocus onJump={() => setMenu(false)} />
            <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-mute">Press / anywhere to search</p>
            <nav className="mt-12 flex flex-col gap-6">
              {LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === "/"}
                  onClick={() => setMenu(false)}
                  className={({ isActive }) =>
                    `font-serif text-4xl leading-none ${isActive ? "text-amber" : "text-paper"}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
