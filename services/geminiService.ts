
import { GoogleGenAI, Type } from "@google/genai";
import { Candle, AnalysisResult } from "../types";

export const analyzeMarketStructure = async (candles: Candle[], symbol: string): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const recentCandles = candles.slice(-40).map(c => ({
    t: c.time.split('T')[1].substring(0, 5),
    o: c.open.toFixed(5),
    h: c.high.toFixed(5),
    l: c.low.toFixed(5),
    c: c.close.toFixed(5),
    v: c.volume
  }));

  const prompt = `
    Analyze EUR/USD 15m timeframe using Wyckoff Theory and Smart Money Concepts.
    
    Context:
    - Focus on liquidity sweeps and structure breaks.
    - Evaluate EMA 9, 21, 50 alignment.
    - Determine if we are in an Accumulation or Distribution phase.
    
    Data: ${JSON.stringify(recentCandles)}
    
    Return JSON:
    {
      "wyckoff": { "type": "Accumulation|Distribution|...", "phase": "A|B|C|D|E", "event": "text", "confidence": 0.0-1.0 },
      "projections": { "target": 0.0, "stopLoss": 0.0, "logic": "text" },
      "sentiment": "Bullish|Bearish|Neutral",
      "sentimentScore": 0-100 (percentage of bullish pressure)
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 2000 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            wyckoff: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                phase: { type: Type.STRING },
                event: { type: Type.STRING },
                confidence: { type: Type.NUMBER }
              },
              required: ["type", "phase", "event", "confidence"]
            },
            projections: {
              type: Type.OBJECT,
              properties: {
                target: { type: Type.NUMBER },
                stopLoss: { type: Type.NUMBER },
                logic: { type: Type.STRING }
              },
              required: ["target", "stopLoss", "logic"]
            },
            sentiment: { type: Type.STRING },
            sentimentScore: { type: Type.NUMBER }
          },
          required: ["wyckoff", "projections", "sentiment", "sentimentScore"]
        }
      }
    });

    const result = JSON.parse(response.text);
    return {
      ...result,
      lastUpdated: new Date().toLocaleTimeString()
    };
  } catch (error) {
    console.error("AI Analysis failed", error);
    return {
      wyckoff: { type: 'Neutral', phase: 'Unknown', event: 'Scanning Market...', confidence: 0.5 },
      projections: { target: candles[candles.length-1].close, stopLoss: candles[candles.length-1].close, logic: 'Data sync in progress' },
      sentiment: 'Neutral',
      sentimentScore: 50,
      lastUpdated: new Date().toLocaleTimeString()
    };
  }
};
