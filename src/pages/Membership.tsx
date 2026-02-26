import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Users } from "lucide-react";

const Membership = () => {
  return (
    <>
      <Helmet>
        <title>Join Us | Liberation Caucus</title>
        <meta name="description" content="Become a member of the Liberation Caucus. Membership is vital to staying informed with caucus events and opportunities." />
      </Helmet>

      <Header />

      <main className="bg-liberation-dark min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-liberation-gold/10 mb-6">
              <Users className="w-8 h-8 text-liberation-gold" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-liberation-cream mb-4">
              Become a <span className="text-liberation-gold">Member</span>
            </h1>
            <p className="text-liberation-cream/70 text-lg">
              Membership is vital to staying informed with caucus events and opportunities. Join us today and be part of the movement.
            </p>
          </div>

          <div className="max-w-2xl mx-auto bg-liberation-dark/50 border border-liberation-gold/20 rounded-2xl p-2 min-h-[600px]">
            <iframe
              src="https://actionnetwork.org/forms/liberation-caucus-membership-form?source=website"
              title="Liberation Caucus Membership Form"
              className="w-full min-h-[600px] rounded-xl"
              style={{ border: "none" }}
              loading="lazy"
            />
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Membership;
