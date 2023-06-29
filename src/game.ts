import * as PIXI from "pixi.js";

let pipsi: PIXI.Sprite;
const carrots: PIXI.Sprite[] = [];
let level = 1;

let pause = false;
let numCarrots = 10;
let speed = 5;

let levelText: PIXI.Text;
let scoreText: PIXI.Text;
let score = 0;
let finished = false;

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
      carrots[i].destroy();
      carrots.splice(i, 1);
      i--;

      score++;
      updateScore();
    }
  }
}

const audio = new Audio("control-seq.mp3");
audio.loop = true;

function finish() {
  scoreText.text = "Well done! Click to continue";
  finished = true;
  // audio.pause();
  // audio.currentTime = 0;
}

function updateScore() {
  scoreText.text = "Carrots: " + (numCarrots - score);
  if (score === numCarrots) {
    finish();
  }
}

function initCarrots(app: PIXI.Application) {
  for (let i = 0; i < numCarrots; i++) {
    const carrot = PIXI.Sprite.from("carrot-100.png");
    carrot.anchor.set(0.5);
    carrot.x = Math.random() * app.screen.width;
    carrot.y = Math.random() * app.screen.height;
    carrot.scale.set(0.25 + Math.random() * 0.25);
    carrot.rotation = Math.random() * 2 * Math.PI;
    app.stage.addChild(carrot);
    carrots.push(carrot);
  }
}

function updateLevelText() {
  levelText.text = "Level: " + level;
}

function startNextLevel(app: PIXI.Application) {
  audio.playbackRate = 1 + 0.5 * level;
  audio.play();
  level++;
  updateLevelText();
  numCarrots = level * 10;
  speed = 5 + (level - 1) * 2;
  initCarrots(app);
  finished = false;
  score = 0;
  updateScore();
  for (const carrot of carrots) {
    app.stage.addChild(carrot);
  }
}

export function startGame(container: HTMLElement) {
  const app = new PIXI.Application({background: "#10909e", resizeTo: window});

  container.replaceChildren(app.view as unknown as Node);
  audio.play();

  const background = PIXI.Sprite.from("bg_grass.jpg");

  background.width = app.screen.width;
  background.height = app.screen.height;
  background.alpha = 0.125;
  app.stage.addChild(background);

  // create a new Sprite from an image path
  pipsi = PIXI.Sprite.from("pipsi-top-100.png");

  scoreText = new PIXI.Text("", {
    fontFamily: "Arial",
    fontSize: 36,
    fill: 0xffffff,
  });
  scoreText.x = 10;
  scoreText.y = 10;
  app.stage.addChild(scoreText);
  updateScore();

  levelText = new PIXI.Text("", {
    fontFamily: "Arial",
    fontSize: 24,
    fill: 0xffffff,
  });
  levelText.x = 10;
  levelText.y = 60;
  app.stage.addChild(levelText);
  updateLevelText();

  initCarrots(app);

  // center the sprite's anchor point
  pipsi.anchor.set(0.5);
  pipsi.scale.set(0.5);
  pipsi.rotation += Math.PI;

  // move the sprite to the center of the screen
  pipsi.x = app.screen.width / 2;
  pipsi.y = app.screen.height / 2;

  app.stage.addChild(pipsi);

  app.stage.interactive = true;
  app.stage.on("pointerdown", () => {
    if (finished) {
      startNextLevel(app);
    } else {
      pause = !pause;
      if (pause) {
        audio.pause();
      } else {
        audio.play();
      }
    }
  });
  app.stage.on("pointermove", (event) => {
    //filter.uniforms.mouse.copyFrom(event.global);
    pipsi.rotation += (event.movement.x * Math.PI) / 180;
  });

  window.addEventListener("keydown", (e) => {
    if (finished) {
      startNextLevel(app);
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
        pipsi.rotation -= Math.PI / 16;
        break;
      case "ArrowRight":
        pipsi.rotation += Math.PI / 16;
        break;
    }
  });

  // Listen for animate update
  app.ticker.add((delta) => {
    if (pause) return;
    if (finished) {
      // just for fun, let's rotate mr rabbit a little
      // delta is 1 if running at 100% performance
      // creates frame-independent transformation
      pipsi.rotation += 0.1 * delta;
      return;
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
