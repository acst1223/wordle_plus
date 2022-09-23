h1 = document.createElement("h1");
h1.innerHTML = "h1 test";
body = document.querySelector("body");
body.appendChild(h1);

let data = null;

fetch("dicts/t.json")
  .then((response) => response.json())
  .then((d) => {
    data = d;
  });

setTimeout(() => {
  h1.innerHTML = data.ckk;
}, 100);

console.log(data, 0);
