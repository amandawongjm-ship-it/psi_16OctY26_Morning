import { PSIBandInfo, RegionId } from '../types/airQuality';

export const PSI_BANDS: Record<string, PSIBandInfo> = {
  Good: {
    name: 'Good',
    min: 0,
    max: 50,
    color: '#10b981', // emerald-500
    badgeBg: 'bg-emerald-500/15',
    badgeBorder: 'border-emerald-500/40',
    badgeText: 'text-emerald-400',
    description: 'Air quality is considered satisfactory, and air pollution poses little or no risk.',
    generalHealthAdvisory: 'Normal outdoor activities can be continued as usual.',
    vulnerableAdvisory: 'Normal outdoor activities for elderly, pregnant women, and children.',
    chronicAdvisory: 'Normal outdoor activities for persons with chronic heart or lung diseases.',
    maskRecommendation: 'No mask required for general public.',
    outdoorStatus: 'normal',
  },
  Moderate: {
    name: 'Moderate',
    min: 51,
    max: 100,
    color: '#eab308', // yellow-500
    badgeBg: 'bg-yellow-500/15',
    badgeBorder: 'border-yellow-500/40',
    badgeText: 'text-yellow-400',
    description: 'Air quality is acceptable. A few sensitive individuals may experience minor irritation.',
    generalHealthAdvisory: 'Normal outdoor activities can be continued.',
    vulnerableAdvisory: 'Normal outdoor activities. Individuals with sensitivities should monitor comfort.',
    chronicAdvisory: 'Normal outdoor activities. Keep emergency reliever medications handy.',
    maskRecommendation: 'No mask required unless personally sensitive.',
    outdoorStatus: 'caution',
  },
  Unhealthy: {
    name: 'Unhealthy',
    min: 101,
    max: 200,
    color: '#f97316', // orange-500
    badgeBg: 'bg-orange-500/15',
    badgeBorder: 'border-orange-500/50',
    badgeText: 'text-orange-400',
    description: 'Everyone may begin to experience health effects; sensitive groups may experience more serious effects.',
    generalHealthAdvisory: 'Reduce prolonged or strenuous outdoor physical exertion (e.g. running, HIIT, outdoor matches).',
    vulnerableAdvisory: 'Minimise prolonged or strenuous outdoor physical exertion. Take frequent indoor breaks.',
    chronicAdvisory: 'Avoid prolonged or strenuous outdoor physical exertion. Seek medical help if feeling unwell.',
    maskRecommendation: 'Consider N95 mask if outdoors for prolonged periods (>2 hours).',
    outdoorStatus: 'reduce',
  },
  'Very Unhealthy': {
    name: 'Very Unhealthy',
    min: 201,
    max: 300,
    color: '#ef4444', // red-500
    badgeBg: 'bg-red-500/20',
    badgeBorder: 'border-red-500/60',
    badgeText: 'text-red-400',
    description: 'Health alert: risk of health effects increased for everyone. High concentrations of particulate haze.',
    generalHealthAdvisory: 'Avoid prolonged or strenuous outdoor physical exertion. Move sports and workouts indoors.',
    vulnerableAdvisory: 'Minimise outdoor activity. Stay indoors where possible.',
    chronicAdvisory: 'Avoid outdoor activity. Keep windows shut and operate HEPA air purifiers.',
    maskRecommendation: 'N95 respirator mask strongly recommended if leaving indoors.',
    outdoorStatus: 'avoid',
  },
  Hazardous: {
    name: 'Hazardous',
    min: 301,
    max: 500,
    color: '#991b1b', // red-800
    badgeBg: 'bg-rose-950/70',
    badgeBorder: 'border-rose-600',
    badgeText: 'text-rose-300',
    description: 'Emergency health warning: Entire population is likely to be affected with adverse symptoms.',
    generalHealthAdvisory: 'Minimise outdoor activity. Stay indoors and keep doors and windows closed.',
    vulnerableAdvisory: 'Stay strictly indoors. Vulnerable persons must avoid any outdoor exposure.',
    chronicAdvisory: 'Stay strictly indoors. Use air purifiers; consult doctor immediately if wheezing.',
    maskRecommendation: 'N95 respirator mandatory for essential outdoor transit. Shorten outdoor exposure.',
    outdoorStatus: 'stay_indoors',
  },
};

export function getPSIBand(psi: number): PSIBandInfo {
  if (psi <= 50) return PSI_BANDS.Good;
  if (psi <= 100) return PSI_BANDS.Moderate;
  if (psi <= 200) return PSI_BANDS.Unhealthy;
  if (psi <= 300) return PSI_BANDS['Very Unhealthy'];
  return PSI_BANDS.Hazardous;
}

