// Content Idea Generator — UI wiring

const EXAMPLE_NICHES = ['skincare', 'personal finance', 'home cooking', 'fitness', 'travel on a budget', 'plants'];

const nicheInput = document.getElementById('nicheInput');
const generateBtn = document.getElementById('generateBtn');
const micBtn = document.getElementById('micBtn');
const micStatus = document.getElementById('micStatus');
const regenerateBtn = document.getElementById('regenerateBtn');
const ideasGrid = document.getElementById('ideasGrid');
const emptyState = document.getElementById('emptyState');
const exampleChips = document.getElementById('exampleChips');
const savedList = document.getElementById('savedList');
const savedEmpty = document.getElementById('savedEmpty');
const savedCount = document.getElementById('savedCount');

let lastShownIds = [];
let currentNiche = '';

const SAVED_KEY = 'contentIdeaGenerator.savedIdeas';

function getSaved() {
  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY)) || [];
  } catch {
    return [];
  }
}

function setSaved(list) {
  localStorage.setItem(SAVED_KEY, JSON.stringify(list));
}

function isSaved(idea) {
  return getSaved().some((s) => s.id === idea.id && s.niche === idea.niche);
}

function toggleSave(idea, btn) {
  const saved = getSaved();
  const idx = saved.findIndex((s) => s.id === idea.id && s.niche === idea.niche);
  if (idx >= 0) {
    saved.splice(idx, 1);
    btn.textContent = '☆ Save';
    btn.classList.remove('saved');
  } else {
    saved.unshift({ ...idea, savedAt: Date.now() });
    btn.textContent = '★ Saved';
    btn.classList.add('saved');
  }
  setSaved(saved);
  renderSavedList();
}

function ideaCard(idea) {
  const card = document.createElement('div');
  card.className = 'idea-card';
  card.dataset.id = idea.id;
  card.dataset.niche = idea.niche;

  const saveBtnInitial = isSaved(idea) ? '★ Saved' : '☆ Save';

  card.innerHTML = `
    <div class="idea-category">${idea.category}</div>
    <h3 class="idea-title">${idea.title}</h3>
    <div class="idea-hook">"${idea.hook}"</div>
    <div class="idea-row"><span class="idea-label">Why it works</span><p>${idea.why}</p></div>
    <div class="idea-row"><span class="idea-label">Beginner tip</span><p>${idea.tip}</p></div>
    <button class="save-btn ${isSaved(idea) ? 'saved' : ''}" type="button">${saveBtnInitial}</button>
  `;

  const saveBtn = card.querySelector('.save-btn');
  saveBtn.addEventListener('click', () => toggleSave(idea, saveBtn));

  return card;
}

function syncSaveButtons() {
  const saved = getSaved();
  ideasGrid.querySelectorAll('.idea-card').forEach((card) => {
    const btn = card.querySelector('.save-btn');
    const stillSaved = saved.some((s) => s.id === card.dataset.id && s.niche === card.dataset.niche);
    btn.textContent = stillSaved ? '★ Saved' : '☆ Save';
    btn.classList.toggle('saved', stillSaved);
  });
}

function renderIdeas(ideas) {
  ideasGrid.innerHTML = '';
  if (!ideas.length) {
    emptyState.hidden = false;
    regenerateBtn.hidden = true;
    return;
  }
  emptyState.hidden = true;
  regenerateBtn.hidden = false;
  ideas.forEach((idea) => ideasGrid.appendChild(ideaCard(idea)));
}

function runGenerate(niche) {
  currentNiche = niche;
  const ideas = window.IdeaEngine.generateIdeas(niche, 8, []);
  lastShownIds = ideas.map((i) => i.id);
  renderIdeas(ideas);
}

function runRegenerate() {
  if (!currentNiche) return;
  const ideas = window.IdeaEngine.generateIdeas(currentNiche, 8, lastShownIds);
  lastShownIds = ideas.map((i) => i.id);
  renderIdeas(ideas);
}

function renderSavedList() {
  const saved = getSaved();
  savedList.innerHTML = '';
  savedCount.textContent = saved.length ? `(${saved.length})` : '';

  if (!saved.length) {
    savedEmpty.hidden = false;
    return;
  }
  savedEmpty.hidden = true;

  saved.forEach((idea) => {
    const row = document.createElement('div');
    row.className = 'saved-row';
    row.innerHTML = `
      <div>
        <div class="saved-title">${idea.title}</div>
        <div class="saved-meta">${idea.category} · for "${idea.niche}"</div>
      </div>
      <button class="remove-btn" type="button">Remove</button>
    `;
    row.querySelector('.remove-btn').addEventListener('click', () => {
      setSaved(getSaved().filter((s) => !(s.id === idea.id && s.niche === idea.niche)));
      renderSavedList();
      syncSaveButtons();
    });
    savedList.appendChild(row);
  });
}

function renderExampleChips() {
  exampleChips.innerHTML = '';
  EXAMPLE_NICHES.forEach((n) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.textContent = n;
    chip.addEventListener('click', () => {
      nicheInput.value = n;
      runGenerate(n);
    });
    exampleChips.appendChild(chip);
  });
}

generateBtn.addEventListener('click', () => {
  const niche = nicheInput.value.trim();
  if (!niche) {
    nicheInput.focus();
    nicheInput.classList.add('error');
    setTimeout(() => nicheInput.classList.remove('error'), 900);
    return;
  }
  runGenerate(niche);
});

nicheInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') generateBtn.click();
});

regenerateBtn.addEventListener('click', runRegenerate);

// Voice input: speak your niche instead of typing it.
const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let isListening = false;

function setMicStatus(text) {
  if (!text) {
    micStatus.hidden = true;
    micStatus.textContent = '';
    return;
  }
  micStatus.hidden = false;
  micStatus.textContent = text;
}

function stopListening() {
  isListening = false;
  micBtn.classList.remove('listening');
  setMicStatus('');
}

if (!SpeechRecognitionAPI) {
  micBtn.classList.add('unsupported');
  micBtn.title = 'Voice input is not supported in this browser — try Chrome or Edge';
} else {
  recognition = new SpeechRecognitionAPI();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.addEventListener('start', () => {
    isListening = true;
    micBtn.classList.add('listening');
    setMicStatus('Listening... speak your niche');
  });

  recognition.addEventListener('result', (event) => {
    const transcript = event.results[0][0].transcript.trim();
    if (transcript) {
      nicheInput.value = transcript;
      runGenerate(transcript);
    }
  });

  recognition.addEventListener('error', (event) => {
    setMicStatus(event.error === 'not-allowed'
      ? 'Microphone access denied — check your browser permissions'
      : "Didn't catch that — try again");
    setTimeout(() => setMicStatus(''), 2500);
  });

  recognition.addEventListener('end', stopListening);

  micBtn.addEventListener('click', () => {
    if (isListening) {
      recognition.stop();
      return;
    }
    nicheInput.classList.remove('error');
    recognition.start();
  });
}

renderExampleChips();
renderSavedList();
