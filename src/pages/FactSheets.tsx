import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useFactSheets, CMSFactSheet } from "@/hooks/useGoogleSheetsCMS";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { FileText, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const FactSheetCard = ({ sheet, index }: { sheet: CMSFactSheet; index: number }) => {
  const { ref, isVisible } = useScrollAnimation();
  const fileUrl = sheet["File url"] || sheet["File URL"];
  const fileType = sheet["File type"] || "PDF";

  return (
    <div
      ref={ref}
      className={`animate-on-scroll ${isVisible ? "visible" : ""} stagger-${(index % 4) + 1}`}
    >
      <div className="bg-liberation-dark/50 border border-liberation-gold/20 rounded-xl p-6 hover:border-liberation-gold/40 transition-all h-full flex flex-col">
        <div className="flex items-start gap-4 mb-4">
          <div className="bg-liberation-gold/10 rounded-lg p-3 shrink-0">
            <FileText className="w-6 h-6 text-liberation-gold" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-liberation-cream mb-1">{sheet.Title}</h3>
            <div className="flex flex-wrap gap-2 text-xs">
              {sheet.Campaign && (
                <span className="px-2 py-0.5 rounded-full bg-liberation-gold/10 text-liberation-gold border border-liberation-gold/30">
                  {sheet.Campaign}
                </span>
              )}
              {fileType && (
                <span className="px-2 py-0.5 rounded-full bg-liberation-cream/5 text-liberation-cream/50 border border-liberation-cream/10 uppercase">
                  {fileType}
                </span>
              )}
            </div>
          </div>
        </div>

        {sheet.Summary && (
          <p className="text-liberation-cream/70 text-sm mb-4 flex-grow">{sheet.Summary}</p>
        )}

        {sheet.Date && (
          <p className="text-liberation-cream/40 text-xs mb-4">Updated {sheet.Date}</p>
        )}

        <div className="flex flex-wrap gap-3 mt-auto">
          {fileUrl && (
            <Button
              size="sm"
              className="bg-liberation-gold hover:bg-liberation-gold/90 text-liberation-dark font-semibold"
              asChild
            >
              <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                Download <Download className="w-3.5 h-3.5 ml-1" />
              </a>
            </Button>
          )}
          {sheet["Related link"] && (
            <Button
              variant="outline"
              size="sm"
              className="border-liberation-gold/40 text-liberation-gold hover:bg-liberation-gold hover:text-liberation-dark"
              asChild
            >
              <a href={sheet["Related link"]} target="_blank" rel="noopener noreferrer">
                Related coverage <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

const FactSheets = () => {
  const { data: factSheets, isLoading, error } = useFactSheets();

  return (
    <>
      <Helmet>
        <title>Fact Sheets | Liberation Caucus</title>
        <meta
          name="description"
          content="Research and policy fact sheets from the Liberation Caucus — legislative analysis, campaign data, and reference materials."
        />
      </Helmet>

      <Header />

      <main className="bg-liberation-dark min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-liberation-cream mb-4">
              Fact <span className="text-liberation-gold">Sheets</span>
            </h1>
            <p className="text-liberation-cream/70 text-lg">
              Research, legislative analysis, and reference materials behind our campaigns.
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
              <p className="text-liberation-cream/60">Unable to load fact sheets at this time. Please try again later.</p>
            </div>
          )}

          {factSheets && factSheets.length === 0 && (
            <div className="text-center py-12">
              <p className="text-liberation-cream/60 text-lg">No fact sheets published yet. Check back soon!</p>
            </div>
          )}

          {factSheets && factSheets.length > 0 && (
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {factSheets.map((sheet, i) => (
                <FactSheetCard key={i} sheet={sheet} index={i} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default FactSheets;
