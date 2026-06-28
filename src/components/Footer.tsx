import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer id="get-involved" className="bg-liberation-dark py-16 border-t border-liberation-gold/20">
      <div className="container mx-auto px-4">
        {/* CTA Banner */}
        <div className="bg-liberation-gold/10 border border-liberation-gold/30 rounded-2xl p-8 md:p-12 mb-16 text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-liberation-cream mb-4">
            Ready to Join the Movement?
          </h3>
          <p className="text-liberation-cream/70 max-w-xl mx-auto mb-8">
            Membership is vital to staying informed with caucus events and opportunities. Join us today and be part of the change.
          </p>
          <Button
            size="lg"
            className="bg-liberation-gold hover:bg-liberation-gold/90 text-liberation-dark font-semibold"
            asChild
          >
            <Link to="/membership">
              Become a Member
            </Link>
          </Button>
        </div>

        {/* Footer Content */}
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-liberation-gold rounded-full flex items-center justify-center">
                <span className="text-liberation-dark font-bold text-lg">LC</span>
              </div>
              <span className="text-liberation-cream font-bold text-xl">Liberation Caucus</span>
            </div>
            <p className="text-liberation-cream/60 max-w-md">
              A non-profit, non-partisan organization advancing the political, community, and economic interests of Black people and people of the African diaspora.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-liberation-gold font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-liberation-cream/60 hover:text-liberation-cream transition-colors">About Us</Link></li>
              <li><Link to="/events" className="text-liberation-cream/60 hover:text-liberation-cream transition-colors">Events</Link></li>
              <li><Link to="/news" className="text-liberation-cream/60 hover:text-liberation-cream transition-colors">News</Link></li>
              <li><Link to="/freedom-summer" className="text-liberation-cream/60 hover:text-liberation-cream transition-colors">Freedom Summer</Link></li>
              <li><Link to="/faq" className="text-liberation-cream/60 hover:text-liberation-cream transition-colors">FAQ</Link></li>
              <li><Link to="/donate" className="text-liberation-cream/60 hover:text-liberation-cream transition-colors">Donate</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-liberation-gold font-semibold mb-4">Contact</h4>
            <ul className="space-y-3">
              <li><a href="mailto:info@liberationcaucus.org" className="text-liberation-cream/60 hover:text-liberation-cream transition-colors">info@liberationcaucus.org</a></li>
              <li><a href="https://www.instagram.com/liberationcaucus" target="_blank" rel="noopener noreferrer" className="text-liberation-cream/60 hover:text-liberation-cream transition-colors">Instagram</a></li>
              <li><a href="https://www.facebook.com/liberationcaucus" target="_blank" rel="noopener noreferrer" className="text-liberation-cream/60 hover:text-liberation-cream transition-colors">Facebook</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-liberation-cream/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-liberation-cream/40 text-sm">
            © {new Date().getFullYear()} Liberation Caucus. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy-policy" className="text-liberation-cream/40 hover:text-liberation-cream/60 text-sm">Privacy Policy</Link>
            <Link to="/terms-of-service" className="text-liberation-cream/40 hover:text-liberation-cream/60 text-sm">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
