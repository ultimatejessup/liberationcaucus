import { Button } from "@/components/ui/button";
import { Heart, Building2 } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const DonateSection = () => {
  const { ref, isVisible } = useScrollAnimation();
  
  return (
    <section id="donate" className="py-24 bg-gradient-to-br from-liberation-red to-liberation-dark relative overflow-hidden" ref={ref}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-liberation-gold rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-liberation-cream rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className={`animate-on-scroll ${isVisible ? 'visible' : ''}`}>
            <span className="text-liberation-gold font-semibold text-sm tracking-widest uppercase">Support the Movement</span>
            <h2 className="text-4xl md:text-5xl font-bold text-liberation-cream mt-4 mb-6">
              Power the Fight for Liberation
            </h2>
            <p className="text-lg text-liberation-cream/80 max-w-2xl mx-auto mb-12 leading-relaxed">
              Your contribution directly supports our organizing work, leadership development programs, and advocacy efforts across the country. Together, we build the power needed to transform our communities.
            </p>
          </div>

          {/* Donation Options */}
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Main Organization */}
            <div className={`bg-liberation-cream/10 backdrop-blur-sm border border-liberation-cream/20 rounded-2xl p-8 text-left animate-on-scroll-scale stagger-1 ${isVisible ? 'visible' : ''}`}>
              <div className="w-14 h-14 bg-liberation-gold/20 rounded-xl flex items-center justify-center mb-6">
                <Heart className="w-7 h-7 text-liberation-gold" />
              </div>
              <h3 className="text-xl font-bold text-liberation-cream mb-3">Liberation Caucus</h3>
              <p className="text-liberation-cream/70 text-sm mb-6">
                Support our educational programs, community organizing, and advocacy work. Tax-deductible.
              </p>
              <Button
                className="w-full bg-liberation-gold hover:bg-liberation-gold/90 text-liberation-dark font-semibold"
                size="lg"
                asChild
              >
                <a href="https://actionnetwork.org/fundraising/lc-donate" target="_blank" rel="noopener noreferrer">
                  Donate to LC
                </a>
              </Button>
            </div>

            {/* PAC */}
            <div className={`bg-liberation-cream/10 backdrop-blur-sm border border-liberation-cream/20 rounded-2xl p-8 text-left animate-on-scroll-scale stagger-2 ${isVisible ? 'visible' : ''}`}>
              <div className="w-14 h-14 bg-liberation-red/20 rounded-xl flex items-center justify-center mb-6">
                <Building2 className="w-7 h-7 text-liberation-cream" />
              </div>
              <h3 className="text-xl font-bold text-liberation-cream mb-3">Liberation PAC</h3>
              <p className="text-liberation-cream/70 text-sm mb-6">
                Support our electoral work and help elect candidates who champion liberation. Not tax-deductible.
              </p>
              <Button
                variant="outline"
                className="w-full border-liberation-cream text-liberation-cream hover:bg-liberation-cream hover:text-liberation-dark font-semibold"
                size="lg"
                asChild
              >
                <a href="https://actionnetwork.org/fundraising/donate-lc-pac?source=direct_link&" target="_blank" rel="noopener noreferrer">
                  Donate to PAC
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DonateSection;
