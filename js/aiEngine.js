// Content Idea Generator — AI-backed generation
// Calls the Cloudflare Worker (which proxies the Anthropic API) to get
// genuinely niche-specific ideas instead of the fixed local templates.
// Returns null on any failure so the caller can fall back to the local
// engine — the app must never break just because the AI call fails.

// Fill this in once the Worker (worker/src/index.js) is deployed to
// Cloudflare Workers. Left blank, generation silently falls back to the
// local template engine.
const AI_WORKER_URL = 'https://content-idea-generator-api.kevinluvaotero.workers.dev/';

async function generateIdeasAI(niche, profile) {
  if (!AI_WORKER_URL) return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(AI_WORKER_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        niche,
        vibe: profile?.vibe || '',
        tone: profile?.tone || '',
        aboutYou: profile?.aboutYou || ''
      })
    });

    clearTimeout(timeout);
    if (!res.ok) return null;

    const data = await res.json();
    if (!Array.isArray(data.ideas) || data.ideas.length === 0) return null;

    return data.ideas.map((idea, i) => ({
      id: `ai-${Date.now()}-${i}`,
      category: idea.category,
      title: idea.title,
      hook: idea.hook,
      why: idea.why,
      tip: idea.tip,
      niche
    }));
  } catch {
    return null;
  }
}

window.AiEngine = { generateIdeasAI };
