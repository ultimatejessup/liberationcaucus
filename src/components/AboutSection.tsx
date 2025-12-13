import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const AboutSection = () => {
  const { ref, isVisible } = useScrollAnimation();
  
  const pillars = [
    { label: "Economic Injustice", color: "bg-liberation-gold" },
    { label: "Sexism", color: "bg-liberation-red" },
    { label: "Ableism", color: "bg-liberation-green" },
    { label: "Racism", color: "bg-liberation-gold" },
    { label: "Patriarchy", color: "bg-liberation-red" },
    { label: "Militarism", color: "bg-liberation-green" },
  ];

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
                  onClick={() => {}}
                >
                  <span className={`w-2 h-2 rounded-full ${pillar.color} transition-transform duration-200`} />
                  <span className="text-liberation-cream text-sm font-medium">{pillar.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Image Grid */}
          <div className={`grid grid-cols-2 gap-4 animate-on-scroll-right ${isVisible ? 'visible' : ''}`}>
            <div className="space-y-4">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1591848478625-de43268e6fb8?w=600&q=80"
                  alt="Black Lives Matter protest march"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="aspect-square rounded-2xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&q=80"
                  alt="Community organizer speaking at event"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="space-y-4 pt-8">
              <div className="aspect-square rounded-2xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=400&q=80"
                  alt="Diverse group of activists with raised fists"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="aspect-[3/4] rounded-2xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1594608661623-aa0bd3a69d98?w=600&q=80"
                  alt="Young Black woman at protest with sign"
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
