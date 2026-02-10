'use client';

import { useEffect, useState, useRef } from 'react';
import { m, useInView } from 'framer-motion';
import { FadeInSection } from '@/components/animations';

interface StatItemProps {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  decimals?: number;
}

function AnimatedCounter({ value, suffix = '', prefix = '', decimals = 0 }: Omit<StatItemProps, 'label'>) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const duration = 2000;
      const steps = 60;
      const increment = value / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(current);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {prefix}{decimals > 0 ? count.toFixed(decimals) : Math.floor(count)}{suffix}
    </span>
  );
}

const stats = [
  { value: 150, suffix: '+', label: 'Tokens Launched' },
  { value: 1250, suffix: '', label: 'Total Holders' },
  { value: 450, suffix: ' BCH', label: 'Total Volume', decimals: 1 },
  { value: 98, suffix: '%', label: 'Success Rate' },
];

export function StatsSection() {
  return (
    <section className="py-20 md:py-32 bg-void relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-neon/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative">
        <FadeInSection>
          <div className="text-center mb-16">
            <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-5xl font-bold uppercase text-text mb-4">
              Platform <span className="text-neon">Statistics</span>
            </h2>
            <p className="text-text-dim text-lg max-w-2xl mx-auto">
              Real-time metrics from the IgniteBCH ecosystem
            </p>
          </div>
        </FadeInSection>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <m.div
              key={index}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="text-center p-6 bg-card border-3 border-border"
            >
              <p className="font-[family-name:var(--font-mono)] text-3xl md:text-4xl font-bold text-neon mb-2">
                <AnimatedCounter 
                  value={stat.value} 
                  suffix={stat.suffix}
                  decimals={stat.decimals || 0}
                />
              </p>
              <p className="font-[family-name:var(--font-heading)] text-sm uppercase text-text-dim">
                {stat.label}
              </p>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
}
