import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Shield } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const LAST_UPDATED = "June 2026";

const policySections = [
  {
    title: "1. What Information We Collect",
    content: `We collect information you choose to give us when you interact with this website:

Contact form: your name, email address, and message.

Membership form: your first and last name, email address, mobile phone number, zip code, precinct leader status, and any committees or councils you select.

Email updates signup: your name and email address.

We do not collect payment information directly. Donations to the Liberation Caucus or our Political Action Committee are processed entirely by Action Network, a separate platform with its own privacy policy.`,
  },
  {
    title: "2. How We Use Your Information",
    content: `We use the information you provide to:

Respond to your questions or messages submitted through our contact form.

Process and follow up on membership applications, including connecting you with the committees and councils you've expressed interest in.

Send you email updates about Liberation Caucus events, programs, and opportunities, if you've signed up to receive them.

We do not sell your personal information. We do not use your information for purposes beyond those described here without asking you first.`,
  },
  {
    title: "3. Third-Party Services We Use",
    content: `Because this website is built using common nonprofit and small-organization tools, a few trusted third parties process data on our behalf:

Supabase hosts our website's backend and database, including contact form submissions.

Airtable stores membership form submissions so our team can follow up with new and prospective members.

Mailchimp manages our email update list.

Resend delivers email notifications to our team when someone submits the contact form.

Google reCAPTCHA helps us prevent spam and automated abuse on our contact form. Use of reCAPTCHA is subject to Google's Privacy Policy and Terms of Service.

Each of these services has its own privacy practices governing the data they process. We choose vendors that we believe handle data responsibly, and we only share the minimum information necessary for them to perform their function for us.`,
  },
  {
    title: "4. Data Retention",
    content: `We retain contact form submissions and membership records for as long as reasonably necessary to respond to your inquiry, maintain our membership rolls, and meet our recordkeeping obligations as a nonprofit organization. You may request that we delete your information at any time by contacting us using the information in Section 7.`,
  },
  {
    title: "5. Your Choices",
    content: `You can unsubscribe from our email updates at any time using the unsubscribe link in any email we send, or by contacting us directly.

You can ask us what information we have on file for you, ask us to correct it, or ask us to delete it, by reaching out using the contact information in Section 7. We will respond to reasonable requests within a reasonable time.

Because committee, council, and program data may be used internally to organize our work, deleting your information may affect our ability to keep you informed about activities you've expressed interest in.`,
  },
  {
    title: "6. Children's Privacy",
    content: `Our membership is open to individuals consistent with our bylaws. This website is not directed at, and we do not knowingly collect personal information from, children under 13. If you believe a child under 13 has provided us with personal information, please contact us so we can remove it.`,
  },
  {
    title: "7. Contact Us",
    content: `If you have questions about this Privacy Policy or how we handle your information, please reach out to us at info@liberationcaucus.org.`,
  },
  {
    title: "8. Changes to This Policy",
    content: `We may update this Privacy Policy from time to time as our work, tools, or legal obligations change. The version posted on this page is always the most current. We encourage you to review it periodically.`,
  },
];

const PrivacyPolicy = () => {
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation();
  const { ref: bodyRef, isVisible: bodyVisible } = useScrollAnimation();

  return (
    <>
      <Helmet>
        <title>Privacy Policy | Liberation Caucus</title>
        <meta
          name="description"
          content="Learn how the Liberation Caucus collects, uses, and protects information you share with us through our website."
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
              <Shield className="w-8 h-8 text-liberation-gold" />
            </div>
            <span className="text-liberation-gold font-semibold text-sm tracking-widest uppercase">
              Your Privacy
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-liberation-cream mt-4 mb-6">
              Privacy Policy
            </h1>
            <p className="text-lg text-liberation-cream/70 max-w-2xl mx-auto">
              Last updated: {LAST_UPDATED}. This page explains what information we collect on this
              website, why we collect it, and how you can reach us with questions.
            </p>
          </div>
        </section>

        {/* Body */}
        <section className="py-20 bg-liberation-dark" ref={bodyRef}>
          <div className="container mx-auto px-4 max-w-4xl">
            <div className={`animate-on-scroll ${bodyVisible ? "visible" : ""}`}>
              <Accordion type="single" collapsible className="space-y-3">
                {policySections.map((section, index) => (
                  <AccordionItem
                    key={index}
                    value={`policy-${index}`}
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

export default PrivacyPolicy;
