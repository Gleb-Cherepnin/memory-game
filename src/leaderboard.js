// Таблица лидеров в localStorage.
const STORAGE_KEY = "memory-game-leaderboard";
const MAX_RESULTS = 10;

function readResults() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (!Array.isArray(data)) {
      return [];
    }

    return data.filter(
      (result) =>
        Number.isFinite(result?.moves) &&
        Number.isFinite(result?.playedAt),
    );
  } catch {
    return [];
  }
}

function sortResults(list) {
  return [...list].sort(
    (a, b) => a.moves - b.moves || a.playedAt - b.playedAt,
  );
}

export function saveResult(moves) {
  const result = {
    moves,
    playedAt: Date.now(),
  };

  const results = [...readResults(), result];
  const sortedResults = sortResults(results);
  const topResults = sortedResults.slice(0, MAX_RESULTS);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(topResults));
  } catch {
  }
}

export function getTopResults() {
  const results = readResults();

  return sortResults(results).slice(0, MAX_RESULTS);
}

export function formatDate(timestamp) {
  const date = new Date(timestamp);

  const pad = (number) => String(number).padStart(2, "0");

  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
}