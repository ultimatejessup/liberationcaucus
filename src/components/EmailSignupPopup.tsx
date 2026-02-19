import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const EmailSignupPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const hasSeenPopup = localStorage.getItem("liberation-caucus-popup-seen");
    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("liberation-caucus-popup-seen", "true");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('mailchimp-subscribe', {
        body: { email, name },
      });

      if (error) throw error;
      
      setIsSubmitted(true);
      localStorage.setItem("liberation-caucus-popup-seen", "true");
      
      setTimeout(() => {
        setIsOpen(false);
      }, 2000);
    } catch (error) {
      console.error("Error subscribing to Mailchimp:", error);
      setIsSubmitted(true);
      localStorage.setItem("liberation-caucus-popup-seen", "true");
      
      setTimeout(() => {
        setIsOpen(false);
      }, 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md bg-liberation-dark border-liberation-gold/30">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4 text-liberation-cream" />
          <span className="sr-only">Close</span>
        </button>
        
        <DialogHeader className="space-y-3">
          <div className="w-16 h-1 bg-liberation-gold mx-auto" />
          <DialogTitle className="text-2xl font-bold text-liberation-cream text-center">
            Stay Connected
          </DialogTitle>
          <DialogDescription className="text-liberation-cream/80 text-center leading-relaxed">
            Join the Liberation Caucus movement. Get updates on our Freedom Summer Leadership Program, events, and opportunities to advance justice and equity.
          </DialogDescription>
        </DialogHeader>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <Input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-liberation-dark/50 border-liberation-gold/40 text-liberation-cream placeholder:text-liberation-cream/50 focus:border-liberation-gold focus:ring-liberation-gold"
            />
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-liberation-dark/50 border-liberation-gold/40 text-liberation-cream placeholder:text-liberation-cream/50 focus:border-liberation-gold focus:ring-liberation-gold"
            />
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-liberation-gold hover:bg-liberation-gold/90 text-liberation-dark font-semibold"
            >
              {isSubmitting ? "Signing Up..." : "Get Updates"}
            </Button>
            <p className="text-xs text-liberation-cream/60 text-center">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </form>
        ) : (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-liberation-gold/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-liberation-gold text-2xl">✓</span>
            </div>
            <p className="text-liberation-cream font-medium">Welcome to the movement!</p>
            <p className="text-liberation-cream/70 text-sm mt-1">Check your inbox for updates.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EmailSignupPopup;
