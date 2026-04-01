const grid = document.getElementById("grid");
const wordsBox = document.getElementById("words");
const restartBtn = document.getElementById("restartBtn");
const playAgainBtn = document.getElementById("playAgainBtn");
const win = document.getElementById("win");
const okSound = document.getElementById("okSound");
const wrongSound = document.getElementById("wrongSound");

const items = [
  { word: "apples", img: "images/apples.png" },
  { word: "bananas", img: "images/bananas.png" },
  { word: "burger", img: "images/burger.png" },
  { word: "cake", img: "images/cake.png" },
  { word: "cheese", img: "images/cheese.png" },
  { word: "chips", img: "images/chips.png" },
  { word: "chocolate", img: "images/chocolate.png" },
  { word: "eggs", img: "images/eggs.png" },
  { word: "icecream", img: "images/icecream.png" },
  { word: "juice", img: "images/juice.png" },
  { word: "milk", img: "images/milk.png" },
  { word: "oranges", img: "images/oranges.png" },
  { word: "pizza", img: "images/pizza.png" },
  { word: "sandwich", img: "images/sandwich.png" }
];

let correctCount = 0;

function shuffle(arr){
  const copy = [...arr];
  for(let i = copy.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function playShort(soundEl){
  if(!soundEl) return;
  try{
    soundEl.currentTime = 0;
    soundEl.play();
  }catch(e){}
}

function showWin(){
  win.hidden = false;
}

function hideWin(){
  win.hidden = true;
}

function createCard(item){
  const card = document.createElement("div");
  card.className = "drag-card";

  const pic = document.createElement("div");
  pic.className = "pic";

  const img = document.createElement("img");
  img.src = item.img;
  img.alt = item.word;
  img.draggable = false;

  const drop = document.createElement("div");
  drop.className = "drop";
  drop.dataset.answer = item.word;

  pic.appendChild(img);
  card.appendChild(pic);
  card.appendChild(drop);

  drop.addEventListener("dragover", (e) => {
    e.preventDefault();
    if(drop.classList.contains("correct")) return;
    drop.classList.add("hover");
  });

  drop.addEventListener("dragleave", () => {
    drop.classList.remove("hover");
  });

  drop.addEventListener("drop", (e) => {
    e.preventDefault();
    drop.classList.remove("hover");

    if(drop.classList.contains("correct")) return;

    const draggedWord = e.dataTransfer.getData("text/plain");
    const draggedId = e.dataTransfer.getData("word-id");
    const draggedEl = document.querySelector(`[data-id="${draggedId}"]`);

    if(!draggedWord || !draggedEl) return;

    if(draggedWord === drop.dataset.answer){
      drop.textContent = draggedWord;
      drop.classList.add("correct");
      draggedEl.remove();
      correctCount += 1;
      playShort(okSound);

      if(correctCount === items.length){
        setTimeout(showWin, 250);
      }
    } else {
      drop.classList.add("wrong");
      playShort(wrongSound);
      setTimeout(() => drop.classList.remove("wrong"), 260);
    }
  });

  return card;
}

function createWord(item, index){
  const word = document.createElement("div");
  word.className = "word";
  word.textContent = item.word;
  word.draggable = true;
  word.dataset.id = `word-${index}`;

  word.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", item.word);
    e.dataTransfer.setData("word-id", word.dataset.id);
    word.classList.add("dragging");
  });

  word.addEventListener("dragend", () => {
    word.classList.remove("dragging");
  });

  return word;
}

function render(){
  grid.innerHTML = "";
  wordsBox.innerHTML = "";
  correctCount = 0;
  hideWin();

  items.forEach(item => {
    grid.appendChild(createCard(item));
  });

  const shuffledWords = shuffle(items);
  shuffledWords.forEach((item, index) => {
    wordsBox.appendChild(createWord(item, index));
  });
}

restartBtn.addEventListener("click", render);
playAgainBtn.addEventListener("click", render);

render();