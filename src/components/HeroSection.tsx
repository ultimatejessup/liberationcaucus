import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(26, 22, 20, 0.7), rgba(26, 22, 20, 0.9)), url('https://images.unsplash.com/photo-1591848478625-de43268e6fb8?w=1920&q=80')`,
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-liberation-gold/20 border border-liberation-gold/40 rounded-full px-4 py-2 mb-8">
            <span className="w-2 h-2 bg-liberation-gold rounded-full animate-pulse" />
            <span className="text-liberation-gold text-sm font-medium">Now Accepting Applications</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-liberation-cream mb-6 leading-tight">
            Building Power for{" "}
            <span className="text-liberation-gold">Liberation</span>
          </h1>
          
          <p className="text-lg md:text-xl text-liberation-cream/80 max-w-2xl mx-auto mb-8 leading-relaxed">
            Advancing the political, community, and economic interests of Black people and people of the African diaspora through the dismantling of oppressive systems.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-liberation-gold hover:bg-liberation-gold/90 text-liberation-dark font-semibold text-lg px-8 py-6 group"
              asChild
            >
              <a href="https://actionnetwork.org/forms/liberation-caucus-membership-form" target="_blank" rel="noopener noreferrer">
                Become a Member
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-liberation-cream/40 text-liberation-cream hover:bg-liberation-cream/10 text-lg px-8 py-6"
              asChild
            >
              <a href="#freedom-summer">Learn About Freedom Summer</a>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 pt-16 border-t border-liberation-cream/10">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-liberation-gold">500+</div>
              <div className="text-liberation-cream/60 text-sm mt-1">Members Strong</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-liberation-gold">25</div>
              <div className="text-liberation-cream/60 text-sm mt-1">Partner Orgs</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-liberation-gold">12</div>
              <div className="text-liberation-cream/60 text-sm mt-1">States Active</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-liberation-cream/40 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-liberation-gold rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
