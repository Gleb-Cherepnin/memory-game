import { el } from "./dom.js";
import { CARDS, createDeck } from "./cards.js";
import { openModal, closeModal } from "./modal.js";
import {
  saveResult,
  getTopResults,
  formatDate,
} from "./leaderboard.js";

const MISMATCH_DELAY_MS = 1000;
const TOTAL_PAIRS = CARDS.length;

const state = {
  deck: [],
  firstIndex: null,
  locked: false,
  finished: false,
  moves: 0,
  pairs: 0,
  timerId: null,
};

const ui = {
  board: null,
  moves: null,
  pairs: null,
  cards: [],
};

function createCounter(label, valueNode) {
  const labelElement = el("span", {
    className: "counter__label",
    text: label,
  });

  return el(
    "div",
    { className: "counter" },
    labelElement,
    valueNode,
  );
}

function buildLayout() {
  ui.moves = el("span", {
    className: "counter__value",
    text: "0",
    attrs: { "aria-live": "polite" },
  });

  ui.pairs = el("span", {
    className: "counter__value",
    text: `0 из ${TOTAL_PAIRS}`,
    attrs: { "aria-live": "polite" },
  });

  ui.board = el("div", {
    className: "board",
  });

  const newGameButton = el("button", {
    className: "btn",
    text: "Новая игра",
    attrs: { type: "button" },
    on: { click: startNewGame },
  });

  const leaderboardButton = el("button", {
    className: "btn btn--secondary",
    text: "Таблица лидеров",
    attrs: { type: "button" },
    on: { click: showLeaderboard },
  });

  const headerButtons = el(
    "div",
    { className: "header__buttons" },
    newGameButton,
    leaderboardButton,
  );

  const header = el(
    "header",
    { className: "header" },
    el("h1", {
      className: "header__title",
      text: "Memory Game",
    }),
    headerButtons,
  );

  const counters = el(
    "div",
    { className: "counters" },
    createCounter("Ходы", ui.moves),
    createCounter("Найдено пар", ui.pairs),
  );

  const main = el(
    "main",
    { className: "main" },
    counters,
    ui.board,
  );

  const app = el(
    "div",
    { className: "app" },
    header,
    main,
  );

  document.body.append(app);
}

function createCardElement(card, index) {
  const back = el("span", {
    className: "card__back",
    attrs: { "aria-hidden": "true" },
  });

  const face = el("img", {
    className: "card__face",
    attrs: {
      src: card.src,
      alt: "",
      draggable: "false",
    },
  });

  return el(
    "button",
    {
      className: "card",
      attrs: { type: "button" },
      on: {
        click: () => onCardClick(index),
      },
    },
    back,
    face,
  );
}

function renderBoard() {
  ui.cards = state.deck.map(createCardElement);

  ui.board.replaceChildren(...ui.cards);

  state.deck.forEach((_, index) => {
    updateCard(index);
  });
}

function updateCard(index) {
  const card = state.deck[index];
  const node = ui.cards[index];
  const isVisible = card.open || card.matched;

  node.classList.toggle("is-open", isVisible);
  node.classList.toggle("is-matched", card.matched);

  if (isVisible) {
    node.setAttribute(
      "aria-label",
      `Карточка ${index + 1}: ${card.name}`,
    );
  } else {
    node.setAttribute(
      "aria-label",
      `Карточка ${index + 1}, закрыта`,
    );
  }
}

function updateCounters() {
  ui.moves.textContent = String(state.moves);
  ui.pairs.textContent = `${state.pairs} из ${TOTAL_PAIRS}`;
}

function startNewGame() {
  clearTimeout(state.timerId);
  closeModal();

  state.deck = createDeck();
  state.firstIndex = null;
  state.locked = false;
  state.finished = false;
  state.moves = 0;
  state.pairs = 0;
  state.timerId = null;

  renderBoard();
  updateCounters();
}

function onCardClick(index) {
  const card = state.deck[index];

  if (
    state.locked ||
    state.finished ||
    card.open ||
    card.matched
  ) {
    return;
  }

  card.open = true;
  updateCard(index);

  if (state.firstIndex === null) {
    state.firstIndex = index;
    return;
  }

  const firstIndex = state.firstIndex;

  state.firstIndex = null;
  state.moves += 1;

  if (state.deck[firstIndex].pairId === card.pairId) {
    handleMatch(firstIndex, index);
  } else {
    handleMismatch(firstIndex, index);
  }

  updateCounters();
}

function handleMatch(firstIndex, secondIndex) {
  state.deck[firstIndex].matched = true;
  state.deck[secondIndex].matched = true;
  state.pairs += 1;

  updateCard(firstIndex);
  updateCard(secondIndex);

  if (state.pairs === TOTAL_PAIRS) {
    finishGame();
  }
}

function handleMismatch(firstIndex, secondIndex) {
  state.locked = true;

  state.timerId = setTimeout(() => {
    state.deck[firstIndex].open = false;
    state.deck[secondIndex].open = false;

    updateCard(firstIndex);
    updateCard(secondIndex);

    state.locked = false;
    state.timerId = null;
  }, MISMATCH_DELAY_MS);
}

function finishGame() {
  state.finished = true;

  saveResult(state.moves);
  showVictory();
}

function pluralMoves(number) {
  const lastDigit = number % 10;
  const lastTwoDigits = number % 100;

  if (lastDigit === 1 && lastTwoDigits !== 11) {
    return "ход";
  }

  if (
    lastDigit >= 2 &&
    lastDigit <= 4 &&
    (lastTwoDigits < 12 || lastTwoDigits > 14)
  ) {
    return "хода";
  }

  return "ходов";
}

function showVictory() {
  const content = el("p", {
    text: `Вы нашли все пары за ${state.moves} ${pluralMoves(state.moves)}.`,
  });

  openModal({
    title: "Победа!",
    content,
    actions: [
      {
        label: "Новая игра",
        onClick: startNewGame,
      },
      {
        label: "Закрыть",
        onClick: closeModal,
      },
    ],
  });
}

function buildLeaderboardTable(results) {
  const head = el(
    "thead",
    {},
    el(
      "tr",
      {},
      el("th", { text: "Место" }),
      el("th", { text: "Ходы" }),
      el("th", { text: "Дата" }),
    ),
  );

  const rows = results.map((result, index) => {
    return el(
      "tr",
      {},
      el("td", { text: String(index + 1) }),
      el("td", { text: String(result.moves) }),
      el("td", { text: formatDate(result.playedAt) }),
    );
  });

  const body = el("tbody", {}, ...rows);

  return el(
    "table",
    { className: "table" },
    head,
    body,
  );
}

function showLeaderboard() {
  const results = getTopResults();

  const content = results.length
    ? buildLeaderboardTable(results)
    : el("p", { text: "Пока нет результатов" });

  openModal({
    title: "Таблица лидеров",
    content,
    actions: [
      {
        label: "Закрыть",
        onClick: closeModal,
      },
    ],
  });
}

buildLayout();
startNewGame();