import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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

const pillars = [
  {
    label: "Economic Injustice",
    color: "bg-liberation-gold",
    definition:
      "The unfair distribution of economic resources, opportunities, and privileges within a society. It encompasses systemic disparities in wealth, income, employment, and access to essential services that disproportionately affect marginalized communities.",
    source: "Based on sociological definitions",
    image: civilRightsSigns,
  },
  {
    label: "Sexism",
    color: "bg-liberation-red",
    definition:
      "Prejudice, stereotyping, or discrimination, typically against women, on the basis of sex. It includes attitudes, conditions, or behaviors that promote stereotyping of social roles based on gender.",
    source: "Merriam-Webster Dictionary",
    image: civilRightsProtesters,
  },
  {
    label: "Ableism",
    color: "bg-liberation-green",
    definition:
      "Discrimination or prejudice against individuals with disabilities. It includes the belief that typical abilities are superior, leading to the marginalization of people with physical, mental, or developmental disabilities.",
    source: "Merriam-Webster Dictionary",
    image: civilRightsCrowd,
  },
  {
    label: "Racism",
    color: "bg-liberation-gold",
    definition:
      "A belief that race is a fundamental determinant of human traits and capacities and that racial differences produce an inherent superiority of a particular race. Also includes systemic oppression of a racial group to the social, economic, and political advantage of another.",
    source: "Merriam-Webster Dictionary",
    image: civilRightsMarch,
  },
  {
    label: "Patriarchy",
    color: "bg-liberation-red",
    definition:
      "A social system in which men hold primary power and predominate in roles of political leadership, moral authority, social privilege, and control of property. It encompasses institutional structures that perpetuate male dominance.",
    source: "Wikipedia",
    image: civilRightsProtesters,
  },
  {
    label: "Militarism",
    color: "bg-liberation-green",
    definition:
      "The belief or the desire of a government or people that a state should maintain a strong military capability and be prepared to use it aggressively to defend or promote national interests. It often prioritizes military solutions over diplomatic ones.",
    source: "Merriam-Webster Dictionary",
    image: civilRightsSigns,
  },
];

