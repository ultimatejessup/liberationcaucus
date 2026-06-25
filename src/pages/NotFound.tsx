import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Home, Users, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <>
      <Helmet>
        <title>Page Not Found | Liberation Caucus</title>
        <meta name="description" content="The page you're looking for could not be found. Return to the Liberation Caucus homepage." />
      </Helmet>

      <Header />

      <main className="bg-liberation-dark min-h-screen flex items-center justify-center relative overflow-hidden pt-20 pb-16">
        {/* Decorative background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-liberation-gold/[0.04] blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-liberation-red/[0.05] blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="max-w-xl mx-auto">
            <div className="inline-flex items-center justify-center mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-liberation-gold to-liberation-gold/60 text-8xl md:text-9xl font-bold tracking-tight">
                404
              </span>
            </div>

            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-liberation-gold to-transparent rounded-full mx-auto mb-8" />

            <h1 className="text-3xl md:text-4xl font-bold text-liberation-cream mb-4">
              This Page Hasn't Been Liberated Yet
            </h1>
            <p className="text-liberation-cream/60 text-lg mb-10 leading-relaxed">
              The page you're looking for doesn't exist or has moved. Let's get you back to the movement.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-liberation-gold to-liberation-gold/85 text-liberation-dark hover:from-liberation-gold/95 hover:to-liberation-gold/80 font-bold w-full sm:w-auto"
                asChild
              >
                <a href="/">
                  <Home className="w-5 h-5" />
                  Back to Home
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-liberation-gold/40 text-liberation-cream hover:bg-liberation-gold/10 hover:text-liberation-cream w-full sm:w-auto"
                asChild
              >
                <a href="/membership">
                  <Users className="w-5 h-5" />
                  Become a Member
                </a>
              </Button>
            </div>

            <a
              href="/"
              className="inline-flex items-center gap-2 text-liberation-cream/50 hover:text-liberation-gold transition-colors text-sm mt-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to the homepage
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default NotFound;
