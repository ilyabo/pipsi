import {startGame} from "./game";
import "./style.css";

const container = document.querySelector<HTMLDivElement>("#app")!;
container.innerHTML = `
  <img
    class="pipsi-photo"
    src="pipsi-800.png"
    alt="pipsi"
    width="200"
    height="276"
  />

  <h1>Hello, my name is PIPSI.</h1>
  <p>
  I'm a plush guinea pig. 
  
  I love carrots and I want to eat them all!
  </p>
  <p>Do you want to play with me?</p>
  <button id="start">START</button>
`;

let isPlaying = false;

// startGame(container);

const startButton = document.querySelector<HTMLButtonElement>("#start");
if (startButton) {
  startButton.addEventListener("click", () => {
    isPlaying = true;
    startGame(container);
  });
}
