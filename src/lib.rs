mod utils;
use std::fmt;
use wasm_bindgen::prelude::*;
extern crate js_sys;
extern crate web_sys;

// A macro to provide `println!(..)`-style syntax for `console.log` logging.
macro_rules! log {
  ( $( $t:tt )* ) => {
    web_sys::console::log_1(&format!( $( $t )* ).into());
  };
}

use web_sys::console;

pub struct Timer<'a> {
    name: &'a str,
}

impl<'a> Timer<'a> {
    pub fn new(name: &'a str) -> Timer<'a> {
        #[allow(unused_unsafe)]
        unsafe {
            console::time_with_label(name);
        }
        Timer { name }
    }
}

impl<'a> Drop for Timer<'a> {
    fn drop(&mut self) {
        #[allow(unused_unsafe)]
        unsafe {
            console::time_end_with_label(self.name);
        }
    }
}

#[wasm_bindgen]
#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Cell {
    Dead = 0,
    Alive = 1,
}

#[wasm_bindgen]
pub struct Universe {
    width: u32,
    height: u32,
    cells: Vec<Cell>,
}

impl Cell {
    fn toggle(&mut self) {
        *self = match *self {
            Cell::Dead => Cell::Alive,
            Cell::Alive => Cell::Dead,
        };
    }
}

#[allow(unused_unsafe)]
#[wasm_bindgen]
impl Universe {
    pub fn new() -> Universe {
        utils::set_panic_hook();
        let width = 64;
        let height = 64;

        let cells = (0..width * height)
            .map(|_i| {
                unsafe {
                    if js_sys::Math::random() < 0.5 {
                        Cell::Alive
                    } else {
                        Cell::Dead
                    }
                }

                // if i % 2 == 0 || i % 7 == 0 {
                //     Cell::Alive
                // } else {
                //     Cell::Dead
                // }
            })
            .collect();

        Universe {
            width,
            height,
            cells,
        }
    }

    pub fn render(&self) -> String {
        self.to_string()
    }

    pub fn set_width(&mut self, width: u32) {
        self.width = width;
        self.cells = (0..width * self.height).map(|_i| Cell::Dead).collect();
    }

    pub fn width(&self) -> u32 {
        self.width
    }

    pub fn set_height(&mut self, height: u32) {
        self.height = height;
        self.cells = (0..self.width * height).map(|_i| Cell::Dead).collect();
    }

    pub fn height(&self) -> u32 {
        self.height
    }

    pub fn cells(&self) -> *const Cell {
        self.cells.as_ptr()
    }

    pub fn toggle_cell(&mut self, row: u32, column: u32) {
        let idx = self.get_index(row, column);
        self.cells[idx].toggle();
    }

    fn clear_area(&mut self, row: u32, column: u32, range: u32) -> (u32, u32) {
        let min_num: u32 = (range as f32 / 2.0).floor() as u32;
        let mut max_num = self.width - min_num;
        if range % 2 > 0 {
            max_num -= 1;
        }

        let offset_num = move |target| {
            if target < min_num {
                return min_num;
            }
            if target > max_num {
                return max_num;
            }
            target
        };

        let offset_row = offset_num(row) - min_num;
        let offset_column = offset_num(column) - min_num;

        (0..range).for_each(|a| {
            (offset_column..).take(range as usize).for_each(|b| {
                let idx = self.get_index(a + offset_row, b);
                self.cells[idx] = Cell::Dead;
            })
        });
        (offset_row, offset_column)
    }

    pub fn gene_cell(&mut self, row: u32, column: u32, target: &str) {
        let (x, y) = self.clear_area(row, column, Self::type_match(target));

        let res_position = match target {
            "glider" => Self::glider_pos(x + 1, y + 1),
            "pulsar" => Self::pulsar_pos(x + 1, y + 1),
            _ => Self::glider_pos(x + 1, y + 1),
        };

        res_position.iter().for_each(|(a, b)| {
            let idx = self.get_index(*a, *b);
            self.cells[idx] = Cell::Alive;
        });
    }

    fn type_match(gene_type: &str) -> u32 {
        match gene_type {
            "glider" => 5,
            "pulsar" => 15,
            _ => 5,
        }
    }

    #[inline]
    fn glider_pos(x: u32, y: u32) -> Vec<(u32, u32)> {
        vec![
            (x + 1, y),
            (x + 2, y + 1),
            (x, y + 2),
            (x + 1, y + 2),
            (x + 2, y + 2),
        ]
    }

