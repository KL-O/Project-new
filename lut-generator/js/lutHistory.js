// LUT Generator — saved LUT history (localStorage, no backend/accounts yet)

const HISTORY_KEY = 'lutGenerator.history';
const MAX_HISTORY = 30;

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  } catch {
    return [];
  }
}

function saveHistoryEntry(entry) {
  const list = getHistory();
  list.unshift(entry);
  if (list.length > MAX_HISTORY) list.length = MAX_HISTORY;
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  return list;
}

function deleteHistoryEntry(id) {
  const list = getHistory().filter((e) => e.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  return list;
}

function makeThumbnail(sourceCanvas, size) {
  const canvas = document.createElement('canvas');
  const scale = Math.min(1, size / Math.max(sourceCanvas.width, sourceCanvas.height));
  canvas.width = Math.max(1, Math.round(sourceCanvas.width * scale));
  canvas.height = Math.max(1, Math.round(sourceCanvas.height * scale));
  canvas.getContext('2d').drawImage(sourceCanvas, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.72);
}

window.LutHistory = { getHistory, saveHistoryEntry, deleteHistoryEntry, makeThumbnail };
