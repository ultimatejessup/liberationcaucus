import { Link } from "react-router-dom";
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

  const enrollmentSteps = [
    {
      title: "Become a Member",
      description: "Freedom Summer enrollment is open to current Liberation Caucus members. If you haven't joined yet, start there.",
    },
    {
      title: "Submit Your Enrollment",
      description: "Members complete a short enrollment form, including a brief statement of interest.",
    },
    {
      title: "Enrollment Review",
      description: "Our program team reviews enrollment submissions and follows up with next steps.",
    },
    {
      title: "Confirmation",
      description: "Confirmed participants receive program details, including schedule, location, and what to prepare.",
    },
    {
      title: "Program Sessions",
      description: "An intensive program combining sessions with in-person retreats.",
    },
    {
      title: "Completion & Alumni Network",
      description: "Participants who complete the program join the Freedom Summer alumni community.",
    },
  ];

  // TODO: REVIEW BEFORE PUBLISH — these testimonials have not been verified as real,
  // consented alumni quotes. Per program review requirements, do not publish this section
  // until the Freedom Summer program (and these specific testimonials, if real) have been
  // reviewed and approved outside of this site-build process.
  const testimonials = [
    {
      quote: "Freedom Summer transformed my understanding of what's possible when we organize with intention. The connections I made continue to fuel my work today.",
      name: "Marcus Johnson",
      role: "Alumni, Community Organizer",
      location: "Atlanta, GA"
    },
    {
      quote: "The political education I received gave me the historical grounding and strategic framework to be more effective in my advocacy work. This program is essential.",
      name: "Aisha Williams",
      role: "Alumni, Policy Advocate",
      location: "Detroit, MI"
    },
    {
      quote: "I came to Freedom Summer looking for skills. I left with a family of fellow freedom fighters who push me to be better every day.",
      name: "Terrence Davis",
      role: "Alumni, Labor Organizer",
      location: "Oakland, CA"
    }
  ];

  const eligibility = [
    "Must identify as Black or of African descent",
    "Age 18 or older",
    "Must be a current member of the Liberation Caucus",
    "Demonstrated commitment to social justice and community work",
    "Able to attend mandatory in-person retreat sessions",
    "Willing to commit time each week to program activities",
  ];

  return (
    <>
      <Helmet>
        <title>Freedom Summer Leadership Program | Liberation Caucus</title>
        <meta name="description" content="The Freedom Summer Leadership Program trains Liberation Caucus members as the next generation of Black political leaders, organizers, and change-makers committed to liberation and justice." />
      </Helmet>

      <Header />
      <EmailSignupPopup />

      {/* Program review notice - remove once program details are reviewed and confirmed outside this site build */}
      <div className="bg-liberation-red/90 text-liberation-cream text-sm text-center py-2 px-4">
        Program details on this page are pending review and confirmation before publishing.
      </div>

      {/* Hero Section */}
      <section className="pt-16 pb-20 bg-liberation-dark" ref={heroRef}>
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className={`animate-on-scroll-left ${heroVisible ? 'visible' : ''}`}>
              <span className="text-liberation-red font-semibold text-sm tracking-widest uppercase">Leadership Development</span>
              <h1 className="text-4xl md:text-6xl font-bold text-liberation-cream mt-4 mb-6 leading-tight">
                Freedom Summer{" "}
                <span className="text-liberation-gold">Leadership Program</span>
              </h1>
              <p className="text-xl text-liberation-cream/70 leading-relaxed mb-4">
                Inspired by the historic Freedom Summer, our program trains Liberation Caucus members as the next generation of Black political leaders, organizers, and change-makers committed to liberation and justice.
              </p>
              <p className="text-liberation-cream/60 leading-relaxed mb-8">
                Freedom Summer is a training program open exclusively to current Liberation Caucus members. Membership is required before you can enroll.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className="bg-liberation-gold hover:bg-liberation-gold/90 text-liberation-dark group"
                  asChild
                >
                  <Link to="/membership">
                    Become a Member to Enroll
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-liberation-cream/30 text-liberation-cream hover:bg-liberation-cream/10"
                  asChild
                >
                  <a href="#enrollment-process">View Enrollment Process</a>
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
                Who Can Enroll?
              </h2>
              <p className="text-lg text-liberation-cream/70 mb-2">
                Freedom Summer enrollment is open to current Liberation Caucus members who are passionate about deepening their commitment to Black liberation and community organizing.
              </p>
              <p className="text-liberation-gold font-semibold mb-8">
                Liberation Caucus membership is required to enroll.
              </p>
              <ul className="space-y-4">
                {eligibility.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-liberation-green flex-shrink-0 mt-0.5" />
                    <span className="text-liberation-cream/80">{item}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant="outline"
                className="border-liberation-gold text-liberation-gold hover:bg-liberation-gold hover:text-liberation-dark mt-6"
                asChild
              >
                <Link to="/membership">Not a member yet? Join the Caucus</Link>
              </Button>
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

      {/* Enrollment Process */}
      <section id="enrollment-process" className="py-20 bg-liberation-cream" ref={timelineRef}>
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-liberation-dark mb-6">
              Enrollment Process
            </h2>
            <p className="text-lg text-liberation-dark/70">
              Here's how Liberation Caucus members enroll in the Freedom Summer Leadership Program.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-liberation-gold/30 hidden md:block" />
              
              <div className="space-y-8">
                {enrollmentSteps.map((item, index) => (
                  <div 
                    key={index} 
                    className={`flex gap-6 animate-on-scroll stagger-${index + 1} ${timelineVisible ? 'visible' : ''}`}
                  >
                    <div className="hidden md:flex flex-shrink-0 w-16 h-16 bg-liberation-gold rounded-full items-center justify-center relative z-10">
                      <span className="text-liberation-dark font-bold text-lg">{index + 1}</span>
                    </div>
                    <div className="flex-1 bg-white p-6 rounded-xl shadow-sm">
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
            Liberation Caucus membership is the first step toward enrolling in Freedom Summer.
          </p>
          <Button
            size="lg"
            className="bg-liberation-dark hover:bg-liberation-dark/90 text-liberation-cream group"
            asChild
          >
            <Link to="/membership">
              Become a Member to Enroll
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default FreedomSummer;
