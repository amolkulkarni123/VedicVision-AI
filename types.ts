
export interface UserBirthDetails {
  name: string;
  date: string; // YYYY-MM-DD
  time: string;
  location: string;
}

export interface PlanetPosition {
  planet: string;
  sign: string;
  house: number;
}

export interface VargaCharts {
  d1: PlanetPosition[];
  d9: PlanetPosition[];
  d10: PlanetPosition[];
}

export interface DashaPeriod {
  planet: string;
  startDate: string;
  endDate: string;
  prediction: string;
  scriptureRef?: string;
}

export interface LoshuGridData {
  grid: (number | null)[]; // 9 positions
  strengths: string[];
  weaknesses: string[];
  missingNumbersAnalysis: string;
}

export interface MonthlyForecast {
  monthName: string;
  prediction: string;
  scriptureRef: string;
  focusArea: string;
  rating: number;
  careerForecast: string;
  healthForecast: string;
  relationshipsForecast: string;
  luckyColor: string;
  luckyNumber: number;
  remedy: string;
}

export interface YearlyForecast {
  year: number;
  overview: string;
  scriptureRef: string;
  keyTransit: string;
  months: MonthlyForecast[];
}

export interface ChartData {
  charts: VargaCharts;
  ascendant: string;
  summary: string;
  scriptureCitations: string[];
  currentDasha: DashaPeriod;
  forecasts: YearlyForecast[];
  loshu: LoshuGridData;
}

export interface DailyHoroscopeData {
  cosmicMood: string;
  personalizedReading: string;
  scriptureSutra: string;
  dos: string[];
  donts: string[];
  luckyMantra: string;
  auspiciousTime: string;
}

export interface MatchResult {
  score: number;
  total: number;
  compatibility_analysis: string;
  mangal_dosha: boolean;
  scriptureVerdict: string;
}

export interface RemedyData {
  title: string;
  description: string;
  remedy: string;
  mantra: string;
  sourceText: string;
}

export interface PalmistryResult {
  overview: string;
  lifeLine: string;
  headLine: string;
  heartLine: string;
  fateLine: string;
  mounts: string;
  specialMarks: string;
}

export interface CouncilWisdom {
  discussion: { agentName: string; wisdom: string }[];
  finalDecree: string;
}

export interface ResearchResult {
  text: string;
  sources: { title: string; uri: string }[];
}

// Added missing Attachment and Message interfaces
export interface Attachment {
  file: File;
  previewUrl: string;
  base64: string;
  mimeType: string;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isError?: boolean;
  attachments?: Attachment[];
}

export enum AppView {
  LANDING = 'LANDING',
  DASHBOARD = 'DASHBOARD',
  PREDICTIONS = 'PREDICTIONS', 
  MATCHMAKING = 'MATCHMAKING',
  REMEDIES = 'REMEDIES',
  CHAT = 'CHAT',
  VISION = 'VISION',
  PALMISTRY = 'PALMISTRY',
  AI_GUIDE = 'AI_GUIDE',
  TODAY_HOROSCOPE = 'TODAY_HOROSCOPE',
  DIVINE_CINEMA = 'DIVINE_CINEMA',
  RISHI_COUNCIL = 'RISHI_COUNCIL',
  SCRIPTURE_RESEARCH = 'SCRIPTURE_RESEARCH'
}

export type Language = string;
export type ModelId = string;
