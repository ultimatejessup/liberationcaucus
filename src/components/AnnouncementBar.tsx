import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { DEBATE_AT, ELECTION_AT } from "@/data/didTheyAnswer";

// Slim announcement bar for the home page, linking to /did-they-answer.
// It switches itself by date, so no deploy is needed on debate night:
//   before Oct 6, 7 p.m. ET  -> countdown to the governor's debate
//   after the debate         -> countdown to Election Day (Nov 3)
//   after Election Day       -> renders nothing (and its spacer disappears)
// Dates come from src/data/didTheyAnswer.ts.

const DEBATE_TS = new Date(DEBATE_AT).getTime();
const ELECTION_TS = new Date(ELECTION_AT).getTime();

function parts(diff: number) {
  const d = Math.max(0, diff);
  return {
    days: Math.floor(d / 86_400_000),
    hours: Math.floor((d / 3_600_000) % 24),
    mins: Math.floor((d / 60_000) % 60),
  };
}

const AnnouncementBar = () => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  if (now >= ELECTION_TS) return null;

  const beforeDebate = now < DEBATE_TS;
  const t = parts((beforeDebate ? DEBATE_TS : ELECTION_TS) - now);
  const label = beforeDebate ? "Governor's debate · Oct 6" : "Election Day · Nov 3";
  const message = beforeDebate
    ? "We asked each candidate for governor public questions. See who answers."
    : "Compare the candidates' answers to our open letters before you vote.";

  return (
    // The spacer clears the fixed site header; it goes away with the bar.
    <div className="bg-liberation-dark pt-16 md:pt-20">
      <Link
        to="/did-they-answer"
        className="group block border-y border-liberation-gold/30 bg-liberation-gold/10 transition-colors hover:bg-liberation-gold/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-liberation-gold"
      >
        <div className="container mx-auto flex flex-col items-center justify-center gap-1.5 px-4 py-2.5 text-center md:flex-row md:gap-5">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-liberation-gold">
            {label}: {t.days}d {String(t.hours).padStart(2, "0")}h {String(t.mins).padStart(2, "0")}m
          </span>
          <span className="text-sm text-liberation-cream">
            {message}{" "}
            <span className="inline-flex items-center gap-1 font-semibold text-liberation-gold">
              Did They Answer?
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </span>
          </span>
        </div>
      </Link>
    </div>
  );
};

export default AnnouncementBar;
