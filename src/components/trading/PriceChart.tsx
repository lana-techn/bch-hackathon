"use client";

import { mockCandles } from "@/data/mock-tokens";

export function PriceChart() {
  const candles = mockCandles;
  const maxHigh = Math.max(...candles.map((c) => c.high));
  const minLow = Math.min(...candles.map((c) => c.low));
  const range = maxHigh - minLow;

  const chartHeight = 300;
  const chartWidth = 600;
  const candleWidth = chartWidth / candles.length;
  const bodyWidth = candleWidth * 0.6;

  const scaleY = (value: number) =>
    chartHeight - ((value - minLow) / range) * chartHeight;

  return (
    <div className="bg-card border-3 border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-[family-name:var(--font-heading)] text-sm font-bold uppercase text-text-dim">
          Price Chart
        </h3>
        <div className="flex gap-2">
          {["1H", "4H", "1D", "1W"].map((tf) => (
            <button
              key={tf}
              className={`px-2 py-0.5 font-[family-name:var(--font-mono)] text-xs border border-border hover:border-neon hover:text-neon transition-colors ${
                tf === "1H" ? "border-neon text-neon" : "text-text-dim"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-[300px]"
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((pct) => (
            <line
              key={pct}
              x1={0}
              y1={chartHeight * pct}
              x2={chartWidth}
              y2={chartHeight * pct}
              stroke="#333333"
              strokeWidth={0.5}
              strokeDasharray="4,4"
            />
          ))}

          {/* Candlesticks */}
          {candles.map((candle, i) => {
            const x = i * candleWidth + candleWidth / 2;
            const isGreen = candle.close >= candle.open;
            const color = isGreen ? "#00FFA3" : "#FF2E2E";

            const openY = scaleY(candle.open);
            const closeY = scaleY(candle.close);
            const highY = scaleY(candle.high);
            const lowY = scaleY(candle.low);

            const bodyTop = Math.min(openY, closeY);
            const bodyHeight = Math.abs(closeY - openY) || 1;

            return (
              <g key={i}>
                {/* Wick */}
                <line
                  x1={x}
                  y1={highY}
                  x2={x}
                  y2={lowY}
                  stroke={color}
                  strokeWidth={1.5}
                />
                {/* Body */}
                <rect
                  x={x - bodyWidth / 2}
                  y={bodyTop}
                  width={bodyWidth}
                  height={bodyHeight}
                  fill={isGreen ? color : color}
                  stroke={color}
                  strokeWidth={0.5}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Price Labels */}
      <div className="flex justify-between mt-2">
        <span className="font-[family-name:var(--font-mono)] text-xs text-text-dim tabular-nums">
          L: {minLow.toFixed(4)}
        </span>
        <span className="font-[family-name:var(--font-mono)] text-xs text-text-dim tabular-nums">
          H: {maxHigh.toFixed(4)}
        </span>
        <span className="font-[family-name:var(--font-mono)] text-xs text-neon tabular-nums">
          C: {candles[candles.length - 1].close.toFixed(4)}
        </span>
      </div>
    </div>
  );
}
