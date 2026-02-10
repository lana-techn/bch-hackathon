'use client';

import { m } from 'framer-motion';
import { FadeInSection, StaggerContainer, StaggerItem } from '@/components/animations';

const steps = [
  {
    number: '01',
    title: 'Create Token',
    description: 'Choose a name, ticker, and image. Deploy in seconds with just 0.005 BCH.',
  },
  {
    number: '02',
    title: 'Trade on Curve',
    description: 'Buy and sell tokens instantly. Price moves up the bonding curve as demand grows.',
  },
  {
    number: '03',
    title: 'Graduate to DEX',
    description: 'When market cap reaches 40 BCH, liquidity automatically migrates to a DEX.',
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-20 md:py-32 bg-card border-y-3 border-border relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative">
        <FadeInSection>
          <div className="text-center mb-16">
            <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-5xl font-bold uppercase text-text mb-4">
              How It <span className="text-neon">Works</span>
            </h2>
            <p className="text-text-dim text-lg max-w-2xl mx-auto">
              Launch your token in 3 simple steps
            </p>
          </div>
        </FadeInSection>

        <StaggerContainer className="relative" staggerDelay={0.2}>
          {/* Connection Line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-border hidden md:block -translate-y-1/2 z-0" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {steps.map((step, index) => (
              <StaggerItem key={index}>
                <m.div 
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="inline-block mb-6">
                    <div className="w-20 h-20 bg-void border-3 border-neon flex items-center justify-center mx-auto relative">
                      <span className="font-[family-name:var(--font-heading)] text-2xl font-bold text-neon">
                        {step.number}
                      </span>
                      {/* Glow effect */}
                      <div className="absolute inset-0 bg-neon/20 blur-xl -z-10" />
                    </div>
                  </div>
                  <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold uppercase text-text mb-3">
                    {step.title}
                  </h3>
                  <p className="text-text-dim leading-relaxed max-w-xs mx-auto">
                    {step.description}
                  </p>
                </m.div>
              </StaggerItem>
            ))}
          </div>
        </StaggerContainer>
      </div>
    </section>
  );
}
