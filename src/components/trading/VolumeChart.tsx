'use client';

import { useMemo } from 'react';
import { formatBCH } from '@/lib/format';

interface VolumeData {
  time: string;
  volume: number;
  buyVolume: number;
  sellVolume: number;
}

interface VolumeChartProps {
  data?: VolumeData[];
  title?: string;
}

// Mock volume data - in real app, this comes from API
const mockVolumeData: VolumeData[] = [
  { time: '00:00', volume: 1.2, buyVolume: 0.8, sellVolume: 0.4 },
  { time: '04:00', volume: 0.8, buyVolume: 0.5, sellVolume: 0.3 },
  { time: '08:00', volume: 2.5, buyVolume: 1.8, sellVolume: 0.7 },
  { time: '12:00', volume: 3.8, buyVolume: 2.2, sellVolume: 1.6 },
  { time: '16:00', volume: 2.1, buyVolume: 1.4, sellVolume: 0.7 },
  { time: '20:00', volume: 1.5, buyVolume: 0.9, sellVolume: 0.6 },
  { time: '23:59', volume: 0.9, buyVolume: 0.6, sellVolume: 0.3 },
];

export function VolumeChart({ data = mockVolumeData, title = '24h Volume' }: VolumeChartProps) {
  const maxVolume = useMemo(() => 
    Math.max(...data.map(d => d.volume)), 
    [data]
  );

  const totalVolume = useMemo(() => 
    data.reduce((acc, d) => acc + d.volume, 0),
    [data]
  );

  const totalBuyVolume = useMemo(() => 
    data.reduce((acc, d) => acc + d.buyVolume, 0),
    [data]
  );

  const totalSellVolume = useMemo(() => 
    data.reduce((acc, d) => acc + d.sellVolume, 0),
    [data]
  );

  return (
    <div className="bg-card border-3 border-border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b-2 border-border">
        <h3 className="font-[family-name:var(--font-heading)] text-sm uppercase tracking-wider text-text">
          {title}
        </h3>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-neon" />
            <span className="font-[family-name:var(--font-mono)] text-text-dim">Buy</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-panic" />
            <span className="font-[family-name:var(--font-mono)] text-text-dim">Sell</span>
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="p-4">
        {/* Volume Bars */}
        <div className="flex items-end justify-between gap-2 h-40 mb-4">
          {data.map((item, index) => {
            const heightPercent = (item.volume / maxVolume) * 100;
            const buyHeightPercent = (item.buyVolume / item.volume) * 100;
            
            return (
              <div 
                key={index} 
                className="flex-1 flex flex-col justify-end group relative"
              >
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-void border border-border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                  <p className="font-[family-name:var(--font-mono)] text-xs text-text">
                    {formatBCH(item.volume, 2)} BCH
                  </p>
                  <p className="font-[family-name:var(--font-mono)] text-[10px] text-text-dim">
                    {item.time}
                  </p>
                </div>

                {/* Stacked Bar */}
                <div 
                  className="w-full flex flex-col-reverse border border-border hover:border-neon transition-colors cursor-pointer"
                  style={{ height: `${heightPercent}%` }}
                >
                  {/* Sell Volume (bottom) */}
                  <div 
                    className="w-full bg-panic/80"
                    style={{ height: `${100 - buyHeightPercent}%` }}
                  />
                  {/* Buy Volume (top) */}
                  <div 
                    className="w-full bg-neon"
                    style={{ height: `${buyHeightPercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* X Axis Labels */}
        <div className="flex justify-between text-xs">
          {data.map((item, index) => (
            <span 
              key={index} 
              className="font-[family-name:var(--font-mono)] text-text-dim flex-1 text-center"
            >
              {item.time}
            </span>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="border-t-2 border-border p-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="font-[family-name:var(--font-heading)] text-[10px] uppercase text-text-dim">
              Total Volume
            </p>
            <p className="font-[family-name:var(--font-mono)] text-lg font-bold text-text">
              {formatBCH(totalVolume, 2)}
            </p>
          </div>
          <div className="text-center border-l border-r border-border">
            <p className="font-[family-name:var(--font-heading)] text-[10px] uppercase text-text-dim">
              Buy Volume
            </p>
            <p className="font-[family-name:var(--font-mono)] text-lg font-bold text-neon">
              {formatBCH(totalBuyVolume, 2)}
            </p>
          </div>
          <div className="text-center">
            <p className="font-[family-name:var(--font-heading)] text-[10px] uppercase text-text-dim">
              Sell Volume
            </p>
            <p className="font-[family-name:var(--font-mono)] text-lg font-bold text-panic">
              {formatBCH(totalSellVolume, 2)}
            </p>
          </div>
        </div>

        {/* Buy/Sell Ratio Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="font-[family-name:var(--font-mono)] text-neon">
              {(totalBuyVolume / totalVolume * 100).toFixed(1)}% Buy
            </span>
            <span className="font-[family-name:var(--font-mono)] text-panic">
              {(totalSellVolume / totalVolume * 100).toFixed(1)}% Sell
            </span>
          </div>
          <div className="w-full h-3 bg-void border-2 border-border flex">
            <div 
              className="h-full bg-neon"
              style={{ width: `${(totalBuyVolume / totalVolume) * 100}%` }}
            />
            <div 
              className="h-full bg-panic"
              style={{ width: `${(totalSellVolume / totalVolume) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
