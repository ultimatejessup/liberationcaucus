import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import {
  Sparkles,
  Vote,
  Cpu,
  HeartHandshake,
  Shield,
  Briefcase,
  Church,
  Users,
  Flag,
} from "lucide-react";

const councils = [
  {
    name: "Young Adults",
    icon: Sparkles,
    description:
      "Organizing and leadership development for the Liberation Caucus's younger membership.",
  },
  {
    name: "Democracy",
    icon: Vote,
    description: "Focused on voting rights, civic participation, and democratic process.",
  },
  {
    name: "Technology",
    icon: Cpu,
    description: "Digital infrastructure, access, and technology policy affecting Black communities.",
  },
  {
    name: "Women's",
    icon: HeartHandshake,
    description: "Issues and leadership development centered on Black women in the Caucus.",
  },
  {
    name: "Armed Services",
    icon: Shield,
    description: "Supporting Black veterans, service members, and military-connected families.",
  },
  {
    name: "Small Business",
    icon: Briefcase,
    description: "Economic development and advocacy for Black-owned small businesses.",
  },
  {
    name: "Faith",
    icon: Church,
    description: "Engagement with Black faith communities and faith-based organizing.",
  },
  {
    name: "Men's",
    icon: Users,
    description: "Issues and leadership development centered on Black men in the Caucus.",
  },
  {
    name: "LGBTQ",
    icon: Flag,
    description: "Advocacy and community for LGBTQ members and allies within the Caucus.",
  },
];

const Councils = () => {
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation();
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation();

  return (
    <>
      <Helmet>
        <title>Councils | Liberation Caucus</title>
        <meta
          name="description"
          content="The Liberation Caucus's nine standing councils, where members organize around shared identity and interest areas."
        />
      </Helmet>

      <Header />

      <main className="pt-20 bg-liberation-dark min-h-screen">
        <section className="py-16 md:py-20" ref={heroRef}>
          <div className={`container mx-auto px-4 text-center animate-on-scroll ${heroVisible ? "visible" : ""}`}>
            <span className="text-liberation-gold font-semibold text-sm tracking-widest uppercase">
              Liberation Caucus Structure
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-liberation-cream mt-4 mb-6">
              Our <span className="text-liberation-gold">Councils</span>
            </h1>
            <p className="text-lg text-liberation-cream/70 max-w-2xl mx-auto">
              Alongside our standing committees, the Liberation Caucus organizes nine standing
              councils where members build community and lead work around shared identity and
              interest areas, as set out in our bylaws.
            </p>
          </div>
        </section>

        <section className="pb-16" ref={gridRef}>
          <div className="container mx-auto px-4">
            <div className={`grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto animate-on-scroll ${gridVisible ? "visible" : ""}`}>
              {councils.map((council) => (
                <div
                  key={council.name}
                  className="rounded-xl border border-liberation-gold/20 bg-liberation-cream/5 p-6"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-liberation-gold/10 mb-4">
                    <council.icon className="h-5 w-5 text-liberation-gold" />
                  </div>
                  <h3 className="text-lg font-semibold text-liberation-cream mb-1.5">
                    {council.name} Council
                  </h3>
                  <p className="text-sm text-liberation-cream/60">{council.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 max-w-5xl mx-auto rounded-lg border border-liberation-cream/10 bg-liberation-cream/5 p-4 text-xs text-liberation-cream/40">
              Council descriptions above are general summaries. Reach out to the Liberation
              Caucus directly for current council leadership and ongoing initiatives.
            </div>
          </div>
        </section>

        <section className="pb-20">
          <div className="container mx-auto px-4 text-center">
            <p className="text-liberation-cream/70 mb-6">
              Councils are open to current Liberation Caucus members. When you join, you can
              select which councils you'd like to be involved with.
            </p>
            <Button
              size="lg"
              className="bg-liberation-gold hover:bg-liberation-gold/90 text-liberation-dark font-semibold"
              asChild
            >
              <Link to="/membership">Join a Council</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Councils;
