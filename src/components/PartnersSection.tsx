import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { ExternalLink } from "lucide-react";

const PartnersSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  const partners = [
    {
      name: "Official Democratic Black Caucus of Macomb County",
      initials: "ODBCMC",
      description: "Black caucus of the Macomb County Democratic Committee, Michigan.",
      url: "https://officialdemblackcaucusmacomb.weebly.com/",
    },
    {
      name: "WCDP Black Caucus",
      initials: "WCDP",
      description: "Washtenaw County Democratic Party's Black Caucus, Michigan.",
      url: "https://www.wcdpblackcaucus.org/",
    },
    {
      name: "Working Families Party — Michigan",
      initials: "WFP",
      description: "Michigan chapter of the national Working Families Party.",
      url: "https://workingfamilies.org/state/michigan/",
    },
  ];

  return (
    <section id="network" className="py-24 bg-liberation-cream" ref={ref}>
      <div className="container mx-auto px-4">
        <div className={`text-center mb-16 animate-on-scroll ${isVisible ? 'visible' : ''}`}>
          <span className="text-liberation-red font-semibold text-sm tracking-widest uppercase">Our Network</span>
          <h2 className="text-4xl md:text-5xl font-bold text-liberation-dark mt-4 mb-6">
            Building Power Together
          </h2>
          <p className="text-lg text-liberation-dark/70 max-w-2xl mx-auto">
            We partner with organizations across the country committed to civic engagement, voter empowerment, and transformative justice.
          </p>
        </div>

        {/* Partners Grid */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {partners.map((partner, index) => (
            <a
              key={index}
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group bg-liberation-dark/5 hover:bg-liberation-dark rounded-2xl p-8 flex flex-col items-center text-center transition-all duration-300 animate-on-scroll-scale stagger-${index + 1} ${isVisible ? 'visible' : ''}`}
            >
              <div className="w-16 h-16 bg-liberation-gold/20 group-hover:bg-liberation-gold rounded-full flex items-center justify-center mb-4 transition-colors">
                <span className="text-liberation-dark group-hover:text-liberation-dark font-bold text-xs">
                  {partner.initials}
                </span>
              </div>
              <span className="text-liberation-dark group-hover:text-liberation-cream font-semibold transition-colors">
                {partner.name}
              </span>
              <span className="text-liberation-dark/60 group-hover:text-liberation-cream/70 text-sm mt-2 transition-colors">
                {partner.description}
              </span>
              <span className="text-liberation-red group-hover:text-liberation-gold text-xs font-semibold mt-4 inline-flex items-center gap-1 transition-colors">
                Visit website <ExternalLink className="w-3 h-3" />
              </span>
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className={`text-center mt-16 animate-on-scroll stagger-8 ${isVisible ? 'visible' : ''}`}>
          <p className="text-liberation-dark/70 mb-4">Interested in partnering with Liberation Caucus?</p>
          <a 
            href="mailto:partnerships@liberationcaucus.org"
            className="text-liberation-red hover:text-liberation-red/80 font-semibold underline underline-offset-4"
          >
            Get in touch →
          </a>
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
