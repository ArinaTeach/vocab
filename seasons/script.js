/****************
 * Sound (simple beep)
 ****************/
let SOUND_ON = true;
const soundBtn = document.getElementById('soundBtn');

if (soundBtn) {
  soundBtn.addEventListener('click', () => {
    SOUND_ON = !SOUND_ON;
    soundBtn.textContent = SOUND_ON ? "🔊 Sound: ON" : "🔇 Sound: OFF";
    soundBtn.classList.toggle('good', SOUND_ON);
    soundBtn.classList.toggle('bad', !SOUND_ON);
  });
}

function beep(freq=520, ms=90, type='sine', gain=0.05){
  if(!SOUND_ON) return;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if(!AudioCtx) return;
  const ctx = new AudioCtx();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.value = gain;
  o.connect(g);
  g.connect(ctx.destination);
  o.start();
  setTimeout(() => {
    o.stop();
    ctx.close();
  }, ms);
}
const sOk  = () => {};
const sBad = () => { beep(180,130,'sawtooth',0.045); };

/****************
 * Tabs
 ****************/
const tabs = [...document.querySelectorAll('[data-tab]')];
const tasks = {
  task1: document.getElementById('task1'),
  task2: document.getElementById('task2'),
  task3: document.getElementById('task3'),
  task4: document.getElementById('task4'),
};

tabs.forEach(btn=>{
  btn.addEventListener('click',()=>{
    tabs.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    Object.values(tasks).forEach(s=>{
      if (s) s.classList.remove('active');
    });
    if (tasks[btn.dataset.tab]) {
      tasks[btn.dataset.tab].classList.add('active');
    }
  });
});

/****************
 * Helpers
 ****************/
