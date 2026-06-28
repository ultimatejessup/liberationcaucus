import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const FAQ = () => {
  const header = useScrollAnimation();
  const general = useScrollAnimation();
  const membership = useScrollAnimation();
  const program = useScrollAnimation();

  const generalFAQs = [
    {
      question: "What is the Liberation Caucus?",
      answer: "The Liberation Caucus is a non-profit, non-partisan organization dedicated to advancing the political, community, and economic interests of Black people and people of the African diaspora in the United States. We work to dismantle oppressive systems and structures that support economic injustice, sexism, ableism, racism, patriarchy, and militarism."
    },
    {
      question: "Is the Liberation Caucus affiliated with any political party?",
      answer: "No, we are a non-partisan organization. We work across party lines to advance policies and candidates that align with our mission of justice and equity for Black communities. Our focus is on issues, not party affiliation."
    },
    {
      question: "How can I get involved with the Liberation Caucus?",
      answer: "There are many ways to get involved! You can become a member, volunteer for our programs, attend our events, or donate to support our work. Visit our membership page to join, or reach out to us directly to learn about volunteer opportunities in your area."
    },
    {
      question: "Where does the Liberation Caucus operate?",
      answer: "While we are headquartered in the United States, our work impacts Black communities nationwide. We have chapters and partner organizations in multiple states and are continually expanding our reach."
    },
    {
      question: "How is the Liberation Caucus funded?",
      answer: "We are funded through individual donations, membership dues, foundation grants, and fundraising events. We also have a Political Action Committee (PAC) that supports candidates aligned with our values. All contributions help us continue our advocacy and programming work."
    }
  ];

  const membershipFAQs = [
    {
      question: "How do I become a member?",
      answer: "You can become a member by completing our membership form on this website. Membership is open to anyone who supports our mission and wants to be part of the movement for justice and equity."
    },
    {
      question: "Is there a membership fee?",
      answer: "We offer both free and sustaining membership options. Sustaining members who contribute monthly help fund our ongoing programs and advocacy work. However, we believe in accessibility, so no one is turned away for inability to pay."
    },
    {
      question: "What benefits do members receive?",
      answer: "Members receive regular updates on our work, invitations to exclusive events and trainings, voting rights in organizational decisions, opportunities to participate in leadership development programs, and the ability to connect with a network of like-minded advocates."
    },
    {
      question: "How do I update my membership information?",
      answer: "You can update your membership information by logging into your Action Network account or by contacting us directly. We want to ensure we can stay connected with you."
    },
    {
      question: "Can organizations become members?",
      answer: "Yes! We welcome organizational partnerships and memberships. Community organizations, civic groups, and other entities aligned with our mission can join as organizational members. Contact us to discuss partnership opportunities."
    }
  ];

  const programFAQs = [
    {
      question: "What is the Freedom Summer Leadership Program?",
      answer: "The Freedom Summer Leadership Program is an intensive leadership development initiative inspired by the historic Freedom Summer. The program trains Liberation Caucus members as the next generation of civic leaders, organizers, and advocates through workshops, mentorship, and hands-on community organizing experience. Program details are being finalized and reviewed."
    },
    {
      question: "Who is eligible to enroll in Freedom Summer?",
      answer: "Freedom Summer enrollment is open to current Liberation Caucus members who are 18 or older and demonstrate commitment to our mission and community organizing. You must be a Liberation Caucus member to enroll — if you haven't joined yet, visit our membership page first."
    },
    {
      question: "How do I enroll in Freedom Summer?",
      answer: "Freedom Summer uses an enrollment process rather than a competitive application. Once you're a Liberation Caucus member, you'll be able to submit your enrollment through the Freedom Summer page. Sign up for our email list to be notified when enrollment opens."
    },
    {
      question: "Is the Freedom Summer program paid?",
      answer: "We aim to make the program accessible regardless of economic background, which may include stipends and covered program-related expenses. Final program details, including any stipend or expense coverage, are being reviewed and will be confirmed before enrollment opens."
    },
    {
      question: "What is the time commitment for Freedom Summer?",
      answer: "Freedom Summer is an intensive program requiring a significant time commitment, including training sessions, community organizing work, and reflection activities. Specific duration and scheduling details are being finalized and will be shared with members ahead of enrollment."
    },
    {
      question: "What happens after completing the Freedom Summer program?",
      answer: "Alumni become part of our leadership network and have access to ongoing mentorship, advanced training opportunities, and career support. Many alumni go on to leadership roles in community organizations, political campaigns, and advocacy work."
    },
    {
      question: "Are there other programs besides Freedom Summer?",
      answer: "Yes! We offer various programs throughout the year including voter education initiatives, policy advocacy training, community organizing workshops, and special events. Check our events page and email updates for the latest program offerings."
    }
  ];

  return (
    <>
      <Helmet>
        <title>FAQ | Liberation Caucus - Frequently Asked Questions</title>
        <meta name="description" content="Find answers to frequently asked questions about Liberation Caucus membership, programs like Freedom Summer, and our mission for justice and equity." />
      </Helmet>
      
      <div className="min-h-screen bg-liberation-dark">
        <Header />
        
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-liberation-gold/10 to-transparent" />
          <div 
            ref={header.ref}
            className={`max-w-4xl mx-auto text-center relative z-10 transition-all duration-1000 ${
              header.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <div className="w-20 h-1 bg-liberation-gold mx-auto mb-6" />
            <h1 className="text-4xl md:text-6xl font-bold text-liberation-cream mb-6">
              Frequently Asked <span className="text-liberation-gold">Questions</span>
            </h1>
            <p className="text-xl text-liberation-cream/80 max-w-2xl mx-auto">
              Find answers to common questions about the Liberation Caucus, our programs, and how you can get involved in the movement.
            </p>
          </div>
        </section>

        {/* General Questions */}
        <section className="py-16 px-4">
          <div 
            ref={general.ref}
            className={`max-w-4xl mx-auto transition-all duration-1000 ${
              general.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <h2 className="text-3xl font-bold text-liberation-cream mb-8">
              <span className="text-liberation-gold">General</span> Questions
            </h2>
            <Accordion type="single" collapsible className="space-y-4">
              {generalFAQs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`general-${index}`}
                  className="bg-liberation-dark/50 border border-liberation-gold/20 rounded-lg px-6 data-[state=open]:border-liberation-gold/40"
                >
                  <AccordionTrigger className="text-liberation-cream hover:text-liberation-gold text-left py-5">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-liberation-cream/80 pb-5 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Membership Questions */}
        <section className="py-16 px-4 bg-liberation-dark/50">
          <div 
            ref={membership.ref}
            className={`max-w-4xl mx-auto transition-all duration-1000 ${
              membership.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <h2 className="text-3xl font-bold text-liberation-cream mb-8">
              <span className="text-liberation-gold">Membership</span> Questions
            </h2>
            <Accordion type="single" collapsible className="space-y-4">
              {membershipFAQs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`membership-${index}`}
                  className="bg-liberation-dark/50 border border-liberation-gold/20 rounded-lg px-6 data-[state=open]:border-liberation-gold/40"
                >
                  <AccordionTrigger className="text-liberation-cream hover:text-liberation-gold text-left py-5">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-liberation-cream/80 pb-5 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Program Questions */}
        <section className="py-16 px-4">
          <div 
            ref={program.ref}
            className={`max-w-4xl mx-auto transition-all duration-1000 ${
              program.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <h2 className="text-3xl font-bold text-liberation-cream mb-8">
              <span className="text-liberation-gold">Program</span> Questions
            </h2>
            <Accordion type="single" collapsible className="space-y-4">
              {programFAQs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`program-${index}`}
                  className="bg-liberation-dark/50 border border-liberation-gold/20 rounded-lg px-6 data-[state=open]:border-liberation-gold/40"
                >
                  <AccordionTrigger className="text-liberation-cream hover:text-liberation-gold text-left py-5">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-liberation-cream/80 pb-5 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-gradient-to-t from-liberation-gold/10 to-transparent">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-liberation-cream mb-4">
              Still Have Questions?
            </h2>
            <p className="text-liberation-cream/80 mb-8 max-w-xl mx-auto">
              We are here to help. Reach out to us directly and a member of our team will get back to you.
            </p>
            <a
              href="mailto:info@liberationcaucus.org"
              className="inline-block bg-liberation-gold hover:bg-liberation-gold/90 text-liberation-dark font-semibold px-8 py-4 rounded-lg transition-all duration-300"
            >
              Contact Us
            </a>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default FAQ;
