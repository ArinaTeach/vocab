const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

function shuffle(arr){
  for(let i = arr.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function escapeHtml(str){
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

const WORDS = [
  { id:"bed", word:"bed", img:"images/bed.png" },
  { id:"desk", word:"desk", img:"images/desk.png" },
  { id:"bookshelf", word:"bookshelf", img:"images/bookshelf.png" },
  { id:"wardrobe", word:"wardrobe", img:"images/wardrobe.png" },
  { id:"carpet", word:"carpet", img:"images/carpet.png" },
  { id:"lamp", word:"lamp", img:"images/lamp.png" },
  { id:"books", word:"books", img:"images/books.png" },
  { id:"lunchbox", word:"lunchbox", img:"images/lunchbox.png" },
  { id:"window", word:"window", img:"images/window.png" },
  { id:"doll", word:"doll", img:"images/doll.png" },
  { id:"bathroom", word:"bathroom", img:"images/bathroom.png" },
  { id:"bedroom", word:"bedroom", img:"images/bedroom.png" }
];

const state = {
  task:null,
  found:0,
  need:0,
  mistakes:0,
  done:{}
};

const main = $("#main");
const homeBtn = $("#homeBtn");

homeBtn.addEventListener("click", renderHome);

function updateStats(){
  $("#progressVal").textContent = `${state.found}/${state.need}`;
  $("#mistakesVal").textContent = String(state.mistakes);
}

function addCorrect(n = 1){
  state.found += n;
  updateStats();

  if(state.found >= state.need){
    state.done[state.task] = true;
    setTimeout(()=>{
      showFinish();
    }, 500);
  }
}

function addMistake(){
  state.mistakes++;
  updateStats();
}

function renderHome(){
  state.task = null;

  main.innerHTML = `
    <section class="home">
      <div class="homeIntro">
        <h2>Choose a task</h2>
        <p></p>
      </div>

      <div class="homeGrid">
        <button class="taskCard" type="button" data-task="drag">
          <div class="taskIcon">🖼️</div>
          <h3>Task 1</h3>
          <p>Drag the words to the pictures.</p>
          <span>Start →</span>
        </button>

        <button class="taskCard" type="button" data-task="unscramble">
          <div class="taskIcon">🔤</div>
          <h3>Task 2</h3>
          <p>Put the letters in the correct order.</p>
          <span>Start →</span>
        </button>
      </div>
    </section>
  `;

  $$(".taskCard").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      openTask(btn.dataset.task);
    });
  });
}

function openTask(task){
  state.task = task;
  state.found = 0;
  state.need = 0;
  state.mistakes = 0;

  main.innerHTML = `
    <section class="stage">
      <div class="stageHead">
        <div>
          <h2 id="taskTitle"></h2>
          <p id="taskDesc"></p>
        </div>

        <div class="stats">
          <div class="stat">
            <span>Progress</span>
            <b id="progressVal">0/0</b>
          </div>
          <div class="stat">
            <span>Mistakes</span>
            <b id="mistakesVal">0</b>
          </div>
          <button class="btn" id="shuffleBtn" type="button">Shuffle</button>
        </div>
      </div>

      <div class="stageBody" id="stageBody"></div>
    </section>
  `;

  $("#shuffleBtn").addEventListener("click", ()=>openTask(task));

  if(task === "drag"){
    $("#taskTitle").textContent = "Task 1 - Drag";
    $("#taskDesc").textContent = "Drag the words to the correct pictures.";
    buildDragTask();
  }

  if(task === "unscramble"){
    $("#taskTitle").textContent = "Task 2 - Unscramble";
    $("#taskDesc").textContent = "Put the letters in the correct order.";
    buildUnscrambleTask();
  }
}

function showFinish(){
  const box = document.createElement("div");
  box.className = "finishBox";
  box.innerHTML = `
    <div class="finishCard">
      <div class="finishEmoji">✅</div>
      <h2>Well done!</h2>
      <p>You finished this task.</p>
      <button class="btn" type="button" id="finishHome">Back home</button>
    </div>
  `;

  document.body.appendChild(box);

  $("#finishHome").addEventListener("click", ()=>{
    box.remove();
    renderHome();
  });
}

/* TASK 1 - DRAG */

