'use client';

import { m } from 'framer-motion';
import { FadeInSection, StaggerContainer, StaggerItem } from '@/components/animations';

const features = [
  {
    title: 'Fair Launch',
    description: 'No presale, no team allocation. Everyone gets the same price at launch.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Bonding Curve',
    description: 'Price increases as more tokens are bought. Early supporters get better prices.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    title: 'Auto Liquidity',
    description: 'When market cap hits 40 BCH, liquidity automatically migrates to DEX.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
  },
  {
    title: '100% Safe',
    description: 'Liquidity locked in smart contract. No rug pull possible.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 md:py-32 bg-void relative overflow-hidden">
      {/* Background Grid */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(#00FFA3 1px, transparent 1px), linear-gradient(90deg, #00FFA3 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
      
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative">
        <FadeInSection>
          <div className="text-center mb-16">
            <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-5xl font-bold uppercase text-text mb-4">
              Why Choose <span className="text-neon">IgniteBCH</span>
            </h2>
            <p className="text-text-dim text-lg max-w-2xl mx-auto">
              The most trusted fair launch platform on Bitcoin Cash
            </p>
          </div>
        </FadeInSection>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6" staggerDelay={0.15}>
          {features.map((feature, index) => (
            <StaggerItem key={index}>
              <m.div 
                    className="bg-card border-3 border-border p-8 group hover:border-neon transition-colors duration-300"
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                <div className="text-neon mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold uppercase text-text mb-2">
                  {feature.title}
                </h3>
                <p className="text-text-dim leading-relaxed">
                  {feature.description}
                </p>
                </m.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
