import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useNews, CMSNews } from "@/hooks/useGoogleSheetsCMS";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Newspaper, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const NewsCard = ({ article, index }: { article: CMSNews; index: number }) => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div
      ref={ref}
      className={`animate-on-scroll ${isVisible ? "visible" : ""} stagger-${(index % 4) + 1}`}
    >
      <div className="bg-liberation-dark/50 border border-liberation-gold/20 rounded-xl overflow-hidden hover:border-liberation-gold/40 transition-all h-full flex flex-col">
        {article["Image URL"] && (
          <div className="aspect-video overflow-hidden">
            <img
              src={article["Image URL"]}
              alt={article.Title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}
        <div className="p-6 flex flex-col flex-grow">
          <div className="flex items-center gap-2 text-sm text-liberation-cream/50 mb-2">
            <Newspaper className="w-3.5 h-3.5" />
            {article.Date}
          </div>
          <h3 className="text-xl font-bold text-liberation-cream mb-3">{article.Title}</h3>
          {article.Summary && (
            <p className="text-liberation-cream/70 text-sm mb-4 flex-grow">{article.Summary}</p>
          )}
          {article.Link && (
            <Button
              variant="outline"
              size="sm"
              className="border-liberation-gold/40 text-liberation-gold hover:bg-liberation-gold hover:text-liberation-dark w-fit mt-auto"
              asChild
            >
              <a href={article.Link} target="_blank" rel="noopener noreferrer">
                Read More <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

const News = () => {
  const { data: news, isLoading, error } = useNews();

  return (
    <>
      <Helmet>
        <title>News | Liberation Caucus</title>
        <meta name="description" content="Latest news and announcements from the Liberation Caucus." />
      </Helmet>

      <Header />

      <main className="bg-liberation-dark min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-liberation-cream mb-4">
              Latest <span className="text-liberation-gold">News</span>
            </h1>
            <p className="text-liberation-cream/70 text-lg">
              Stay informed with the latest updates and announcements.
            </p>
          </div>

          {isLoading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-liberation-dark/50 border border-liberation-gold/10 rounded-xl overflow-hidden">
                  <Skeleton className="aspect-video bg-liberation-cream/10" />
                  <div className="p-6">
                    <Skeleton className="h-4 w-1/3 mb-2 bg-liberation-cream/10" />
                    <Skeleton className="h-6 w-3/4 mb-3 bg-liberation-cream/10" />
                    <Skeleton className="h-4 w-full mb-2 bg-liberation-cream/10" />
                    <Skeleton className="h-4 w-2/3 bg-liberation-cream/10" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-liberation-cream/60">Unable to load news at this time. Please try again later.</p>
            </div>
          )}

          {news && news.length === 0 && (
            <div className="text-center py-12">
              <p className="text-liberation-cream/60 text-lg">No news articles at this time. Check back soon!</p>
            </div>
          )}

          {news && news.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {news.map((article, i) => (
                <NewsCard key={i} article={article} index={i} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default News;