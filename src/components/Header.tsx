import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { label: "About Us", href: "/about" },
    { label: "Events", href: "/events" },
    { label: "News", href: "/news" },
    { label: "Freedom Summer", href: "/freedom-summer" },
    { label: "FAQ", href: "/faq" },
    { label: "Get Involved", href: "/#get-involved" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-liberation-dark/95 backdrop-blur-sm border-b border-liberation-gold/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-liberation-gold rounded-full flex items-center justify-center">
              <span className="text-liberation-dark font-bold text-lg">LC</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-liberation-cream font-bold text-lg tracking-wide">Liberation Caucus</span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-liberation-cream/80 hover:text-liberation-gold transition-colors text-sm font-medium"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="outline"
              className="border-liberation-gold text-liberation-gold hover:bg-liberation-gold hover:text-liberation-dark"
              asChild
            >
              <a href="https://actionnetwork.org/forms/liberation-caucus-membership-form" target="_blank" rel="noopener noreferrer">
                Join Us
              </a>
            </Button>
            <Button className="bg-liberation-red hover:bg-liberation-red/90 text-liberation-cream" asChild>
              <a href="#donate">Donate</a>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-liberation-cream p-2"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-liberation-gold/20">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-liberation-cream/80 hover:text-liberation-gold transition-colors font-medium"
                >
                  {link.label}
                </a>
              ))}
              <div className="flex flex-col gap-2 pt-4">
                <Button
                  variant="outline"
                  className="border-liberation-gold text-liberation-gold hover:bg-liberation-gold hover:text-liberation-dark w-full"
                  asChild
                >
                  <a href="https://actionnetwork.org/forms/liberation-caucus-membership-form" target="_blank" rel="noopener noreferrer">
                    Join Us
                  </a>
                </Button>
                <Button className="bg-liberation-red hover:bg-liberation-red/90 text-liberation-cream w-full" asChild>
                  <a href="#donate">Donate</a>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
