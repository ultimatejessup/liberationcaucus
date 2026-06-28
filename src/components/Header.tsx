import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Menu, X, ScrollText, ChevronDown } from "lucide-react";

const tools = [
  {
    label: "Purple Book",
    href: "/purplbook",
    description: "Black caucus legislative directory — federal, state, and local.",
    icon: ScrollText,
  },
  // Next: Michigan Utility Rate Tracker — add here once its route is built.
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileToolsOpen, setIsMobileToolsOpen] = useState(false);

  const navLinks = [
    { label: "About Us", href: "/about" },
    { label: "Events", href: "/events" },
    { label: "News", href: "/news" },
    { label: "Our Network", href: "/#network" },
    { label: "Get Involved", href: "/#get-involved" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-liberation-dark/95 backdrop-blur-sm border-b border-liberation-gold/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-liberation-gold rounded-full flex items-center justify-center">
              <span className="text-liberation-dark font-bold text-lg">LC</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-liberation-cream font-bold text-lg tracking-wide">Liberation Caucus</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.slice(0, 3).map((link) => (
              <NavLink
                key={link.label}
                to={link.href}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${
                    isActive ? "text-liberation-gold" : "text-liberation-cream/80 hover:text-liberation-gold"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}

            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="h-auto bg-transparent p-0 text-sm font-medium text-liberation-cream/80 hover:bg-transparent hover:text-liberation-gold focus:bg-transparent data-[state=open]:bg-transparent data-[state=open]:text-liberation-gold">
                    Tools
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="w-72 gap-1 p-2 bg-liberation-dark border border-liberation-gold/20">
                      {tools.map((tool) => (
                        <li key={tool.href}>
                          <NavigationMenuLink asChild>
                            <Link
                              to={tool.href}
                              className="flex flex-col gap-1 rounded-md p-3 transition-colors hover:bg-liberation-gold/10"
                            >
                              <span className="flex items-center gap-2 text-sm font-semibold text-liberation-cream">
                                <tool.icon className="h-4 w-4 text-liberation-gold" />
                                {tool.label}
                              </span>
                              <span className="text-xs text-liberation-cream/60">{tool.description}</span>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            {navLinks.slice(3).map((link) =>
              link.href.startsWith("/#") ? (
                <Link
                  key={link.label}
                  to={link.href}
                  className="text-liberation-cream/80 hover:text-liberation-gold transition-colors text-sm font-medium"
                >
                  {link.label}
                </Link>
              ) : (
                <NavLink
                  key={link.label}
                  to={link.href}
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors ${
                      isActive ? "text-liberation-gold" : "text-liberation-cream/80 hover:text-liberation-gold"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              )
            )}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="outline"
              className="border-liberation-gold text-liberation-gold hover:bg-liberation-gold hover:text-liberation-dark"
              asChild
            >
              <Link to="/membership">
                Join Us
              </Link>
            </Button>
            <Button className="bg-liberation-red hover:bg-liberation-red/90 text-liberation-cream" asChild>
              <Link to="/donate">Donate</Link>
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
              {navLinks.slice(0, 3).map((link) => (
                <NavLink
                  key={link.label}
                  to={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    `font-medium transition-colors ${
                      isActive ? "text-liberation-gold" : "text-liberation-cream/80 hover:text-liberation-gold"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}

              <div>
                <button
                  onClick={() => setIsMobileToolsOpen(!isMobileToolsOpen)}
                  className="flex w-full items-center justify-between font-medium text-liberation-cream/80 hover:text-liberation-gold transition-colors"
                  aria-expanded={isMobileToolsOpen}
                >
                  Tools
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${isMobileToolsOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isMobileToolsOpen && (
                  <div className="mt-3 flex flex-col gap-3 border-l border-liberation-gold/20 pl-4">
                    {tools.map((tool) => (
                      <Link
                        key={tool.href}
                        to={tool.href}
                        onClick={() => {
                          setIsMenuOpen(false);
                          setIsMobileToolsOpen(false);
                        }}
                        className="flex items-center gap-2 text-sm text-liberation-cream/70 hover:text-liberation-gold transition-colors"
                      >
                        <tool.icon className="h-4 w-4 text-liberation-gold" />
                        {tool.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {navLinks.slice(3).map((link) =>
                link.href.startsWith("/#") ? (
                  <Link
                    key={link.label}
                    to={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-liberation-cream/80 hover:text-liberation-gold transition-colors font-medium"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <NavLink
                    key={link.label}
                    to={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) =>
                      `font-medium transition-colors ${
                        isActive ? "text-liberation-gold" : "text-liberation-cream/80 hover:text-liberation-gold"
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                )
              )}
              <div className="flex flex-col gap-2 pt-4">
                <Button
                  variant="outline"
                  className="border-liberation-gold text-liberation-gold hover:bg-liberation-gold hover:text-liberation-dark w-full"
                  asChild
                >
                  <Link to="/membership" onClick={() => setIsMenuOpen(false)}>
                    Join Us
                  </Link>
                </Button>
                <Button className="bg-liberation-red hover:bg-liberation-red/90 text-liberation-cream w-full" asChild>
                  <Link to="/donate" onClick={() => setIsMenuOpen(false)}>Donate</Link>
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
