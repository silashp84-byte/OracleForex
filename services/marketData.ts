
import { Candle } from '../types';

const generateInitialData = (count: number, basePrice: number): Candle[] => {
  let candles: Candle[] = [];
  let currentPrice = basePrice;
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const time = new Date(now.getTime() - (count - i) * 15 * 60 * 1000).toISOString();
    const volatility = basePrice * 0.002;
    const open = currentPrice;
    const close = open + (Math.random() - 0.5) * volatility;
    const high = Math.max(open, close) + Math.random() * (volatility * 0.5);
    const low = Math.min(open, close) - Math.random() * (volatility * 0.5);
    const volume = Math.floor(Math.random() * 1000) + 500;

    candles.push({ time, open, high, low, close, volume });
    currentPrice = close;
  }
  return calculateEMAs(candles);
};

export const calculateEMAs = (candles: Candle[]): Candle[] => {
  const calc = (data: Candle[], period: number, key: 'ema9' | 'ema21' | 'ema50') => {
    if (data.length === 0) return data;
    
    const k = 2 / (period + 1);
    let ema = data[0].close;
    
    return data.map((c, i) => {
      if (i === 0) {
        return { ...c, [key]: ema };
      }
      ema = c.close * k + ema * (1 - k);
      return { ...c, [key]: ema };
    });
  };

  let results = [...candles];
  results = calc(results, 9, 'ema9');
  results = calc(results, 21, 'ema21');
  results = calc(results, 50, 'ema50');
  return results;
};

export const marketStream = {
  getInitialData: (symbol: string) => {
    const basePrices: Record<string, number> = {
      'EUR/USD': 1.0850,
      'GBP/USD': 1.2640,
      'USD/JPY': 149.30,
      'XAU/USD': 2024.50,
    };
    return generateInitialData(100, basePrices[symbol] || 1.0000);
  },
  
  getNextCandle: (lastCandle: Candle): Candle => {
    const volatility = lastCandle.close * 0.0005;
    const open = lastCandle.close;
    const close = open + (Math.random() - 0.48) * volatility; // Slight upward bias for demo
    const high = Math.max(open, close) + Math.random() * (volatility * 0.3);
    const low = Math.min(open, close) - Math.random() * (volatility * 0.3);
    const time = new Date(new Date(lastCandle.time).getTime() + 15 * 60 * 1000).toISOString();
    
    return {
      time,
      open,
      high,
      low,
      close,
      volume: Math.floor(Math.random() * 1000) + 500
    };
  }
};
