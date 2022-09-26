const CORRECT = "correct";
const CLOSE = "close";
const WRONG = "wrong";

const MIN_WORD_LENGTH = 4;
const MAX_WORD_LENGTH = 8;

let langGame = "en";
let wordLength = 6;
let words = null; // all words
let wordLenDict = null; // A mapping from the length of words to word lists.
let alphabet = null; // alphabet

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

      // load wordLenDict
      loadWordLenDict();

      // set goal
      setGoal();
    });
}
loadData();

/**
 * Set goal.
 */
function setGoal() {
  let pool = wordLenDict[wordLength];
  goal = pool[Math.floor(Math.random() * pool.length)];

  // cheat
  console.log(`Goal "${goal}" has been set.`);
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
  setCellFontSize();
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
  if (langGame == "en") {
    v = v.toUpperCase();
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
  if (langGame == "en") {
    v = v.toUpperCase();
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
  }

  if (allCorrect) {
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
