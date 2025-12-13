const PartnersSection = () => {
  // Placeholder partner organizations - these would be replaced with actual logos
  const partners = [
    { name: "Black Voters Matter", initials: "BVM" },
    { name: "Color of Change", initials: "COC" },
    { name: "Movement for Black Lives", initials: "M4BL" },
    { name: "NAACP", initials: "NAACP" },
    { name: "National Urban League", initials: "NUL" },
    { name: "Black Alliance for Just Immigration", initials: "BAJI" },
    { name: "Dream Defenders", initials: "DD" },
    { name: "Until Freedom", initials: "UF" },
  ];

  return (
    <section id="network" className="py-24 bg-liberation-cream">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-liberation-red font-semibold text-sm tracking-widest uppercase">Our Network</span>
          <h2 className="text-4xl md:text-5xl font-bold text-liberation-dark mt-4 mb-6">
            Building Power Together
          </h2>
          <p className="text-lg text-liberation-dark/70 max-w-2xl mx-auto">
            We partner with organizations across the country committed to civic engagement, voter empowerment, and transformative justice.
          </p>
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {partners.map((partner, index) => (
            <div
              key={index}
              className="group bg-liberation-dark/5 hover:bg-liberation-dark rounded-2xl p-8 flex flex-col items-center justify-center aspect-square transition-all duration-300 cursor-pointer"
            >
              <div className="w-16 h-16 bg-liberation-gold/20 group-hover:bg-liberation-gold rounded-full flex items-center justify-center mb-4 transition-colors">
                <span className="text-liberation-dark group-hover:text-liberation-dark font-bold text-sm">
                  {partner.initials}
                </span>
              </div>
              <span className="text-liberation-dark/70 group-hover:text-liberation-cream text-sm text-center font-medium transition-colors">
                {partner.name}
              </span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
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
