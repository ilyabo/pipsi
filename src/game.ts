import * as PIXI from "pixi.js";
import {randomNormal} from "d3-random";

const container = document.querySelector<HTMLDivElement>("#app")!;
let pipsi: PIXI.Sprite;
let carrots: PIXI.Sprite[] = [];
let level = 1;

let screenArea: number;
const IPHONE_12_SCREEN_AREA = 329160;
let gameStarted = false;

let pause = false;
let numCarrots = 7;
const PIPSI_SCALE = 0.35;
const INITIAL_SPEED = 1;
// let INITIAL_NUM_CARROTS = 7;
let speed = INITIAL_SPEED;
const ENERGY_LOSS_FACTOR = 0.001;
const ROTATION_ENERGY_COST = 0.01;
const CARROT_SIGMA_FACTOR = 25;
const CARROT_ENERGY_BOOST_FACTOR = 0.2;
const ENERGY_BOOST_ON_LEVEL_COMPLETION = 1.0;
let levelScore = 0;
let energyLevel = 1;
const KEYBOARD_ROTATION_ANGLE = Math.PI / 16;

let levelText: PIXI.Text;
let scoreText: PIXI.Text;
let resultText: PIXI.Text;

let maxScore = Number(localStorage.getItem("maxScore")) || 0;
let score = 0;
let isLevelCompleted = false;

function checkCollision() {
  const rectA = pipsi.getBounds();

  for (let i = 0; i < carrots.length; i++) {
    const rectB = carrots[i].getBounds();

    if (
      rectA.x + rectA.width > rectB.x &&
      rectA.x < rectB.x + rectB.width &&
      rectA.y + rectA.height > rectB.y &&
      rectA.y < rectB.y + rectB.height
    ) {
      energyLevel = Math.min(
        energyLevel +
          CARROT_ENERGY_BOOST_FACTOR *
            carrots[i].scale.x *
            (screenArea / IPHONE_12_SCREEN_AREA),
        1
      );
      carrots[i].destroy();
      carrots.splice(i, 1);
      i--;

      score++;
      levelScore++;
      if (score > maxScore) {
        maxScore = score;
        localStorage.setItem("maxScore", maxScore.toString());
      }
      updateScore();
    }
  }
}

const audio = new Audio("control-seq.mp3");
audio.loop = true;

// Handle visibility change event
function handleVisibilityChange() {
  if (gameStarted) {
    if (document.visibilityState === "hidden") {
      // Tab is hidden, pause the audio
      audio.pause();
    } else {
      // Tab is visible, resume playing the audio
      audio.play();
    }
  }
}

// Attach visibility change event listener
document.addEventListener("visibilitychange", handleVisibilityChange);

function updateScore() {
  scoreText.text =
    "Score: " + score + (maxScore > score ? " (High: " + maxScore + ")" : "");
  if (levelScore === numCarrots) {
    showResult("Level completed!\nTap to continue");
    isLevelCompleted = true;
    energyLevel = Math.min(1, energyLevel + ENERGY_BOOST_ON_LEVEL_COMPLETION);
    // audio.pause();
    // audio.currentTime = 0;
  }
}

const textStyle = new PIXI.TextStyle({
  dropShadow: true,
  dropShadowAngle: 0,
  dropShadowBlur: 3,
  dropShadowColor: "#000000",
  dropShadowDistance: 0,

  fontFamily: "Arial",
  fontSize: 24,
  fill: 0xffffff,
  align: "center",
});

function keepWithinBounds(x: number, y: number) {
  const margin = 5;
  const width = app.screen.width;
  const height = app.screen.height;
  if (x < margin) {
    x = margin;
  } else if (x > width - margin) {
    x = width - margin;
  }
  if (y < margin) {
    y = margin;
  } else if (y > height - margin) {
    y = height - margin;
  }
  return [x, y];
}

