mod utils;
use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
extern "C" {}

#[wasm_bindgen]
pub fn minmax(items: &[f64], left_edge: f64, right_edge: f64) -> js_sys::Float64Array  {
    let len = items.len();
    let mut min = f64::INFINITY;
    let mut max = f64::NEG_INFINITY;
    let mut index = 0;

    while index < len {
        let t = items[index];
        let v = items[index + 1];

        if t < left_edge {
            index += 2;
            continue;
        }

        if t > right_edge {
            index += 2;
            break;
        }

        if v < min { min = v }
        if v > max { max = v }

        index += 2;
    }

    js_sys::Float64Array::from(&[min, max][..])
}
