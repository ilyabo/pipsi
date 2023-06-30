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
  <h2>My name is Pipsi</h2>

  <p>
  
    I'm a plush guinea pig. 
  
  I love carrots and I want to eat them all!
  But the longer I run for them, the more I get tired.
  Help me to eat as many carrots as possible before I get tired.
  </p>
  <button id="start">START</button>
  
  <p>  </p>

  </section>
`;

// startGame(container);

const startButton = document.querySelector<HTMLButtonElement>("#start");
if (startButton) {
  startButton.addEventListener("click", () => {
    startGame(container);
  });
}
