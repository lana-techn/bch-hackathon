'use client';

import { m } from 'framer-motion';
import { FadeInSection, StaggerContainer, StaggerItem } from '@/components/animations';

const features = [
  {
    id: 'fair-launch',
    title: 'Fair Launch',
    description: 'No presale, no team allocation, no insider deals. Everyone gets the same price at launch. The bonding curve ensures transparent price discovery from day one.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    size: 'large',
    color: 'neon',
  },
  {
    id: 'bonding-curve',
    title: 'Linear Bonding Curve',
    description: 'P = mS formula. Price increases linearly with supply. Early buyers get better rates.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    size: 'small',
    color: 'neon',
  },
  {
    id: 'auto-liquidity',
    title: 'Auto DEX Migration',
    description: 'When market cap hits 40 BCH, liquidity automatically moves to DEX. No manual steps required.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
    size: 'small',
    color: 'warn',
  },
  {
    id: 'smart-contract',
    title: 'CashScript Covenant',
    description: 'Powered by Bitcoin Cash smart contracts. Immutable, transparent, and secured by the BCH blockchain. The contract locks liquidity and enforces bonding curve math.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    size: 'large',
    color: 'neon',
  },
  {
    id: 'instant-trading',
    title: 'Instant Trading',
    description: 'Buy and sell tokens immediately after launch. No waiting periods. No liquidity provider setup needed.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    size: 'small',
    color: 'neon',
  },
  {
    id: 'low-fees',
    title: 'Low Fees',
    description: 'Only 1% trading fee. 0.005 BCH launch fee. No hidden costs.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    size: 'small',
    color: 'text',
  },
  {
    id: 'wallet-support',
    title: 'Multi-Wallet Support',
    description: 'Connect with Paytaca, Cashonize, or any WalletConnect-compatible BCH wallet.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    size: 'small',
    color: 'neon',
  },
  {
    id: 'analytics',
    title: 'Real-Time Analytics',
    description: 'Live price charts, volume tracking, and holder statistics. All on-chain data.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    size: 'small',
    color: 'warn',
  },
];

function BentoCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const isLarge = feature.size === 'large';
  const colorClasses = {
    neon: 'border-neon/30 hover:border-neon text-neon',
    warn: 'border-warn/30 hover:border-warn text-warn',
    text: 'border-text-dim/30 hover:border-text text-text',
  };

  return (
    <m.div
      className={`group relative bg-card border-3 ${colorClasses[feature.color as keyof typeof colorClasses]} 
        p-6 md:p-8 overflow-hidden transition-all duration-300 cursor-pointer
        ${isLarge ? 'md:col-span-2 md:row-span-1' : ''}`}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      {/* Background Gradient */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
        ${feature.color === 'neon' ? 'bg-gradient-to-br from-neon/5 to-transparent' : ''}
        ${feature.color === 'warn' ? 'bg-gradient-to-br from-warn/5 to-transparent' : ''}
        ${feature.color === 'text' ? 'bg-gradient-to-br from-text/5 to-transparent' : ''}
      `} />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Icon */}
        <div className={`mb-4 ${isLarge ? 'scale-110' : ''}`}>
          {feature.icon}
        </div>

        {/* Title */}
        <h3 className={`font-[family-name:var(--font-heading)] font-bold uppercase text-text mb-3
          ${isLarge ? 'text-2xl' : 'text-lg'}`}>
          {feature.title}
        </h3>

        {/* Description */}
        <p className={`text-text-dim leading-relaxed flex-grow
          ${isLarge ? 'text-base' : 'text-sm'}`}>
          {feature.description}
        </p>

        {/* Arrow Indicator */}
        <div className="mt-4 flex items-center gap-2 text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity">
          <span className={feature.color === 'neon' ? 'text-neon' : feature.color === 'warn' ? 'text-warn' : 'text-text'}>
            Learn more
          </span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>

      {/* Corner Accent */}
      <div className={`absolute top-0 right-0 w-16 h-16 opacity-10
        ${feature.color === 'neon' ? 'bg-neon' : ''}
        ${feature.color === 'warn' ? 'bg-warn' : ''}
        ${feature.color === 'text' ? 'bg-text' : ''}
      `} 
      style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }} />
    </m.div>
  );
}

export function StatsSection() {
  return (
    <section className="py-20 md:py-32 bg-void relative overflow-hidden">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #00FFA3 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative">
        <FadeInSection>
          <div className="text-center mb-16">
            <span className="font-mono text-xs text-neon uppercase tracking-widest mb-4 block">
              Platform Features
            </span>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-5xl font-bold uppercase text-text mb-4">
              What Makes Us <span className="text-neon">Different</span>
            </h2>
            <p className="text-text-dim text-lg max-w-2xl mx-auto">
              Built specifically for Bitcoin Cash with security, transparency, 
              and fairness at the core.
            </p>
          </div>
        </FadeInSection>

        {/* Bento Grid */}
        <StaggerContainer 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-fr"
          staggerDelay={0.1}
        >
          {features.map((feature, index) => (
            <StaggerItem key={feature.id}>
              <BentoCard feature={feature} index={index} />
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Bottom CTA */}
        <FadeInSection delay={0.4}>
          <div className="mt-12 text-center">
            <p className="text-text-dim font-mono text-sm mb-4">
              Ready to experience the future of token launches?
            </p>
            <div className="inline-flex items-center gap-2 text-neon font-heading text-sm uppercase">
              <span className="w-2 h-2 bg-neon animate-pulse" />
              Launch your token in under 2 seconds
            </div>
          </div>
        </FadeInSection>
      </div>
    </section>
  );
}
