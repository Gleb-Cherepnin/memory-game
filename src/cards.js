export const CARDS = [
  { id: "bob1", name: "Боб", src: "assets/cards/1.jpg" },
  { id: "bob2", name: "Боб", src: "assets/cards/2.jpg" },
  { id: "Bear", name: "Медведь", src: "assets/cards/3.png" },
  { id: "Patric", name: "Патрик", src: "assets/cards/4.jpg" },
  { id: "bob3", name: "Боб", src: "assets/cards/5.webp" },
  { id: "Tramp", name: "Трамп", src: "assets/cards/6.jpg" },
  { id: "Ilon", name: "Илон", src: "assets/cards/7.jpeg" },
  { id: "Shrek", name: "Шрек", src: "assets/cards/8.jpg" },
];

export function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function createDeck() {
  const pairs = CARDS.flatMap((card) => [card, card]);
  return shuffle(pairs).map((card, index) => ({
    uid: index,
    pairId: card.id,
    name: card.name,
    src: card.src,
    open: false,
    matched: false,
  }));
}
