let langGame = "en";
let wordData = null;

let firstCell = document.querySelector("div.cell");
let main = document.querySelector("main");

function loadData() {
  fetch(`dicts/${langGame}.json`)
    .then((response) => response.json())
    .then((data) => {
      wordData = data;
    });
}
loadData();

setTimeout(() => {
  console.log("wordData", wordData);
}, 100);

function setCellFontSize() {
  let cellSize = firstCell.clientHeight;
  main.style.fontSize = `${cellSize * 0.6}px`;
}
setCellFontSize();
addEventListener("resize", () => {
  setCellFontSize();
});
