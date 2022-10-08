const CORRECT = "correct";
const CLOSE = "close";
const WRONG = "wrong";

const WORD_LENGTH_PROPERTY = "--word-length";

const MIN_WORD_LENGTH = 4;
const MAX_WORD_LENGTH = 8;

let langGame = "en";
let wordLength = 6;
let words = null; // all words
let wordLenDict = null; // A mapping from the length of words to word lists.
let alphabet = null; // alphabet
let alphabetStr = null; // A string of alphabet
let alphabetCellDict = null; // A mapping from each character to corresponding char cell

let infoIcon = document.querySelector("i.fa-info");
let infoOverlay = document.querySelector("section.overlay-info");
let infoPopup = infoOverlay.querySelector("div.popup");
let charGrid = infoOverlay.querySelector("div.char-grid");

let settingsIcon = document.querySelector("i.fa-gear");
let settingsOverlay = document.querySelector("section.overlay-settings");
let settingsPopup = settingsOverlay.querySelector("div.popup");

let settingsItemLangGame = settingsOverlay.querySelector(
  ".settings-item-lang-game"
);
let settingsOptionsLangGame = settingsItemLangGame.querySelectorAll(
  "div.settings-option-lang-game"
);
let settingsOptionDictLangGame = {
  en: settingsItemLangGame.querySelector(".en"),
  ja: settingsItemLangGame.querySelector(".ja"),
  es: settingsItemLangGame.querySelector(".es"),
};

let settingsItemWordLength = settingsOverlay.querySelector(
  ".settings-item-word-length"
);
let settingsOptionsWordLength = settingsItemWordLength.querySelectorAll(
  "div.settings-option-word-length"
);

let githubIcon = document.querySelector("i.fa-github");

let firstRow = document.querySelector("div.row");
let firstCell = document.querySelector("div.cell");
let main = document.querySelector("main");
let inputBox = document.querySelector("input.main");
let button = document.querySelector("button.main");
let goal = null;

/**
 * Load data from dicts.
 */

function loadWordLenDict() {
  let res = {};
  for (let i = MIN_WORD_LENGTH; i <= MAX_WORD_LENGTH; i++) {
    res[i] = [];
  }

  words.forEach((w) => {
    if (w.length >= MIN_WORD_LENGTH && w.length <= MAX_WORD_LENGTH) {
      res[w.length].push(w);
    }
  });

  for (let i = MIN_WORD_LENGTH; i <= MAX_WORD_LENGTH; i++) {
    if (res[i].length == 0) {
      console.error(`No word of length ${i}`);
    }
  }

  wordLenDict = res;
}

/**
 * Set up character grid.
 */
function setupCharGrid() {
  charGrid.innerHTML = "";
  alphabetCellDict = {};
  for (let i = 0; i < alphabetStr.length; i++) {
    let newCharCell = document.createElement("div");
    newCharCell.innerText = alphabetStr[i];
    newCharCell.classList.add("char-cell");
    charGrid.appendChild(newCharCell);
    alphabetCellDict[alphabetStr[i]] = newCharCell;
  }
}

/**
 * Load data.
 */

function loadData() {
  fetch(`dicts/${langGame}.json`)
    .then((response) => response.json())
    .then((data) => {
      words = data.words;
      let s = new Set();

      for (let i = 0; i < data.alphabet.length; i++) {
        s.add(data.alphabet[i]);
      }
      alphabet = s;
      alphabetStr = data.alphabet;

      // load wordLenDict
      loadWordLenDict();

      // set goal
      setGoal();

      // setup char grid
      setupCharGrid();
    });
  resetCells();
  initInputBox();
}
loadData();

/**
 * Set goal.
 */
function setGoal() {
  let pool = wordLenDict[wordLength];
  // goal = pool[Math.floor(Math.random() * pool.length)];
  goal = pool[hashInteger(getLastMidnightTimestamp()) % pool.length];

  // cheat
  // console.log(`Goal "${goal}" has been set.`);
}
/**
 * Set cell font size.
 * Reset when resizing window.
 */

function setCellFontSize() {
  let cellSize = firstCell.clientHeight;
  main.style.fontSize = `${cellSize * 0.6}px`;
}
setCellFontSize();
addEventListener("resize", () => {
  setTimeout(setCellFontSize, 650);
});

/**
 * Check input validity.
 */

function checkInput(input) {
  if (alphabet === null || input.length != wordLength) {
    return false;
  }
  for (let i = 0; i < input.length; i++) {
    if (!alphabet.has(input[i])) {
      return false;
    }
  }
  return true;
}

inputBox.addEventListener("input", () => {
  let v = inputBox.value;
  if (langGame == "en" || langGame == "es") {
    v = v.toUpperCase();
  } else if (langGame == "ja") {
    v = hiraganaWord2katakanaWord(v);
  }
  if (checkInput(v)) {
    button.classList.add("valid");
  } else {
    button.classList.remove("valid");
  }
});

/**
 * Judge correctness
 */

function judge(trial, answer) {
  allCorrect = true;
  let res = new Array(wordLength);
  let stat = {};
  for (let i = 0; i < wordLength; i++) {
    stat[trial[i]] = 0;
    stat[answer[i]] = 0;
  }
  for (let i = 0; i < wordLength; i++) {
    if (trial[i] == answer[i]) {
      res[i] = CORRECT;
    } else {
      stat[answer[i]]++;
      allCorrect = false;
    }
  }
  for (let i = 0; i < wordLength; i++) {
    if (res[i] !== CORRECT) {
      if (stat[trial[i]] > 0) {
        res[i] = CLOSE;
        stat[trial[i]]--;
      } else {
        res[i] = WRONG;
      }
    }
  }
  return [res, allCorrect];
}

