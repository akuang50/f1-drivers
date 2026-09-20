import { useState } from "react";
import { absoluteUrl } from "../lib/paths";
import { renderShareCard, type CardLine } from "../lib/shareCard";

export function ShareActions({
  raceName,
  locality,
  round,
  lines,
}: {
  raceName: string;
  locality: string;
  round: string;
  lines: CardLine[];
}) {
  const [note, setNote] = useState("");
  const url = absoluteUrl(`/grands-prix/${round}/card`);

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    setNote("Link copied.");
  }

  async function downloadCard() {
    const blob = await renderShareCard({
      kicker: `${locality} · Round ${round}`,
      title: raceName.replace(" Grand Prix", ""),
      subtitle: "Predicted finishing order — unofficial form model",
      lines,
    });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = `paddock-${round}-prediction.png`;
    a.click();
    URL.revokeObjectURL(href);
    const file = new File([blob], a.download, { type: "image/png" });
    if (navigator.share) {
      try {
        const payload: ShareData = { title: `Paddock prediction · ${raceName}`, text: "Unofficial predicted finishing order", url };
        if (navigator.canShare?.({ files: [file] })) payload.files = [file];
        if (navigator.canShare?.(payload)) await navigator.share(payload);
      } catch {
        /* user cancelled */
      }
    }
    setNote("Card saved.");
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={copyLink}
          className="border border-paper/30 px-4 py-2 text-[11px] uppercase tracking-[0.2em] hover:border-paper"
        >
          Copy share URL
        </button>
        <button
          type="button"
          onClick={() => void downloadCard()}
          className="border border-amber/50 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-amber hover:border-amber"
        >
          Save prediction card
        </button>
      </div>
      {note && <p className="mt-3 text-sm text-mute">{note}</p>}
    </div>
  );
}
