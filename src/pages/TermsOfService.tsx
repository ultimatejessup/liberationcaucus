import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Scale } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const LAST_UPDATED = "June 2026";

const termsSections = [
  {
    title: "1. Acceptance of Terms",
    content: `By accessing or using this website, you agree to these Terms of Service. If you do not agree, please do not use this website. We may update these terms from time to time, and continued use of the site after changes means you accept the updated terms.`,
  },
  {
    title: "2. Who We Are",
    content: `The Liberation Caucus is a non-profit, non-partisan organization advancing the political, community, and economic interests of Black people and people of the African diaspora. Our full mission, purpose, and governance structure are described on our About Us page and in our bylaws.`,
  },
  {
    title: "3. Using This Website",
    content: `You may browse this website and use its forms for their intended purposes: learning about our work, reaching out to us, applying for membership, signing up for updates, and accessing links to our events, news, and donation pages.

You agree not to use this website to submit false, misleading, or fraudulent information, to attempt to gain unauthorized access to any part of our systems, or to interfere with the website's normal operation.`,
  },
  {
    title: "4. Membership",
    content: `Submitting a membership form through this website is a request to join the Liberation Caucus. Membership itself, including eligibility, rights, and responsibilities, is governed by our bylaws, not by these Terms of Service. Submitting the form does not guarantee membership is automatically granted; our team reviews and follows up on membership requests.`,
  },
  {
    title: "5. Donations",
    content: `Donations to the Liberation Caucus and to our Political Action Committee are processed through Action Network, a third-party platform. Donations are subject to Action Network's terms and any applicable laws governing nonprofit and political contributions. We do not process or store payment information on this website.`,
  },
  {
    title: "6. Third-Party Links and Services",
    content: `This website links to and relies on third-party services, including Action Network, Mailchimp, and social media platforms. We are not responsible for the content, privacy practices, or terms of those third-party services. Your use of them is governed by their own terms.`,
  },
  {
    title: "7. Intellectual Property",
    content: `The content on this website, including our name, logo, and original written material, belongs to the Liberation Caucus unless otherwise noted. Historical images used on this site are used for educational and inspirational purposes related to our mission. You may share links to our content, but you may not reproduce it for commercial purposes without our permission.`,
  },
  {
    title: "8. No Warranty",
    content: `This website is provided "as is." We do our best to keep information accurate and current, but we make no guarantees that the website will be error-free, uninterrupted, or perfectly up to date at all times.`,
  },
  {
    title: "9. Limitation of Liability",
    content: `To the fullest extent permitted by law, the Liberation Caucus is not liable for any indirect, incidental, or consequential damages arising from your use of this website.`,
  },
  {
    title: "10. Contact Us",
    content: `Questions about these Terms of Service can be sent to info@liberationcaucus.org.`,
  },
];

const TermsOfService = () => {
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation();
  const { ref: bodyRef, isVisible: bodyVisible } = useScrollAnimation();

  return (
    <>
      <Helmet>
        <title>Terms of Service | Liberation Caucus</title>
        <meta
          name="description"
          content="The terms that govern your use of the Liberation Caucus website."
        />
      </Helmet>

      <Header />

      <main className="pt-20">
        {/* Hero */}
        <section className="relative py-24 md:py-28 bg-liberation-dark overflow-hidden" ref={heroRef}>
          <div className="absolute inset-0 bg-gradient-to-b from-liberation-dark to-liberation-dark/95" />
          <div
            className={`container mx-auto px-4 relative z-10 text-center animate-on-scroll ${
              heroVisible ? "visible" : ""
            }`}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-liberation-gold/10 mb-6">
              <Scale className="w-8 h-8 text-liberation-gold" />
            </div>
            <span className="text-liberation-gold font-semibold text-sm tracking-widest uppercase">
              Terms of Service
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-liberation-cream mt-4 mb-6">
              Terms of Service
            </h1>
            <p className="text-lg text-liberation-cream/70 max-w-2xl mx-auto">
              Last updated: {LAST_UPDATED}. These terms govern your use of the Liberation Caucus
              website.
            </p>
          </div>
        </section>

        {/* Body */}
        <section className="py-20 bg-liberation-dark" ref={bodyRef}>
          <div className="container mx-auto px-4 max-w-4xl">
            <div className={`animate-on-scroll ${bodyVisible ? "visible" : ""}`}>
              <Accordion type="single" collapsible className="space-y-3">
                {termsSections.map((section, index) => (
                  <AccordionItem
                    key={index}
                    value={`terms-${index}`}
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

export default TermsOfService;
