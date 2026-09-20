export function driverName(given: string, family: string) {
  return `${given} ${family}`;
}

export function ageFrom(dob: string, now = new Date()) {
  const born = new Date(dob);
  let age = now.getFullYear() - born.getFullYear();
  const m = now.getMonth() - born.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < born.getDate())) age -= 1;
  return age;
}

export function formatDate(iso: string) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatWhen(date: string, time?: string) {
  const iso = time ? `${date}T${time}` : `${date}T12:00:00Z`;
  return new Date(iso).toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: time ? "2-digit" : undefined,
    minute: time ? "2-digit" : undefined,
    timeZoneName: time ? "short" : undefined,
  });
}

export function countdownParts(target: Date, now = new Date()) {
  const ms = Math.max(0, target.getTime() - now.getTime());
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  return { days, hours, minutes, past: target.getTime() <= now.getTime() };
}

export function ordinal(n: number) {
  const v = n % 100;
  if (v >= 11 && v <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

export function placeLabel(n: number) {
  return `P${n}`;
}

export function raceTarget(date: string, time?: string) {
  return new Date(time ? `${date}T${time}` : `${date}T13:00:00Z`);
}
