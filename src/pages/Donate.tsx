import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Heart, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const Donate = () => {
  return (
    <>
      <Helmet>
        <title>Donate | Liberation Caucus</title>
        <meta name="description" content="Support the Liberation Caucus and its Political Action Committee. Your donation advances justice for Black communities." />
      </Helmet>

      <Header />

      <main className="bg-liberation-dark min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-liberation-red/10 mb-6">
              <Heart className="w-8 h-8 text-liberation-red" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-liberation-cream mb-4">
              Support the <span className="text-liberation-gold">Movement</span>
            </h1>
            <p className="text-liberation-cream/70 text-lg">
              Your generous contribution helps us advance the political, community, and economic interests of Black people and people of the African diaspora.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Caucus Donation */}
            <div className="bg-liberation-dark/50 border border-liberation-gold/20 rounded-2xl p-8 flex flex-col items-center text-center hover:border-liberation-gold/40 transition-all">
              <div className="w-14 h-14 rounded-full bg-liberation-gold/10 flex items-center justify-center mb-6">
                <Heart className="w-7 h-7 text-liberation-gold" />
              </div>
              <h2 className="text-2xl font-bold text-liberation-cream mb-3">Donate to the Caucus</h2>
              <p className="text-liberation-cream/60 mb-8 flex-grow">
                Support our community programs, educational initiatives, and organizing efforts that uplift Black communities across the nation.
              </p>
              <Button
                size="lg"
                className="bg-liberation-gold hover:bg-liberation-gold/90 text-liberation-dark font-semibold w-full"
                asChild
              >
                <a href="https://actionnetwork.org/fundraising/lc-donate" target="_blank" rel="noopener noreferrer">
                  Donate Now
                </a>
              </Button>
            </div>

            {/* PAC Donation */}
            <div className="bg-liberation-dark/50 border border-liberation-gold/20 rounded-2xl p-8 flex flex-col items-center text-center hover:border-liberation-gold/40 transition-all">
              <div className="w-14 h-14 rounded-full bg-liberation-red/10 flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-liberation-red" />
              </div>
              <h2 className="text-2xl font-bold text-liberation-cream mb-3">Donate to the PAC</h2>
              <p className="text-liberation-cream/60 mb-8 flex-grow">
                Support our Political Action Committee to elect leaders who champion justice, equity, and opportunity for Black communities.
              </p>
              <Button
                size="lg"
                className="bg-liberation-red hover:bg-liberation-red/90 text-liberation-cream font-semibold w-full"
                asChild
              >
                <a href="https://actionnetwork.org/fundraising/donate-lc-pac?source=direct_link&" target="_blank" rel="noopener noreferrer">
                  Donate to PAC
                </a>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Donate;
