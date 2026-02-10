'use client';

import { m } from 'framer-motion';
import Link from 'next/link';
import { FadeInSection } from '@/components/animations';

export function CTASection() {
  return (
    <section className="py-20 md:py-32 bg-card border-y-3 border-border relative overflow-hidden">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #00FFA3 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="max-w-4xl mx-auto px-4 md:px-8 relative text-center">
        <FadeInSection>
          <m.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-5xl font-bold uppercase text-text mb-6">
              Ready to Launch Your <span className="text-neon">Token?</span>
            </h2>
            <p className="text-text-dim text-lg md:text-xl mb-8 max-w-2xl mx-auto">
              Join the fairest launch platform on Bitcoin Cash. No coding required, 
              deploy in under 2 seconds.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/create"
                className="brutal-btn bg-neon text-void font-[family-name:var(--font-heading)] font-bold text-sm uppercase tracking-wider px-10 py-4 border-3 border-neon hover:bg-neon/90 transition-colors inline-block"
              >
                Launch Token Now
              </Link>
              <Link
                href="/tokens"
                className="brutal-btn bg-void text-neon font-[family-name:var(--font-heading)] font-bold text-sm uppercase tracking-wider px-10 py-4 border-3 border-neon hover:bg-neon/10 transition-colors inline-block"
              >
                Explore Tokens
              </Link>
            </div>

            <p className="mt-8 text-text-dim text-sm font-[family-name:var(--font-mono)]">
              Launch fee: 0.005 BCH • No hidden fees • Instant deployment
            </p>
          </m.div>
        </FadeInSection>
      </div>
    </section>
  );
}
