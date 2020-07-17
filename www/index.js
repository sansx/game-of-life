import { Universe, Cell } from "test1";
// Import the WebAssembly memory at the top of the file.
import { memory } from "test1/test1_bg";

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
const DEAD_COLOR = "#FFFFFF";
const ALIVE_COLOR = "#000000";
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

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const idx = getIndex(row, col);

      ctx.fillStyle = cells[idx] === Cell.Dead
        ? DEAD_COLOR
        : ALIVE_COLOR;

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