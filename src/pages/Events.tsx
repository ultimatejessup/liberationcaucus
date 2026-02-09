import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useEvents, CMSEvent } from "@/hooks/useGoogleSheetsCMS";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { CalendarDays, MapPin, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const EventCard = ({ event, index }: { event: CMSEvent; index: number }) => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div
      ref={ref}
      className={`animate-on-scroll ${isVisible ? "visible" : ""} stagger-${(index % 4) + 1}`}
    >
      <div className="bg-liberation-dark/50 border border-liberation-gold/20 rounded-xl p-6 hover:border-liberation-gold/40 transition-all h-full flex flex-col">
        <div className="flex items-start gap-4 mb-4">
          <div className="bg-liberation-gold/10 rounded-lg p-3 shrink-0">
            <CalendarDays className="w-6 h-6 text-liberation-gold" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-liberation-cream mb-1">{event.Title}</h3>
            <div className="flex flex-wrap gap-3 text-sm text-liberation-cream/60">
              {event.Date && (
                <span className="flex items-center gap-1">
                  <CalendarDays className="w-3.5 h-3.5" />
                  {event.Date}
                </span>
              )}
              {event.Time && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {event.Time}
                </span>
              )}
            </div>
          </div>
        </div>
        {event.Location && (
          <p className="flex items-center gap-1.5 text-sm text-liberation-cream/50 mb-3">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            {event.Location}
          </p>
        )}
        {event.Description && (
          <p className="text-liberation-cream/70 text-sm mb-4 flex-grow">{event.Description}</p>
        )}
        {event.Link && (
          <Button
            variant="outline"
            size="sm"
            className="border-liberation-gold/40 text-liberation-gold hover:bg-liberation-gold hover:text-liberation-dark w-fit mt-auto"
            asChild
          >
            <a href={event.Link} target="_blank" rel="noopener noreferrer">
              Learn More <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </a>
          </Button>
        )}
      </div>
    </div>
  );
};

const Events = () => {
  const { data: events, isLoading, error } = useEvents();

  return (
    <>
      <Helmet>
        <title>Events | Liberation Caucus</title>
        <meta name="description" content="Upcoming events from the Liberation Caucus — community gatherings, workshops, town halls, and more." />
      </Helmet>

      <Header />

      <main className="bg-liberation-dark min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-liberation-cream mb-4">
              Upcoming <span className="text-liberation-gold">Events</span>
            </h1>
            <p className="text-liberation-cream/70 text-lg">
              Join us at our upcoming community events, workshops, and gatherings.
            </p>
          </div>

          {isLoading && (
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-liberation-dark/50 border border-liberation-gold/10 rounded-xl p-6">
                  <Skeleton className="h-6 w-3/4 mb-3 bg-liberation-cream/10" />
                  <Skeleton className="h-4 w-1/2 mb-2 bg-liberation-cream/10" />
                  <Skeleton className="h-4 w-full mb-2 bg-liberation-cream/10" />
                  <Skeleton className="h-4 w-2/3 bg-liberation-cream/10" />
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-liberation-cream/60">Unable to load events at this time. Please try again later.</p>
            </div>
          )}

          {events && events.length === 0 && (
            <div className="text-center py-12">
              <p className="text-liberation-cream/60 text-lg">No upcoming events at this time. Check back soon!</p>
            </div>
          )}

          {events && events.length > 0 && (
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {events.map((event, i) => (
                <EventCard key={i} event={event} index={i} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Events;