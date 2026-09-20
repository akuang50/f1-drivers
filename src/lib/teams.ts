export const TEAM_COLORS: Record<string, string> = {
  mercedes: "#00D7B6",
  ferrari: "#ED1131",
  mclaren: "#F47600",
  red_bull: "#4781D7",
  rb: "#6C98FF",
  alpine: "#00A1E8",
  haas: "#9C9FA2",
  audi: "#F50537",
  williams: "#1868DB",
  aston_martin: "#229971",
  cadillac: "#C4A35A",
};

export const TEAM_SHORT: Record<string, string> = {
  mercedes: "Mercedes",
  ferrari: "Ferrari",
  mclaren: "McLaren",
  red_bull: "Red Bull",
  rb: "Racing Bulls",
  alpine: "Alpine",
  haas: "Haas",
  audi: "Audi",
  williams: "Williams",
  aston_martin: "Aston Martin",
  cadillac: "Cadillac",
};

const PORTRAIT_FALLBACKS: Record<string, string> = {
  antonelli:
    "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/K/ANDANT01_Kimi_Antonelli/andant01.png",
  russell:
    "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/G/GEORUS01_George_Russell/georus01.png",
  hamilton:
    "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LEWHAM01_Lewis_Hamilton/lewham01.png",
  norris:
    "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANNOR01_Lando_Norris/lannor01.png",
  leclerc:
    "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CHALEC01_Charles_Leclerc/chalec01.png",
  max_verstappen:
    "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png",
  piastri:
    "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/O/OSCPIA01_Oscar_Piastri/oscpia01.png",
  hadjar:
    "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/I/ISAHAD01_Isack_Hadjar/isahad01.png",
  lawson:
    "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LIALAW01_Liam_Lawson/lialaw01.png",
  gasly:
    "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/P/PIEGAS01_Pierre_Gasly/piegas01.png",
  arvid_lindblad:
    "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/A/ARVLIN01_Arvid_Lindblad/arvlin01.png",
  colapinto:
    "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/F/FRACOL01_Franco_Colapinto/fracol01.png",
  bearman:
    "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/O/OLIBEA01_Oliver_Bearman/olibea01.png",
  bortoleto:
    "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/G/GABBOR01_Gabriel_Bortoleto/gabbor01.png",
  hulkenberg:
    "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/N/NICHUL01_Nico_Hulkenberg/nichul01.png",
  sainz:
    "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CARSAI01_Carlos_Sainz/carsai01.png",
  albon:
    "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/A/ALEALB01_Alexander_Albon/alealb01.png",
  ocon:
    "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/E/ESTOCO01_Esteban_Ocon/estoco01.png",
  alonso:
    "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/F/FERALO01_Fernando_Alonso/feralo01.png",
  tsunoda:
    "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/Y/YUKTSU01_Yuki_Tsunoda/yuktsu01.png",
  stroll:
    "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANSTR01_Lance_Stroll/lanstr01.png",
  bottas:
    "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/V/VALBOT01_Valtteri_Bottas/valbot01.png",
  perez:
    "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/S/SERPER01_Sergio_Perez/serper01.png",
};

export function portraitFor(driverId: string, fromOpenF1?: string | null) {
  if (fromOpenF1) return fromOpenF1.replace(".transform/1col/image.png", "");
  return PORTRAIT_FALLBACKS[driverId] ?? "";
}

export function teamColor(constructorId: string, overlay?: Record<string, string>) {
  return overlay?.[constructorId] ?? TEAM_COLORS[constructorId] ?? "#8d8896";
}

export const STREET_CIRCUITS = new Set([
  "monaco",
  "baku",
  "marina_bay",
  "vegas",
  "miami",
  "jeddah",
]);

export const CIRCUIT_NOTES: Record<string, string> = {
  albert_park: "Season opener rhythm — high-speed parkland with limited passing.",
  shanghai: "Long back straight rewards slipstream and DRS trains.",
  suzuka: "The figure-eight: commitment through 130R and the Esses.",
  miami: "Hard-braking zone into T1; street-meets-stadium energy.",
  villeneuve: "Wall of Champions territory. Precision over aggression.",
  monaco: "Qualifying is the race. Barriers punish the smallest miss.",
  catalunya: "Technical, tyre-sensitive — a true aero proving ground.",
  red_bull_ring: "Short lap, big overtaking into T3 and T4.",
  silverstone: "Maggotts-Becketts still the high-speed benchmark.",
  spa: "Weather lottery. Eau Rouge-Raidillon decides brave days.",
  hungaroring: "The Monaco of the east: track position over race pace.",
  zandvoort: "Banked T3 and a packed calendar sprint weekend.",
  monza: "Temple of Speed. Straight-line muscle and low drag.",
  madring: "Madrid's new street-permanent hybrid. Limited history.",
  baku: "Castle section plus a 2km straight — chaos is a feature.",
  sepang: "Tropical humidity and long high-speed sweeps return.",
  marina_bay: "Night street fight. Highest physical load of the year.",
  americas: "COTA's first sector is a flowing roller coaster.",
  rodriguez: "Thin air. Engines and cooling work overtime.",
  interlagos: "Interlagos never settles — weather and Senna S.",
  vegas: "Strip straights, desert cold, and a Saturday night show.",
  losail: "Desert night grip with a long, flowing last sector.",
  yas_marina: "Season finale theatre under Yas lights.",
};
