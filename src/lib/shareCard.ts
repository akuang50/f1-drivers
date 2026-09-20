export type CardLine = {
  place: number;
  name: string;
  range: string;
};

export async function renderShareCard(opts: {
  kicker: string;
  title: string;
  subtitle: string;
  lines: CardLine[];
}): Promise<Blob> {
  const width = 1080;
  const height = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  await document.fonts.ready;

  ctx.fillStyle = "#08090d";
  ctx.fillRect(0, 0, width, height);
  const glow = ctx.createRadialGradient(900, 80, 20, 900, 80, 520);
  glow.addColorStop(0, "rgba(201,75,56,0.28)");
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#c94b38";
  ctx.fillRect(0, 0, width, 6);

  ctx.fillStyle = "#c4a574";
  ctx.font = "28px Outfit, sans-serif";
  ctx.fillText("PREDICTION", 72, 92);

  ctx.fillStyle = "#9a9286";
  ctx.font = "24px Outfit, sans-serif";
  ctx.fillText(opts.kicker.toUpperCase(), 72, 150);

  ctx.fillStyle = "#ece4d6";
  ctx.font = "italic 72px 'Instrument Serif', serif";
  wrapText(ctx, opts.title, 72, 240, 920, 78);

  ctx.fillStyle = "#9a9286";
  ctx.font = "28px Outfit, sans-serif";
  ctx.fillText(opts.subtitle, 72, 430);

  ctx.strokeStyle = "rgba(236,228,214,0.16)";
  ctx.beginPath();
  ctx.moveTo(72, 470);
  ctx.lineTo(1008, 470);
  ctx.stroke();

  opts.lines.slice(0, 10).forEach((line, i) => {
    const y = 540 + i * 64;
    ctx.fillStyle = "#9a9286";
    ctx.font = "42px Teko, sans-serif";
    ctx.fillText(`P${line.place}`, 72, y);
    ctx.fillStyle = "#ece4d6";
    ctx.font = "40px 'Instrument Serif', serif";
    ctx.fillText(line.name, 180, y);
    ctx.fillStyle = "#c4a574";
    ctx.font = "22px Outfit, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(line.range, 1008, y);
    ctx.textAlign = "left";
  });

  ctx.fillStyle = "#9a9286";
  ctx.font = "20px Outfit, sans-serif";
  ctx.fillText("Paddock  ·  unofficial form model  ·  not FIA", 72, 1290);

  return await new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Could not export card"));
    }, "image/png");
  });
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(" ");
  let line = "";
  let cursor = y;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, cursor);
      line = word;
      cursor += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, cursor);
}
