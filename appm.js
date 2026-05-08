const TMDB_API_KEY = "";

const TMDB_BASE = "https://api.themoviedb.org/3";
const IMG = (path, size = "w500") => path ? `https://image.tmdb.org/t/p/${size}${path}` : "";

// --- DOM ---
const heroBg = document.getElementById("heroBg");
const heroTitle = document.getElementById("heroTitle");
const heroMeta = document.getElementById("heroMeta");
const heroDesc = document.getElementById("heroDesc");
const heroInfoBtn = document.getElementById("heroInfoBtn");

const rowTrending = document.getElementById("rowTrending");
const rowPopular = document.getElementById("rowPopular");
const rowTopRated = document.getElementById("rowTopRated");

const modal = document.getElementById("modal");
const modalBackdrop = document.getElementById("modalBackdrop");
const modalCloseBtn = document.getElementById("modalCloseBtn");
const modalTitle = document.getElementById("modalTitle");
const modalMeta = document.getElementById("modalMeta");
const modalDesc = document.getElementById("modalDesc");

const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");


let currentHero = null;

// --- Helpers ---
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * Math.max(1, arr.length))];
}

function openModal(movie) {
  const title = movie.title || movie.name || "Untitled";
  modalTitle.textContent = title;
  modalMeta.textContent = `⭐ ${Number(movie.vote_average || 0).toFixed(1)}  •  ${movie.release_date || movie.first_air_date || "—"}`;
  modalDesc.textContent = movie.overview || "No overview available.";
  modal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  modal.setAttribute("aria-hidden", "true");
}

function renderRow(container, items) {
  container.innerHTML = "";
  items.forEach((m) => {
    const card = document.createElement("div");
    card.className = "card";
    card.tabIndex = 0;

    const img = document.createElement("div");
    img.className = "card__img";
    const poster = m.poster_path ? IMG(m.poster_path, "w342") : "";
    if (poster) img.style.backgroundImage = `url("${poster}")`;

    const body = document.createElement("div");
    body.className = "card__body";

    const title = document.createElement("p");
    title.className = "card__title";
    title.textContent = m.title || m.name || "Untitled";

    body.appendChild(title);
    card.appendChild(img);
    card.appendChild(body);

    card.addEventListener("click", () => openModal(m));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") openModal(m);
    });

    container.appendChild(card);
  });
}

function setHero(movie) {
  currentHero = movie;
  const title = movie.title || movie.name || "Featured";
  heroTitle.textContent = title;
  heroMeta.textContent = `⭐ ${Number(movie.vote_average || 0).toFixed(1)}  •  ${movie.release_date || movie.first_air_date || "—"}`;
  heroDesc.textContent = movie.overview || "";
  const bg = movie.backdrop_path ? IMG(movie.backdrop_path, "original") : "";
  heroBg.style.backgroundImage = bg ? `url("${bg}")` : "none";
}

async function tmdbGet(path, params = {}) {
  const url = new URL(TMDB_BASE + path);
  url.searchParams.set("api_key", TMDB_API_KEY);
  url.searchParams.set("language", "en-US");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB error ${res.status} for ${path}`);
  return res.json();
}