import { useState } from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Users, CheckCircle, Shield, Heart, Megaphone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const COMMITTEES = [
  "Rules, Bylaws and Policy",
  "Membership",
  "Finance",
  "Operations",
  "Civic Engagement",
];

const COUNCILS = [
  "Small Business",
  "Womens",
  "Mens",
  "Faith",
  "LGBTQ",
  "Technology",
  "Youth",
  "Democracy",
];

const BENEFITS = [
  { icon: Megaphone, title: "Amplify Your Voice", desc: "Shape policy and community action" },
  { icon: Shield, title: "Leadership Pipeline", desc: "Access training and mentorship" },
  { icon: Heart, title: "Community Power", desc: "Connect with changemakers near you" },
];

const Membership = () => {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { ref: animRef } = useScrollAnimation();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    zipCode: "",
    precinctLeader: "",
    committees: [] as string[],
    councils: [] as string[],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCommitteeToggle = (committee: string) => {
    setForm((prev) => ({
      ...prev,
      committees: prev.committees.includes(committee)
        ? prev.committees.filter((c) => c !== committee)
        : [...prev.committees, committee],
    }));
  };

  const handleCouncilToggle = (council: string) => {
    setForm((prev) => ({
      ...prev,
      councils: prev.councils.includes(council)
        ? prev.councils.filter((c) => c !== council)
        : [...prev.councils, council],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.zipCode) {
      toast({ title: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <>
      <Helmet>
        <title>Join Us | Liberation Caucus</title>
        <meta name="description" content="Become a member of the Liberation Caucus. Membership is vital to staying informed with caucus events and opportunities." />
      </Helmet>

      <Header />

      <main className="bg-liberation-dark min-h-screen pt-24 pb-16 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-liberation-gold/[0.03] blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-liberation-red/[0.04] blur-3xl" />
          <div className="absolute top-1/3 left-0 w-[300px] h-[300px] rounded-full bg-liberation-green/[0.04] blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Hero header */}
          <div ref={animRef} className="animate-on-scroll max-w-3xl mx-auto text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-liberation-gold/20 to-liberation-gold/5 border border-liberation-gold/20 mb-6">
              <Users className="w-9 h-9 text-liberation-gold" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-liberation-cream mb-4 tracking-tight">
              Join the{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-liberation-gold to-liberation-gold/70">
                Liberation Caucus
              </span>
            </h1>
            <p className="text-liberation-cream/60 text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
              Membership is vital to staying informed with caucus events and opportunities. Join us today and be part of the movement.
            </p>
          </div>

          {/* Benefits strip */}
          <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            {BENEFITS.map((b, i) => (
              <div
                key={b.title}
                className={`animate-on-scroll stagger-${i + 1} flex items-center gap-3 bg-liberation-cream/[0.03] border border-liberation-gold/10 rounded-xl px-5 py-4 hover:border-liberation-gold/25 transition-colors`}
              >
                <div className="shrink-0 w-10 h-10 rounded-lg bg-liberation-gold/10 flex items-center justify-center">
                  <b.icon className="w-5 h-5 text-liberation-gold" />
                </div>
                <div>
                  <p className="text-liberation-cream font-semibold text-sm">{b.title}</p>
                  <p className="text-liberation-cream/50 text-xs">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Form card */}
          <div className="max-w-xl mx-auto">
            <div className="relative bg-gradient-to-b from-liberation-cream/[0.05] to-liberation-dark/80 border border-liberation-gold/15 rounded-2xl p-8 md:p-10 backdrop-blur-sm shadow-[0_0_60px_-15px_hsl(var(--liberation-gold)/0.1)]">
              {/* Gold accent line at top */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-liberation-gold to-transparent rounded-full" />

              {submitted ? (
                <div className="text-center py-16 animate-fade-in">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-liberation-gold/15 mb-6">
                    <CheckCircle className="w-10 h-10 text-liberation-gold" />
                  </div>
                  <h2 className="text-3xl font-bold text-liberation-cream mb-3">Welcome to the Movement!</h2>
                  <p className="text-liberation-cream/60 text-lg">Thank you for joining the Liberation Caucus. We'll be in touch soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Section: Personal Info */}
                  <div>
                    <h2 className="text-liberation-cream font-semibold text-lg mb-4 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-liberation-gold/20 text-liberation-gold text-xs font-bold flex items-center justify-center">1</span>
                      Your Information
                    </h2>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName" className="text-liberation-cream/80 text-sm">First Name <span className="text-liberation-red">*</span></Label>
                          <Input
                            id="firstName"
                            name="firstName"
                            value={form.firstName}
                            onChange={handleChange}
                            placeholder="First Name"
                            className="bg-liberation-dark/60 border-liberation-cream/10 text-liberation-cream placeholder:text-liberation-cream/30 focus:border-liberation-gold/50 focus:ring-liberation-gold/20 transition-colors"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName" className="text-liberation-cream/80 text-sm">Last Name <span className="text-liberation-red">*</span></Label>
                          <Input
                            id="lastName"
                            name="lastName"
                            value={form.lastName}
                            onChange={handleChange}
                            placeholder="Last Name"
                            className="bg-liberation-dark/60 border-liberation-cream/10 text-liberation-cream placeholder:text-liberation-cream/30 focus:border-liberation-gold/50 focus:ring-liberation-gold/20 transition-colors"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-liberation-cream/80 text-sm">Email <span className="text-liberation-red">*</span></Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="you@email.com"
                          className="bg-liberation-dark/60 border-liberation-cream/10 text-liberation-cream placeholder:text-liberation-cream/30 focus:border-liberation-gold/50 focus:ring-liberation-gold/20 transition-colors"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="mobile" className="text-liberation-cream/80 text-sm">Mobile Number</Label>
                          <Input
                            id="mobile"
                            name="mobile"
                            type="tel"
                            value={form.mobile}
                            onChange={handleChange}
                            placeholder="(201) 555-0123"
                            className="bg-liberation-dark/60 border-liberation-cream/10 text-liberation-cream placeholder:text-liberation-cream/30 focus:border-liberation-gold/50 focus:ring-liberation-gold/20 transition-colors"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="zipCode" className="text-liberation-cream/80 text-sm">Zip/Postal Code <span className="text-liberation-red">*</span></Label>
                          <Input
                            id="zipCode"
                            name="zipCode"
                            value={form.zipCode}
                            onChange={handleChange}
                            placeholder="00000"
                            className="bg-liberation-dark/60 border-liberation-cream/10 text-liberation-cream placeholder:text-liberation-cream/30 focus:border-liberation-gold/50 focus:ring-liberation-gold/20 transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-gradient-to-r from-transparent via-liberation-gold/20 to-transparent" />

                  {/* Section: Leadership */}
                  <div>
                    <h2 className="text-liberation-cream font-semibold text-lg mb-4 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-liberation-gold/20 text-liberation-gold text-xs font-bold flex items-center justify-center">2</span>
                      Leadership Interest
                    </h2>
                    <Select
                      value={form.precinctLeader}
                      onValueChange={(value) => setForm((prev) => ({ ...prev, precinctLeader: value }))}
                    >
                      <SelectTrigger className="bg-liberation-dark/60 border-liberation-cream/10 text-liberation-cream focus:border-liberation-gold/50 focus:ring-liberation-gold/20 transition-colors">
                        <SelectValue placeholder="Are you interested in becoming a precinct leader?" />
                      </SelectTrigger>
                      <SelectContent className="bg-liberation-dark border-liberation-cream/10">
                        <SelectItem value="yes" className="text-liberation-cream focus:bg-liberation-gold/10 focus:text-liberation-cream">I want to become a precinct leader</SelectItem>
                        <SelectItem value="no" className="text-liberation-cream focus:bg-liberation-gold/10 focus:text-liberation-cream">Not at this time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-gradient-to-r from-transparent via-liberation-gold/20 to-transparent" />

                  {/* Section: Committees */}
                  <div>
                    <h2 className="text-liberation-cream font-semibold text-lg mb-1 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-liberation-gold/20 text-liberation-gold text-xs font-bold flex items-center justify-center">3</span>
                      Caucus Committees
                    </h2>
                    <p className="text-liberation-cream/40 text-sm mb-4 ml-8">Select committees you'd like to join</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-8">
                      {COMMITTEES.map((committee) => (
                        <label
                          key={committee}
                          htmlFor={`committee-${committee}`}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                            form.committees.includes(committee)
                              ? "border-liberation-gold/40 bg-liberation-gold/[0.07]"
                              : "border-liberation-cream/5 bg-liberation-cream/[0.02] hover:border-liberation-cream/15"
                          }`}
                        >
                          <Checkbox
                            id={`committee-${committee}`}
                            checked={form.committees.includes(committee)}
                            onCheckedChange={() => handleCommitteeToggle(committee)}
                            className="border-liberation-gold/40 data-[state=checked]:bg-liberation-gold data-[state=checked]:border-liberation-gold"
                          />
                          <span className="text-liberation-cream/80 text-sm">{committee}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-gradient-to-r from-transparent via-liberation-gold/20 to-transparent" />

                  {/* Section: Councils */}
                  <div>
                    <h2 className="text-liberation-cream font-semibold text-lg mb-1 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-liberation-gold/20 text-liberation-gold text-xs font-bold flex items-center justify-center">4</span>
                      Liberation Caucus Councils
                    </h2>
                    <p className="text-liberation-cream/40 text-sm mb-4 ml-8">Select councils you'd like to participate in</p>
                    <div className="grid grid-cols-2 gap-2 ml-8">
                      {COUNCILS.map((council) => (
                        <label
                          key={council}
                          htmlFor={`council-${council}`}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                            form.councils.includes(council)
                              ? "border-liberation-gold/40 bg-liberation-gold/[0.07]"
                              : "border-liberation-cream/5 bg-liberation-cream/[0.02] hover:border-liberation-cream/15"
                          }`}
                        >
                          <Checkbox
                            id={`council-${council}`}
                            checked={form.councils.includes(council)}
                            onCheckedChange={() => handleCouncilToggle(council)}
                            className="border-liberation-gold/40 data-[state=checked]:bg-liberation-gold data-[state=checked]:border-liberation-gold"
                          />
                          <span className="text-liberation-cream/80 text-sm">{council}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-liberation-gold to-liberation-gold/85 text-liberation-dark hover:from-liberation-gold/95 hover:to-liberation-gold/80 font-bold text-lg py-6 mt-4 rounded-xl shadow-[0_4px_20px_-4px_hsl(var(--liberation-gold)/0.4)] hover:shadow-[0_4px_30px_-4px_hsl(var(--liberation-gold)/0.5)] transition-all duration-300"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 border-2 border-liberation-dark/30 border-t-liberation-dark rounded-full animate-spin" />
                        Submitting...
                      </span>
                    ) : (
                      "Join the Liberation Caucus"
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Membership;