    #[inline]
    fn pulsar_pos(x: u32, y: u32) -> Vec<(u32, u32)> {
        println!("{}, {}", x, y);
        let res: Vec<u32> = (2..).take(3).chain((8..).take(3)).collect();
        let mut target: Vec<(u32, u32)> = Vec::new();
        println!("res:{:?}", res);
        vec![0, 5, 7, 12].iter().for_each(|init_x| {
            res.iter().for_each(|init_y| {
                target.push((*init_x + x, *init_y + y));
                target.push((*init_y + x, *init_x + y));
            })
        });
        target
    }

    #[inline]
    fn get_index(&self, row: u32, column: u32) -> usize {
        (row * self.width + column) as usize
    }

    fn live_neighbor_count(&self, row: u32, column: u32) -> u8 {
        let mut count = 0;

        let north = if row == 0 { self.height - 1 } else { row - 1 };

        let south = if row == self.height - 1 { 0 } else { row + 1 };

        let west = if column == 0 {
            self.width - 1
        } else {
            column - 1
        };

        let east = if column == self.width - 1 {
            0
        } else {
            column + 1
        };

        let nw = self.get_index(north, west);
        count += self.cells[nw] as u8;

        let n = self.get_index(north, column);
        count += self.cells[n] as u8;

        let ne = self.get_index(north, east);
        count += self.cells[ne] as u8;

        let w = self.get_index(row, west);
        count += self.cells[w] as u8;

        let e = self.get_index(row, east);
        count += self.cells[e] as u8;

        let sw = self.get_index(south, west);
        count += self.cells[sw] as u8;

        let s = self.get_index(south, column);
        count += self.cells[s] as u8;

        let se = self.get_index(south, east);
        count += self.cells[se] as u8;

        count
    }

    pub fn destory(&mut self) {
        self.cells = self.cells.iter().map(|_i| Cell::Dead).collect();
    }

    pub fn reset(&mut self) {
        self.destory();
        self.cells = (0..self.width * self.height)
            .map(|_i| unsafe {
                if js_sys::Math::random() < 0.5 {
                    Cell::Alive
                } else {
                    Cell::Dead
                }
            })
            .collect()
    }

    pub fn tick(&mut self) {
        let mut next = self.cells.clone();
        for row in 0..self.height {
            for col in 0..self.width {
                let idx = self.get_index(row, col);
                let cell = self.cells[idx];
                let live_neighbors = self.live_neighbor_count(row, col);

                // log!(
                //   "cell[{}, {}] is initially {:?} and has {} live neighbors",
                //   row,
                //   col,
                //   cell,
                //   live_neighbors
                // );

                let next_cell = match (cell, live_neighbors) {
                    // Rule 1: Any live cell with fewer than two live neighbours
                    // dies, as if caused by underpopulation.
                    (Cell::Alive, x) if x < 2 => Cell::Dead,
                    // Rule 2: Any live cell with two or three live neighbours
                    // lives on to the next generation.
                    (Cell::Alive, 2) | (Cell::Alive, 3) => Cell::Alive,
                    // Rule 3: Any live cell with more than three live
                    // neighbours dies, as if by overpopulation.
                    (Cell::Alive, x) if x > 3 => Cell::Dead,
                    // Rule 4: Any dead cell with exactly three live neighbours
                    // becomes a live cell, as if by reproduction.
                    (Cell::Dead, 3) => Cell::Alive,
                    // All other cells remain in the same state.
                    (otherwise, _) => otherwise,
                };
                // log!("    it becomes {:?}", next_cell);
                next[idx] = next_cell;
            }
        }
        self.cells = next;
    }
}

impl fmt::Display for Universe {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        for line in self.cells.as_slice().chunks(self.width as usize) {
            for &cell in line {
                let symbol = if cell == Cell::Dead { '□' } else { '■' };
                write!(f, "{}", symbol)?;
            }
            write!(f, "\n")?;
        }
        Ok(())
    }
}

impl Universe {
    pub fn get_cells(&self) -> &[Cell] {
        &self.cells
    }

    pub fn set_cells(&mut self, cells: &[(u32, u32)]) {
        for (row, col) in cells.iter().cloned() {
            let idx = self.get_index(row, col);
            self.cells[idx] = Cell::Alive;
        }
    }
}