function initCarrots(app: PIXI.Application) {
  for (let i = 0; i < numCarrots; i++) {
    const carrot = PIXI.Sprite.from("carrot-100.png");
    carrot.anchor.set(0.5);
    const [x, y] = keepWithinBounds(
      randomNormal(app.screen.width / 2, 50 + CARROT_SIGMA_FACTOR * level)(),
      randomNormal(app.screen.height / 2, 50 + CARROT_SIGMA_FACTOR * level)()
    );
    carrot.x = x;
    carrot.y = y;
    carrot.scale.set(0.25 + Math.random() * 0.25);
    carrot.rotation = Math.random() * 2 * Math.PI;
    app.stage.addChild(carrot);
    carrots.push(carrot);
  }
}

function updateLevelText() {
  levelText.text = "Level: " + level;
}

function startLevel() {
  resultText.visible = false;
  audio.play();

  updateLevelText();
  // numCarrots = INITIAL_NUM_CARROTS + (level - 1) * 2;
  audio.playbackRate = 1 + 0.05 * level;
  speed = INITIAL_SPEED + (level - 1) * 0.25;
  initCarrots(app);
  isLevelCompleted = false;
  levelScore = 0;
  updateScore();
  for (const carrot of carrots) {
    app.stage.addChild(carrot);
  }
}

const app = new PIXI.Application({
  antialias: true,
  background: "#10909e",
  resizeTo: window,
});

const background = PIXI.Sprite.from("bg_grass.jpg");

background.width = app.screen.width;
background.height = app.screen.height;
background.alpha = 0.125;
app.stage.addChild(background);

scoreText = new PIXI.Text("", {
  ...textStyle,
  fontSize: 24,
});
scoreText.x = 10;
scoreText.y = 10;
app.stage.addChild(scoreText);
updateScore();

// Create a container for the progress bar
const energyBarContainer = new PIXI.Container();
energyBarContainer.x = 10;
energyBarContainer.y = 70;
app.stage.addChild(energyBarContainer);

// Create the background rectangle
const energyBackground = new PIXI.Graphics();
energyBackground.beginFill(0xcccccc);
energyBackground.drawRect(0, 0, 200, 10);
energyBackground.endFill();
energyBarContainer.addChild(energyBackground);

// Create the progress rectangle
const energyBar = new PIXI.Graphics();
energyBar.beginFill(0xff0000);
energyBar.drawRect(0, 0, 0, 10);
energyBar.endFill();
energyBarContainer.addChild(energyBar);

// Update the progress bar
function updateEnergyBar() {
  const width = 200 * energyLevel;
  energyBar.clear();
  energyBar.beginFill(0xff0000);
  energyBar.drawRect(0, 0, width, 10);
  energyBar.endFill();
}

resultText = new PIXI.Text("", textStyle);
resultText.anchor.set(0.5, 0.5);
resultText.x = app.screen.width / 2;
resultText.y = app.screen.height / 2;
resultText.visible = false;
app.stage.addChild(resultText);

function showResult(text: string) {
  resultText.text = text;
  resultText.visible = true;
}

levelText = new PIXI.Text("", {
  ...textStyle,
  fontSize: 20,
});
levelText.x = 10;
levelText.y = 40;
app.stage.addChild(levelText);
updateLevelText();

initCarrots(app);
// create a new Sprite from an image path
pipsi = PIXI.Sprite.from("pipsi-top-100.png");
// center the sprite's anchor point
pipsi.anchor.set(0.5);
pipsi.scale.set(PIPSI_SCALE);
pipsi.rotation += Math.PI;

// move the sprite to the center of the screen
pipsi.x = app.screen.width / 2;
pipsi.y = app.screen.height / 2;

app.stage.addChild(pipsi);

// Enable interactivity!
// app.stage.interactive = true;

// Make sure the whole canvas area is interactive, not just the circle.
// app.stage.hitArea = app.screen;

app.stage.eventMode = "dynamic";
let prevX = 0;

