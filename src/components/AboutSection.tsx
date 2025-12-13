import { useState } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import civilRightsMarch from "@/assets/civil-rights-march-1963.jpg";
import civilRightsSigns from "@/assets/civil-rights-signs.jpg";
import civilRightsProtesters from "@/assets/civil-rights-protesters.jpg";
import civilRightsCrowd from "@/assets/civil-rights-crowd.jpg";

const AboutSection = () => {
  const { ref, isVisible } = useScrollAnimation();
  const [selectedPillar, setSelectedPillar] = useState<string | null>(null);
  
  const pillars = [
    { 
      label: "Economic Injustice", 
      color: "bg-liberation-gold",
      definition: "The unfair distribution of economic resources, opportunities, and privileges within a society. It encompasses systemic disparities in wealth, income, employment, and access to essential services that disproportionately affect marginalized communities.",
      source: "Based on sociological definitions",
      image: civilRightsSigns
    },
    { 
      label: "Sexism", 
      color: "bg-liberation-red",
      definition: "Prejudice, stereotyping, or discrimination, typically against women, on the basis of sex. It includes attitudes, conditions, or behaviors that promote stereotyping of social roles based on gender.",
      source: "Merriam-Webster Dictionary",
      image: civilRightsProtesters
    },
    { 
      label: "Ableism", 
      color: "bg-liberation-green",
      definition: "Discrimination or prejudice against individuals with disabilities. It includes the belief that typical abilities are superior, leading to the marginalization of people with physical, mental, or developmental disabilities.",
      source: "Merriam-Webster Dictionary",
      image: civilRightsCrowd
    },
    { 
      label: "Racism", 
      color: "bg-liberation-gold",
      definition: "A belief that race is a fundamental determinant of human traits and capacities and that racial differences produce an inherent superiority of a particular race. Also includes systemic oppression of a racial group to the social, economic, and political advantage of another.",
      source: "Merriam-Webster Dictionary",
      image: civilRightsMarch
    },
    { 
      label: "Patriarchy", 
      color: "bg-liberation-red",
      definition: "A social system in which men hold primary power and predominate in roles of political leadership, moral authority, social privilege, and control of property. It encompasses institutional structures that perpetuate male dominance.",
      source: "Wikipedia",
      image: civilRightsProtesters
    },
    { 
      label: "Militarism", 
      color: "bg-liberation-green",
      definition: "The belief or the desire of a government or people that a state should maintain a strong military capability and be prepared to use it aggressively to defend or promote national interests. It often prioritizes military solutions over diplomatic ones.",
      source: "Merriam-Webster Dictionary",
      image: civilRightsSigns
    },
  ];

  const currentPillar = pillars.find(p => p.label === selectedPillar);

  return (
    <section id="about" className="py-24 bg-liberation-dark" ref={ref}>
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div className={`animate-on-scroll-left ${isVisible ? 'visible' : ''}`}>
            <span className="text-liberation-gold font-semibold text-sm tracking-widest uppercase">Our Mission</span>
            <h2 className="text-4xl md:text-5xl font-bold text-liberation-cream mt-4 mb-6">
              Non-Partisan. Non-Profit.{" "}
              <span className="text-liberation-gold">Uncompromising.</span>
            </h2>
            <p className="text-lg text-liberation-cream/70 leading-relaxed mb-6">
              Liberation Caucus exists to advance the political, community, and economic interests of Black people and people of the African diaspora in the United States.
            </p>
            <p className="text-lg text-liberation-cream/70 leading-relaxed mb-8">
              We work tirelessly to dismantle the oppressive systems and structures that perpetuate injustice—confronting economic inequality, challenging patriarchy, and fighting for a world where every person can live with dignity and freedom.
            </p>

            {/* Pillars */}
            <div className="flex flex-wrap gap-3">
              {pillars.map((pillar, index) => (
                <button
                  key={index}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-liberation-cream/10 border border-liberation-cream/20 animate-on-scroll-scale stagger-${index + 1} ${isVisible ? 'visible' : ''} transition-all duration-200 cursor-pointer hover:bg-liberation-cream/20 active:scale-95 active:shadow-[0_0_20px_rgba(212,175,55,0.5)] focus:outline-none focus:ring-2 focus:ring-liberation-gold/50`}
                  onClick={() => setSelectedPillar(pillar.label)}
                >
                  <span className={`w-2 h-2 rounded-full ${pillar.color} transition-transform duration-200`} />
                  <span className="text-liberation-cream text-sm font-medium">{pillar.label}</span>
                </button>
              ))}
            </div>

            <Dialog open={!!selectedPillar} onOpenChange={() => setSelectedPillar(null)}>
              <DialogContent className="bg-liberation-dark border-liberation-cream/20 text-liberation-cream max-w-lg">
                {currentPillar?.image && (
                  <div className="aspect-video rounded-lg overflow-hidden mb-4">
                    <img 
                      src={currentPillar.image} 
                      alt={`Historic civil rights imagery representing ${currentPillar.label}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <DialogHeader>
                  <DialogTitle className="text-2xl text-liberation-gold flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full ${currentPillar?.color}`} />
                    {currentPillar?.label}
                  </DialogTitle>
                  <DialogDescription className="text-liberation-cream/80 text-base leading-relaxed pt-4">
                    {currentPillar?.definition}
                  </DialogDescription>
                </DialogHeader>
                <p className="text-xs text-liberation-cream/50 mt-2">
                  Source: {currentPillar?.source}
                </p>
              </DialogContent>
            </Dialog>
          </div>

          {/* Image Grid */}
          <div className={`grid grid-cols-2 gap-4 animate-on-scroll-right ${isVisible ? 'visible' : ''}`}>
            <div className="space-y-4">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden">
                <img 
                  src={civilRightsMarch}
                  alt="1963 March on Washington civil rights demonstration"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="aspect-square rounded-2xl overflow-hidden">
                <img 
                  src={civilRightsSigns}
                  alt="Civil rights protesters with signs demanding equality"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="space-y-4 pt-8">
              <div className="aspect-square rounded-2xl overflow-hidden">
                <img 
                  src={civilRightsProtesters}
                  alt="Civil rights movement protesters marching for justice"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="aspect-[3/4] rounded-2xl overflow-hidden">
                <img 
                  src={civilRightsCrowd}
                  alt="Massive crowd at historic civil rights rally"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
