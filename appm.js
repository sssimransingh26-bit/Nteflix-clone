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

const MOCK = {
  trending: [
    {
      id: 1,
      title: "Mock: The Dark Night",
      overview: "A gritty mock thriller in a city of neon shadows.",
      poster_path: null,
      backdrop_path: null,
      vote_average: 8.6,
      release_date: "2024-01-12",
    },
    {
      id: 2,
      title: "Mock: Space Run",
      overview: "A mock sci-fi adventure across galaxies and broken timelines.",
      poster_path: null,
      backdrop_path: null,
      vote_average: 7.9,
      release_date: "2023-10-01",
    },
    {
      id: 3,
      title: "Mock: Love & Code",
      overview: "A romantic comedy about shipping features and feelings.",
      poster_path: null,
      backdrop_path: null,
      vote_average: 7.3,
      release_date: "2025-02-14",
    },
  ],
  popular: [
    { id: 11, title: "Mock: Heist City", overview: "Big plans. Bigger mistakes.", poster_path: null, backdrop_path: null, vote_average: 7.8, release_date: "2022-08-09" },
    { id: 12, title: "Mock: Ocean Storm", overview: "A survival drama at sea.", poster_path: null, backdrop_path: null, vote_average: 7.1, release_date: "2021-06-22" },
    { id: 13, title: "Mock: The Last Stand", overview: "Action packed mock blockbuster.", poster_path: null, backdrop_path: null, vote_average: 7.6, release_date: "2020-11-11" },
  ],
  topRated: [
    { id: 21, title: "Mock: The Masterpiece", overview: "Critically acclaimed mock cinema.", poster_path: null, backdrop_path: null, vote_average: 9.1, release_date: "2019-03-03" },
    { id: 22, title: "Mock: Silent Echo", overview: "A haunting drama of memory.", poster_path: null, backdrop_path: null, vote_average: 8.9, release_date: "2018-09-18" },
    { id: 23, title: "Mock: Ember", overview: "A slow-burn mock thriller.", poster_path: null, backdrop_path: null, vote_average: 8.7, release_date: "2017-01-27" },
  ],
};

// --- Init ---
async function loadHome() {
  try {
    if (!TMDB_API_KEY) throw new Error("No TMDB key, using mock data.");

    const [trending, popular, topRated] = await Promise.all([
      tmdbGet("/trending/movie/week"),
      tmdbGet("/movie/popular"),
      tmdbGet("/movie/top_rated"),
    ]);

    const featured = pickRandom(trending.results);
    setHero(featured);
    renderRow(rowTrending, trending.results);
    renderRow(rowPopular, popular.results);
    renderRow(rowTopRated, topRated.results);
  } catch (err) {
    // fallback mock
    const featured = pickRandom(MOCK.trending);
    setHero(featured);
    renderRow(rowTrending, MOCK.trending);
    renderRow(rowPopular, MOCK.popular);
    renderRow(rowTopRated, MOCK.topRated);
    console.warn(String(err));
  }
}

async function runSearch(q) {
  const query = (q || "").trim();
  if (!query) return;

  try {
    if (!TMDB_API_KEY) throw new Error("No TMDB key, search needs TMDB.");

    const data = await tmdbGet("/search/movie", { query, include_adult: "false" });

    // Replace trending row with search results (simple UX)
    document.querySelector(".row__title").textContent = `Results for "${query}"`;
    renderRow(rowTrending, data.results);
    rowTrending.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (err) {
    alert("Add your TMDB_API_KEY in app.js to enable real search.");
    console.warn(String(err));
  }
}

// --- Events ---
heroInfoBtn.addEventListener("click", () => currentHero && openModal(currentHero));
modalBackdrop.addEventListener("click", closeModal);
modalCloseBtn.addEventListener("click", closeModal);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  runSearch(searchInput.value);
});

loadHome();
