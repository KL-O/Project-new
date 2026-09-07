// Content Idea Generator — engine
// Combines a niche/topic the user types with a library of proven,
// niche-agnostic content formats to produce concrete post ideas.

const IDEA_TEMPLATES = [
  {
    id: 'story-day-in-life',
    category: 'Relatable / Story',
    title: (n) => `A day in the life of someone learning ${n}`,
    hook: (n) => `3 weeks into ${n} and still googling the basics`,
    why: 'People trying to learn the same thing you are will watch because it\'s them, not you.',
    tip: "Film in real time, don't over-plan — imperfection is what makes it relatable."
  },
  {
    id: 'myth-busting',
    category: 'Myth-Busting',
    title: (n) => `3 myths about ${n} that aren't true`,
    hook: (n) => `I believed this about ${n} for way too long`,
    why: 'Debunking something people assume is true gets saved — it feels like useful ammo.',
    tip: 'Pick myths you genuinely believed yourself — it reads as more convincing.'
  },
  {
    id: 'zero-experience-tutorial',
    category: 'Tutorial',
    title: (n) => `How to start ${n} with zero experience`,
    hook: (n) => `How I actually started ${n} with literally zero experience`,
    why: 'It ranks in search and gets saved — the video people wish existed when they started.',
    tip: "Show the very first step, not step five — beginners skip content that assumes too much."
  },
  {
    id: 'wish-i-knew',
    category: 'Listicle',
    title: (n) => `5 things I wish I knew before starting ${n}`,
    hook: (n) => `5 things about ${n} I had to learn the hard way`,
    why: 'A clean number and a clear promise — people finish it just to see if they already know the list.',
    tip: 'Put your strongest point first and last — those are the ones people remember.'
  },
  {
    id: '7-day-challenge',
    category: 'Challenge',
    title: (n) => `I tried ${n} for 7 days straight — here's what happened`,
    hook: (n) => `7 days of ${n}. No skipping.`,
    why: 'Built-in cliffhanger — day one hooks people, the recap is the payoff.',
    tip: 'Post daily updates as short clips, then a recap — one idea becomes a week of content.'
  },
  {
    id: 'first-attempt-reaction',
    category: 'Reaction',
    title: (n) => `Reacting to my first attempt at ${n}`,
    hook: (n) => `Reacting to my first ever attempt at ${n}`,
    why: 'Watching someone laugh at their past self is funny and weirdly motivating at the same time.',
    tip: "Don't edit out the cringe — that's the part people actually connect with."
  },
  {
    id: 'before-after',
    category: 'Before / After',
    title: (n) => `My ${n} progress: before vs. after`,
    hook: (n) => `30 days of ${n} — before and after`,
    why: 'The visual payoff does the work for you; nobody scrolls past a real transformation.',
    tip: "Film the 'before' on day one even if you don't feel ready — you'll want the footage later."
  },
  {
    id: 'faq-top-question',
    category: 'Q&A',
    title: (n) => `Answering the #1 question beginners ask about ${n}`,
    hook: (n) => `The one question I get asked about ${n} more than any other`,
    why: 'You\'re answering something real, which is why it reads as helpful instead of content for content\'s sake.',
    tip: 'Pull the question from an actual comment or DM — it feels more authentic than a made-up one.'
  },
  {
    id: 'behind-the-scenes',
    category: 'Behind the Scenes',
    title: (n) => `What nobody shows you about ${n}`,
    hook: (n) => `What ${n} actually looks like behind the camera`,
    why: 'Messy and unpolished reads as honest — that\'s rarer than it should be.',
    tip: 'Film the messy setup and the mistakes, not just the final result.'
  },
  {
    id: 'trend-jack',
    category: 'Trend-Jack',
    title: (n) => `Using a trending sound or format to talk about ${n}`,
    hook: (n) => `Using this week's trending sound to talk about ${n}`,
    why: 'Borrowed reach — the algorithm is already pushing the format, you\'re just riding it.',
    tip: "Check your app's Discover/For You page right before filming — trends move fast."
  },
  {
    id: 'beginner-vs-expert',
    category: 'Comparison',
    title: (n) => `${n} beginner vs. ${n} expert — the difference`,
    hook: (n) => `${n} on day one vs. six months in`,
    why: 'Side by side, the gap speaks for itself — no explaining required.',
    tip: "Keep both examples short and back-to-back — don't make people wait for the payoff."
  },
  {
    id: 'biggest-mistake',
    category: 'Mistake-Focused',
    title: (n) => `The biggest mistake beginners make in ${n}`,
    hook: (n) => `The mistake almost every ${n} beginner makes`,
    why: 'Fear of doing it wrong is a stronger pull than curiosity about doing it right.',
    tip: "Name ONE mistake per video, not five — a single focus keeps it shareable."
  },
  {
    id: 'budget-start',
    category: 'Budget',
    title: (n) => `Getting started in ${n} on a budget`,
    hook: (n) => `How to start ${n} without spending much at all`,
    why: 'It removes the excuse people use to never begin, which is exactly why they watch.',
    tip: "Give exact numbers or prices — vague 'affordable' claims don't convert viewers."
  },
  {
    id: 'almost-quit',
    category: 'Storytime',
    title: (n) => `Why I started ${n} (and almost quit)`,
    hook: (n) => `I almost gave up on ${n} in week one — here's what changed`,
    why: 'A low point people can picture themselves in makes the rest of the story land.',
    tip: "Be specific about the low point — vague struggle stories don't land."
  },
  {
    id: 'save-this-tips',
    category: 'Tips Dump',
    title: (n) => `Quick tips for anyone starting ${n} this week`,
    hook: (n) => `Bookmark this before you start ${n}`,
    why: 'Saying "save this" out loud is a cheat code — it directly nudges the metric the algorithm rewards.',
    tip: 'Literally say "save this for later" out loud in the video — it works.'
  },
  {
    id: 'standard-advice-fail',
    category: 'Contrarian',
    title: (n) => `Common ${n} advice that didn't work for me`,
    hook: (n) => `The "normal" advice for ${n} didn't work for me at all`,
    why: 'Disagreeing with common advice invites people to argue with you in the comments — that\'s the point.',
    tip: "Explain what DID work instead — don't just complain."
  },
  {
    id: 'no-fluff-gear',
    category: 'Tools / Gear',
    title: (n) => `What you actually need to start ${n}`,
    hook: (n) => `What I actually use for ${n} — no sponsored fluff`,
    why: 'People searching for gear recommendations save these to come back to later.',
    tip: 'Mention 3-5 items max — overwhelming lists get skipped past.'
  },
  {
    id: 'full-process',
    category: 'Process / Time-lapse',
    title: (n) => `The full process of ${n}, start to finish`,
    hook: (n) => `The whole ${n} process, sped up to under a minute`,
    why: 'Satisfying to watch start to finish, and short enough that people rewatch it.',
    tip: 'Speed up the boring parts, but keep the key moment at real speed.'
  },
  {
    id: 'community-question',
    category: 'Community',
    title: (n) => `I asked other ${n} beginners this — here's what they said`,
    hook: (n) => `I asked 10 other ${n} beginners the same question`,
    why: 'One opinion is content. Ten opinions is a discussion people want to weigh in on.',
    tip: 'Post the question as a poll or story first to actually collect real answers.'
  },
  {
    id: 'glow-up',
    category: 'Progress',
    title: (n) => `My ${n} glow-up over time`,
    hook: (n) => `My ${n} glow-up, start to now`,
    why: 'Visible progress is the most reliable motivator there is — it makes people believe they can do it too.',
    tip: 'Keep a simple log from day one (even just phone notes) — you will want the material later.'
  },
  {
    id: 'explain-simply',
    category: 'Explainer',
    title: (n) => `${n}, explained like you're five`,
    hook: (n) => `${n}, explained the way I wish someone had explained it to me`,
    why: 'Simple, clear explanations get shared to the one friend who\'s been asking about this exact thing.',
    tip: 'Use one strong analogy, not three — one comparison that sticks beats several that don\'t.'
  },
  {
    id: 'unpopular-opinion',
    category: 'Controversial (mild)',
    title: (n) => `An unpopular opinion about ${n}`,
    hook: (n) => `Unpopular opinion about ${n} — go ahead and argue with me`,
    why: 'A little friction in the comments is free reach — just keep it mild enough not to backfire.',
    tip: 'Keep it genuinely mild — real controversy invites the wrong kind of attention.'
  },
  {
    id: 'weekly-routine',
    category: 'Routine',
    title: (n) => `My weekly ${n} routine as a beginner`,
    hook: (n) => `My actual weekly ${n} routine, not the aspirational version`,
    why: 'People compare it to their own — the honest, imperfect version is the one that gets saved.',
    tip: 'Be honest about the boring or inconsistent parts — it reads as more relatable than a "perfect" routine.'
  },
  {
    id: 'real-cost',
    category: 'Cost Breakdown',
    title: (n) => `What I've actually spent on ${n} so far`,
    hook: (n) => `What I've really spent on ${n} so far`,
    why: 'Real numbers are just interesting, and people share them because they\'re rarely told the truth.',
    tip: 'Break it into categories instead of one lump sum — it is easier to follow.'
  },
  {
    id: 'first-impression',
    category: 'First Impressions',
    title: (n) => `My honest first impression of ${n}`,
    hook: (n) => `My honest, no-filter first impression of ${n}`,
    why: 'You can\'t fake a first impression later, which is exactly why it feels believable.',
    tip: 'Film it the literal first time you try something — a first impression cannot be faked later.'
  },
  {
    id: 'two-methods',
    category: 'Method Comparison',
    title: (n) => `Two ways to approach ${n} — which is better?`,
    hook: (n) => `Two ways to do ${n} — I tried both so you don't have to`,
    why: 'A clear side-by-side with a winner gives people something to actually use, not just watch.',
    tip: 'Pick a clear winner by the end — do not leave it ambiguous.'
  },
  {
    id: 'roast-my-attempt',
    category: 'Ask for Feedback',
    title: (n) => `Beginner in ${n} — what am I doing wrong?`,
    hook: (n) => `Roast my ${n} attempt — I can take it`,
    why: 'Inviting criticism makes people feel like they\'re coaching you, not just watching you.',
    tip: 'Actually respond to the advice in a follow-up video — it turns one video into two.'
  },
  {
    id: 'month-recap',
    category: 'Recap',
    title: (n) => `1 month of ${n}: what changed`,
    hook: (n) => `One month into ${n} — what actually changed`,
    why: 'Low effort to make since you\'re reusing footage, and recaps consistently outperform single updates.',
    tip: 'Pull old footage or photos from earlier in the month — you likely already have it.'
  },
  {
    id: 'full-faq',
    category: 'FAQ',
    title: (n) => `Answering everything people ask me about ${n}`,
    hook: (n) => `Answering every ${n} question I've ever gotten, in one video`,
    why: 'It\'s the video you can point people to instead of answering the same DM for the tenth time.',
    tip: 'Pull questions from your actual comments — do not guess at what people want to know.'
  },
  {
    id: 'realistic-expectations',
    category: 'Expectations',
    title: (n) => `What to actually expect when you start ${n}`,
    hook: (n) => `What nobody tells you to actually expect from ${n}`,
    why: 'Setting honest expectations builds more trust than hype ever will.',
    tip: 'Be specific about timelines — "it took me 3 weeks to see X" is more useful than vague encouragement.'
  }
];

