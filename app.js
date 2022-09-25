let langGame = "en";
let wordLength = 6;
let words = null; // all words
let alphabet = null; // alphabet

let firstCell = document.querySelector("div.cell");
let main = document.querySelector("main");
let inputBox = document.querySelector("input.main");
let button = document.querySelector("button.main");

/**
 * Load data from dicts.
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
    });
}
loadData();

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
  console.log(v, checkInput(v));
});
