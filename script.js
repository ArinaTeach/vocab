const grid = document.getElementById("grid");
const restartBtn = document.getElementById("restartBtn");
const win = document.getElementById("win");
const playAgainBtn = document.getElementById("playAgainBtn");

// Картинки (каждая будет два раза — пары)
const images = [
  "images/burger.png",
  "images/chips.png",
  "images/cake.png",
  "images/cheese.png",
  "images/eggs.png",
  "images/icecream.png",
  "images/juice.png",
  "images/milk.png",
  "images/pizza.png",
  "images/sandwich.png",
];

let deck = [];
let first = null;
let second = null;
let lock = false;
let matchedCount = 0;

function shuffle(arr){
  for(let i = arr.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function makeDeck(){
  deck = shuffle([...images, ...images].map((src, idx) => ({
    id: idx + "-" + src,
    src,
    matched: false
  })));
}

function render(){
  grid.innerHTML = "";
  deck.forEach((cardData, index) => {
    const btn = document.createElement("button");
    btn.className = "card";
    btn.type = "button";
    btn.setAttribute("aria-label", "карточка");
    btn.dataset.index = String(index);

    btn.innerHTML = `
      <div class="back">⭐</div>
      <div class="front"><img src="${cardData.src}" alt="" draggable="false"></div>
    `;

    btn.addEventListener("click", () => onFlip(btn));
    grid.appendChild(btn);
  });
}

function resetTurn(){
  first = null;
  second = null;
  lock = false;
}

function showWin(){
  win.hidden = false;
}

function hideWin(){
  win.hidden = true;
}

function onFlip(cardEl){
  if(lock) return;

  const idx = Number(cardEl.dataset.index);
  const data = deck[idx];

  if(data.matched) return;
  if(cardEl.classList.contains("is-flipped")) return;

  cardEl.classList.add("is-flipped");

  if(!first){
    first = { idx, el: cardEl, src: data.src };
    return;
  }

  second = { idx, el: cardEl, src: data.src };
  lock = true;

  const isMatch = first.src === second.src;

  if(isMatch){
    deck[first.idx].matched = true;
    deck[second.idx].matched = true;

    first.el.classList.add("matched");
    second.el.classList.add("matched");

    matchedCount += 2;

    setTimeout(() => {
      resetTurn();
      if(matchedCount === deck.length){
        showWin();
      }
    }, 450);
  } else {
    setTimeout(() => {
      first.el.classList.remove("is-flipped");
      second.el.classList.remove("is-flipped");
      resetTurn();
    }, 800);
  }
}

function start(){
  hideWin();
  matchedCount = 0;
  resetTurn();
  makeDeck();
  render();
}

restartBtn.addEventListener("click", start);
playAgainBtn.addEventListener("click", start);

start();
