import { Button } from "@/components/ui/button";
import { Calendar, Users, BookOpen, ArrowRight } from "lucide-react";

const FredomSummerSection = () => {
  const features = [
    {
      icon: BookOpen,
      title: "Political Education",
      description: "Deep dives into organizing strategies, policy analysis, and movement history."
    },
    {
      icon: Users,
      title: "Community Building",
      description: "Connect with fellow organizers and build lasting relationships across the diaspora."
    },
    {
      icon: Calendar,
      title: "Field Experience",
      description: "Hands-on experience in campaign strategy, voter outreach, and civic engagement."
    }
  ];

  return (
    <section id="freedom-summer" className="py-24 bg-liberation-cream">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-liberation-red font-semibold text-sm tracking-widest uppercase">Leadership Development</span>
          <h2 className="text-4xl md:text-5xl font-bold text-liberation-dark mt-4 mb-6">
            Freedom Summer Leadership Program
          </h2>
          <p className="text-lg text-liberation-dark/70 leading-relaxed">
            Inspired by the historic 1964 Freedom Summer, our program trains the next generation of Black political leaders, organizers, and change-makers committed to liberation and justice.
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image Side */}
          <div className="relative">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80"
                alt="Freedom Summer Leadership Program participants engaged in discussion"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Accent Element */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-liberation-gold/20 rounded-2xl -z-10" />
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-liberation-red/20 rounded-2xl -z-10" />
          </div>

          {/* Content Side */}
          <div className="space-y-8">
            {features.map((feature, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-liberation-gold/20 rounded-xl flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-liberation-gold" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-liberation-dark mb-2">{feature.title}</h3>
                  <p className="text-liberation-dark/70">{feature.description}</p>
                </div>
              </div>
            ))}

            <div className="pt-4">
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
          </div>
        </div>
      </div>
    </section>
  );
};

export default FredomSummerSection;
