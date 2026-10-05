import { Fragment, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "@/hooks/use-toast";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Check, ChevronDown, Copy, ExternalLink, Tv, Vote } from "lucide-react";
import {
  candidates,
  DEBATE_AT,
  DEBATE_ARTICLE_URL,
  ELECTION_AT,
  NON_ENDORSEMENT,
  VOTER_URL,
  WATCH_URL,
  type CandidateLetter,
  type LetterQuestion,
  type ResponseStatus,
} from "@/data/didTheyAnswer";

const DEBATE_TS = new Date(DEBATE_AT).getTime();
const ELECTION_TS = new Date(ELECTION_AT).getTime();

function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}

function split(diff: number) {
  const d = Math.max(0, diff);
  return {
    days: Math.floor(d / 86_400_000),
    hours: Math.floor((d / 3_600_000) % 24),
    mins: Math.floor((d / 60_000) % 60),
    secs: Math.floor((d / 1000) % 60),
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

function CountdownGroup({ label, diff }: { label: string; diff: number }) {
  const t = split(diff);
  const cells: Array<[string, string]> = [
    [String(t.days), "Days"],
    [pad(t.hours), "Hrs"],
    [pad(t.mins), "Min"],
    [pad(t.secs), "Sec"],
  ];
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
      <span className="text-[11px] font-semibold uppercase tracking-widest text-liberation-cream/70">{label}</span>
      <div className="flex gap-3 font-mono tabular-nums" aria-hidden="true">
        {cells.map(([value, unit]) => (
          <div key={unit} className="flex min-w-[2.25rem] flex-col items-center">
            <strong className="text-lg font-semibold leading-none text-liberation-gold">{value}</strong>
            <span className="mt-1 text-[9px] uppercase tracking-widest text-liberation-cream/50">{unit}</span>
          </div>
        ))}
      </div>
      <span className="sr-only">
        {t.days} days and {t.hours} hours remaining.
      </span>
    </div>
  );
}

function CountdownBar({ now }: { now: number }) {
  const debateDone = now >= DEBATE_TS;
  return (
    <div className="sticky top-16 z-40 border-b border-liberation-gold/20 bg-liberation-dark py-2.5 md:top-20">
      <div className="container mx-auto flex flex-col items-center justify-center gap-2 px-4 md:flex-row md:gap-8">
        {debateDone ? (
          <p className="text-sm text-liberation-cream/70">
            The debate has aired. Compare what was said with the questions below.
          </p>
        ) : (
          <CountdownGroup label="Governor's debate · Oct 6, 7 p.m. ET" diff={DEBATE_TS - now} />
        )}
        <div className="hidden h-8 w-px bg-liberation-cream/15 md:block" aria-hidden="true" />
        <CountdownGroup label="Election Day · Nov 3" diff={ELECTION_TS - now} />
      </div>
    </div>
  );
}

const STATUS_STYLE: Record<ResponseStatus, { label: string; cls: string }> = {
  no_response: { label: "No Response", cls: "border-liberation-red/40 bg-liberation-red/10 text-liberation-red" },
  pending: { label: "Letter Pending", cls: "border-amber-600/40 bg-amber-500/10 text-amber-700" },
  responded: { label: "Responded", cls: "border-liberation-green/40 bg-liberation-green/10 text-liberation-green" },
};

function daysBetween(from: number, to: number) {
  return Math.max(0, Math.floor((to - from) / 86_400_000));
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Detroit",
  });
}

