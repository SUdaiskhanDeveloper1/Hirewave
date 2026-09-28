/**
 * Light / night mode.
 *
 * The active theme is a `data-theme` attribute on <html>; globals.css swaps the
 * tokens on it. Light is the default, and an explicit choice is kept in
 * `localStorage` so it survives reloads.
 */

export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'hirewave:theme:v1';

/**
 * Inlined in <head> so a saved night-mode choice is applied before first paint -
 * without it the page would flash light, then switch once React loads.
 */
export const THEME_INIT_SCRIPT = `try{if(localStorage.getItem('${THEME_STORAGE_KEY}')==='dark')document.documentElement.dataset.theme='dark'}catch(e){}`;
