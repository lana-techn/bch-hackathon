'use client';

import { m } from 'framer-motion';
import { FadeInSection, StaggerContainer, StaggerItem } from '@/components/animations';

const steps = [
  {
    number: '01',
    title: 'Deploy Smart Contract',
    shortDesc: 'Launch in seconds',
    fullDesc: 'Deploy a CashScript bonding curve covenant with one click. No coding required. Your token is secured by Bitcoin Cash blockchain with immutable liquidity lock. The smart contract ensures no one - not even the creator - can withdraw liquidity before graduation.',
    features: ['One-click deployment', 'CashScript covenant', 'Immutable liquidity lock', 'Anti-rug pull guarantee'],
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Bonding Curve Trading',
    shortDesc: 'Fair price discovery',
    fullDesc: 'Buy and sell tokens instantly with a linear bonding curve (P = mS). Early supporters get better prices. The curve automatically calculates prices based on circulating supply - no order books, no liquidity providers needed. Trading fees (1%) go to platform sustainability.',
    features: ['Instant trades', 'Linear pricing curve', 'No slippage', 'Automatic market making'],
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Auto-Graduate to DEX',
    shortDesc: 'Liquidity migration',
    fullDesc: 'When market cap hits 40 BCH (~$12,000), liquidity automatically migrates to a decentralized exchange. 200M tokens (20%) reserved for DEX liquidity. Trading continues seamlessly with deeper liquidity. No manual intervention required.',
    features: ['Auto-migration at 40 BCH', 'DEX liquidity lock', '200M token reserve', 'Seamless transition'],
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-20 md:py-32 bg-card border-y-3 border-border relative overflow-hidden">
      {/* Background Grid */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: 'linear-gradient(#00FFA3 1px, transparent 1px), linear-gradient(90deg, #00FFA3 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative">
        <FadeInSection>
          <div className="text-center mb-16">
            <span className="font-mono text-xs text-neon uppercase tracking-widest mb-4 block">
              Technical Process
            </span>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-5xl font-bold uppercase text-text mb-4">
              How IgniteBCH <span className="text-neon">Works</span>
            </h2>
            <p className="text-text-dim text-lg max-w-2xl mx-auto">
              Fair launch protocol powered by Bitcoin Cash smart contracts. 
              Transparent, secure, and fully decentralized.
            </p>
          </div>
        </FadeInSection>

        <StaggerContainer className="relative" staggerDelay={0.2}>
          {/* Connection Line */}
          <div className="absolute top-[60px] left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-neon to-transparent hidden md:block z-0 opacity-30" />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
            {steps.map((step, index) => (
              <StaggerItem key={index}>
                <m.div 
                  className="bg-void border-3 border-border p-8 h-full group hover:border-neon transition-all duration-300"
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Step Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-neon/10 border-2 border-neon flex items-center justify-center">
                        <span className="font-[family-name:var(--font-heading)] text-xl font-bold text-neon">
                          {step.number}
                        </span>
                      </div>
                      <div className="text-neon">
                        {step.icon}
                      </div>
                    </div>
                    <span className="font-mono text-xs text-text-dim uppercase">
                      Step {step.number}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold uppercase text-text mb-2">
                    {step.title}
                  </h3>
                  <p className="text-neon text-sm font-mono mb-4">
                    {step.shortDesc}
                  </p>
                  <p className="text-text-dim leading-relaxed text-sm mb-6">
                    {step.fullDesc}
                  </p>

                  {/* Features List */}
                  <div className="border-t-2 border-border pt-4">
                    <ul className="space-y-2">
                      {step.features.map((feature, fIndex) => (
                        <li key={fIndex} className="flex items-center gap-2 text-xs">
                          <span className="w-1.5 h-1.5 bg-neon flex-shrink-0" />
                          <span className="text-text-dim font-mono">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Glow Effect on Hover */}
                  <div className="absolute inset-0 bg-neon/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                </m.div>
              </StaggerItem>
            ))}
          </div>
        </StaggerContainer>

        {/* Technical Specs */}
        <FadeInSection delay={0.4}>
          <div className="mt-16 bg-void border-2 border-border p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <p className="font-mono text-xs text-text-dim uppercase mb-1">Total Supply</p>
                <p className="font-heading text-lg font-bold text-text">1,000,000,000</p>
              </div>
              <div>
                <p className="font-mono text-xs text-text-dim uppercase mb-1">Curve Supply</p>
                <p className="font-heading text-lg font-bold text-neon">800M (80%)</p>
              </div>
              <div>
                <p className="font-mono text-xs text-text-dim uppercase mb-1">DEX Reserve</p>
                <p className="font-heading text-lg font-bold text-warn">200M (20%)</p>
              </div>
              <div>
                <p className="font-mono text-xs text-text-dim uppercase mb-1">Graduation Target</p>
                <p className="font-heading text-lg font-bold text-text">40 BCH</p>
              </div>
            </div>
          </div>
        </FadeInSection>
      </div>
    </section>
  );
}
