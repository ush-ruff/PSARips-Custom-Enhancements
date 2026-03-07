// ==UserScript==
// @name         PSARips - Custom Enhancements
// @namespace    Violentmonkey Scripts
// @match        https://psarips.*/*
// @match        https://psa.*/*
// @match        https://x265.club/*
// @version      1.0.0
// @author       ushruff
// @description  Setup custom keyboard shortcuts and other quality of life enhancments for PSARips
// @homepageURL  https://github.com/ush-ruff/PSARips-Custom-Enhancements/
// @downloadURL  https://github.com/ush-ruff/PSARips-Custom-Enhancements/raw/main/script.user.js
// @grant        none
// @license      GNU GPLv3
// ==/UserScript==

// -----------------------
// CONFIGURABLE VARIABLES
// -----------------------
const KEYS = {
  "F": {
    action: () => focusSelectElement(`#page .search-field`),
    label: "Search",
  },
  "Shift + ?": {
    action: () => showShortcutInfo(MODAL_ID),
    label: "Show shortcut help",
  }
}

const MODAL_ID = "shortcut-modal"


// --------------------
// REFERENCE VARIABLES
// --------------------
const SELECTORS = {
  postTitle: '.wp-singular .post-title.entry-title',
  infoDiv: '.sp-body.folded',
}
const IMDB_REGEX = /https:\/\/www\.imdb\.com\/title\/(tt\d{7,8})\//

const IMDB_ICON = `
    <svg id="imdb_icon" style="width: 48px; transform: translateY(2px)" xmlns="http://www.w3.org/2000/svg" width="64" height="32" viewBox="0 0 64 32" version="1.1">
      <g fill="#F5C518">
        <rect x="0" y="0" width="100%" height="100%" rx="4"></rect>
      </g>
      <g transform="translate(8.000000, 7.000000)" fill="#000000" fill-rule="nonzero">
        <polygon points="0 18 5 18 5 0 0 0"></polygon>
        <path d="M15.6725178,0 L14.5534833,8.40846934 L13.8582008,3.83502426 C13.65661,2.37009263 13.4632474,1.09175121 13.278113,0 L7,0 L7,18 L11.2416347,18 L11.2580911,6.11380679 L13.0436094,18 L16.0633571,18 L17.7583653,5.8517865 L17.7707076,18 L22,18 L22,0 L15.6725178,0 Z"></path>
        <path d="M24,18 L24,0 L31.8045586,0 C33.5693522,0 35,1.41994415 35,3.17660424 L35,14.8233958 C35,16.5777858 33.5716617,18 31.8045586,18 L24,18 Z M29.8322479,3.2395236 C29.6339219,3.13233348 29.2545158,3.08072342 28.7026524,3.08072342 L28.7026524,14.8914865 C29.4312846,14.8914865 29.8796736,14.7604764 30.0478195,14.4865461 C30.2159654,14.2165858 30.3021941,13.486105 30.3021941,12.2871637 L30.3021941,5.3078959 C30.3021941,4.49404499 30.272014,3.97397442 30.2159654,3.74371416 C30.1599168,3.5134539 30.0348852,3.34671372 29.8322479,3.2395236 Z"></path>
        <path d="M44.4299079,4.50685823 L44.749518,4.50685823 C46.5447098,4.50685823 48,5.91267586 48,7.64486762 L48,14.8619906 C48,16.5950653 46.5451816,18 44.749518,18 L44.4299079,18 C43.3314617,18 42.3602746,17.4736618 41.7718697,16.6682739 L41.4838962,17.7687785 L37,17.7687785 L37,0 L41.7843263,0 L41.7843263,5.78053556 C42.4024982,5.01015739 43.3551514,4.50685823 44.4299079,4.50685823 Z M43.4055679,13.2842155 L43.4055679,9.01907814 C43.4055679,8.31433946 43.3603268,7.85185468 43.2660746,7.63896485 C43.1718224,7.42607505 42.7955881,7.2893916 42.5316822,7.2893916 C42.267776,7.2893916 41.8607934,7.40047379 41.7816216,7.58767002 L41.7816216,9.01907814 L41.7816216,13.4207851 L41.7816216,14.8074788 C41.8721037,15.0130276 42.2602358,15.1274059 42.5316822,15.1274059 C42.8031285,15.1274059 43.1982131,15.0166981 43.281155,14.8074788 C43.3640968,14.5982595 43.4055679,14.0880581 43.4055679,13.2842155 Z"></path>
      </g>
    </svg>
  `


// -------------------------------------------
// Setup Dependencies
// -------------------------------------------
const LIB_INSTALL_URL = "https://raw.githubusercontent.com/ush-ruff/Common/main/Userscript-Helper-Lib/helpersLib.user.js"

function ensureLibrary() {
  const lib = window.ushruffUSKit

  if (!lib) {
    console.error(
      `The installed script requires ushrufUSKit library. Install the script and refresh the current tab.\n` +
      `If the script does not automatically redirect you, visit the following link.\n` +
      `${LIB_INSTALL_URL}` +
      `Ensure that the library runs before the current script to avoid errors.`
    )
    window.open(LIB_INSTALL_URL, "_blank")
    return false
  }

  return true
}

if (!ensureLibrary()) {
  return
}

const { installKeyHandler, focusSelectElement, setupShortcutInfo, showShortcutInfo } = window.ushruffUSKit


// -------------------------------------------
// Event Listeners
// -------------------------------------------
window.addEventListener("load", () => { 
  insertBtns()
  installKeyHandler(KEYS)
  setupShortcutInfo(MODAL_ID, KEYS)
})


// -------------------------------------------
// Main Functions
// -------------------------------------------
function insertBtns() {
  const postTitle = document.querySelector(SELECTORS.postTitle)
  if (!postTitle) return console.error("Failed to get the post title!")
  if (postTitle.querySelector('#imdb_icon')) return   // Check if IMDb icon already inserted

  const postTitleText = postTitle.textContent.trim()

  // Extracting the IMDb link from the movie release "Info" dropdown
  const infoDiv = document.querySelector(SELECTORS.infoDiv)
  if (!infoDiv) return console.warn("Info dropdown is not found. Check if the selector's changed.")

  const imdbMovieLink = infoDiv.textContent.match(IMDB_REGEX)?.[0]
  const fallbackSearch = `https://www.imdb.com/find?s=tt&ttype=tv&q=${encodeURIComponent(postTitleText)}`

  const imdbHtml = `<a href="${imdbMovieLink || fallbackSearch}" target="_blank" title="Open in IMDb">${IMDB_ICON}</a>`

  postTitle.innerHTML = `${postTitleText}${imdbHtml}`
}

