<div align="center">

  <h1><code>wasm_game_of_life</code></h1>

  <strong>Conway's Game of Life in Rust and WebAssembly</strong>

  <!-- <p>
    <a href="https://travis-ci.org/rustwasm/wasm_game_of_life"><img src="https://img.shields.io/azure-devops/build/rustwasm/gloo/6.svg?style=flat-square" alt="Build Status" /></a>
  </p>

  <sub>Built with 🦀🕸 by <a href="https://rustwasm.github.io/">The Rust and WebAssembly Working Group</a></sub> -->
</div>

## About

This repository is made base on [Tutorial: Conway's Game of Life](https://rustwasm.github.io/book/game-of-life/introduction.html), the tutorial builds increasingly featureful implementations of [Conway's Game of Life][game-of-life].

## 🚴 Usage
### 🛠️ Install `wasm-pack`
check the website to get [`wasm-pack`](https://rustwasm.github.io/wasm-pack/installer/)

### 🛠️ Build with `wasm-pack build`

```
wasm-pack build
```
### Go to www dir and install frontend dependents with npm
```
cd www && npm i
```

### Running server
```
npm run start
```

### [Read the tutorial here!][tutorial]

[game-of-life]: https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life
[tutorial]: https://rustwasm.github.io/book/game-of-life/introduction.html
