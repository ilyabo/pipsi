import {startGame} from "./game";
import "./style.css";

const container = document.querySelector<HTMLDivElement>("#app")!;
container.innerHTML = `

  <img
    class="pipsi-photo"
    src="pipsi-800.png"
    alt="pipsi"
    width="100"
    height="138"
  />

  <section>
  <h1>Hello, my name is Pipsi</h1>
  <p>
  I'm a plush guinea pig. 
  
  I love carrots and I want to eat them all!
  But the longer I run for them, the more I get tired.

  </p>
  <p>  Help me to eat as many carrots as possible before I get tired.</p>
  <button id="start">START</button>
  </section>
`;

// startGame(container);

const startButton = document.querySelector<HTMLButtonElement>("#start");
if (startButton) {
  startButton.addEventListener("click", () => {
    startGame(container);
  });
}
