import { Universe, Cell } from "wasm-game-of-life";
// Import the WebAssembly memory at the top of the file.
import { memory } from "wasm-game-of-life/wasm_game_of_life_bg";
import "./static/css/nes.min.css";

// Version 1: use text render game
// const pre = document.getElementById("game-of-life-canvas");
// const universe = Universe.new();

// const renderLoop = () => {
//     pre.textContent = universe.render();
//     universe.tick();

//     requestAnimationFrame(renderLoop);
// };
// requestAnimationFrame(renderLoop);

const CELL_SIZE = 5; // px
const GRID_COLOR = "#CCCCCC";
// const DEAD_COLOR = "#FFFFFF";
// const ALIVE_COLOR = "#000000";
const DEAD_COLOR = '#B6BCC2';
const ALIVE_COLOR = "#2E3635";

let generType;

const rangeIpt = document.getElementById('rangeipt')
console.log(rangeIpt.value);

// Construct the universe, and get its width and height.
const universe = Universe.new();
const width = universe.width();
const height = universe.height();

// Give the canvas room for all of our cells and a 1px border
// around each of them.
const canvas = document.getElementById("game-of-life-canvas");
canvas.height = (CELL_SIZE + 1) * height + 1;
canvas.width = (CELL_SIZE + 1) * width + 1;

const ctx = canvas.getContext('2d');

const drawGrid = () => {
  ctx.beginPath();
  ctx.strokeStyle = GRID_COLOR;
  // Vertical lines.
  for (let i = 0; i <= width; i++) {
    ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0);
    ctx.lineTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * height + 1);
  }

  // Horizontal lines.
  for (let j = 0; j <= height; j++) {
    ctx.moveTo(0, j * (CELL_SIZE + 1) + 1);
    ctx.lineTo((CELL_SIZE + 1) * width + 1, j * (CELL_SIZE + 1) + 1);
  }
  ctx.stroke();
};

const getIndex = (row, column) => {
  return row * width + column;
};

const drawCells = () => {
  const cellsPtr = universe.cells();
  const cells = new Uint8Array(memory.buffer, cellsPtr, width * height);

  ctx.beginPath();

  // for (let row = 0; row < height; row++) {
  //   for (let col = 0; col < width; col++) {
  //     const idx = getIndex(row, col);

  //     ctx.fillStyle = cells[idx] === Cell.Dead
  //       ? DEAD_COLOR
  //       : ALIVE_COLOR;

  //     ctx.fillRect(
  //       col * (CELL_SIZE + 1) + 1,
  //       row * (CELL_SIZE + 1) + 1,
  //       CELL_SIZE,
  //       CELL_SIZE
  //     );
  //   }
  // }

  // Alive cells.
  ctx.fillStyle = ALIVE_COLOR;
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const idx = getIndex(row, col);
      if (cells[idx] !== Cell.Alive) {
        continue;
      }
      ctx.fillRect(
        col * (CELL_SIZE + 1) + 1,
        row * (CELL_SIZE + 1) + 1,
        CELL_SIZE,
        CELL_SIZE
      );
    }
  }

  // Dead cells.
  ctx.fillStyle = DEAD_COLOR;
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const idx = getIndex(row, col);
      if (cells[idx] !== Cell.Dead) {
        continue;
      }

      ctx.fillRect(
        col * (CELL_SIZE + 1) + 1,
        row * (CELL_SIZE + 1) + 1,
        CELL_SIZE,
        CELL_SIZE
      );
    }
  }

  ctx.stroke();
};

drawGrid()
drawCells()

let animationId = null;


const renderLoop = () => {
  // debugger;
  fps.render();
  universe.tick();
  drawGrid();
  drawCells();
  if (rangeIpt.value == 1) {
    clearInterval(animationId)
    animationId = requestAnimationFrame(renderLoop)
  } else if (!animationId) {
    cancelAnimationFrame(animationId)
    animationId = setInterval(renderLoop, rangeIpt.value * 100);
  }
};

const isPaused = () => {
  return animationId === null;
};

const playPauseButton = document.getElementById("play-pause");
const nextButton = document.getElementById('next-step')
const destoryButton = document.getElementById('boom')
const resetButton = document.getElementById('reset')

const play = () => {
  playPauseButton.textContent = "||";
  renderLoop();
};

const drawNext = () => {
  universe.tick();
  drawGrid();
  drawCells();
}

const pause = () => {
  playPauseButton.textContent = ">";
  clearInterval(animationId)
  cancelAnimationFrame(animationId);
  animationId = null;
};

playPauseButton.addEventListener("click", event => {
  if (isPaused()) {
    play();
  } else {
    pause();
  }
});

nextButton.addEventListener('click', drawNext)

destoryButton.addEventListener('click', () => {
  universe.destory();
  drawNext()
})

rangeIpt.addEventListener('change', ({ target: { value } }) => {
  console.log(
    value
  );
  clearInterval(animationId)
  cancelAnimationFrame(animationId);
  animationId = null
  renderLoop();
})

resetButton.addEventListener('click', () => {
  universe.reset();
  drawGrid();
  drawCells();
})

canvas.addEventListener("click", event => {
  const boundingRect = canvas.getBoundingClientRect();

  const scaleX = canvas.width / boundingRect.width;
  const scaleY = canvas.height / boundingRect.height;

  const canvasLeft = (event.clientX - boundingRect.left) * scaleX;
  const canvasTop = (event.clientY - boundingRect.top) * scaleY;

  const row = Math.min(Math.floor(canvasTop / (CELL_SIZE + 1)), height - 1);
  const col = Math.min(Math.floor(canvasLeft / (CELL_SIZE + 1)), width - 1);

  universe.toggle_cell(row, col);
  drawGrid();
  drawCells();
});

document.onkeydown = e => {
  // keyCode 16 : Shift
  // keyCode 17 : Control
  switch (e.keyCode) {
    case 16:
      generType = 'pulsar'
      break
    case 17:
      generType = 'glider'
      break;
    default:
      generType = null
      break;
  }
}

document.onkeyup = () => {
  generType = null
}

// renderLoop()

const fps = new class {
  constructor() {
    this.fps = document.getElementById("fps");
    this.frames = [];
    this.lastFrameTimeStamp = performance.now();
  }

  render() {
    // Convert the delta time since the last frame render into a measure
    // of frames per second.
    const now = performance.now();
    const delta = now - this.lastFrameTimeStamp;
    this.lastFrameTimeStamp = now;
    const fps = 1 / delta * 1000;

    // Save only the latest 100 timings.
    this.frames.push(fps);
    if (this.frames.length > 100) {
      this.frames.shift();
    }

    // Find the max, min, and mean of our 100 latest timings.
    let min = Infinity;
    let max = -Infinity;
    let sum = 0;
    for (let i = 0; i < this.frames.length; i++) {
      sum += this.frames[i];
      min = Math.min(this.frames[i], min);
      max = Math.max(this.frames[i], max);
    }
    let mean = sum / this.frames.length;

    // Render the statistics.
    this.fps.textContent = `
         latest = ${Math.round(fps)}
avg of last 100 = ${Math.round(mean)}
min of last 100 = ${Math.round(min)}
max of last 100 = ${Math.round(max)}
    `.trim();
  }
};



