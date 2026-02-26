import { useState } from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Users, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const Membership = () => {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    zipCode: "",
    phone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.zipCode) {
      toast({ title: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    setLoading(true);
    // Simulate submission
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
              Become a <span className="text-liberation-gold">Member</span>
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
                  <Label htmlFor="email" className="text-liberation-cream">Email Address *</Label>
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
                    <Label htmlFor="zipCode" className="text-liberation-cream">Zip Code *</Label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      value={form.zipCode}
                      onChange={handleChange}
                      placeholder="00000"
                      className="bg-liberation-dark border-liberation-gold/30 text-liberation-cream placeholder:text-liberation-cream/40 focus:border-liberation-gold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-liberation-cream">Phone (optional)</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="(555) 555-5555"
                      className="bg-liberation-dark border-liberation-gold/30 text-liberation-cream placeholder:text-liberation-cream/40 focus:border-liberation-gold"
                    />
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