function Pill({
  href,
  children,
  variant = "gold",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "gold" | "dark";
}) {
  const cls =
    variant === "gold"
      ? "bg-liberation-gold text-liberation-dark hover:bg-liberation-gold/90"
      : "border-2 border-liberation-gold bg-liberation-dark text-liberation-gold hover:bg-liberation-dark/80";
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex max-w-full items-center gap-2.5 rounded-full px-5 py-3 text-sm font-bold leading-tight shadow-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-liberation-dark ${cls}`}
    >
      {children}
      <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
    </a>
  );
}

const VoterPill = () => (
  <Pill href={VOTER_URL}>
    <Vote className="h-4 w-4 shrink-0" aria-hidden="true" />
    <span>Register to vote or find your polling place</span>
  </Pill>
);

const WatchPill = () => (
  <Pill href={WATCH_URL} variant="dark">
    <Tv className="h-4 w-4 shrink-0" aria-hidden="true" />
    <span>Watch the debate on WOOD TV8's YouTube</span>
  </Pill>
);

function CandidateCard({ c, now }: { c: CandidateLetter; now: number }) {
  const status = STATUS_STYLE[c.status];
  const sent = new Date(c.sentOn).getTime();
  const answered = c.questions.filter((q) => q.answer).length;
  const daysOut = daysBetween(sent, now);
  const deadlineTs = c.respondBy ? new Date(c.respondBy).getTime() : null;
  const dayCounter =
    c.status === "responded" && c.respondedOn
      ? `Responded ${formatDate(c.respondedOn)}`
      : `${daysOut} ${daysOut === 1 ? "day" : "days"} since letter`;
  const deadlineLine =
    deadlineTs === null
      ? null
      : deadlineTs > now
        ? `${daysBetween(now, deadlineTs)} days until the response deadline`
        : "Response deadline has passed";

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-200 p-6">
        <div>
          <p className="mb-1.5 text-xs font-bold uppercase tracking-widest text-liberation-gold">{c.partyLabel}</p>
          <h2 className="text-2xl font-bold text-gray-900">{c.name}</h2>
          <p className="text-sm text-gray-500">{c.office}</p>
        </div>
        <div className="text-center">
          <Badge
            variant="outline"
            className={`rounded-full border-2 px-3.5 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider ${status.cls}`}
          >
            {status.label}
          </Badge>
          <p className="mt-1.5 font-mono text-[11px] text-gray-500">{dayCounter}</p>
          {deadlineLine && <p className="font-mono text-[11px] text-gray-500">{deadlineLine}</p>}
        </div>
      </div>

      <dl className="grid gap-4 border-b border-gray-200 bg-gray-50 p-6 sm:grid-cols-3">
        <div>
          <dt className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Letter sent</dt>
          <dd className="mt-0.5 text-sm font-medium text-gray-900">{formatDate(c.sentOn)}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Response requested by</dt>
          <dd className="mt-0.5 text-sm font-medium text-gray-900">{c.respondBy ? formatDate(c.respondBy) : "No deadline set"}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Questions answered</dt>
          <dd className="mt-0.5 text-sm font-medium text-gray-900">
            {answered} of {c.questions.length}
          </dd>
        </div>
      </dl>

      <div className="p-6">
        <h3 className="mb-3 text-sm font-semibold text-gray-900">
          The {c.questions.length === 6 ? "six" : c.questions.length === 4 ? "four" : c.questions.length} questions asked
        </h3>
        <QuestionTable candidate={c} />

        <p className="mb-4 rounded-r-lg border-l-4 border-amber-600/70 bg-gray-50 px-4 py-2.5 text-[13px] text-gray-600">
          {c.note}
        </p>

        {c.status === "responded" && c.responseUrl && (
          <Button asChild className="mb-4 bg-liberation-green text-white hover:bg-liberation-green/90">
            <a href={c.responseUrl} target="_blank" rel="noopener noreferrer">
              Read the full, unedited response <ExternalLink className="ml-1.5 h-4 w-4" />
            </a>
          </Button>
        )}

        <Accordion type="single" collapsible>
          <AccordionItem value="letter" className="border-t border-dashed border-gray-300 border-b-0">
            <AccordionTrigger className="py-3 text-sm font-semibold text-liberation-gold hover:no-underline">
              Read the full letter
            </AccordionTrigger>
            <AccordionContent>
              <div className="max-w-prose space-y-3 text-sm text-gray-600">
                {c.letter.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
                <p className="font-medium text-gray-900">
                  {c.signoff.map((line, i) => (
                    <span key={line}>
                      {line}
                      {i < c.signoff.length - 1 && <br />}
                    </span>
                  ))}
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </article>
  );
}

async function copyQuestion(text: string) {
  try {
    await navigator.clipboard.writeText(`${text} #DidTheyAnswer`);
    toast({ title: "Copied", description: "The question is on your clipboard." });
  } catch {
    toast({
      title: "Copy blocked by this browser",
      description: "Select the question text and copy it manually.",
      variant: "destructive",
    });
  }
}