const bylawsSections = [
  {
    title: "I. Name and Membership",
    content: `This organization shall be known as the Liberation Caucus. Its membership shall consist of individuals from Black and African diaspora communities, or allies for the liberty of the Black and the African diaspora in the United States, its territories and allies, all of whom must also be at least 16 years of age or older or active, registered voters in their state, or paying annual membership fees to the Caucus.

The Liberation Caucus shall be a non-profit organization in the state of Michigan and upon its dissolution, all assets and real and personal property of the Liberation Caucus and its committees shall be divided to the benefit of its trustees.

The Liberation Caucus shall identify people who are Black or members of the African diaspora who are elected officials in the United States, its territories and allies, as prospective members-at-large; members-at-large may vote and are eligible for office in the Caucus.`,
  },
  {
    title: "II. Purpose",
    content: `The purpose of the Liberation Caucus is to advance the political, community and economic interests of Black people and people of the African diaspora in America through the dismantling of oppressive systems and structures that support economic injustice, sexism, ableism, racism, patriarchy and militarism; to recruit, engage and organize Black people and people of the African diaspora who live in America for civic engagement and public service; to recruit, train, endorse and elect Black people and people of the African diaspora as candidates for public office at all levels of government; to raise funds, create assets and build caucus membership to support our initiatives, candidates and goals.`,
  },
  {
    title: "III. Fundamental Principles",
    content: `All public meetings of the Liberation Caucus shall be open to attendance by all Black people and people of the African diaspora in America regardless of actual or perceived race, color, creed, sex, age, national origin, economic status, religion, ethnic identity, ancestry, marital status, sexual orientation, physical appearance or disability.

No tests for membership in, nor any oaths of loyalty to, the Liberation Caucus shall be required which has the effect of requiring members to acquiesce in, condone or support discrimination.

The time and place for all public meetings shall be publicized fully to assure timely notice to all interested people. Meetings must be held in accessible places large enough to accommodate all interested people.

All rules and bylaws shall be available on request. The most recent version shall be publicly available electronically.

The unit rule is prohibited. No rule shall require a person to cast a vote contrary to that person's judgment. On all questions of procedure not resolved by these Bylaws, Robert's Rules of Order shall be used. Votes shall not be taken by secret ballot.`,
  },
  {
    title: "IV. Officers and Executive Committee",
    content: `The Officers shall be a Chairperson, Vice-Chairperson of the opposite sex of the Chairperson, a Recording Secretary, Corresponding Secretary, and a Treasurer. They shall have a term of two (2) years and be elected at the Liberation Caucus State Convention held in odd years.

The Executive Committee shall consist of the Executive Board and no less than five (5) but no more than twenty-one (21) elected members serving two (2) year terms. All reasonable efforts shall be taken to ensure that no more than half of Executive Committee members shall be of the same gender.

The Chairperson shall preside at all meetings. The Vice-Chairperson shall assist and temporarily assume duties in the Chairperson's absence. The Recording Secretary shall keep accurate records. The Corresponding Secretary shall maintain correspondence. The Treasurer shall be responsible for financial receipts and disbursements.`,
  },
  {
    title: "V. Meetings",
    content: `Regular meetings of the Executive Committee shall have at least five (5) days notice. A quorum shall consist of a simple majority.

At least four times per calendar year there shall be a full membership meeting where Officers and Executive Committee shall report on activities, finances and membership, with at least fourteen (14) days' notice.

Special meetings may be called by a majority of the Executive Committee or full membership with at least five (5) days' notice. All meetings shall be conducted according to Robert's Rules of Order.`,
  },
  {
    title: "VI. Committees and Councils",
    content: `Standing Committees include: Rules, Bylaws and Policy; Membership; Finance; Operations; Programs and Education; and Political Action.

Standing Councils include: Young Adults, Democracy, Technology, Women's, Armed Services, Small Business, Faith, Men's, and LGBTQ.

The Political Action Committee shall coordinate candidate and campaign education and have two standing subcommittees: Voter Mobilization and Endorsements.`,
  },
  {
    title: "VII. Endorsements",
    content: `The Liberation Caucus shall not endorse candidates not aligned with the purpose of the organization and who are not members. The organization will not endorse issues or candidates for partisan office without alignment amongst a simple majority of members in good standing.`,
  },
  {
    title: "VIII. Fiscal Management",
    content: `The fiscal year shall end in June. The Liberation Caucus shall keep correct and complete books and records. An annual report shall be submitted to the Executive Committee. Books and records shall be reviewed by an independent certified public accountant. The Liberation Caucus shall not make loans to any officer or director.`,
  },
  {
    title: "IX. Compensation",
    content: `No officer in performance of their elected duties shall accept any compensation other than for actual expenses. No part of the income or assets shall inure to any member except for reimbursement of actual expenses and reasonable compensation for services if the membership approves.`,
  },
  {
    title: "X. Conflict of Interest",
    content: `Any member of the board who has a financial, personal or official interest in, or conflict with any matter before the board shall voluntarily excuse themselves, vacate their seat and refrain from discussion and voting on said item.`,
  },
  {
    title: "XI. Amendments",
    content: `Proposals for changes shall first be referred to the Rules, Bylaws and Policy Committee. Bylaws may be amended by a two-thirds (2/3) majority vote, provided written notice has been given at least two (2) weeks prior to the meeting. These bylaws supersede all bylaws, rules, motions and policies of a contrary nature.`,
  },
  {
    title: "XII. Certification",
    content: `These bylaws were approved at a meeting of its members by a simple majority vote on September 25, 2025.`,
  },
];

