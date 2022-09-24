let langGame = "en";
let wordData = null;

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