function restart() {
  level = 1;
  energyLevel = 1;
  score = 0;
  pipsi.x = app.screen.width / 2;
  pipsi.y = app.screen.height / 2;
  for (const carrot of carrots) {
    carrot.destroy();
  }
  audio.currentTime = 0;
  carrots = [];
  startLevel();
}

resultText.eventMode = "dynamic";
resultText.onpointerdown = () => {
  if (isLevelCompleted) {
    level++;
    startLevel();
  } else if (energyLevel === 0) {
    restart();
  }
};

app.stage.addEventListener("pointerdown", (event) => {
  if (!isLevelCompleted && energyLevel > 0) {
    prevX = event.global.x;
  }
});

app.stage.on("pointermove", (event) => {
  if (energyLevel === 0) return;
  const dx = event.global.x - prevX;
  prevX = event.global.x;
  const angle = (dx * Math.PI) / 180;
  pipsi.rotation += angle;
  applyRotationCost(angle);
});

function onTired() {
  showResult("Uff… I just got too tired!\nTap to try again");
  audio.pause();
}

function applyRotationCost(angle: number) {
  energyLevel = Math.max(0, energyLevel - angle * ROTATION_ENERGY_COST);
  if (energyLevel === 0) {
    onTired();
  }
}

window.addEventListener("keydown", (e) => {
  if (isLevelCompleted) {
    level++;
    startLevel();
  }
  switch (e.code) {
    // case "ArrowUp":
    //   pipsi.x += Math.cos(pipsi.rotation + Math.PI / 2) * 10;
    //   pipsi.y += Math.sin(pipsi.rotation + Math.PI / 2) * 10;
    //   break;
    // case "ArrowDown":
    //   pipsi.x -= Math.cos(pipsi.rotation + Math.PI / 2) * 10;
    //   pipsi.y -= Math.sin(pipsi.rotation + Math.PI / 2) * 10;
    //   break;
    case "ArrowLeft":
      if (energyLevel === 0) return;
      pipsi.rotation -= KEYBOARD_ROTATION_ANGLE;
      applyRotationCost(KEYBOARD_ROTATION_ANGLE);
      break;
    case "ArrowRight":
      if (energyLevel === 0) return;
      pipsi.rotation += Math.PI / 16;
      applyRotationCost(KEYBOARD_ROTATION_ANGLE);
      break;
    case "Space":
      if (energyLevel === 0) {
        restart();
      } else {
        pause = !pause;
        if (pause) {
          audio.pause();
        } else {
          audio.play();
        }
      }
      break;
  }
});

export function startGame() {
  gameStarted = true;
  container.replaceChildren(app.view as unknown as Node);
  audio.play();
  screenArea = app.screen.width * app.screen.height;
  console.log("screenArea", screenArea);

  let tick = 0;
  // Listen for animate update
  app.ticker.add((delta) => {
    if (pause) return;
    if (energyLevel === 0) return;
    if (isLevelCompleted) {
      // just for fun, let's rotate mr rabbit a little
      // delta is 1 if running at 100% performance
      // creates frame-independent transformation
      pipsi.rotation += 0.1 * delta;
      return;
    }
    updateEnergyBar();

    tick += delta;
    // pipsi.scale.y = PIPSI_SCALE + Math.sin(tick * 0.1) * 0.02;

    energyLevel = Math.max(0, energyLevel - delta * speed * ENERGY_LOSS_FACTOR);
    if (energyLevel === 0) {
      onTired();
    }

    pipsi.x += Math.cos(pipsi.rotation + Math.PI / 2) * speed * delta;
    pipsi.y += Math.sin(pipsi.rotation + Math.PI / 2) * speed * delta;

    if (pipsi.x < 0) {
      pipsi.x = app.screen.width;
    }
    if (pipsi.x > app.screen.width) {
      pipsi.x = 0;
    }
    if (pipsi.y < 0) {
      pipsi.y = app.screen.height;
    }
    if (pipsi.y > app.screen.height) {
      pipsi.y = 0;
    }
    checkCollision();
  });
}