// Maps a "vibe/tone" style category to the template ids that fit it best.
// Used to bias which templates get picked when the user fills in their
// personal style profile, instead of pure random selection.
const TONE_MAP = {
  funny: ['first-attempt-reaction', 'unpopular-opinion', 'standard-advice-fail', 'roast-my-attempt', 'myth-busting'],
  motivational: ['almost-quit', 'glow-up', 'month-recap', 'realistic-expectations', 'wish-i-knew'],
  calm: ['zero-experience-tutorial', 'full-faq', 'explain-simply', 'no-fluff-gear', 'budget-start'],
  edgy: ['unpopular-opinion', 'standard-advice-fail', 'biggest-mistake', 'first-impression'],
  wholesome: ['story-day-in-life', 'behind-the-scenes', 'community-question', 'weekly-routine'],
  energetic: ['7-day-challenge', 'trend-jack', 'full-process', 'two-methods']
};

const TONE_KEYWORDS = {
  funny: ['funny', 'sarcastic', 'humor', 'comedic', 'witty', 'silly', 'goofy'],
  motivational: ['motivational', 'inspiring', 'inspire', 'uplifting', 'encourag'],
  calm: ['calm', 'informative', 'educational', 'chill', 'relaxed', 'soft-spoken'],
  edgy: ['edgy', 'bold', 'blunt', 'controversial', 'no-filter', 'unfiltered'],
  wholesome: ['wholesome', 'relatable', 'heartfelt', 'genuine', 'friendly'],
  energetic: ['energetic', 'hype', 'high energy', 'excited', 'fast-paced', 'upbeat']
};

