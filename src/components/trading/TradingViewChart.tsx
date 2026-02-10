'use client';

import { useState } from 'react';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  Area,
} from 'recharts';
import { formatBCH } from '@/lib/format';

interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface TradingViewChartProps {
  data?: CandleData[];
  title?: string;
}

// Generate realistic mock candle data
const generateCandleData = (): CandleData[] => {
  const data: CandleData[] = [];
  let price = 0.0000000274; // Starting price
  const now = new Date();
  
  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 3600000); // Hourly data
    const volatility = 0.15; // 15% volatility
    const trend = Math.random() > 0.45 ? 1 : -1; // Slight upward bias
    
    const change = price * volatility * (Math.random() - 0.5) * 2 * trend;
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + Math.abs(change) * Math.random() * 0.5;
    const low = Math.min(open, close) - Math.abs(change) * Math.random() * 0.5;
    const volume = 0.1 + Math.random() * 0.8;
    
    data.push({
      time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      open,
      high,
      low,
      close,
      volume,
    });
    
    price = close;
  }
  
  return data;
};

// Custom Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isGreen = data.close >= data.open;
    
    return (
      <div className="bg-void-black border-2 border-border p-3 shadow-lg">
        <p className="font-[family-name:var(--font-mono)] text-xs text-text-dim mb-2">
          {data.time}
        </p>
        <div className="space-y-1 font-[family-name:var(--font-mono)] text-xs">
          <div className="flex justify-between gap-4">
            <span className="text-text-dim">Open:</span>
            <span className={isGreen ? 'text-neon' : 'text-panic'}>
              {data.open.toExponential(6)}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-text-dim">High:</span>
            <span className="text-text">{data.high.toExponential(6)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-text-dim">Low:</span>
            <span className="text-text">{data.low.toExponential(6)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-text-dim">Close:</span>
            <span className={isGreen ? 'text-neon' : 'text-panic'}>
              {data.close.toExponential(6)}
            </span>
          </div>
          <div className="flex justify-between gap-4 pt-1 border-t border-border">
            <span className="text-text-dim">Vol:</span>
            <span className="text-warn">{formatBCH(data.volume, 2)}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// Custom Candlestick Shape
const Candlestick = (props: any) => {
  const { x, y, width, height, low, high, open, close } = props;
  const isGreen = close >= open;
  const color = isGreen ? '#00FFA3' : '#FF2E2E';
  
  // Calculate positions
  const candleWidth = Math.max(width * 0.6, 4);
  const wickWidth = 1;
  
  // Body
  const bodyTop = Math.min(y + height * (1 - (Math.max(open, close) - low) / (high - low)), 
                           y + height * (1 - (Math.min(open, close) - low) / (high - low)));
  const bodyHeight = Math.abs(y + height * (1 - (open - low) / (high - low)) - 
                              y + height * (1 - (close - low) / (high - low)));
  
  // Normalize positions
  const range = high - low;
  const top = y;
  const bottom = y + height;
  const openY = bottom - ((open - low) / range) * height;
  const closeY = bottom - ((close - low) / range) * height;
  const highY = bottom - ((high - low) / range) * height;
  const lowY = bottom;
  
  const bodyTopY = Math.min(openY, closeY);
  const bodyBottomY = Math.max(openY, closeY);
  const bodyH = Math.max(bodyBottomY - bodyTopY, 2);
  
  return (
    <g>
      {/* Wick - High to Low */}
      <line
        x1={x + width / 2}
        y1={highY}
        x2={x + width / 2}
        y2={lowY}
        stroke={color}
        strokeWidth={wickWidth}
      />
      {/* Body - Open to Close */}
      <rect
        x={x + (width - candleWidth) / 2}
        y={bodyTopY}
        width={candleWidth}
        height={bodyH}
        fill={isGreen ? color : color}
        stroke={color}
        strokeWidth={1}
      />
    </g>
  );
};

export function TradingViewChart({ data, title = 'Price Chart' }: TradingViewChartProps) {
  const [timeframe, setTimeframe] = useState('1H');
  const chartData = data || generateCandleData();
  
  // Calculate stats
  const currentPrice = chartData[chartData.length - 1]?.close || 0;
  const openPrice = chartData[0]?.open || 0;
  const priceChange = ((currentPrice - openPrice) / openPrice) * 100;
  const isPositive = priceChange >= 0;
  
  const highPrice = Math.max(...chartData.map(d => d.high));
  const lowPrice = Math.min(...chartData.map(d => d.low));
  const totalVolume = chartData.reduce((acc, d) => acc + d.volume, 0);

  const timeframes = ['1M', '5M', '15M', '1H', '4H', '1D', '1W'];

  return (
    <div className="bg-card border-3 border-border">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-4 border-b-2 border-border gap-4">
        <div className="flex items-center gap-4">
          <h3 className="font-[family-name:var(--font-heading)] text-sm uppercase tracking-wider text-text">
            {title}
          </h3>
          <div className="flex items-center gap-2">
            <span className="font-[family-name:var(--font-mono)] text-lg font-bold text-text">
              {currentPrice.toExponential(6)}
            </span>
            <span className={`font-[family-name:var(--font-mono)] text-sm ${isPositive ? 'text-neon' : 'text-panic'}`}>
              {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
            </span>
          </div>
        </div>
        
        {/* Timeframe Selector */}
        <div className="flex gap-1">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 font-[family-name:var(--font-mono)] text-xs uppercase transition-colors ${
                timeframe === tf
                  ? 'bg-neon text-void font-bold'
                  : 'bg-void border border-border text-text-dim hover:border-neon hover:text-neon'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-0 border-b-2 border-border">
        <div className="p-3 border-r-2 border-border text-center">
          <p className="font-[family-name:var(--font-heading)] text-[10px] uppercase text-text-dim">24h High</p>
          <p className="font-[family-name:var(--font-mono)] text-sm font-bold text-text">{highPrice.toExponential(6)}</p>
        </div>
        <div className="p-3 border-r-2 border-border text-center">
          <p className="font-[family-name:var(--font-heading)] text-[10px] uppercase text-text-dim">24h Low</p>
          <p className="font-[family-name:var(--font-mono)] text-sm font-bold text-text">{lowPrice.toExponential(6)}</p>
        </div>
        <div className="p-3 border-r-2 border-border text-center">
          <p className="font-[family-name:var(--font-heading)] text-[10px] uppercase text-text-dim">24h Volume</p>
          <p className="font-[family-name:var(--font-mono)] text-sm font-bold text-text">{formatBCH(totalVolume, 2)}</p>
        </div>
        <div className="p-3 text-center">
          <p className="font-[family-name:var(--font-heading)] text-[10px] uppercase text-text-dim">Range</p>
          <p className="font-[family-name:var(--font-mono)] text-sm font-bold text-text">
            {((highPrice - lowPrice) / lowPrice * 100).toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="p-4">
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <defs>
              <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FFE600" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#FFE600" stopOpacity={0}/>
              </linearGradient>
            </defs>
            
            <XAxis 
              dataKey="time" 
              axisLine={{ stroke: '#27272a' }}
              tickLine={{ stroke: '#27272a' }}
              tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'JetBrains Mono' }}
              interval="preserveStartEnd"
            />
            
            <YAxis 
              domain={['dataMin', 'dataMax']}
              axisLine={{ stroke: '#27272a' }}
              tickLine={{ stroke: '#27272a' }}
              tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'JetBrains Mono' }}
              tickFormatter={(value) => value.toExponential(2)}
              width={60}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            {/* Volume Bars */}
            <Bar 
              dataKey="volume" 
              yAxisId="volume"
              fill="url(#volumeGradient)"
              opacity={0.5}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.close >= entry.open ? '#00FFA330' : '#FF2E2E30'} 
                />
              ))}
            </Bar>
            
            {/* Price Line */}
            <Area
              type="monotone"
              dataKey="close"
              stroke={isPositive ? '#00FFA3' : '#FF2E2E'}
              strokeWidth={2}
              fill={isPositive ? '#00FFA310' : '#FF2E2E10'}
            />
            
            {/* Reference line at starting price */}
            <ReferenceLine 
              y={openPrice} 
              stroke="#71717a" 
              strokeDasharray="3 3"
              strokeOpacity={0.5}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 p-3 border-t-2 border-border text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-neon" />
          <span className="font-[family-name:var(--font-mono)] text-text-dim">Bullish</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-panic" />
          <span className="font-[family-name:var(--font-mono)] text-text-dim">Bearish</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-warn/30" />
          <span className="font-[family-name:var(--font-mono)] text-text-dim">Volume</span>
        </div>
      </div>
    </div>
  );
}
