export function PageHeader({
  kicker,
  title,
  lede,
}: {
  kicker: string;
  title: string;
  lede?: string;
}) {
  return (
    <div className="mb-14 max-w-3xl">
      <p className="text-[11px] uppercase tracking-[0.34em] text-amber">{kicker}</p>
      <h1 className="mt-3 font-serif text-[clamp(2.8rem,6vw,5.2rem)] leading-[0.92]">{title}</h1>
      {lede && <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-mute">{lede}</p>}
    </div>
  );
}