function idsMatchingStyleText(styleText) {
  const lower = styleText.toLowerCase();
  const matchedIds = new Set();
  for (const [tone, keywords] of Object.entries(TONE_KEYWORDS)) {
    if (keywords.some((k) => lower.includes(k))) {
      TONE_MAP[tone].forEach((id) => matchedIds.add(id));
    }
  }
  return Array.from(matchedIds);
}

function personalizeTip(tip, aboutYou) {
  const clean = (aboutYou || '').trim();
  if (!clean) return tip;
  return `${tip} Also: mention "${clean}" somewhere in it — that's the detail that makes it feel like you, not a template.`;
}

function shuffle(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// excludeIds: everything shown so far this session — avoided when possible.
// hardExcludeIds: just the immediately previous batch — avoided even when
// the pool has to reset, so a reroll never shows the exact same screen twice
// in a row even after the full 30-template library has been cycled through.
function generateIdeas(niche, count = 8, excludeIds = [], profile = null, hardExcludeIds = []) {
  const clean = niche.trim();
  if (!clean) return [];

  let pool = IDEA_TEMPLATES.filter((t) => !excludeIds.includes(t.id));
  if (pool.length < count) {
    pool = IDEA_TEMPLATES.filter((t) => !hardExcludeIds.includes(t.id));
    if (pool.length < count) pool = IDEA_TEMPLATES.slice();
  }

  let picked;
  const styleText = profile ? `${profile.vibe || ''} ${profile.tone || ''}` : '';
  const preferredIds = styleText.trim() ? idsMatchingStyleText(styleText) : [];

  if (preferredIds.length) {
    const preferred = shuffle(pool.filter((t) => preferredIds.includes(t.id)));
    const rest = shuffle(pool.filter((t) => !preferredIds.includes(t.id)));
    picked = [...preferred, ...rest].slice(0, count);
  } else {
    picked = shuffle(pool).slice(0, count);
  }

  const aboutYou = profile ? profile.aboutYou : '';
  // Only personalize a few ideas, not all of them — repeating the same
  // "work in X" line on every card would feel spammy instead of useful.
  const personalizeCount = aboutYou.trim() ? Math.min(3, picked.length) : 0;
  const personalizeIndexes = new Set(shuffle(picked.map((_, i) => i)).slice(0, personalizeCount));

  return picked.map((t, i) => ({
    id: t.id,
    category: t.category,
    title: t.title(clean),
    hook: t.hook(clean),
    why: t.why,
    tip: personalizeIndexes.has(i) ? personalizeTip(t.tip, aboutYou) : t.tip,
    niche: clean
  }));
}

window.IdeaEngine = { generateIdeas, IDEA_TEMPLATES };
