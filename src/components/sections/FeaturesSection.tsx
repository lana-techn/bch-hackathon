'use client';

import { m } from 'framer-motion';
import { FadeInSection, StaggerContainer, StaggerItem } from '@/components/animations';

const features = [
  {
    id: 'fair-launch',
    title: 'Fair Launch',
    subtitle: 'No Presale',
    description: 'Zero insider allocations. Zero team tokens. Everyone starts at the same price point with equal opportunity. True fairness from block one.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    gridArea: 'large',
  },
  {
    id: 'bonding-curve',
    title: 'Linear Pricing',
    subtitle: 'P = mS Formula',
    description: 'Price increases linearly with supply. Early buyers get better rates. Mathematical fairness built into the protocol.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    gridArea: 'large',
  },
  {
    id: 'auto-liquidity',
    title: 'Auto Migration',
    subtitle: '40 BCH Target',
    description: 'Liquidity automatically moves to DEX at graduation. No manual intervention required. Seamless transition to deeper markets.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
    gridArea: 'large',
  },
  {
    id: 'smart-contract',
    title: 'CashScript',
    subtitle: 'BCH Native',
    description: 'Immutable smart contracts secured by Bitcoin Cash blockchain.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    gridArea: 'small',
  },
  {
    id: 'instant',
    title: 'Instant Deploy',
    subtitle: '< 2 Seconds',
    description: 'Launch and trade immediately. No waiting periods.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    gridArea: 'small',
  },
  {
    id: 'security',
    title: '100% Safe',
    subtitle: 'Locked Liquidity',
    description: 'Liquidity locked by contract. No rug pull possible. Ever.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    gridArea: 'medium',
  },
];

function FeatureCard({ feature }: { feature: typeof features[0] }) {
  const isLarge = feature.gridArea === 'large';
  const isMedium = feature.gridArea === 'medium';

  return (
    <m.div
      className={`group relative bg-card border-3 border-border overflow-hidden 
        hover:border-neon transition-all duration-300 h-full
        ${isLarge ? 'p-8' : 'p-6'}`}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-neon/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Top Row: Icon + Subtitle */}
        <div className="flex items-start justify-between mb-4">
          <div className={`text-neon ${isLarge ? 'scale-110' : ''}`}>
            {feature.icon}
          </div>
          <span className="font-mono text-[10px] uppercase text-text-dim bg-void px-2 py-1 border border-border">
            {feature.subtitle}
          </span>
        </div>

        {/* Title */}
        <h3 className={`font-[family-name:var(--font-heading)] font-bold uppercase text-text mb-3
          ${isLarge ? 'text-2xl' : isMedium ? 'text-xl' : 'text-lg'}`}>
          {feature.title}
        </h3>

        {/* Description */}
        <p className={`text-text-dim leading-relaxed flex-grow
          ${isLarge ? 'text-base' : 'text-sm'}`}>
          {feature.description}
        </p>

        {/* Bottom Action - Only on larger cards */}
        {(isLarge || isMedium) && (
          <div className="mt-6 pt-4 border-t-2 border-border">
            <div className="flex items-center gap-2 text-xs font-mono text-neon opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Learn more</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Corner Accent */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-neon/10 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }} />
    </m.div>
  );
}

export function FeaturesSection() {
  // Split features for grid layout
  const mainFeatures = features.filter(f => f.gridArea === 'large');
  const otherFeatures = features.filter(f => f.gridArea !== 'large');

  return (
    <section className="py-20 md:py-32 bg-void relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #00FFA3 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative">
        {/* Header */}
        <FadeInSection>
          <div className="text-center mb-16">
            <span className="font-mono text-xs text-neon uppercase tracking-widest mb-4 block">
              Core Features
            </span>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-5xl font-bold uppercase text-text mb-4">
              Why Choose <span className="text-neon">IITEBCH</span>
            </h2>
            <p className="text-text-dim text-lg max-w-2xl mx-auto">
              Built for fairness, secured by Bitcoin Cash
            </p>
          </div>
        </FadeInSection>

        {/* Bento Grid - Desktop Layout */}
        <StaggerContainer className="hidden md:grid gap-4" staggerDelay={0.1}>
          {/* Row 1: 3 Main Features (Large cards - same size) */}
          <div className="grid grid-cols-3 gap-4">
            {mainFeatures.map((feature) => (
              <StaggerItem key={feature.id}>
                <FeatureCard feature={feature} />
              </StaggerItem>
            ))}
          </div>

          {/* Row 2: 3 Other Features (Small cards) */}
          <div className="grid grid-cols-3 gap-4">
            {otherFeatures.map((feature) => (
              <StaggerItem key={feature.id}>
                <FeatureCard feature={feature} />
              </StaggerItem>
            ))}
          </div>
        </StaggerContainer>

        {/* Mobile Layout - Single Column */}
        <StaggerContainer className="md:hidden grid grid-cols-1 gap-4" staggerDelay={0.1}>
          {features.map((feature) => (
            <StaggerItem key={feature.id}>
              <FeatureCard feature={feature} />
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Bottom Stats Bar */}
        <FadeInSection delay={0.3}>
          <div className="mt-16 bg-card border-2 border-border p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <p className="font-mono text-xs text-text-dim uppercase mb-1">Launch Fee</p>
                <p className="font-heading text-xl font-bold text-text">0.005 BCH</p>
              </div>
              <div>
                <p className="font-mono text-xs text-text-dim uppercase mb-1">Trading Fee</p>
                <p className="font-heading text-xl font-bold text-neon">1%</p>
              </div>
              <div>
                <p className="font-mono text-xs text-text-dim uppercase mb-1">Curve Supply</p>
                <p className="font-heading text-xl font-bold text-text">800M</p>
              </div>
              <div>
                <p className="font-mono text-xs text-text-dim uppercase mb-1">DEX Reserve</p>
                <p className="font-heading text-xl font-bold text-warn">200M</p>
              </div>
            </div>
          </div>
        </FadeInSection>
      </div>
    </section>
  );
}