function buildDragTask(){
  const list = shuffle([...WORDS]);

  state.need = list.length;
  updateStats();

  $("#stageBody").innerHTML = `
    <div class="dragLayout">
      <div class="pictureGrid" id="pictureGrid"></div>

      <div class="wordPanel">
        <h3>Words</h3>
        <div class="wordChips" id="wordChips"></div>
      </div>
    </div>
  `;

  const grid = $("#pictureGrid");
  const chips = $("#wordChips");

  list.forEach(item=>{
    const card = document.createElement("div");
    card.className = "picCard";

    card.innerHTML = `
      <div class="picBox">
        <img src="${escapeHtml(item.img)}" alt="${escapeHtml(item.word)}" draggable="false">
      </div>
      <div class="dropBox" data-answer="${escapeHtml(item.id)}"></div>
    `;

    grid.appendChild(card);
  });

  shuffle([...WORDS]).forEach(item=>{
    const chip = document.createElement("div");
    chip.className = "wordChip";
    chip.draggable = true;
    chip.dataset.id = item.id;
    chip.textContent = item.word;

    chip.addEventListener("dragstart", e=>{
      if(chip.classList.contains("used")){
        e.preventDefault();
        return;
      }

      e.dataTransfer.setData("text/plain", item.id);
    });

    chips.appendChild(chip);
  });

  $$(".dropBox").forEach(drop=>{
    drop.addEventListener("dragover", e=>{
      e.preventDefault();
      drop.classList.add("over");
    });

    drop.addEventListener("dragleave", ()=>{
      drop.classList.remove("over");
    });

    drop.addEventListener("drop", e=>{
      e.preventDefault();
      drop.classList.remove("over");

      if(drop.classList.contains("filled")) return;

      const got = e.dataTransfer.getData("text/plain");
      const need = drop.dataset.answer;

      const chip = $$(".wordChip").find(x=>x.dataset.id === got && !x.classList.contains("used"));

      if(got === need){
        drop.textContent = chip.textContent;
        drop.classList.add("filled");

        chip.classList.add("used");
        chip.draggable = false;

        addCorrect(1);
      }else{
        addMistake();

        drop.classList.add("wrong");
        if(chip) chip.classList.add("wrong");

        setTimeout(()=>{
          drop.classList.remove("wrong");
          if(chip) chip.classList.remove("wrong");
        }, 600);
      }
    });
  });
}

/* TASK 2 - UNSCRAMBLE */

function buildUnscrambleTask(){
  const items = shuffle([...WORDS]);

  let currentIndex = 0;
  let draggedLetter = null;

  state.need = items.length;
  updateStats();

  $("#stageBody").innerHTML = `
    <div class="unscrambleBox">
      <div class="uImageCard">
        <img id="uImage" src="" alt="">
      </div>

      <div class="uSlots" id="uSlots"></div>
      <div class="uLetters" id="uLetters"></div>
    </div>
  `;

  const imgEl = $("#uImage");
  const slotsWrap = $("#uSlots");
  const lettersWrap = $("#uLetters");

  function renderItem(){
    const item = items[currentIndex];
    const answer = item.word.toLowerCase();

    imgEl.src = item.img;
    imgEl.alt = item.word;

    slotsWrap.innerHTML = "";
    lettersWrap.innerHTML = "";
    draggedLetter = null;

    answer.split("").forEach((ch, index)=>{
      const slot = document.createElement("div");
      slot.className = "uSlot";
      slot.dataset.letter = ch;
      slot.dataset.filled = "0";

      slot.addEventListener("dragover", e=>{
        e.preventDefault();
        slot.classList.add("over");
      });

      slot.addEventListener("dragleave", ()=>{
        slot.classList.remove("over");
      });

      slot.addEventListener("drop", e=>{
        e.preventDefault();
        slot.classList.remove("over");

        if(slot.dataset.filled === "1") return;
        if(!draggedLetter) return;

        const got = draggedLetter.textContent.toLowerCase();

        if(got === slot.dataset.letter){
          slot.textContent = got;
          slot.dataset.filled = "1";
          slot.classList.add("correct");

          draggedLetter.classList.add("used");
          draggedLetter.draggable = false;
          draggedLetter = null;

          const allDone = $$(".uSlot").every(s=>s.dataset.filled === "1");

          if(allDone){
            addCorrect(1);

            setTimeout(()=>{
              currentIndex++;

              if(currentIndex >= items.length){
                showFinish();
                return;
              }

              renderItem();
            }, 700);
          }
        }else{
          addMistake();
          slot.classList.add("wrong");

          setTimeout(()=>{
            slot.classList.remove("wrong");
          }, 600);

          draggedLetter = null;
        }
      });

      slotsWrap.appendChild(slot);
    });

    const letters = shuffle(answer.split(""));

    letters.forEach(ch=>{
      const letter = document.createElement("div");
      letter.className = "uLetter";
      letter.textContent = ch;
      letter.draggable = true;

      letter.addEventListener("dragstart", e=>{
        if(letter.classList.contains("used")){
          e.preventDefault();
          return;
        }

        draggedLetter = letter;
        e.dataTransfer.setData("text/plain", ch);
      });

      lettersWrap.appendChild(letter);
    });
  }

  renderItem();
}

renderHome();