export function getPM25Band(pm25: number): { label: string; color: string; desc: string } {
  if (pm25 <= 55) {
    return { label: 'Normal', color: '#10b981', desc: '0 - 55 µg/m³: Air quality normal' };
  }
  if (pm25 <= 150) {
    return { label: 'Elevated', color: '#eab308', desc: '56 - 150 µg/m³: Elevated haze particle levels' };
  }
  if (pm25 <= 250) {
    return { label: 'High', color: '#f97316', desc: '151 - 250 µg/m³: High particulate density' };
  }
  return { label: 'Very High', color: '#ef4444', desc: '> 250 µg/m³: Critical particulate concentration' };
}

export const REGIONS_META: Record<
  RegionId,
  {
    name: string;
    displayName: string;
    coords: { lat: number; lng: number };
    stationCode: string;
    majorTowns: string[];
    description: string;
  }
> = {
  national: {
    name: 'National',
    displayName: 'Islandwide (Singapore Overall)',
    coords: { lat: 1.3521, lng: 103.8198 },
    stationCode: 'SG-ISLAND',
    majorTowns: ['All 5 Zones', 'Singapore Straits', 'Sentosa to Woodlands'],
    description: 'Weighted 24-hr aggregate index across all 5 monitoring zones.',
  },
  north: {
    name: 'North',
    displayName: 'North Zone (Woodlands / Yishun)',
    coords: { lat: 1.41803, lng: 103.82 },
    stationCode: 'NEA-STN-01',
    majorTowns: ['Woodlands', 'Yishun', 'Sembawang', 'Admiralty', 'Marsiling', 'Khatib', 'Mandai'],
    description: 'Northern border facing Johor Straits and mangrove corridors.',
  },
  south: {
    name: 'South',
    displayName: 'South Zone (CBD / Marina Bay / Sentosa)',
    coords: { lat: 1.29587, lng: 103.82 },
    stationCode: 'NEA-STN-02',
    majorTowns: ['Marina Bay', 'Tanjong Pagar', 'CBD', 'Telok Blangah', 'Sentosa', 'Queenstown', 'Harbourfront'],
    description: 'Southern coastal financial center and southern islands.',
  },
  east: {
    name: 'East',
    displayName: 'East Zone (Changi / Tampines / Bedok)',
    coords: { lat: 1.35735, lng: 103.94 },
    stationCode: 'NEA-STN-03',
    majorTowns: ['Tampines', 'Bedok', 'Pasir Ris', 'Changi Airport', 'Marine Parade', 'Katong', 'Paya Lebar'],
    description: 'Eastern coastal plain, international airport & residential corridors.',
  },
  west: {
    name: 'West',
    displayName: 'West Zone (Jurong / Clementi / Tuas)',
    coords: { lat: 1.35735, lng: 103.7 },
    stationCode: 'NEA-STN-04',
    majorTowns: ['Jurong East', 'Jurong West', 'Tuas', 'Boon Lay', 'Clementi', 'Bukit Batok', 'Choa Chu Kang'],
    description: 'Western industrial basin, Tuas Mega Port & Jurong Lake District.',
  },
  central: {
    name: 'Central',
    displayName: 'Central Zone (Bishan / Ang Mo Kio / Orchard)',
    coords: { lat: 1.35735, lng: 103.82 },
    stationCode: 'NEA-STN-05',
    majorTowns: ['Ang Mo Kio', 'Bishan', 'Toa Payoh', 'Orchard Road', 'Novena', 'Thomson', 'Serangoon'],
    description: 'Central urban heartland and Central Catchment Nature Reserve.',
  },
};

export const NEIGHBORHOOD_TO_REGION: Record<string, RegionId> = {
  woodlands: 'north',
  yishun: 'north',
  sembawang: 'north',
  admiralty: 'north',
  marsiling: 'north',
  khatib: 'north',
  mandai: 'north',
  simpang: 'north',

  'marina bay': 'south',
  'tanjong pagar': 'south',
  cbd: 'south',
  'telok blangah': 'south',
  sentosa: 'south',
  queenstown: 'south',
  harbourfront: 'south',
  chinatown: 'south',
  'bukit merah': 'south',
  'raffles place': 'south',
  clarke: 'south',

  tampines: 'east',
  bedok: 'east',
  'pasir ris': 'east',
  changi: 'east',
  'marine parade': 'east',
  katong: 'east',
  'paya lebar': 'east',
  simei: 'east',
  'tanah merah': 'east',
  siglap: 'east',
  kembangan: 'east',
  geylang: 'east',

  jurong: 'west',
  'jurong east': 'west',
  'jurong west': 'west',
  tuas: 'west',
  'boon lay': 'west',
  clementi: 'west',
  'bukit batok': 'west',
  'choa chu kang': 'west',
  'bukit panjang': 'west',
  pioneer: 'west',
  'west coast': 'west',

  'ang mo kio': 'central',
  bishan: 'central',
  'toa payoh': 'central',
  orchard: 'central',
  novena: 'central',
  thomson: 'central',
  serangoon: 'central',
  kallang: 'central',
  newton: 'central',
  balestier: 'central',
  'bukit timah': 'central',
  punggol: 'north',
  sengkang: 'north',
};