/**
 * New trial.
 */

button.addEventListener("click", () => {
  let v = inputBox.value;
  if (langGame == "en" || langGame == "es") {
    v = v.toUpperCase();
  } else if (langGame == "ja") {
    v = hiraganaWord2katakanaWord(v);
  }
  if (!checkInput(v)) {
    return;
  }
  if (goal === null) {
    return; // temporary
  }
  inputBox.value = "";
  button.classList.remove("valid");
  judgeRes = judge(v, goal);
  res = judgeRes[0];
  allCorrect = judgeRes[1];

  let rows = main.querySelectorAll("div.row");
  let lastRow = rows[rows.length - 1];
  let lastRowCells = lastRow.querySelectorAll("div.cell");
  for (let i = 0; i < wordLength; i++) {
    lastRowCells[i].innerHTML = v[i];
    lastRowCells[i].classList.add(res[i]);
    let cl = alphabetCellDict[v[i]].classList;
    if (res[i] == CORRECT) {
      cl.add(CORRECT);
      cl.remove(CLOSE);
      cl.remove(WRONG);
    } else if (res[i] == CLOSE) {
      if (!cl.contains(CORRECT)) {
        cl.add(CLOSE);
        cl.remove(WRONG);
      }
    } else if (res[i] == WRONG) {
      if (!cl.contains(CORRECT) && !cl.contains(CLOSE)) {
        cl.add(WRONG);
      }
    }
  }

  if (allCorrect) {
    setTimeout(userWin, 600);
    return;
  }

  let newRow = document.createElement("div");
  newRow.classList.add("row");
  for (let i = 0; i < wordLength; i++) {
    let newCell = document.createElement("div");
    newCell.classList.add("cell");
    newRow.appendChild(newCell);
  }
  main.appendChild(newRow);
});

/**
 * Init input box.
 */
function initInputBox() {
  inputBox.maxLength = wordLength;
  inputBox.value = "";
  inputBox.readOnly = false;
}

/**
 * Process for winning the game
 */
function userWin() {
  inputBox.maxLength = 32767;
  inputBox.value = "Congratulations!";
  inputBox.readOnly = true;
}

/**
 * Get the timestamp of the last midnight date.
 */
function getLastMidnightTimestamp() {
  let d = new Date();
  d.setMinutes(0, 0, 0);
  return Math.floor(d.valueOf() / 1000);
}

/**
 * Hash an integer.
 */

function hashInteger(x) {
  return (x + 347448) % 999983;
}

/**
 * Overlay info show/hide event.
 */
infoIcon.addEventListener("click", () => {
  infoOverlay.classList.add("show");
});

infoOverlay.addEventListener("click", () => {
  infoOverlay.classList.remove("show");
});

infoPopup.addEventListener("click", (e) => {
  e.stopPropagation();
});

/**
 * Overlay settings show/hide event.
 */
settingsIcon.addEventListener("click", () => {
  settingsOverlay.classList.add("show");
});

settingsOverlay.addEventListener("click", () => {
  settingsOverlay.classList.remove("show");
});

settingsPopup.addEventListener("click", (e) => {
  e.stopPropagation();
});

/**
 * Reset cells.
 */
function resetCells() {
  let rows = main.querySelectorAll("div.row");
  for (let i = 1; i < rows.length; i++) {
    rows[i].remove();
  }
  let cells = firstRow.querySelectorAll("div.cell");
  cells.forEach((cell) => {
    cell.innerHTML = "";
    cell.classList.remove(CORRECT, CLOSE, WRONG);
  });

  if (cells.length < wordLength) {
    main.style.setProperty(WORD_LENGTH_PROPERTY, wordLength);
    let diff = wordLength - cells.length;
    for (let i = 0; i < diff; i++) {
      let newCell = document.createElement("div");
      newCell.classList.add("cell");
      firstRow.appendChild(newCell);
    }
  } else if (cells.length > wordLength) {
    let l = cells.length;
    for (let i = wordLength; i < l; i++) {
      cells[i].remove();
    }
    main.style.setProperty(WORD_LENGTH_PROPERTY, wordLength);
  }
}

/**
 * Game language selection events.
 */
for (let [k, v] of Object.entries(settingsOptionDictLangGame)) {
  v.addEventListener("click", () => {
    if (v.classList.contains("selected")) return;
    settingsOptionsLangGame.forEach((option) => {
      option.classList.remove("selected");
    });
    v.classList.add("selected");
    langGame = k;
    loadData();
  });
}

/**
 * Word length selection events.
 */
settingsOptionsWordLength.forEach((o) => {
  o.addEventListener("click", () => {
    if (o.classList.contains("selected")) return;
    settingsOptionsWordLength.forEach((option) => {
      option.classList.remove("selected");
    });
    o.classList.add("selected");
    wordLength = Number(o.innerHTML);
    loadData();
  });
});

/**
 * Ja tools
 */

function isHiragana(c) {
  let o = c.charCodeAt(0);
  return o >= 12353 && o <= 12438;
}

function hiragana2katakana(c) {
  if (isHiragana(c)) {
    return String.fromCharCode(c.charCodeAt(0) + 96);
  }
  return c;
}

function hiraganaWord2katakanaWord(w) {
  let res = [];
  for (let i = 0; i < w.length; i++) {
    res.push(hiragana2katakana(w[i]));
  }
  return res.join("");
}

/**
 * Press the Github icon.
 */
githubIcon.addEventListener("click", () => {
  window.open("https://github.com/acst1223/wordle_plus");
});
