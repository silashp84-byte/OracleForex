
export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ema9?: number;
  ema21?: number;
  ema50?: number;
}

export interface WyckoffPhase {
  type: 'Accumulation' | 'Distribution' | 'Re-Accumulation' | 'Re-Distribution' | 'Neutral';
  phase: 'A' | 'B' | 'C' | 'D' | 'E' | 'Unknown';
  event: string;
  confidence: number;
}

export interface AnalysisResult {
  wyckoff: WyckoffPhase;
  projections: {
    target: number;
    stopLoss: number;
    logic: string;
  };
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  sentimentScore: number; // 0 to 100, where > 50 is bullish
  lastUpdated: string;
}

export interface MarketState {
  symbol: string;
  currentPrice: number;
  change24h: number;
  candles: Candle[];
}
