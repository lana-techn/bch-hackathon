'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatBCH } from '@/lib/format';

interface VolumeData {
  time: string;
  buy: number;
  sell: number;
}

const data: VolumeData[] = [
  { time: '00:00', buy: 0.8, sell: 0.4 },
  { time: '04:00', buy: 0.5, sell: 0.3 },
  { time: '08:00', buy: 1.8, sell: 0.7 },
  { time: '12:00', buy: 2.2, sell: 1.6 },
  { time: '16:00', buy: 1.4, sell: 0.7 },
  { time: '20:00', buy: 0.9, sell: 0.6 },
];

export function VolumeChart() {
  const totalBuy = data.reduce((a, b) => a + b.buy, 0);
  const totalSell = data.reduce((a, b) => a + b.sell, 0);
  const total = totalBuy + totalSell;
  const buyRatio = (totalBuy / total) * 100;

  return (
    <div className="bg-card border-3 border-border">
      {/* Header */}
      <div className="p-4 border-b-2 border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-[family-name:var(--font-heading)] text-sm uppercase text-text">
            Volume 24h
          </h3>
          <p className="font-[family-name:var(--font-mono)] text-lg font-bold text-text">
            {formatBCH(total, 2)}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="p-4">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <XAxis 
              dataKey="time" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#71717a', fontSize: 10 }}
            />
            <YAxis 
              hide
            />
            <Tooltip 
              cursor={{ fill: '#00FFA310' }}
              contentStyle={{ 
                backgroundColor: '#050505', 
                border: '2px solid #27272a',
                borderRadius: 0
              }}
              labelStyle={{ color: '#71717a', fontSize: 12 }}
            />
            <Bar dataKey="buy" stackId="a" fill="#00FFA3" />
            <Bar dataKey="sell" stackId="a" fill="#FF2E2E" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Stats */}
      <div className="px-4 pb-4">
        <div className="flex justify-between text-xs mb-2">
          <span className="text-neon font-mono">Buy {formatBCH(totalBuy, 2)}</span>
          <span className="text-panic font-mono">Sell {formatBCH(totalSell, 2)}</span>
        </div>
        <div className="h-2 bg-void border border-border flex">
          <div className="bg-neon" style={{ width: `${buyRatio}%` }} />
          <div className="bg-panic" style={{ width: `${100 - buyRatio}%` }} />
        </div>
      </div>
    </div>
  );
}
