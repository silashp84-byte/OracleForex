
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Activity, 
  Cpu, 
  Target, 
  ShieldAlert, 
  RefreshCw,
  Globe,
  LayoutDashboard,
  LineChart,
  BarChart2,
  Zap,
  TrendingUp,
  TrendingDown,
  ArrowUpRight
} from 'lucide-react';
import { 
  ComposedChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Bar,
  Cell,
  ReferenceLine,
  Area
} from 'recharts';
import { marketStream, calculateEMAs } from '../services/marketData';
import { analyzeMarketStructure } from '../services/geminiService';
import { Candle, AnalysisResult, MarketState } from '../types';

const TradingTerminal: React.FC = () => {
  const SYMBOL = 'EUR/USD';
  const [activeTab, setActiveTab] = useState<'chart' | 'analysis'>('chart');
  const [market, setMarket] = useState<MarketState>({
    symbol: SYMBOL,
    currentPrice: 0,
    change24h: 0,
    candles: []
  });
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pricePulse, setPricePulse] = useState<'up' | 'down' | null>(null);

  // Initial Load
  useEffect(() => {
    const initialCandles = marketStream.getInitialData(SYMBOL);
    setMarket({
      symbol: SYMBOL,
      currentPrice: initialCandles[initialCandles.length - 1].close,
      change24h: (Math.random() - 0.5) * 1.2,
      candles: initialCandles
    });
    // Trigger first analysis automatically
    handleAnalysis(initialCandles, SYMBOL);
  }, []);

  // Optimized Real-time Sync
  useEffect(() => {
    const interval = setInterval(() => {
      setMarket(prev => {
        const lastPrice = prev.currentPrice;
        const next = marketStream.getNextCandle(prev.candles[prev.candles.length - 1]);
        
        // Trigger visual pulse
        if (next.close > lastPrice) setPricePulse('up');
        else if (next.close < lastPrice) setPricePulse('down');
        setTimeout(() => setPricePulse(null), 800);

        const updatedCandles = calculateEMAs([...prev.candles.slice(1), next]);
        return {
          ...prev,
          currentPrice: next.close,
          candles: updatedCandles
        };
      });
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAnalysis = useCallback(async (currentCandles: Candle[], symbol: string) => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeMarketStructure(currentCandles, symbol);
      setAnalysis(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  }, [isAnalyzing]);

  // Memoized Chart Components for Fluidity
  const chartData = useMemo(() => market.candles, [market.candles]);
  const currentCandle = useMemo(() => market.candles[market.candles.length - 1], [market.candles]);

  return (
    <div className="flex flex-col h-screen bg-[#020617] text-slate-100 overflow-hidden select-none">
      
      {/* Header - Transparent High-End Glass */}
      <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-slate-900/20 backdrop-blur-3xl z-40 transition-colors">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className={`p-2.5 rounded-2xl transition-all duration-500 shadow-lg ${
              pricePulse === 'up' ? 'bg-emerald-500/20 text-emerald-400' : 
              pricePulse === 'down' ? 'bg-rose-500/20 text-rose-400' : 'bg-white/5 text-slate-400'
            }`}>
              <Zap className="w-5 h-5 fill-current" />
            </div>
            {isAnalyzing && (
              <div className="absolute inset-0 rounded-2xl border-2 border-emerald-500/50 animate-ping" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-black tracking-tighter">EUR<span className="text-emerald-400">USD</span></h1>
              <span className="bg-white/5 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest text-slate-500">M15</span>
            </div>
            <p className="text-[9px] font-bold text-slate-500 tracking-[0.2em] uppercase opacity-60">Real-Time Oracle Engine</p>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <div className={`text-2xl font-black mono leading-none tracking-tighter transition-all duration-500 ${
            pricePulse === 'up' ? 'text-emerald-400 translate-y-[-2px]' : 
            pricePulse === 'down' ? 'text-rose-400 translate-y-[2px]' : 'text-slate-100'
          }`}>
            {market.currentPrice.toFixed(5)}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-[10px] font-black flex items-center gap-0.5 ${market.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {market.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(market.change24h).toFixed(2)}%
            </span>
            <div className="w-1 h-1 rounded-full bg-slate-700" />
            <span className="text-[10px] font-bold text-slate-500 uppercase mono">Live</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 relative overflow-hidden bg-[radial-gradient(circle_at_50%_0%,_#0f172a_0%,_#020617_100%)]">
        
        {/* CHART VIEW */}
        <div className={`view-transition absolute inset-0 flex flex-col ${
          activeTab === 'chart' ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 pointer-events-none'
        }`}>
          <div className="px-6 py-4 flex justify-between items-center bg-white/[0.02]">
            <div className="flex gap-5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">EMA 9</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">EMA 21</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">EMA 50</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
               <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Wyckoff Intensity:</span>
               <div className="h-1 w-16 bg-slate-800 rounded-full overflow-hidden">
                 <div className="h-full bg-emerald-500/50 w-3/4 animate-pulse" />
               </div>
            </div>
          </div>
          
          <div className="flex-1 px-2 pb-6">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.05}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 6" stroke="#ffffff08" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  tick={{ fill: '#475569', fontSize: 9, fontWeight: 800 }} 
                  axisLine={false}
                  tickFormatter={(val) => new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                />
                <YAxis 
                  domain={['auto', 'auto']} 
                  orientation="right"
                  tick={{ fill: '#475569', fontSize: 9, fontWeight: 800 }}
                  axisLine={false}
                  tickFormatter={(val) => val.toFixed(4)}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(2, 6, 23, 0.9)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', fontSize: '10px' }}
                />
                
                {/* Visual Volume Layer */}
                <Bar dataKey="volume" yAxisId={1}>
                  {chartData.map((entry, index) => (
                    <Cell key={`vol-${index}`} fill={entry.close > entry.open ? '#10b98120' : '#f43f5e20'} />
                  ))}
                </Bar>
                
                <Line type="monotone" dataKey="ema9" stroke="#10b981" dot={false} strokeWidth={1.5} strokeOpacity={0.4} />
                <Line type="monotone" dataKey="ema21" stroke="#fbbf24" dot={false} strokeWidth={1.5} strokeOpacity={0.4} />
                <Line type="monotone" dataKey="ema50" stroke="#3b82f6" dot={false} strokeWidth={1.5} strokeOpacity={0.4} />
                
                {/* Price Action Layer */}
                <Area type="monotone" dataKey="close" stroke="transparent" fill="url(#areaGradient)" />
                <Line 
                  type="monotone" 
                  dataKey="close" 
                  stroke="#f8fafc" 
                  strokeWidth={2} 
                  dot={(props: any) => {
                    const { cx, cy, payload } = props;
                    const isBullish = payload.close >= payload.open;
                    return (
                      <rect 
                        x={cx - 1.5} 
                        y={Math.min(props.y, cy) - 2} 
                        width={3} 
                        height={Math.max(4, Math.abs(payload.close - payload.open) * 15000)} 
                        rx={0.5}
                        fill={isBullish ? '#10b981' : '#f43f5e'}
                      />
                    );
                  }} 
                />

                {analysis && (
                  <>
                    <ReferenceLine y={analysis.projections.target} stroke="#10b981" strokeDasharray="5 5" strokeWidth={2} label={{ value: 'TP TARGET', position: 'insideRight', fill: '#10b981', fontSize: 9, fontWeight: 900 }} />
                    <ReferenceLine y={analysis.projections.stopLoss} stroke="#f43f5e" strokeDasharray="5 5" strokeWidth={2} label={{ value: 'SL SAFETY', position: 'insideRight', fill: '#f43f5e', fontSize: 9, fontWeight: 900 }} />
                  </>
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Liquid Floating Scan Button */}
          <button 
            onClick={() => handleAnalysis(market.candles, SYMBOL)}
            disabled={isAnalyzing}
            className={`absolute bottom-10 right-8 w-16 h-16 rounded-[24px] flex items-center justify-center transition-all duration-500 shadow-2xl active:scale-90 group overflow-hidden ${
              isAnalyzing 
              ? 'bg-slate-800 text-slate-500' 
              : 'bg-emerald-500 text-slate-950 hover:shadow-emerald-500/40 hover:-translate-y-2'
            }`}
          >
            {isAnalyzing ? <RefreshCw className="w-7 h-7 animate-spin" /> : <Cpu className="w-7 h-7 transition-transform group-hover:rotate-12" />}
            {!isAnalyzing && <div className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-150 transition-transform duration-700 rounded-full" />}
          </button>
        </div>

        {/* ANALYSIS VIEW */}
        <div className={`view-transition absolute inset-0 flex flex-col p-8 overflow-y-auto ${
          activeTab === 'analysis' ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'
        }`}>
          <div className="max-w-xl mx-auto w-full space-y-8 fade-in-up">
            
            {/* Sentiment Engine Card */}
            <div className="bg-slate-900/40 border border-white/5 rounded-[40px] p-8 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/10 rounded-2xl">
                    <BarChart2 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Liquidity Pulse</h2>
                    <p className="text-sm font-bold text-slate-200">Market Sentiment Score</p>
                  </div>
                </div>
                <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight shadow-sm ${
                  analysis?.sentiment === 'Bullish' ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-slate-950'
                }`}>
                  {analysis?.sentiment || 'Analyzing'}
                  <ArrowUpRight className="w-3 h-3" />
                </div>
              </div>

              <div className="relative h-4 w-full bg-slate-950 rounded-full p-0.5 border border-white/5 overflow-hidden">
                <div 
                  className="sentiment-bar-fluid h-full rounded-full transition-all duration-1000 cubic-bezier(0.22, 1, 0.36, 1)" 
                  style={{ width: `${analysis?.sentimentScore || 50}%` }}
                />
              </div>
              
              <div className="flex justify-between mt-4 px-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <span className="text-emerald-400/80">Buyers {analysis?.sentimentScore || 50}%</span>
                <span className="text-rose-400/80">Sellers {100 - (analysis?.sentimentScore || 50)}%</span>
              </div>
            </div>

            {/* AI Structure Reports */}
            <div className="grid gap-6">
              {isAnalyzing ? (
                <div className="h-48 bg-slate-900/20 rounded-[40px] border border-white/5 animate-pulse" />
              ) : analysis && (
                <>
                  <div className="bg-slate-900/40 border border-white/5 rounded-[40px] p-8 relative overflow-hidden group hover:border-white/10 transition-colors">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Wyckoff Logic Struct</div>
                        <div className="text-4xl font-black text-emerald-400 italic tracking-tighter">PHASE {analysis.wyckoff.phase}</div>
                      </div>
                      <div className="text-right">
                        <span className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-tight">
                          {analysis.wyckoff.type}
                        </span>
                        <div className="text-[10px] font-bold text-slate-600 mt-2 uppercase">Confidence: {(analysis.wyckoff.confidence * 100).toFixed(0)}%</div>
                      </div>
                    </div>
                    <div className="bg-slate-950/40 p-5 rounded-3xl border border-white/5 text-sm font-medium text-slate-300 leading-relaxed italic">
                      "{analysis.wyckoff.event}"
                    </div>
                  </div>

                  {/* Execution Protocol */}
                  <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-[40px] p-8 space-y-6 relative overflow-hidden">
                    <div className="flex items-center gap-2 text-emerald-400 text-[11px] font-black uppercase tracking-widest">
                      <Target className="w-4 h-4" /> Tactical Execution
                    </div>
                    
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <div className="text-[10px] text-emerald-500/40 font-black uppercase tracking-widest">Profit Objective</div>
                        <div className="text-5xl font-black mono text-emerald-400 tracking-tighter">
                          {analysis.projections.target.toFixed(5)}
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="text-[10px] text-rose-500/40 font-black uppercase tracking-widest">Risk Ceiling</div>
                        <div className="text-2xl font-black mono text-rose-400 tracking-tighter opacity-80">
                          {analysis.projections.stopLoss.toFixed(5)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-6 border-t border-emerald-500/10 text-sm text-slate-400 leading-relaxed font-bold">
                      {analysis.projections.logic}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="bg-rose-500/5 border border-rose-500/10 rounded-[30px] p-6 flex gap-5 items-center">
              <div className="p-4 bg-rose-500/10 rounded-2xl shadow-inner">
                <ShieldAlert className="w-6 h-6 text-rose-500" />
              </div>
              <div>
                <h4 className="text-[11px] text-rose-300 font-black uppercase tracking-widest mb-1">Safety Advisor</h4>
                <p className="text-[10px] text-rose-400/60 leading-tight font-bold max-w-sm">
                  Avoid trades if spreads exceed 0.5 pips. Monitor High-Impact News releases before Phase E.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Navigation - Minimalist Fluid Tab Bar */}
      <nav className="h-24 bg-slate-950 border-t border-white/5 grid grid-cols-2 px-6 pb-6 pt-2 z-50">
        <button 
          onClick={() => setActiveTab('chart')}
          className={`flex flex-col items-center justify-center gap-2 transition-all duration-300 relative ${
            activeTab === 'chart' ? 'text-emerald-400' : 'text-slate-600'
          }`}
        >
          <div className={`p-3 rounded-2xl transition-all duration-500 ${activeTab === 'chart' ? 'bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : ''}`}>
            <LineChart className={`w-6 h-6 transition-transform ${activeTab === 'chart' ? 'scale-110' : 'scale-100'}`} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.3em]">Oracle</span>
          {activeTab === 'chart' && (
            <div className="absolute -bottom-1 w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_8px_#10b981]" />
          )}
        </button>
        
        <button 
          onClick={() => setActiveTab('analysis')}
          className={`flex flex-col items-center justify-center gap-2 transition-all duration-300 relative ${
            activeTab === 'analysis' ? 'text-emerald-400' : 'text-slate-600'
          }`}
        >
          <div className={`p-3 rounded-2xl transition-all duration-500 ${activeTab === 'analysis' ? 'bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : ''}`}>
            <LayoutDashboard className={`w-6 h-6 transition-transform ${activeTab === 'analysis' ? 'scale-110' : 'scale-100'}`} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.3em]">Intelligence</span>
          {activeTab === 'analysis' && (
            <div className="absolute -bottom-1 w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_8px_#10b981]" />
          )}
        </button>
      </nav>

      {/* Ultra Smooth Ticker */}
      <footer className="h-8 bg-black/60 border-t border-white/5 flex items-center px-8 overflow-hidden backdrop-blur-3xl">
        <div className="flex gap-16 whitespace-nowrap animate-ticker items-center">
          <div className="flex items-center gap-3 text-[9px] font-black text-slate-500">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            EUR/USD LIQUIDITY: <span className="text-slate-200 mono">DEPTH OPTIMAL</span>
          </div>
          <div className="flex items-center gap-3 text-[9px] font-black text-slate-500">
            SERVER STATUS: <span className="text-emerald-400 mono">SYNCHRONIZED</span>
          </div>
          <div className="flex items-center gap-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">
            <Globe className="w-3 h-3 text-slate-700" /> AI ENGINE VALIDATION ACTIVE
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          animation: ticker 40s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default TradingTerminal;
