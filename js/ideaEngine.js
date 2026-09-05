// Content Idea Generator — engine
// Combines a niche/topic the user types with a library of proven,
// niche-agnostic content formats to produce concrete post ideas.

const IDEA_TEMPLATES = [
  {
    id: 'story-day-in-life',
    category: 'Relatable / Story',
    title: (n) => `A day in the life of someone learning ${n}`,
    hook: (n) => `POV: you're 3 weeks into ${n} and still confused`,
    why: 'Relatable content builds connection with other beginners going through the same thing you are.',
    tip: "Film in real time, don't over-plan — imperfection is what makes it relatable."
  },
  {
    id: 'myth-busting',
    category: 'Myth-Busting',
    title: (n) => `3 myths about ${n} that aren't true`,
    hook: (n) => `Everyone told me this about ${n}... they were wrong`,
    why: 'Myth-busting content triggers curiosity and gets saved or shared as a reference.',
    tip: 'Pick myths you genuinely believed yourself — it reads as more convincing.'
  },
  {
    id: 'zero-experience-tutorial',
    category: 'Tutorial',
    title: (n) => `How to start ${n} with zero experience`,
    hook: (n) => `Here's exactly how I started ${n} from nothing`,
    why: 'Beginner tutorials rank well in search and get saved as a reference.',
    tip: "Show the very first step, not step five — beginners skip content that assumes too much."
  },
  {
    id: 'wish-i-knew',
    category: 'Listicle',
    title: (n) => `5 things I wish I knew before starting ${n}`,
    hook: (n) => `Nobody tells you these 5 things about ${n}`,
    why: 'Numbered lists are an easy promise, and easy to watch or read all the way through.',
    tip: 'Put your strongest point first and last — those are the ones people remember.'
  },
  {
    id: '7-day-challenge',
    category: 'Challenge',
    title: (n) => `I tried ${n} for 7 days straight — here's what happened`,
    hook: (n) => `I gave ${n} 7 days. Here's the result.`,
    why: 'Challenge and experiment formats create a built-in story arc with a payoff.',
    tip: 'Post daily updates as short clips, then a recap — one idea becomes a week of content.'
  },
  {
    id: 'first-attempt-reaction',
    category: 'Reaction',
    title: (n) => `Reacting to my first attempt at ${n}`,
    hook: (n) => `Watching my first ${n} attempt back... painful`,
    why: 'Self-reaction content is inherently funny or relatable, and shows real progress.',
    tip: "Don't edit out the cringe — that's the part people actually connect with."
  },
  {
    id: 'before-after',
    category: 'Before / After',
    title: (n) => `My ${n} progress: before vs. after`,
    hook: (n) => `This is what 30 days of ${n} actually looks like`,
    why: 'Transformation content has a built-in visual payoff that stops the scroll.',
    tip: "Film the 'before' on day one even if you don't feel ready — you'll want the footage later."
  },
  {
    id: 'faq-top-question',
    category: 'Q&A',
    title: (n) => `Answering the #1 question beginners ask about ${n}`,
    hook: (n) => `The question everyone asks me about ${n}`,
    why: 'Answering real questions positions you as helpful and makes the content searchable.',
    tip: 'Pull the question from an actual comment or DM — it feels more authentic than a made-up one.'
  },
  {
    id: 'behind-the-scenes',
    category: 'Behind the Scenes',
    title: (n) => `What nobody shows you about ${n}`,
    hook: (n) => `The unfiltered, behind-the-scenes side of ${n}`,
    why: 'Behind-the-scenes content builds trust because it feels unpolished and honest.',
    tip: 'Film the messy setup and the mistakes, not just the final result.'
  },
  {
    id: 'trend-jack',
    category: 'Trend-Jack',
    title: (n) => `Using a trending sound or format to talk about ${n}`,
    hook: (n) => `[Trending audio] but make it ${n}`,
    why: 'Trending formats borrow existing momentum and reach for free.',
    tip: "Check your app's Discover/For You page right before filming — trends move fast."
  },
  {
    id: 'beginner-vs-expert',
    category: 'Comparison',
    title: (n) => `${n} beginner vs. ${n} expert — the difference`,
    hook: (n) => `Beginner ${n} vs. after 6 months`,
    why: 'Comparisons make progress and skill visible in a single clip.',
    tip: "Keep both examples short and back-to-back — don't make people wait for the payoff."
  },
  {
    id: 'biggest-mistake',
    category: 'Mistake-Focused',
    title: (n) => `The biggest mistake beginners make in ${n}`,
    hook: (n) => `Stop doing this if you're new to ${n}`,
    why: 'Mistake-focused content taps into fear of doing it wrong, which drives high engagement.',
    tip: "Name ONE mistake per video, not five — a single focus keeps it shareable."
  },
  {
    id: 'budget-start',
    category: 'Budget',
    title: (n) => `Getting started in ${n} on a budget`,
    hook: (n) => `You don't need to spend a lot to start ${n}`,
    why: 'Budget content removes a common excuse and appeals to a wide audience.',
    tip: "Give exact numbers or prices — vague 'affordable' claims don't convert viewers."
  },
  {
    id: 'almost-quit',
    category: 'Storytime',
    title: (n) => `Why I started ${n} (and almost quit)`,
    hook: (n) => `I almost quit ${n} after week one. Here's why I didn't.`,
    why: 'Origin stories with a low point create emotional investment in your journey.',
    tip: "Be specific about the low point — vague struggle stories don't land."
  },
  {
    id: 'save-this-tips',
    category: 'Tips Dump',
    title: (n) => `Quick tips for anyone starting ${n} this week`,
    hook: (n) => `Save this if you're starting ${n}`,
    why: "'Save this' framing directly boosts the save metric platforms reward in the algorithm.",
    tip: 'Literally say "save this for later" out loud in the video — it works.'
  },
  {
    id: 'standard-advice-fail',
    category: 'Contrarian',
    title: (n) => `Common ${n} advice that didn't work for me`,
    hook: (n) => `I tried the 'standard' ${n} advice. It didn't work.`,
    why: 'Contrarian takes on common advice spark comments and debate.',
    tip: "Explain what DID work instead — don't just complain."
  },
  {
    id: 'no-fluff-gear',
    category: 'Tools / Gear',
    title: (n) => `What you actually need to start ${n}`,
    hook: (n) => `Everything I actually use for ${n} (no fluff)`,
    why: 'Gear and tool round-ups are highly searched and saved as reference.',
    tip: 'Mention 3-5 items max — overwhelming lists get skipped past.'
  },
  {
    id: 'full-process',
    category: 'Process / Time-lapse',
    title: (n) => `The full process of ${n}, start to finish`,
    hook: (n) => `Watch the entire ${n} process in under a minute`,
    why: 'Process videos are satisfying to watch and easy to loop.',
    tip: 'Speed up the boring parts, but keep the key moment at real speed.'
  },
  {
    id: 'community-question',
    category: 'Community',
    title: (n) => `I asked other ${n} beginners this — here's what they said`,
    hook: (n) => `I asked 10 people new to ${n} this one question`,
    why: 'Crowdsourced content feels bigger than a solo opinion and invites more responses.',
    tip: 'Post the question as a poll or story first to actually collect real answers.'
  },
  {
    id: 'glow-up',
    category: 'Progress',
    title: (n) => `My ${n} glow-up over time`,
    hook: (n) => `How much I've improved at ${n} since starting`,
    why: 'Visible growth over time is motivating and inspires others to start.',
    tip: 'Keep a simple log from day one (even just phone notes) — you will want the material later.'
  },
  {
    id: 'explain-simply',
    category: 'Explainer',
    title: (n) => `${n}, explained like you're five`,
    hook: (n) => `${n}, explained simply`,
    why: 'Simplified explainer content is highly saveable and shareable to friends who are also curious.',
    tip: 'Use one strong analogy, not three — one comparison that sticks beats several that don\'t.'
  },
  {
    id: 'unpopular-opinion',
    category: 'Controversial (mild)',
    title: (n) => `An unpopular opinion about ${n}`,
    hook: (n) => `Unpopular ${n} opinion, don't hate me`,
    why: 'Mild controversy reliably drives comments, which boosts reach.',
    tip: 'Keep it genuinely mild — real controversy invites the wrong kind of attention.'
  },
  {
    id: 'weekly-routine',
    category: 'Routine',
    title: (n) => `My weekly ${n} routine as a beginner`,
    hook: (n) => `Here's my actual ${n} routine right now`,
    why: 'Routine content is aspirational and easy for others to copy or compare to their own.',
    tip: 'Be honest about the boring or inconsistent parts — it reads as more relatable than a "perfect" routine.'
  },
  {
    id: 'real-cost',
    category: 'Cost Breakdown',
    title: (n) => `What I've actually spent on ${n} so far`,
    hook: (n) => `The real cost of getting into ${n}`,
    why: 'Real numbers are inherently interesting and get saved and shared often.',
    tip: 'Break it into categories instead of one lump sum — it is easier to follow.'
  },
  {
    id: 'first-impression',
    category: 'First Impressions',
    title: (n) => `My honest first impression of ${n}`,
    hook: (n) => `My unfiltered first impression of ${n}`,
    why: 'Honest, unpolished first-take content feels authentic in a way scripted content does not.',
    tip: 'Film it the literal first time you try something — a first impression cannot be faked later.'
  },
  {
    id: 'two-methods',
    category: 'Method Comparison',
    title: (n) => `Two ways to approach ${n} — which is better?`,
    hook: (n) => `I tried two different ways to do ${n}`,
    why: 'Side-by-side comparisons give viewers a clear, useful takeaway.',
    tip: 'Pick a clear winner by the end — do not leave it ambiguous.'
  },
  {
    id: 'roast-my-attempt',
    category: 'Ask for Feedback',
    title: (n) => `Beginner in ${n} — what am I doing wrong?`,
    hook: (n) => `Roast my ${n} attempt, I need the feedback`,
    why: 'Inviting feedback drives comments and makes your audience feel involved in your growth.',
    tip: 'Actually respond to the advice in a follow-up video — it turns one video into two.'
  },
  {
    id: 'month-recap',
    category: 'Recap',
    title: (n) => `1 month of ${n}: what changed`,
    hook: (n) => `30 days of ${n}, here's the recap`,
    why: 'Recap content is a natural, low-effort way to reuse footage you already have.',
    tip: 'Pull old footage or photos from earlier in the month — you likely already have it.'
  },
  {
    id: 'full-faq',
    category: 'FAQ',
    title: (n) => `Answering everything people ask me about ${n}`,
    hook: (n) => `FAQ: everything about ${n} in one video`,
    why: 'FAQ-style content is highly searchable and works well as a pinned or reference post.',
    tip: 'Pull questions from your actual comments — do not guess at what people want to know.'
  },
  {
    id: 'realistic-expectations',
    category: 'Expectations',
    title: (n) => `What to actually expect when you start ${n}`,
    hook: (n) => `What nobody tells you to expect from ${n}`,
    why: 'Setting realistic expectations builds trust and avoids an "this influencer lied to me" backlash.',
    tip: 'Be specific about timelines — "it took me 3 weeks to see X" is more useful than vague encouragement.'
  }
];

function shuffle(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateIdeas(niche, count = 8, excludeIds = []) {
  const clean = niche.trim();
  if (!clean) return [];

  let pool = IDEA_TEMPLATES.filter((t) => !excludeIds.includes(t.id));
  if (pool.length < count) pool = IDEA_TEMPLATES.slice();

  const picked = shuffle(pool).slice(0, count);

  return picked.map((t) => ({
    id: t.id,
    category: t.category,
    title: t.title(clean),
    hook: t.hook(clean),
    why: t.why,
    tip: t.tip,
    niche: clean
  }));
}

window.IdeaEngine = { generateIdeas, IDEA_TEMPLATES };
