// Data for the "Did They Answer?" tracker (src/pages/DidTheyAnswer.tsx).
//
// To update the page, edit this file only:
//   - A candidate responds: set `status` to "responded", fill `respondedOn`
//     and `responseUrl`, and mark each question's `answer` (see below).
//   - Only mark a question answered if the candidate actually answered it.
//     Leave `answer` undefined to show "Awaiting answer".
// All dates are ISO strings with an explicit UTC offset (Michigan is
// UTC-04:00 until Nov 1, 2026, then UTC-05:00).

export type ResponseStatus = "no_response" | "pending" | "responded";

export interface QuestionAnswer {
  where: "written" | "on_air";
  note?: string;
  url?: string;
}

export interface LetterQuestion {
  topic: string;
  text: string;
  answer?: QuestionAnswer;
}

export interface CandidateLetter {
  id: string;
  name: string;
  office: string;
  partyLabel: string;
  sentOn: string;
  respondBy?: string;
  status: ResponseStatus;
  respondedOn?: string;
  responseUrl?: string;
  subject: string;
  note: string;
  questions: LetterQuestion[];
  letter: string[];
  signoff: string[];
}

export const DEBATE_AT = "2026-10-06T19:00:00-04:00";
export const ELECTION_AT = "2026-11-03T00:00:00-05:00";

export const VOTER_URL = "https://mvic.sos.state.mi.us/";
export const DEBATE_ARTICLE_URL = "https://www.woodtv.com/news/elections/governor-candidates-to-debate-at-wood-tv8/";
// Public Google Drive folder with the social graphics (one per question, in
// X, Facebook and Instagram sizes). Its sharing must be "Anyone with the link".
export const CARDS_URL = "https://drive.google.com/drive/folders/1DGX2thpfkyrOWq74vtanHgZSKxA_YSsl";
// Direct link to WOOD TV8's "Michigan gubernatorial debate" live stream on
// YouTube (Tue, Oct 6, 2026, 7 p.m. ET). Confirmed Oct 4, 2026.
export const WATCH_URL = "https://www.youtube.com/live/-EPDHDaW_5s";

export const NON_ENDORSEMENT =
  "The Liberation Caucus is a non-partisan, non-profit organization and does not endorse or oppose any candidate for public office. This page reports on public correspondence and public response only.";