function AnswerStatus({ q }: { q: LetterQuestion }) {
  if (!q.answer) return <span className="text-gray-500">Awaiting answer</span>;
  return (
    <span className="font-semibold text-liberation-green">
      Answered {q.answer.where === "on_air" ? "on air" : "in writing"}
      {q.answer.note ? `: ${q.answer.note}` : ""}
      {q.answer.url && (
        <>
          {" "}
          <a href={q.answer.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
            Read it
          </a>
        </>
      )}
    </span>
  );
}

// Every question in a candidate's letter, worded exactly as sent. Rows expand
// to show the full question and a copy button for debate-night posting.
function QuestionTable({ candidate }: { candidate: CandidateLetter }) {
  const qs = candidate.questions;
  const [open, setOpen] = useState<Set<number>>(new Set());
  const allOpen = open.size === qs.length;

  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <div className="mb-5">
      <div className="mb-2 flex justify-end">
        <button
          type="button"
          onClick={() => setOpen(allOpen ? new Set() : new Set(qs.map((_, i) => i)))}
          className="text-xs font-semibold text-liberation-gold underline-offset-2 hover:underline"
        >
          {allOpen ? "Collapse all" : "Expand all"}
        </button>
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200">
        <table className="w-full border-collapse text-left text-sm">
          <caption className="sr-only">Questions in the open letter to {candidate.name}</caption>
          <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-500">
            <tr>
              <th scope="col" className="w-10 px-3 py-2.5">#</th>
              <th scope="col" className="px-3 py-2.5">Question</th>
              <th scope="col" className="hidden w-44 px-3 py-2.5 sm:table-cell">Status</th>
            </tr>
          </thead>
          <tbody>
            {qs.map((q, i) => {
              const isOpen = open.has(i);
              return (
                <Fragment key={q.topic}>
                  <tr className="border-t border-gray-200 align-top">
                    <td className="px-3 py-3 font-mono text-xs text-gray-500">{i + 1}</td>
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        onClick={() => toggle(i)}
                        aria-expanded={isOpen}
                        aria-controls={`q-${candidate.id}-${i}`}
                        className="flex w-full items-start justify-between gap-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-liberation-gold"
                      >
                        <span className="min-w-0">
                          <strong className="block text-gray-900">{q.topic}</strong>
                          {!isOpen && <span className="line-clamp-1 text-gray-600">{q.text}</span>}
                        </span>
                        <ChevronDown
                          className={`mt-0.5 h-4 w-4 shrink-0 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
                          aria-hidden="true"
                        />
                      </button>
                      <div className="mt-1 text-xs sm:hidden">
                        <AnswerStatus q={q} />
                      </div>
                    </td>
                    <td className="hidden px-3 py-3 text-xs sm:table-cell">
                      <AnswerStatus q={q} />
                    </td>
                  </tr>
                  {isOpen && (
                    <tr id={`q-${candidate.id}-${i}`} className="bg-gray-50">
                      <td />
                      <td colSpan={2} className="px-3 pb-4 pt-1">
                        <blockquote className="max-w-prose select-text text-[15px] text-gray-800">{q.text}</blockquote>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => copyQuestion(q.text)}
                          className="mt-3 rounded-full border-liberation-gold text-liberation-gold hover:bg-liberation-gold/10 hover:text-liberation-gold"
                        >
                          <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy question
                        </Button>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const DidTheyAnswer = () => {
  const now = useNow();
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation();

  const lettersSent = candidates.filter((c) => new Date(c.sentOn).getTime() <= now).length;
  const responses = candidates.filter((c) => c.status === "responded").length;
  const firstSent = Math.min(...candidates.map((c) => new Date(c.sentOn).getTime()));

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copied", description: "Share this page to keep the candidates accountable." });
    } catch {
      toast({ title: "Copy blocked by this browser", description: "Copy the address from your browser bar.", variant: "destructive" });
    }
  };

  return (
    <>
      <Helmet>
        <title>Did They Answer? | Liberation Caucus</title>
        <meta
          name="description"
          content="Tracking whether Michigan's candidates for governor have answered the Liberation Caucus's open letters on institutional racism, with a countdown to the October 6 debate and Election Day."
        />
      </Helmet>

      <Header />

      <main className="min-h-screen bg-white pt-16 md:pt-20">
        <CountdownBar now={now} />

        <section className="border-b border-gray-100 py-10 md:py-14">
          <div
            ref={heroRef}
            className={`container mx-auto max-w-4xl px-4 transition-all duration-700 ${
              heroVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-liberation-gold">
              Liberation Caucus · Accountability Tracker
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">Did They Answer?</h1>
            <p className="mt-4 max-w-2xl text-lg text-gray-600">
              The Liberation Caucus sent public, written questions on institutional racism to the candidates for
              Michigan governor. This page tracks whether each candidate has answered, in their own words.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <WatchPill />
              <VoterPill />
            </div>
            <p className="mt-3 max-w-xl text-xs text-gray-500">
              The first pill opens WOOD TV8's live stream of the debate on YouTube (Tuesday, October 6, 7 p.m. ET). The
              second opens the Michigan Department of State Voter Information Center to check your registration,
              register, find your polling place, or track an absentee ballot.
            </p>
            <p className="mt-8 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3.5 text-[13px] italic text-gray-600">
              {NON_ENDORSEMENT}
            </p>
          </div>
        </section>

        <section className="py-10">
          <div className="container mx-auto max-w-4xl px-4">
            <div className="flex flex-col gap-5 rounded-2xl bg-liberation-dark p-6 text-liberation-cream md:p-8">
              <p className="text-xs font-bold uppercase tracking-widest text-liberation-gold">
                Debate night · Tuesday, October 6
              </p>
              <h2 className="text-2xl font-bold text-liberation-cream md:text-3xl">
                Watch the debate, then check the record
              </h2>
              <p className="max-w-prose text-liberation-cream/75">
                Jocelyn Benson and John James debate live for one hour. Our open letters ask each candidate different
                questions, matched to their office and record. Expand any question below, copy it, and post it with
                #DidTheyAnswer while the debate airs to see who answers on air and who answers in writing.
              </p>
              <dl className="grid gap-4 sm:grid-cols-3">
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-liberation-cream/50">When</dt>
                  <dd className="text-sm font-medium">Tue, Oct 6 · 7 to 8 p.m. ET</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-liberation-cream/50">Where to watch</dt>
                  <dd className="text-sm font-medium">WOOD TV8, woodtv.com, and Nexstar stations statewide, including WLNS</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-liberation-cream/50">Announced topics</dt>
                  <dd className="text-sm font-medium">Technology, healthcare, immigration, the economy</dd>
                </div>
              </dl>
              <div className="flex flex-wrap items-center gap-3">
                <WatchPill />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copyLink}
                  className="rounded-full border-liberation-gold bg-transparent text-liberation-gold hover:bg-liberation-gold/15 hover:text-liberation-gold"
                >
                  <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy link to this page
                </Button>
                <a
                  href={DEBATE_ARTICLE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-liberation-gold underline-offset-2 hover:underline"
                >
                  Debate details from WOOD TV8 <ExternalLink className="ml-0.5 inline h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>
              <div>
                <VoterPill />
              </div>
              <p className="text-xs text-liberation-cream/60">
                The suggested tag #DidTheyAnswer is the Caucus's own and is not affiliated with the debate host.
                Election Day is November 3.
              </p>
            </div>
          </div>
        </section>

        <section className="pb-4">
          <div className="container mx-auto grid max-w-4xl grid-cols-1 gap-3 px-4 sm:grid-cols-3">
            {[
              { value: lettersSent, label: "Letters sent" },
              { value: responses, label: "Responses received" },
              { value: daysBetween(firstSent, now), label: "Days since first letter" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-gray-200 bg-white p-4 text-center">
                <strong className="block text-3xl font-semibold tabular-nums text-gray-900">{s.value}</strong>
                <span className="mt-1 block text-[11px] uppercase tracking-wider text-gray-500">{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="py-10">
          <div className="container mx-auto flex max-w-4xl flex-col gap-7 px-4">
            {candidates.map((c) => (
              <CandidateCard key={c.id} c={c} now={now} />
            ))}
          </div>
        </section>

        <section className="border-t border-gray-100 py-10">
          <div className="container mx-auto max-w-4xl space-y-4 px-4">
            <VoterPill />
            <p className="max-w-prose text-xs text-gray-500">
              The Liberation Caucus advances the political, community, and economic interests of Black people and people
              of the African diaspora through the dismantling of oppressive systems. Every candidate's response will be
              published in full and unedited.
            </p>
            <p className="max-w-prose text-xs italic text-gray-500">{NON_ENDORSEMENT}</p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default DidTheyAnswer;
