import { useState } from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Users, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const COMMITTEES = [
  "Rules, Bylaws and Policy",
  "Membership",
  "Finance",
  "Operations",
  "Civic Engagement",
];

const Membership = () => {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    zipCode: "",
    precinctLeader: "",
    committees: [] as string[],
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

      <main className="bg-liberation-dark min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-liberation-gold/10 mb-6">
              <Users className="w-8 h-8 text-liberation-gold" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-liberation-cream mb-4">
              Join the <span className="text-liberation-gold">Liberation Caucus</span>
            </h1>
            <p className="text-liberation-cream/70 text-lg">
              Membership is vital to staying informed with caucus events and opportunities. Join us today and be part of the movement.
            </p>
          </div>

          <div className="max-w-xl mx-auto bg-liberation-dark/50 border border-liberation-gold/20 rounded-2xl p-8">
            {submitted ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-liberation-gold mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-liberation-cream mb-2">Welcome to the Movement!</h2>
                <p className="text-liberation-cream/70">Thank you for joining the Liberation Caucus. We'll be in touch soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-liberation-cream">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      placeholder="First Name"
                      className="bg-liberation-dark border-liberation-gold/30 text-liberation-cream placeholder:text-liberation-cream/40 focus:border-liberation-gold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-liberation-cream">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      placeholder="Last Name"
                      className="bg-liberation-dark border-liberation-gold/30 text-liberation-cream placeholder:text-liberation-cream/40 focus:border-liberation-gold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-liberation-cream">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@email.com"
                    className="bg-liberation-dark border-liberation-gold/30 text-liberation-cream placeholder:text-liberation-cream/40 focus:border-liberation-gold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mobile" className="text-liberation-cream">Mobile Number</Label>
                    <Input
                      id="mobile"
                      name="mobile"
                      type="tel"
                      value={form.mobile}
                      onChange={handleChange}
                      placeholder="(201) 555-0123"
                      className="bg-liberation-dark border-liberation-gold/30 text-liberation-cream placeholder:text-liberation-cream/40 focus:border-liberation-gold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode" className="text-liberation-cream">Zip/Postal Code *</Label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      value={form.zipCode}
                      onChange={handleChange}
                      placeholder="00000"
                      className="bg-liberation-dark border-liberation-gold/30 text-liberation-cream placeholder:text-liberation-cream/40 focus:border-liberation-gold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-liberation-cream">Are you interested in becoming a precinct leader?</Label>
                  <Select
                    value={form.precinctLeader}
                    onValueChange={(value) => setForm((prev) => ({ ...prev, precinctLeader: value }))}
                  >
                    <SelectTrigger className="bg-liberation-dark border-liberation-gold/30 text-liberation-cream focus:border-liberation-gold">
                      <SelectValue placeholder="I want to become a precinct leader" />
                    </SelectTrigger>
                    <SelectContent className="bg-liberation-dark border-liberation-gold/30">
                      <SelectItem value="yes" className="text-liberation-cream">I want to become a precinct leader</SelectItem>
                      <SelectItem value="no" className="text-liberation-cream">Not at this time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-liberation-cream">Sign up for a Caucus Committee</Label>
                  <div className="space-y-2">
                    {COMMITTEES.map((committee) => (
                      <div key={committee} className="flex items-center space-x-3">
                        <Checkbox
                          id={`committee-${committee}`}
                          checked={form.committees.includes(committee)}
                          onCheckedChange={() => handleCommitteeToggle(committee)}
                          className="border-liberation-gold/40 data-[state=checked]:bg-liberation-gold data-[state=checked]:border-liberation-gold"
                        />
                        <Label
                          htmlFor={`committee-${committee}`}
                          className="text-liberation-cream/80 font-normal cursor-pointer"
                        >
                          {committee}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-liberation-gold text-liberation-dark hover:bg-liberation-gold/90 font-bold text-lg py-6 mt-2"
                >
                  {loading ? "Submitting..." : "Join the Liberation Caucus"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Membership;