export const candidates: CandidateLetter[] = [
  {
    id: "benson",
    name: "Jocelyn Benson",
    office: "Michigan Secretary of State",
    partyLabel: "Democratic nominee for governor",
    sentOn: "2026-09-15T00:00:00-04:00",
    status: "no_response",
    subject: "Institutional racism at the Michigan Department of State",
    note:
      "Since January 2026, four current and former MDOS employees have filed lawsuits alleging a pattern of racial discrimination under Michigan's Elliott-Larsen Civil Rights Act.",
    questions: [
      {
        topic: "Root causes",
        text: "What systemic failures, traditions, or culture enabled racial discrimination at the MDOS?",
      },
      {
        topic: "Task force",
        text: "What is the status of the MDOS Race and Equity Task Force?",
      },
      {
        topic: "Investigation",
        text: "Will an independent external investigation be commissioned into the allegations against the MDOS?",
      },
      {
        topic: "Timeline",
        text: "What does meaningful institutional change look like? What is your timeline for execution?",
      },
    ],
    letter: [
      "September 15, 2026",
      "Dear Jocelyn,",
      "Congratulations on your democratic nomination for governor of the State of Michigan. Your leadership has gained the endorsement of the Michigan Democratic Party Black Caucus, the Michigan Black Mayors Association, and now the Michigan Democratic Party to be the next chief executive officer of our state. Godspeed; you are no stranger to the critical waters our state navigates. These endorsements are earned. You're leading the defense of our election process and access to democracy for all. You are recognized nationally for this core premise: democratic institutions only work if the people running them are held accountable to the people they serve.",
      "Michigan's institutions are eating this culture and the attitude for systematic change for breakfast. Since January 2026, four current and former employees of the Michigan Department of State have filed lawsuits alleging a pattern of racial discrimination under the Elliott-Larsen Civil Rights Act. This is not about one department. It is a test case for Michigan's appetite for substantive change and how it addresses systemic exclusion of Black workers and Black labor in state government. Your vision as governor extends to every Black and Brown worker in Michigan. Right now, Michigan has one of the highest unemployment rates for Black workers in the country. Over 400,000 Black women have lost federal jobs due to sharp institutional racism steered by white nationalists leading the White House. The greatest endorsement allows You, to meet Us, at a moment when we must address economic injustice directly.",
      "In your own voice, Black Michigan needs a direct, personal account and commitment to dismantling institutional racism in Michigan. Core to this pledge is breaking the economic oppression and exclusion of Black workers in state contracting and employment. Michigan's institutions do not organically have this language; these bodies can only use the terms given by the policies that created them. This racism shines when routed through communications staff.",
      "You have the power and agency right now to commit to the long road to dismantling systemic oppression through coalition, discovery, and transparency. Black workers have raised their voices, identifying the pattern and practice of institutional racism in the workplace. The institution's response reeks of cold racism, ignoring the string of separation agreements and administrative suggestions for reform. I'm inviting your voice to define what meaningful institutional change looks like and a timeline for execution. Please share your vision and statements on these questions:",
      "• What systemic failures, traditions, or culture enabled racial discrimination at the MDOS?",
      "• What is the status of the MDOS Race and Equity Task Force?",
      "• Will an independent external investigation be commissioned into the allegations against the MDOS?",
      "• What does meaningful institutional change look like? What is your timeline for execution?",
      "The anxiety around the future of work is real. Currently, a person's proximity to whiteness can determine their ability to work, vote, and live in this country. Centering Black workers in reconciling and correcting systemic injustice holds institutions accountable. Protecting every worker's ability to show up, be paid fairly, and report abuse without fear of retaliation.",
      "Michigan's rising Black unemployment reflects one of the nation's highest Black-white unemployment disparities. Our state must actively work to close this gap as a core part of its fiscal strategy. Every Michigander who moves from unemployment to well-paid work is good. I believe in full employment in Michigan. Black workers demand and desire full employment for all. Full employment confirms Michigan's commitment to a robust economy.",
      "Ideally, you'll assume the executive office of one of the world's most agile economies with policy tools to make full employment a reality. The Improved Workforce Opportunity Wage and Earned Sick Time Acts are pro-worker benchmarks. Good trouble is necessary now. Protecting worker rights requires stronger coordination between the Department of Labor and Economic Opportunity and the Michigan Department of Civil Rights. These few steps help Michigan be an accountable government to the people and all employees who work for it.",
      "In the fold for the long run,",
    ],
    signoff: ["Brandon A. Jessup", "Liberation Caucus"],
  },
  {
    id: "james",
    name: "John James",
    office: "U.S. Representative, Michigan's 10th District",
    partyLabel: "Republican candidate for governor",
    sentOn: "2026-09-30T00:00:00-04:00",
    respondBy: "2026-10-09T23:59:00-04:00",
    status: "no_response",
    subject: "Six public questions on institutional racism",
    note:
      "A parallel inquiry was sent to Secretary Jocelyn Benson on September 15, 2026. Every response will be published in full and unedited.",
    questions: [
      {
        topic: "Reparations",
        text: "Do you support reparations for Black Michiganders? Specifically, do you support the lineage restrictions in House Bill 6111-6113, introduced by Donavan McKinney? Will you sign similar legislation as Governor?",
      },
      {
        topic: "Full employment",
        text: "Will you commit to a published, numeric target for closing the employment gap between Black workers and the rest of Michigan?",
      },
      {
        topic: "Healthcare",
        text: "As Congressman, you voted for the One Big Beautiful Bill Act, quoted as \"...the One Big Beautiful bill restores fiscal responsibility to Washington while safeguarding vital programs like Social Security, Medicare, and Medicaid..\" Will you protect or roll back Michigan's Medicaid expansion as Governor?",
      },
      {
        topic: "Voting rights",
        text: "Will you support restoring the Voting Rights Act protections lost after Shelby County v Holder before leaving Congress in 2026? As governor, will you oppose any barriers to voting in Michigan, specifically in majority-Black communities?",
      },
      {
        topic: "Freedom of speech",
        text: "You voted in support of the resolution honoring Charlie Kirk; would you protect the right of Black workers, students, educators, and organizers to protest, teach Black history, and criticize government without retaliation?",
      },
      {
        topic: "Cost of living",
        text: "You've voted to continue the U.S. incursion in Iran multiple times. How will you protect the income of Black working families and businesses that are paying the price for your decision at the pump?",
      },
    ],
    letter: [
      "September 30, 2026",
      "Dear John,",
      "The Liberation Caucus is a non-partisan, non-profit organization advancing the political, communal, and economic interests of Black people and the African diaspora. I'm writing you on behalf of the organization with public questions regarding institutional racism and dismantling oppressive systems in Michigan. The caucus sent a similar inquiry to Jocelyn Benson on September 15, 2026.",
      "If elected, you would be Michigan's first Black governor. This sends a powerful signal of radical institutional change in Michigan. With this historic possibility in sight, your candidacy without scrutiny creates a fallacy of political power and agency for Michigan's Black community. Black liberation is built on communion, persistence, and equity. Your ascension cannot be leveraged in exchange for tasteless incremental change that our voices have substantially voted against.",
      "Liberation Caucus identifies institutional racism as the traditions, policies, and practices that produce racially unequal outcomes, whether intended or unintended. The Liberation Caucus asks these six questions as a second attempt to understand how you would use the power of Michigan's agencies, appointments, budget, and enforcement as governor.",
      "1. Reparations: Do you support reparations for Black Michiganders? Specifically, do you support the lineage restrictions in House Bill 6111-6113, introduced by Donavan McKinney? Will you sign similar legislation as Governor?",
      "2. Full employment for Black workers: Will you commit to a published, numeric target for closing the employment gap between Black workers and the rest of Michigan?",
      "3. Healthcare: As Congressman, you voted for the One Big Beautiful Bill Act, quoted as \"...the One Big Beautiful bill restores fiscal responsibility to Washington while safeguarding vital programs like Social Security, Medicare, and Medicaid..\" Will you protect or roll back Michigan's Medicaid expansion as Governor?",
      "4. Voting rights: Will you support restoring the Voting Rights Act protections lost after Shelby County v Holder before leaving Congress in 2026? As governor, will you oppose any barriers to voting in Michigan, specifically in majority-Black communities?",
      "5. Freedom of Speech: You voted in support of the resolution honoring Charlie Kirk; would you protect the right of Black workers, students, educators, and organizers to protest, teach Black history, and criticize government without retaliation?",
      "6. Cost of Living: You've voted to continue the U.S. incursion in Iran multiple times. How will you protect the income of Black working families and businesses that are paying the price for your decision at the pump?",
      "Please respond in writing by October 9th, 2026. We will publish your response in full and unedited, alongside every other candidate's. I welcome you to a public community forum on these questions for authentic, direct engagement with the people, not only the selected press.",
      "In the fold for the long run,",
    ],
    signoff: ["Brandon A. Jessup", "Liberation Caucus"],
  },
];
