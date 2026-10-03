import ScrollReveal from '../components/common/ScrollReveal'
import HeroSection from '../components/landing/HeroSection'
import WhySection from '../components/landing/WhySection'
import HowItWorksSection from '../components/landing/HowItWorksSection'
import FeaturesSection from '../components/landing/FeaturesSection'
import AlgorithmsPreview from '../components/landing/AlgorithmsPreview'
import ContactSection from '../components/landing/ContactSection'
import FaqSection from '../components/landing/FaqSection'
import FinalCta from '../components/landing/FinalCta'

export default function LandingPage() {
  return (
    <div className="w-full">
      {/* 1. Hero Section (bg-canvas) */}
      <div className="w-full bg-canvas border-b border-line/40">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <HeroSection />
        </div>
      </div>

      {/* 2. Why Section (bg-surface) */}
      <div className="w-full bg-surface border-b border-line">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <ScrollReveal>
            <WhySection />
          </ScrollReveal>
        </div>
      </div>

      {/* 3. How It Works Section (bg-canvas) */}
      <div className="w-full bg-canvas border-b border-line">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <ScrollReveal>
            <HowItWorksSection />
          </ScrollReveal>
        </div>
      </div>

      {/* 4. Features & Zen Spotlight Section (bg-surface) */}
      <div className="w-full bg-surface border-b border-line">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <ScrollReveal>
            <FeaturesSection />
          </ScrollReveal>
        </div>
      </div>

      {/* 5. Algorithms Preview Section (bg-canvas) */}
      <div className="w-full bg-canvas border-b border-line">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <ScrollReveal>
            <AlgorithmsPreview />
          </ScrollReveal>
        </div>
      </div>

      {/* 6. Contact Section (bg-surface) */}
      <div className="w-full bg-surface border-b border-line">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <ScrollReveal>
            <ContactSection />
          </ScrollReveal>
        </div>
      </div>

      {/* 7. FAQ Section (bg-canvas) */}
      <div className="w-full bg-canvas border-b border-line">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <ScrollReveal>
            <FaqSection />
          </ScrollReveal>
        </div>
      </div>

      {/* 8. Final CTA Section (bg-surface) */}
      <div className="w-full bg-surface">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <ScrollReveal>
            <FinalCta />
          </ScrollReveal>
        </div>
      </div>
    </div>
  )
}