const AboutUs = () => {
  const { ref: missionRef, isVisible: missionVisible } = useScrollAnimation();
  const { ref: whatWeDoRef, isVisible: whatWeDoVisible } = useScrollAnimation();
  const { ref: bylawsRef, isVisible: bylawsVisible } = useScrollAnimation();
  const [selectedPillar, setSelectedPillar] = useState<string | null>(null);
  const currentPillar = pillars.find((p) => p.label === selectedPillar);

  return (
    <>
      <Helmet>
        <title>About Us | Liberation Caucus</title>
        <meta
          name="description"
          content="Learn about Liberation Caucus — a non-profit, non-partisan organization advancing the political, community and economic interests of Black people and people of the African diaspora."
        />
      </Helmet>

      <Header />

      <main className="pt-20">
        {/* Hero */}
        <section className="relative py-24 md:py-32 bg-liberation-dark overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <img
              src={civilRightsMarch}
              alt="Historic civil rights march"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-liberation-dark/80 to-liberation-dark" />
          <div className="container mx-auto px-4 relative z-10 text-center">
            <span className="text-liberation-gold font-semibold text-sm tracking-widest uppercase">
              About Us
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-liberation-cream mt-4 mb-6">
              Non-Partisan. Non-Profit.{" "}
              <span className="text-liberation-gold">Uncompromising.</span>
            </h1>
            <p className="text-xl text-liberation-cream/70 max-w-3xl mx-auto">
              A dedicated home for Black people and the African diaspora — training grassroots leaders for sustainable power.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-24 bg-liberation-dark" ref={missionRef}>
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className={`animate-on-scroll-left ${missionVisible ? "visible" : ""}`}>
                <span className="text-liberation-gold font-semibold text-sm tracking-widest uppercase">
                  Our Mission
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-liberation-cream mt-4 mb-6">
                  Advancing Justice for Black Communities
                </h2>
                <p className="text-lg text-liberation-cream/70 leading-relaxed mb-6">
                  The purpose of the Liberation Caucus is to advance the political, community and economic interests of Black people and people of the African diaspora in the United States through the dismantling of oppressive systems and structures that support economic injustice, sexism, ableism, racism, patriarchy and militarism.
                </p>
                <p className="text-lg text-liberation-cream/70 leading-relaxed mb-8">
                  We recruit, engage and organize Black people and people of the African diaspora for civic engagement and public service. We recruit, train, endorse and elect Black people and people of the African diaspora as candidates for public office at all levels of government.
                </p>

                {/* Pillars */}
                <div className="flex flex-wrap gap-3">
                  {pillars.map((pillar, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-liberation-cream/10 border border-liberation-cream/20 animate-on-scroll-scale stagger-${index + 1} ${missionVisible ? "visible" : ""} transition-all duration-200 cursor-pointer hover:bg-liberation-cream/20 active:scale-95 focus:outline-none focus:ring-2 focus:ring-liberation-gold/50`}
                      onClick={() => setSelectedPillar(pillar.label)}
                    >
                      <span className={`w-2 h-2 rounded-full ${pillar.color}`} />
                      <span className="text-liberation-cream text-sm font-medium">
                        {pillar.label}
                      </span>
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
              <div className={`grid grid-cols-2 gap-4 animate-on-scroll-right ${missionVisible ? "visible" : ""}`}>
                <div className="space-y-4">
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden">
                    <img src={civilRightsMarch} alt="1963 March on Washington" className="w-full h-full object-cover" />
                  </div>
                  <div className="aspect-square rounded-2xl overflow-hidden">
                    <img src={civilRightsSigns} alt="Civil rights protesters with signs" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="aspect-square rounded-2xl overflow-hidden">
                    <img src={civilRightsProtesters} alt="Civil rights movement marchers" className="w-full h-full object-cover" />
                  </div>
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden">
                    <img src={civilRightsCrowd} alt="Crowd at historic civil rights rally" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What We Do */}
        <section className="py-24 bg-liberation-cream" ref={whatWeDoRef}>
          <div className="container mx-auto px-4">
            <div className={`text-center mb-16 animate-on-scroll ${whatWeDoVisible ? "visible" : ""}`}>
              <span className="text-liberation-red font-semibold text-sm tracking-widest uppercase">
                What We Do
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-liberation-dark mt-4 mb-6">
                Building Sustainable Power
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  title: "Train Grassroots Leaders",
                  description:
                    "The Liberation Caucus is a dedicated home for Black people and the African diaspora for training grassroots leaders for sustainable power.",
                },
                {
                  title: "Elect Black Diaspora",
                  description:
                    "We recruit, train, endorse and elect Black people and people of the African diaspora as candidates for public office at all levels of government.",
                },
                {
                  title: "Civic Engagement",
                  description:
                    "We recruit, engage and organize Black people and people of the African diaspora for civic engagement and public service.",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className={`bg-liberation-dark rounded-2xl p-8 animate-on-scroll-scale stagger-${index + 1} ${whatWeDoVisible ? "visible" : ""}`}
                >
                  <div className="w-12 h-12 bg-liberation-gold/20 rounded-full flex items-center justify-center mb-6">
                    <span className="text-liberation-gold font-bold text-lg">{index + 1}</span>
                  </div>
                  <h3 className="text-xl font-bold text-liberation-cream mb-3">{item.title}</h3>
                  <p className="text-liberation-cream/70 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bylaws */}
        <section className="py-24 bg-liberation-dark" ref={bylawsRef}>
          <div className="container mx-auto px-4 max-w-4xl">
            <div className={`text-center mb-16 animate-on-scroll ${bylawsVisible ? "visible" : ""}`}>
              <span className="text-liberation-gold font-semibold text-sm tracking-widest uppercase">
                Governance
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-liberation-cream mt-4 mb-6">
                Bylaws of the Liberation Caucus
              </h2>
              <p className="text-lg text-liberation-cream/70 max-w-2xl mx-auto">
                Approved by membership vote on September 25, 2025. Our bylaws ensure transparency, accountability, and democratic governance.
              </p>
            </div>

            <div className={`animate-on-scroll ${bylawsVisible ? "visible" : ""}`}>
              <Accordion type="single" collapsible className="space-y-3">
                {bylawsSections.map((section, index) => (
                  <AccordionItem
                    key={index}
                    value={`bylaws-${index}`}
                    className="bg-liberation-cream/5 border border-liberation-cream/10 rounded-xl px-6 data-[state=open]:bg-liberation-cream/10"
                  >
                    <AccordionTrigger className="text-liberation-cream hover:text-liberation-gold text-left font-semibold py-5">
                      {section.title}
                    </AccordionTrigger>
                    <AccordionContent className="text-liberation-cream/70 leading-relaxed whitespace-pre-line pb-6">
                      {section.content}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default AboutUs;
