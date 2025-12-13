import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EmailSignupPopup from "@/components/EmailSignupPopup";
import { Button } from "@/components/ui/button";
import { Calendar, Users, BookOpen, ArrowRight, CheckCircle, Quote } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

import civilRightsMarch from "@/assets/civil-rights-march-1963.jpg";
import civilRightsSigns from "@/assets/civil-rights-signs.jpg";

const FreedomSummer = () => {
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation();
  const { ref: timelineRef, isVisible: timelineVisible } = useScrollAnimation();
  const { ref: testimonialsRef, isVisible: testimonialsVisible } = useScrollAnimation();

  const programFeatures = [
    {
      icon: BookOpen,
      title: "Political Education",
      description: "Intensive curriculum covering organizing strategies, policy analysis, Black political history, and movement theory from experienced practitioners."
    },
    {
      icon: Users,
      title: "Community Building",
      description: "Build lasting relationships with fellow organizers from across the African diaspora. Create networks that extend far beyond the program."
    },
    {
      icon: Calendar,
      title: "Field Experience",
      description: "Hands-on campaign work including voter outreach, community canvassing, and direct action organizing with established movement organizations."
    }
  ];

  const timeline = [
    {
      date: "January 15",
      title: "Applications Open",
      description: "Submit your application including essay responses and references."
    },
    {
      date: "March 1",
      title: "Application Deadline",
      description: "All applications must be submitted by 11:59 PM EST."
    },
    {
      date: "March 15 - April 15",
      title: "Interview Period",
      description: "Selected applicants participate in virtual interviews with program staff."
    },
    {
      date: "May 1",
      title: "Acceptance Notifications",
      description: "All applicants receive decisions and accepted participants confirm enrollment."
    },
    {
      date: "June 1 - August 15",
      title: "Program Sessions",
      description: "10-week intensive program combining virtual sessions with in-person retreats."
    },
    {
      date: "August 30",
      title: "Graduation & Alumni Network",
      description: "Celebration ceremony and induction into the Freedom Summer alumni community."
    }
  ];

  const testimonials = [
    {
      quote: "Freedom Summer transformed my understanding of what's possible when we organize with intention. The connections I made continue to fuel my work today.",
      name: "Marcus Johnson",
      role: "2023 Alumni, Community Organizer",
      location: "Atlanta, GA"
    },
    {
      quote: "The political education I received gave me the historical grounding and strategic framework to be more effective in my advocacy work. This program is essential.",
      name: "Aisha Williams",
      role: "2022 Alumni, Policy Advocate",
      location: "Detroit, MI"
    },
    {
      quote: "I came to Freedom Summer looking for skills. I left with a family of fellow freedom fighters who push me to be better every day.",
      name: "Terrence Davis",
      role: "2023 Alumni, Labor Organizer",
      location: "Oakland, CA"
    }
  ];

  const eligibility = [
    "Must identify as Black or of African descent",
    "Age 18 or older at program start",
    "Demonstrated commitment to social justice and community work",
    "Available for full program duration (June - August)",
    "Able to attend mandatory in-person retreat sessions",
    "Willing to commit 10-15 hours per week to program activities"
  ];

  return (
    <>
      <Helmet>
        <title>Freedom Summer Leadership Program | Liberation Caucus</title>
        <meta name="description" content="Join the Freedom Summer Leadership Program - training the next generation of Black political leaders, organizers, and change-makers committed to liberation and justice." />
      </Helmet>

      <Header />
      <EmailSignupPopup />

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-liberation-dark" ref={heroRef}>
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className={`animate-on-scroll-left ${heroVisible ? 'visible' : ''}`}>
              <span className="text-liberation-red font-semibold text-sm tracking-widest uppercase">Leadership Development</span>
              <h1 className="text-4xl md:text-6xl font-bold text-liberation-cream mt-4 mb-6 leading-tight">
                Freedom Summer{" "}
                <span className="text-liberation-gold">Leadership Program</span>
              </h1>
              <p className="text-xl text-liberation-cream/70 leading-relaxed mb-8">
                Inspired by the historic 1964 Freedom Summer, our program trains the next generation of Black political leaders, organizers, and change-makers committed to liberation and justice.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className="bg-liberation-gold hover:bg-liberation-gold/90 text-liberation-dark group"
                  asChild
                >
                  <a href="https://actionnetwork.org/forms/liberation-caucus-membership-form" target="_blank" rel="noopener noreferrer">
                    Apply Now
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-liberation-cream/30 text-liberation-cream hover:bg-liberation-cream/10"
                  asChild
                >
                  <a href="#timeline">View Timeline</a>
                </Button>
              </div>
            </div>
            <div className={`relative animate-on-scroll-right ${heroVisible ? 'visible' : ''}`}>
              <div className="aspect-[4/3] rounded-2xl overflow-hidden">
                <img 
                  src={civilRightsMarch}
                  alt="Historic 1963 March on Washington - inspiration for Freedom Summer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-liberation-gold/20 rounded-2xl -z-10" />
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-liberation-red/20 rounded-2xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Program Features */}
      <section className="py-20 bg-liberation-cream">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-liberation-dark mb-6">
              What You Will Learn
            </h2>
            <p className="text-lg text-liberation-dark/70">
              Our comprehensive curriculum combines theory with practice, preparing you to lead in your community.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {programFeatures.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-liberation-gold/20 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-liberation-gold" />
                </div>
                <h3 className="text-xl font-semibold text-liberation-dark mb-3">{feature.title}</h3>
                <p className="text-liberation-dark/70">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Eligibility */}
      <section className="py-20 bg-liberation-dark">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-liberation-cream mb-6">
                Who Should Apply?
              </h2>
              <p className="text-lg text-liberation-cream/70 mb-8">
                We seek passionate individuals ready to deepen their commitment to Black liberation and community organizing.
              </p>
              <ul className="space-y-4">
                {eligibility.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-liberation-green flex-shrink-0 mt-0.5" />
                    <span className="text-liberation-cream/80">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="aspect-square rounded-2xl overflow-hidden">
              <img 
                src={civilRightsSigns}
                alt="Civil rights activists with signs demanding equality"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section id="timeline" className="py-20 bg-liberation-cream" ref={timelineRef}>
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-liberation-dark mb-6">
              Application Timeline
            </h2>
            <p className="text-lg text-liberation-dark/70">
              Mark your calendar for these important dates in the Freedom Summer application process.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-liberation-gold/30 hidden md:block" />
              
              <div className="space-y-8">
                {timeline.map((item, index) => (
                  <div 
                    key={index} 
                    className={`flex gap-6 animate-on-scroll stagger-${index + 1} ${timelineVisible ? 'visible' : ''}`}
                  >
                    <div className="hidden md:flex flex-shrink-0 w-16 h-16 bg-liberation-gold rounded-full items-center justify-center relative z-10">
                      <Calendar className="w-6 h-6 text-liberation-dark" />
                    </div>
                    <div className="flex-1 bg-white p-6 rounded-xl shadow-sm">
                      <span className="text-liberation-red font-semibold text-sm">{item.date}</span>
                      <h3 className="text-xl font-semibold text-liberation-dark mt-1 mb-2">{item.title}</h3>
                      <p className="text-liberation-dark/70">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-liberation-dark" ref={testimonialsRef}>
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-liberation-cream mb-6">
              Hear From Our Alumni
            </h2>
            <p className="text-lg text-liberation-cream/70">
              Our graduates are leading the fight for justice across the country.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className={`bg-liberation-cream/5 border border-liberation-cream/10 p-8 rounded-2xl animate-on-scroll-scale stagger-${index + 1} ${testimonialsVisible ? 'visible' : ''}`}
              >
                <Quote className="w-10 h-10 text-liberation-gold/40 mb-4" />
                <p className="text-liberation-cream/90 italic mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div>
                  <p className="text-liberation-gold font-semibold">{testimonial.name}</p>
                  <p className="text-liberation-cream/60 text-sm">{testimonial.role}</p>
                  <p className="text-liberation-cream/40 text-sm">{testimonial.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-liberation-gold">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-liberation-dark mb-6">
            Ready to Join the Movement?
          </h2>
          <p className="text-xl text-liberation-dark/70 mb-8 max-w-2xl mx-auto">
            Applications are now open. Take the first step toward becoming a freedom fighter.
          </p>
          <Button
            size="lg"
            className="bg-liberation-dark hover:bg-liberation-dark/90 text-liberation-cream group"
            asChild
          >
            <a href="https://actionnetwork.org/forms/liberation-caucus-membership-form" target="_blank" rel="noopener noreferrer">
              Apply for Freedom Summer
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </Button>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default FreedomSummer;