function shuffle(arr){
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

/****************
 * Data
 ****************/
const MONTHS = [
  { id:'january',   label:'January',   ru:'ЯНВАРЬ',     season:'winter' },
  { id:'february',  label:'February',  ru:'ФЕВРАЛЬ',    season:'winter' },
  { id:'march',     label:'March',     ru:'МАРТ',       season:'spring' },
  { id:'april',     label:'April',     ru:'АПРЕЛЬ',     season:'spring' },
  { id:'may',       label:'May',       ru:'МАЙ',        season:'spring' },
  { id:'june',      label:'June',      ru:'ИЮНЬ',       season:'summer' },
  { id:'july',      label:'July',      ru:'ИЮЛЬ',       season:'summer' },
  { id:'august',    label:'August',    ru:'АВГУСТ',     season:'summer' },
  { id:'september', label:'September', ru:'СЕНТЯБРЬ',   season:'autumn' },
  { id:'october',   label:'October',   ru:'ОКТЯБРЬ',    season:'autumn' },
  { id:'november',  label:'November',  ru:'НОЯБРЬ',     season:'autumn' },
  { id:'december',  label:'December',  ru:'ДЕКАБРЬ',    season:'winter' },
];

const SEASON_EMOJI = {
  winter:'❄️',
  spring:'🌷',
  summer:'☀️',
  autumn:'🍂'
};

/****************
 * Task 1 — Sorter
 ****************/
const t1MonthsEl   = document.getElementById('t1Months');
const t1CorrectEl  = document.getElementById('t1Correct');
const t1ShuffleBtn = document.getElementById('t1Shuffle');
const t1ResetBtn   = document.getElementById('t1Reset');

let t1State = { correct:0, used:new Set() };

function renderTask1(){
  if(!t1MonthsEl || !t1CorrectEl) return;

  t1State.correct = 0;
  t1State.used = new Set();
  t1CorrectEl.textContent = '0';

  [...document.querySelectorAll('.dropzone')].forEach(z=>{
    z.classList.remove('over','filled');
    z.innerHTML = `<div class="dropHint">Drop months here</div>`;
  });

  t1MonthsEl.innerHTML = '';
  const months = shuffle(MONTHS);

  months.forEach(m=>{
    const chip = document.createElement('div');
    chip.className = 'chip';
    chip.draggable = true;
    chip.dataset.id = m.id;
    chip.dataset.season = m.season;
    chip.textContent = m.label;

    chip.addEventListener('dragstart', (e)=>{
      if(chip.classList.contains('used')){
        e.preventDefault();
        return;
      }
      e.dataTransfer.setData('text/plain', m.id);
      chip.style.opacity = '0.6';
      setTimeout(()=>chip.style.opacity='', 120);
    });

    t1MonthsEl.appendChild(chip);
  });

  [...document.querySelectorAll('.dropzone')].forEach(zone=>{
    zone.ondragover = (e)=>{
      e.preventDefault();
      zone.classList.add('over');
    };
    zone.ondragleave = ()=>{
      zone.classList.remove('over');
    };
    zone.ondrop = (e)=>{
      e.preventDefault();
      zone.classList.remove('over');

      const gotId = e.dataTransfer.getData('text/plain');
      const chip = [...t1MonthsEl.querySelectorAll('.chip')].find(c=>c.dataset.id===gotId);
      if(!chip || chip.classList.contains('used')) return;

      const needSeason = zone.dataset.accept;
      const gotSeason  = chip.dataset.season;

      if(gotSeason === needSeason){
        zone.classList.add('filled');
        const hint = zone.querySelector('.dropHint');
        if(hint) hint.remove();

        chip.classList.add('used','correct');
        chip.draggable = false;

        const mini = document.createElement('div');
        mini.className = 'chip';
        mini.textContent = chip.textContent;
        mini.style.cursor = 'default';
        mini.style.boxShadow = 'none';
        mini.style.borderColor = 'rgba(34,197,94,.55)';
        mini.style.background = '#f0fff5';
        mini.style.pointerEvents = 'none';

        zone.appendChild(mini);

        t1State.correct++;
        t1CorrectEl.textContent = String(t1State.correct);
        sOk();
      }else{
        chip.classList.add('wrong');
        sBad();
        zone.classList.add('badflash');
        setTimeout(()=>{
          chip.classList.remove('wrong');
          zone.classList.remove('badflash');
        }, 380);
      }
    };
  });
}

if (t1ShuffleBtn) t1ShuffleBtn.addEventListener('click', renderTask1);
if (t1ResetBtn) t1ResetBtn.addEventListener('click', renderTask1);

/****************
 * Task 2 — Unscramble
 ****************/
const t2Emoji    = document.getElementById('t2Emoji');
const t2WordLbl  = document.getElementById('t2WordLabel');
const t2Slots    = document.getElementById('t2Slots');
const t2Letters  = document.getElementById('t2Letters');
const t2Status   = document.getElementById('t2Status');
const t2ProgEl   = document.getElementById('t2Prog');
const t2NewBtn   = document.getElementById('t2New');
const t2ResetBtn = document.getElementById('t2Reset');

let t2 = {
  words: shuffle(MONTHS.map(m => ({ word: m.label.toLowerCase(), ru: m.ru, season: m.season }))),
  index: 0,
  answer: '',
  dragEl: null,
  prog: 0
};

function setT2SlotBase(slot){
  slot.classList.remove('filled','badflash');
}
function setT2SlotGood(slot){
  slot.classList.add('filled');
  slot.classList.remove('badflash');
}
function flashT2SlotBad(slot){
  slot.classList.add('badflash');
  setTimeout(()=> slot.classList.remove('badflash'), 260);
}

function buildLetters(word){
  return shuffle(word.split(''));
}

function renderTask2(){
  if(!t2Emoji || !t2WordLbl || !t2Slots || !t2Letters || !t2Status || !t2ProgEl) return;

  const item = t2.words[t2.index];
  t2.answer = item.word;

  t2Emoji.textContent = SEASON_EMOJI[item.season] || '🗓️';
  t2WordLbl.textContent = item.ru;
  t2Status.textContent = "Drag a letter into the correct box.";
  t2.dragEl = null;

  t2Slots.innerHTML = '';
  for(let i=0;i<t2.answer.length;i++){
    const slot = document.createElement('div');
    slot.className = 'slot';
    slot.dataset.pos = String(i);
    slot.dataset.filled = '0';
    setT2SlotBase(slot);

    slot.addEventListener('dragover', e => e.preventDefault());
    slot.addEventListener('drop', e => {
      e.preventDefault();
      if(!t2.dragEl) return;

      if(slot.dataset.filled === '1'){
        sBad();
        flashT2SlotBad(slot);
        t2.dragEl = null;
        return;
      }

      const ch = (t2.dragEl.dataset.ch || '').toLowerCase();
      const pos = Number(slot.dataset.pos);
      const expected = t2.answer[pos];

      if(ch === expected){
        slot.textContent = ch.toUpperCase();
        slot.dataset.filled = '1';
        setT2SlotGood(slot);

        t2.dragEl.classList.add('used');
        t2.dragEl.setAttribute('draggable','false');
        t2.dragEl = null;

        const allFilled = [...t2Slots.querySelectorAll('.slot')]
          .every(s => s.dataset.filled === '1');

        if(allFilled){
          t2.prog = Math.max(t2.prog, t2.index + 1);
          t2ProgEl.textContent = String(Math.min(t2.prog, 12));
          t2Status.textContent = "✅ Great! Next word…";

          setTimeout(()=>{
  if(t2.index < t2.words.length - 1){
    t2.index++;
    renderTask2();
  }else{
    t2Status.textContent = "✅ Great! You finished all 12 words.";
    t2Letters.innerHTML = '';
  }
}, 450);
        }else{
          t2Status.textContent = "Good! Keep going.";
          sOk();
        }
      }else{
        sBad();
        flashT2SlotBad(slot);
        t2Status.textContent = "❌ Wrong place. Try again.";
        t2.dragEl = null;
      }
    });

    t2Slots.appendChild(slot);
  }

  t2Letters.innerHTML = '';
  const letters = buildLetters(t2.answer);

  letters.forEach((ch)=>{
    const tile = document.createElement('div');
    tile.className = 'letter';
    tile.textContent = ch.toUpperCase();
    tile.dataset.ch = ch.toLowerCase();
    tile.setAttribute('draggable','true');

    tile.addEventListener('dragstart', (e)=>{
      t2.dragEl = tile;
      e.dataTransfer.setData('text/plain', ch);
      setTimeout(()=> tile.style.opacity = '0.55', 0);
    });

    tile.addEventListener('dragend', ()=>{
      tile.style.opacity = '';
      t2.dragEl = null;
    });

    t2Letters.appendChild(tile);
  });
}

if (t2NewBtn) {
  t2NewBtn.addEventListener('click', ()=>{
    t2.index = (t2.index + 1) % t2.words.length;
    renderTask2();
  });
}

if (t2ResetBtn) {
  t2ResetBtn.addEventListener('click', ()=>{
    renderTask2();
  });
}

/****************
 * Task 3 — Wordsearch
 ****************/
const wsWordsRaw = MONTHS.map(m => m.label.toUpperCase());

const wsGridEl  = document.getElementById('wsGrid');
const wsWordsEl = document.getElementById('wsWords');
const wsStatus  = document.getElementById('wsStatus');
const t3FoundEl = document.getElementById('t3Found');
const t3TotalEl = document.getElementById('t3Total');
const t3NewBtn  = document.getElementById('t3New');

let ws = {
  size: 12,
  grid: [],
  placements: [],
  activeWord: null,
  activeIndex: 0,
  tempCells: [],
  found: new Set(),
  locked: new Set()
};

function placeWord(word){
  const maxTries = 2200;
  for(let t=0; t<maxTries; t++){
    const dir = Math.random() < 0.5 ? "H" : "V";
    const r = Math.floor(Math.random()*ws.size);
    const c = Math.floor(Math.random()*ws.size);

    const cells = [];
    if(dir === "H"){
      if(c + word.length > ws.size) continue;
      for(let k=0;k<word.length;k++) cells.push(r*ws.size + (c+k));
    }else{
      if(r + word.length > ws.size) continue;
      for(let k=0;k<word.length;k++) cells.push((r+k)*ws.size + c);
    }

    let ok = true;
    for(let k=0;k<word.length;k++){
      const idx = cells[k];
      if(ws.grid[idx]) { ok = false; break; }
    }
    if(!ok) continue;

    for(let k=0;k<word.length;k++){
      ws.grid[cells[k]] = word[k];
    }
    ws.placements.push({word, cells});
    return true;
  }
  return false;
}

function buildWordSearchOrRetry(){
  const maxAttempts = 80;
  for(let a=0; a<maxAttempts; a++){
    ws.grid = Array(ws.size * ws.size).fill("");
    ws.placements = [];

    const words = shuffle(wsWordsRaw.slice());
    let okAll = true;

    for(const w of words){
      const ok = placeWord(w);
      if(!ok){
        okAll = false;
        break;
      }
    }
    if(okAll) return true;
  }
  return false;
}

function newWordSearch(){
  if(!wsGridEl || !wsWordsEl || !wsStatus || !t3FoundEl || !t3TotalEl) return;

  ws.activeWord = null;
  ws.activeIndex = 0;
  ws.tempCells = [];
  ws.found = new Set();
  ws.locked = new Set();

  t3FoundEl.textContent = "0";
  t3TotalEl.textContent = String(wsWordsRaw.length);

  ws.size = 12;
  buildWordSearchOrRetry();

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for(let i=0;i<ws.grid.length;i++){
    if(!ws.grid[i]) ws.grid[i] = letters[Math.floor(Math.random()*letters.length)];
  }

  renderWordSearch();
}

function renderWordSearch(){
  wsGridEl.style.setProperty('--n', ws.size);

  wsWordsEl.innerHTML = "";
  wsWordsRaw.forEach(w=>{
    const b = document.createElement('button');
    b.className = "wordbtn";
    b.textContent = w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    b.dataset.word = w;
    b.addEventListener('click', ()=> selectWord(w));
    wsWordsEl.appendChild(b);
  });

  wsGridEl.innerHTML = "";
  ws.grid.forEach((ch, idx)=>{
    const cell = document.createElement('div');
    cell.className = "cell";
    cell.textContent = ch;
    cell.dataset.idx = String(idx);
    cell.addEventListener('click', ()=> onWsCell(idx, cell));
    wsGridEl.appendChild(cell);
  });

  setWsStatus("");
  syncWordButtons();
  syncLockedCells();
}

function setWsStatus(msg){
  if(wsStatus) wsStatus.textContent = msg;
}

function selectWord(word){
  if(ws.found.has(word)) return;
  ws.activeWord = word;
  ws.activeIndex = 0;
  clearTempMarks();
  setWsStatus(`Now: ${word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()} (click letters in order)`);
  syncWordButtons();
}

function syncWordButtons(){
  if(!wsWordsEl) return;
  [...wsWordsEl.querySelectorAll('.wordbtn')].forEach(btn=>{
    const w = btn.dataset.word;
    btn.classList.toggle('active', ws.activeWord === w);
    btn.classList.toggle('found', ws.found.has(w));
  });
}

function cellEl(idx){
  return wsGridEl ? wsGridEl.querySelector(`.cell[data-idx="${idx}"]`) : null;
}

function syncLockedCells(){
  ws.locked.forEach(idx=>{
    const el = cellEl(idx);
    if(el){
      el.classList.add('locked','good');
      el.classList.remove('bad');
    }
  });
}

function clearTempMarks(){
  ws.tempCells.forEach(idx=>{
    if(ws.locked.has(idx)) return;
    const el = cellEl(idx);
    if(el) el.classList.remove('good','bad');
  });
  ws.tempCells = [];
}

function markBad(idx){
  if(ws.locked.has(idx)) return;
  const el = cellEl(idx);
  if(!el) return;
  el.classList.add('bad');
  setTimeout(()=>el.classList.remove('bad'), 350);
}

function onWsCell(idx, el){
  if(ws.locked.has(idx)) return;
  if(!ws.activeWord){
    sBad();
    setWsStatus("First choose a month on the right 🙂");
    return;
  }

  const expected = ws.activeWord[ws.activeIndex];
  const got = ws.grid[idx];

  if(got === expected){
    sOk();
    el.classList.add('good');
    ws.tempCells.push(idx);
    ws.activeIndex++;

    if(ws.activeIndex === ws.activeWord.length){
      const placement = ws.placements.find(p=>p.word===ws.activeWord);
      const clicked = ws.tempCells.slice();

      const sameSet = placement && placement.cells.length === clicked.length &&
        placement.cells.every(x => clicked.includes(x));

      if(sameSet){
        clicked.forEach(i=>ws.locked.add(i));
        ws.found.add(ws.activeWord);
        if (t3FoundEl) t3FoundEl.textContent = String(ws.found.size);
        setWsStatus(`✅ Found: ${ws.activeWord.charAt(0).toUpperCase() + ws.activeWord.slice(1).toLowerCase()}!`);
      }else{
        sBad();
        setWsStatus("Oops! Try again (wrong path).");
      }

      ws.activeWord = null;
      ws.activeIndex = 0;
      ws.tempCells = [];
      syncWordButtons();
      syncLockedCells();
    }
  }else{
    sBad();
    markBad(idx);
    setWsStatus(`❌ Wrong letter. Start ${ws.activeWord.toLowerCase()} again.`);
    clearTempMarks();
    ws.activeIndex = 0;
  }
}

if (t3NewBtn) t3NewBtn.addEventListener('click', newWordSearch);

/****************
 * Task 4 — Translation Cards
 ****************/
const t4Grid = document.getElementById('t4Grid');
const t4ResetBtn = document.getElementById('t4Reset');

const T4_PHRASES = [
  { ru: 'Зимой обычно идет снег.', en: 'It usually snows in winter.' },
  { ru: 'Я люблю весну, но мой любимый сезон — осень.', en: 'I like spring, but my favourite season is autumn.' },
  { ru: 'Летом солнечно и жарко.', en: 'It is sunny and hot in summer.' },
  { ru: 'Мой день рождения осенью.', en: 'My birthday is in autumn.' },

  { ru: 'Какой самый холодный сезон в году?', en: 'What is the coldest season of the year?' },
  { ru: 'Какой первый месяц весны?', en: 'What is the first month of spring?' },
  { ru: 'Почему ты любишь зиму?', en: 'Why do you like winter?' },
  { ru: 'Мое любимое время года — лето.', en: 'My favourite season is summer.' },

  { ru: 'Ее день рождения в мае.', en: 'Her birthday is in May.' },
  { ru: 'Июнь не холодный.', en: 'June is not cold.' },
  { ru: 'Дети не ходят в школу летом.', en: "Children don't go to school in summer." },
  { ru: 'Сколько времён года в году?', en: 'How many seasons are there in a year?' },

  { ru: 'Какой сейчас месяц?', en: 'What month is it now?' },
  { ru: 'Осенью холодно?', en: 'Is it cold in autumn?' },
  { ru: 'Я люблю кататься на коньках зимой.', en: 'I like skating in winter.' }
];

function renderTask4(){
  if(!t4Grid) return;

  t4Grid.innerHTML = '';

  shuffle(T4_PHRASES).forEach(card=>{
    const el = document.createElement('div');
    el.className = 'translation-card';

    el.innerHTML = `
      <div class="card-inner">
        <div class="card-face card-cover">
          <div class="paper-stack">
            <div class="paper paper-1"></div>
            <div class="paper paper-2"></div>
            <div class="paper paper-3"></div>
          </div>
        </div>

        <div class="card-face card-front">
  <div class="card-text">${card.ru}</div>
</div>

<div class="card-face card-back">
  <div class="card-text">${card.en}</div>
</div>
      </div>
    `;

    let state = 0; // 0 cover, 1 ru, 2 en

    el.addEventListener('click', () => {
      state = (state + 1) % 3;
      el.classList.remove('show-ru','show-en');

      if(state === 1){
        el.classList.add('show-ru');
      } else if(state === 2){
        el.classList.add('show-en');
      }
    });

    t4Grid.appendChild(el);
  });
}

if (t4ResetBtn) t4ResetBtn.addEventListener('click', renderTask4);

/****************
 * Init
 ****************/
(function init(){
  renderTask1();

  if (t2ProgEl) t2ProgEl.textContent = '0';
  renderTask2();

  newWordSearch();
  renderTask4();
})();