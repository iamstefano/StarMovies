const cE = (type) => document.createElement(type);
const LIBRARY_STORAGE_KEY = "starmovies-library-v1";

const global = {
  currentPage: window.location.pathname.split("/").pop() || "index.html",
  search: {
    term: "",
    type: "",
    page: 1,
    totalPages: 1,
    totalResults: 0,
  },
  api: {
    apiKey: "07216a1a06f37360792e4611ca0c6c7c",
    apiUrl: "https://api.themoviedb.org/3/",
  },
};

function getLibrary() {
  try {
    const stored = JSON.parse(localStorage.getItem(LIBRARY_STORAGE_KEY) || "{}");
    return stored && typeof stored === "object" && !Array.isArray(stored)
      ? stored
      : {};
  } catch (error) {
    console.warn("Impossibile leggere la raccolta locale.", error);
    return {};
  }
}

function saveLibrary(library) {
  try {
    localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(library));
    return true;
  } catch (error) {
    showAlert("Spazio locale non disponibile: modifiche non salvate.");
    return false;
  }
}

function libraryItemKey(type, id) {
  return type === "tv" ? `tv-${id}` : String(id);
}

function getLibraryItem(type, id) {
  const library = getLibrary();
  return library[libraryItemKey(type, id)] || {};
}

function updateLibraryItem(media, type, changes) {
  const library = getLibrary();
  const id = libraryItemKey(type, media.id);
  const previous = library[id] || (type === "movie" ? library[String(media.id)] : {}) || {};
  library[id] = {
    ...previous,
    id: media.id,
    type,
    title: (type === "tv" ? media.name : media.title) || previous.title || "Titolo non disponibile",
    poster_path: media.poster_path ?? previous.poster_path ?? null,
    release_date: (type === "tv" ? media.first_air_date : media.release_date) || previous.release_date || "",
    vote_average: media.vote_average ?? previous.vote_average ?? 0,
    ...changes,
    updatedAt: new Date().toISOString(),
  };

  if (!library[id].favorite && !library[id].watched && !library[id].rating && !library[id].comment) {
    delete library[id];
  }

  return saveLibrary(library) ? library[id] || {} : null;
}

function createMediaCard(media, type = "movie") {
  const entry = getLibraryItem(type, media.id);
  const titleText = media.title || media.name || "Titolo non disponibile";
  const releaseDate = media.release_date || media.first_air_date;
  const card = cE("article");
  card.className = "card";

  const link = cE("a");
  link.className = "card-media-link";
  link.href = `${type === "tv" ? "tv" : "movie"}-details.html?id=${encodeURIComponent(media.id)}`;
  link.setAttribute("aria-label", `Apri i dettagli di ${titleText}`);

  const image = cE("img");
  image.src = media.poster_path
    ? `https://image.tmdb.org/t/p/w500${media.poster_path}`
    : "./assets/images/no-image.png";
  image.className = "card-img-top";
  image.alt = `Locandina di ${titleText}`;
  image.loading = "lazy";
  link.appendChild(image);

  const typeBadge = cE("span");
  typeBadge.className = "media-type-badge";
  typeBadge.textContent = type === "tv" ? "SERIE TV" : "FILM";
  link.appendChild(typeBadge);
  card.appendChild(link);

  const body = cE("div");
  body.className = "card-body";
  const title = cE("h3");
  title.className = "card-title";
  title.textContent = titleText;
  body.appendChild(title);

  const rating = cE("p");
  rating.className = "card-text";
  rating.textContent = `★ ${Number(media.vote_average || 0).toFixed(1)} / 10${releaseDate ? ` · ${releaseDate.slice(0, 4)}` : ""}`;
  body.appendChild(rating);

  if (entry.rating) {
    const personalRating = cE("p");
    personalRating.className = "personal-card-note";
    personalRating.textContent = `Il tuo voto: ${entry.rating}/10`;
    body.appendChild(personalRating);
  }

  const favoriteButton = cE("button");
  favoriteButton.type = "button";
  favoriteButton.className = "btn favorite-toggle";
  favoriteButton.textContent = entry.favorite ? "♥ Nei preferiti" : "♡ Aggiungi ai preferiti";
  favoriteButton.setAttribute("aria-pressed", String(Boolean(entry.favorite)));
  favoriteButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const current = getLibraryItem(type, media.id);
    const updated = updateLibraryItem(media, type, { favorite: !current.favorite });
    const isFavorite = updated ? Boolean(updated.favorite) : Boolean(current.favorite);
    favoriteButton.textContent = isFavorite ? "♥ Nei preferiti" : "♡ Aggiungi ai preferiti";
    favoriteButton.setAttribute("aria-pressed", String(isFavorite));
    if (!isFavorite && global.currentPage === "favorites.html") displayFavorites();
  });
  body.appendChild(favoriteButton);
  card.appendChild(body);
  return card;
}

function createMovieCard(movie) {
  return createMediaCard(movie, "movie");
}

function renderPersonalMediaTools(media, type, container) {
  const existing = getLibraryItem(type, media.id);
  const section = cE("section");
  section.className = "personal-tools";
  section.setAttribute("aria-labelledby", "personal-tools-title");

  const heading = cE("h2");
  heading.id = "personal-tools-title";
  heading.textContent = "La tua scheda";
  section.appendChild(heading);

  const actions = cE("div");
  actions.className = "personal-actions";
  const favoriteButton = cE("button");
  favoriteButton.type = "button";
  favoriteButton.className = "btn favorite-toggle";
  favoriteButton.setAttribute("aria-pressed", String(Boolean(existing.favorite)));
  const syncFavoriteButton = () => {
    favoriteButton.textContent = favoriteButton.getAttribute("aria-pressed") === "true"
      ? "♥ Rimuovi dai preferiti"
      : "♡ Aggiungi ai preferiti";
  };
  syncFavoriteButton();
  favoriteButton.addEventListener("click", () => {
    const current = getLibraryItem(type, media.id);
    const updated = updateLibraryItem(media, type, { favorite: !current.favorite });
    const isFavorite = updated ? Boolean(updated.favorite) : Boolean(current.favorite);
    favoriteButton.setAttribute("aria-pressed", String(isFavorite));
    syncFavoriteButton();
  });

  const watchedLabel = cE("label");
  watchedLabel.className = "watched-toggle";
  const watchedInput = cE("input");
  watchedInput.type = "checkbox";
  watchedInput.checked = Boolean(existing.watched);
  watchedInput.addEventListener("change", () => {
    updateLibraryItem(media, type, { watched: watchedInput.checked });
  });
  watchedLabel.append(watchedInput, document.createTextNode(type === "tv" ? " L'ho vista" : " L'ho visto"));
  actions.append(favoriteButton, watchedLabel);
  section.appendChild(actions);

  const form = cE("form");
  form.className = "personal-review-form";
  const ratingLabel = cE("label");
  ratingLabel.htmlFor = "personal-rating";
  ratingLabel.textContent = "Il tuo voto (1–10)";
  const ratingInput = cE("select");
  ratingInput.id = "personal-rating";
  ratingInput.name = "rating";
  ratingInput.required = true;
  const placeholder = cE("option");
  placeholder.value = "";
  placeholder.textContent = "Scegli un voto";
  ratingInput.appendChild(placeholder);
  for (let score = 10; score >= 1; score -= 1) {
    const option = cE("option");
    option.value = String(score);
    option.textContent = `${score} / 10`;
    ratingInput.appendChild(option);
  }
  if (existing.rating) ratingInput.value = String(existing.rating);

  const commentLabel = cE("label");
  commentLabel.htmlFor = "personal-comment";
  commentLabel.textContent = "Il tuo commento";
  const commentInput = cE("textarea");
  commentInput.id = "personal-comment";
  commentInput.name = "comment";
  commentInput.rows = 4;
  commentInput.maxLength = 1000;
  commentInput.placeholder = "Annota cosa ne pensi (solo su questo dispositivo)…";
  commentInput.value = existing.comment || "";

  const saveButton = cE("button");
  saveButton.type = "submit";
  saveButton.className = "btn btn-primary";
  saveButton.textContent = "Salva la scheda";
  const status = cE("p");
  status.className = "personal-save-status";
  status.setAttribute("aria-live", "polite");

  form.append(ratingLabel, ratingInput, commentLabel, commentInput, saveButton, status);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const saved = updateLibraryItem(media, type, {
      rating: Number(ratingInput.value),
      comment: commentInput.value.trim(),
    });
    status.textContent = saved?.rating ? "Scheda salvata su questo dispositivo." : "Impossibile salvare la scheda.";
  });
  section.appendChild(form);
  container.appendChild(section);
}

function renderPersonalMovieTools(movie, container) {
  renderPersonalMediaTools(movie, "movie", container);
}

function displayFavorites() {
  const container = document.querySelector("#favorite-movies");
  container.replaceChildren();
  const favorites = Object.values(getLibrary()).filter((media) => media.favorite);
  const count = document.querySelector("#favorites-count");
  count.textContent = `${favorites.length} ${favorites.length === 1 ? "titolo" : "titoli"} nei preferiti`;
  if (!favorites.length) {
    const empty = cE("p");
    empty.className = "empty-state";
    empty.textContent = "La tua lista è vuota. Aggiungi film o serie TV ai preferiti dalle schede o dai risultati.";
    container.appendChild(empty);
    return;
  }

  favorites
    .sort((a, b) => a.title.localeCompare(b.title, "it"))
    .forEach((media) => {
      const type = media.type === "tv" ? "tv" : "movie";
      const card = createMediaCard(media, type);
      const review = getLibraryItem(type, media.id);
      if (review.watched || review.comment) {
        const note = cE("p");
        note.className = "personal-card-note";
        note.textContent = review.watched
          ? `${type === "tv" ? "Vista" : "Visto"}${review.comment ? ` · ${review.comment}` : ""}`
          : review.comment;
        card.querySelector(".card-body").appendChild(note);
      }
      container.appendChild(card);
    });
}

// Display 20 most popular movies
async function displayPopularMovies() {
  const { results } = await fetchAPIData("movie/popular");
  const popularMoviesContainer = document.querySelector("#popular-movies");
  results.forEach((movie) => popularMoviesContainer.appendChild(createMovieCard(movie)));
}

// Display 20 most popular tv shows

async function displayPopularShows() {
  const { results } = await fetchAPIData("tv/popular");
  const popularShowsContainer = document.querySelector("#popular-shows");
  results.forEach((show) => popularShowsContainer.appendChild(createMediaCard(show, "tv")));
}

// Display Movie Details
async function displayMovieDetails() {
  const movieId = window.location.search.split("=")[1];

  const movie = await fetchAPIData(`movie/${movieId}`);

  // Overlay for background image
  displayBackgroundImage("movie", movie.backdrop_path);

  const div = cE("div");
  div.classList.add("details_top");

  const imageDiv = cE("div");
  const image = cE("img");
  image.className = "card-img-top";
  image.alt = movie.title;

  if (movie.poster_path) {
    image.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
  } else {
    image.src = "./assets/images/no-image.png";
  }

  imageDiv.appendChild(image);
  div.appendChild(imageDiv);

  const detailsDiv = cE("div");
  const title = cE("h2");
  title.textContent = movie.title;

  const vote = cE("p");
  const starIcon = cE("i");
  starIcon.classList.add("fa", "fa-star", "text_primary");
  vote.textContent = `${movie.vote_average.toFixed(2)} /10 `; ///////////////////////////////////// toFixed(1)?????????
  vote.appendChild(starIcon);

  const releaseDate = cE("p");
  releaseDate.className = "text-muted";
  releaseDate.textContent = `Release Date: ${movie.release_date}`;

  const overview = cE("p");
  overview.textContent = movie.overview;

  const genresHeading = cE("h5");
  genresHeading.textContent = "Genres";

  const genresList = cE("ul");
  genresList.className = "list-group";
  movie.genres.forEach((genre) => {
    const genreItem = cE("li");
    genreItem.textContent = genre.name;
    genresList.appendChild(genreItem);
  });

  const homepageLink = cE("a");
  homepageLink.href = movie.homepage;
  homepageLink.target = "_blank";
  homepageLink.className = "btn";
  homepageLink.textContent = "Visit Movie Homepage";

  detailsDiv.appendChild(title);
  detailsDiv.appendChild(vote);
  detailsDiv.appendChild(releaseDate);
  detailsDiv.appendChild(overview);
  detailsDiv.appendChild(genresHeading);
  detailsDiv.appendChild(genresList);
  detailsDiv.appendChild(homepageLink);

  div.appendChild(detailsDiv);

  const detailsContainer = document.querySelector("#movie-details");
  detailsContainer.appendChild(div);
  renderPersonalMovieTools(movie, detailsContainer);
}

// Display Show Details // not working
async function displayShowDetails() {
  const showId = new URLSearchParams(window.location.search).get("id");
  if (!showId) throw new Error("ID serie TV mancante.");
  const show = await fetchAPIData(`tv/${showId}`);
  const detailsContainer = document.querySelector("#show-details");
  displayBackgroundImage("tv", show.backdrop_path);
  document.title = `${show.name} · StarMovies`;

  const detailsTop = cE("div");
  detailsTop.className = "details_top tv-details-top";
  const poster = cE("img");
  poster.className = "tv-detail-poster";
  poster.src = show.poster_path
    ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
    : "./assets/images/no-image.png";
  poster.alt = `Locandina di ${show.name || "serie TV"}`;
  poster.loading = "eager";

  const info = cE("div");
  info.className = "tv-detail-copy";
  const eyebrow = cE("p");
  eyebrow.className = "eyebrow";
  eyebrow.textContent = "SERIE TV · GUIDA E RACCOLTA PERSONALE";
  const title = cE("h1");
  title.textContent = show.name || "Serie TV";
  const meta = cE("p");
  meta.className = "tv-detail-meta";
  meta.textContent = [
    `★ ${Number(show.vote_average || 0).toFixed(1)} / 10`,
    show.first_air_date ? show.first_air_date.slice(0, 4) : "Anno sconosciuto",
    show.number_of_seasons ? `${show.number_of_seasons} stagioni` : "Stagioni n/d",
    show.status || "Stato n/d",
  ].join("  ·  ");
  const overview = cE("p");
  overview.className = "tv-detail-overview";
  overview.textContent = show.overview || "La descrizione non è disponibile.";

  const genres = cE("div");
  genres.className = "genre-chips";
  (show.genres || []).forEach((genre) => {
    const chip = cE("span");
    chip.className = "genre-chip";
    chip.textContent = genre.name;
    genres.appendChild(chip);
  });

  const homepageLink = show.homepage ? cE("a") : null;
  if (homepageLink) {
    homepageLink.href = show.homepage;
    homepageLink.target = "_blank";
    homepageLink.rel = "noopener noreferrer";
    homepageLink.className = "btn";
    homepageLink.textContent = "Sito ufficiale";
  }

  info.append(eyebrow, title, meta, overview, genres);
  if (homepageLink) info.appendChild(homepageLink);
  detailsTop.append(poster, info);

  const stats = cE("div");
  stats.className = "tv-stats-grid";
  const statItems = [
    ["Episodi", show.number_of_episodes ?? "—"],
    ["Stagioni", show.number_of_seasons ?? "—"],
    ["Prima messa in onda", show.first_air_date || "—"],
    ["Ultima messa in onda", show.last_air_date || "—"],
  ];
  statItems.forEach(([label, value]) => {
    const stat = cE("div");
    stat.className = "tv-stat-card";
    const statValue = cE("strong");
    statValue.textContent = String(value);
    const statLabel = cE("span");
    statLabel.textContent = label;
    stat.append(statValue, statLabel);
    stats.appendChild(stat);
  });

  const lowerInfo = cE("div");
  lowerInfo.className = "tv-production-info";
  const episode = show.last_episode_to_air;
  const episodeInfo = cE("p");
  episodeInfo.textContent = episode?.name
    ? `Ultimo episodio: ${episode.name}${episode.air_date ? ` · ${episode.air_date}` : ""}`
    : "Informazioni sull'ultimo episodio non disponibili.";
  const companyList = cE("p");
  const companies = (show.production_companies || []).map((company) => company.name).filter(Boolean);
  companyList.textContent = companies.length ? `Produzione: ${companies.join(" · ")}` : "";
  lowerInfo.append(episodeInfo);
  if (companyList.textContent) lowerInfo.appendChild(companyList);

  detailsContainer.append(detailsTop, stats, lowerInfo);
  renderPersonalMediaTools(show, "tv", detailsContainer);
}

// Display Backdrop On Details Pages
function displayBackgroundImage(type, backgroundPath) {
  if (!backgroundPath) return;
  const overlayDiv = document.createElement("div");
  overlayDiv.style.backgroundImage = `url(https://image.tmdb.org/t/p/original/${backgroundPath})`;
  overlayDiv.style.backgroundSize = "cover";
  overlayDiv.style.backgroundPosition = "center";
  overlayDiv.style.height = "100vh";
  overlayDiv.style.width = "100%";
  overlayDiv.style.position = "absolute";
  overlayDiv.style.top = "0";
  overlayDiv.style.left = "0";
  overlayDiv.style.zIndex = "-1";
  overlayDiv.style.opacity = "0.1";

  const details = document.querySelector(type === "movie" ? "#movie-details" : "#show-details");
  if (details) details.prepend(overlayDiv);
}

// Search Movies/Shows --> futura implementazione serie tv
async function search() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  global.search.type = urlParams.get("type") === "tv" ? "tv" : "movie";
  global.search.term = (urlParams.get("search-term") || "").trim();
  const searchInput = document.querySelector("#search-term");
  if (searchInput) searchInput.value = global.search.term;
  const selectedType = document.querySelector(`#${global.search.type}`);
  if (selectedType) selectedType.checked = true;

  if (global.search.term !== "" && global.search.term !== null) {
    const { results, total_pages, page, total_results } = await searchAPIData();

    global.search.page = page;
    global.search.totalPages = total_pages;
    global.search.totalResults = total_results;

    if (results.length === 0) {
      showAlert("No results found");
      return;
    }

    displaySearchResults(results);

  } else {
    showAlert("Please enter a search term");
  }
}

function displaySearchResults(results) {
  const searchResults = document.querySelector("#search-results");
  const searchResultsHeading = document.querySelector(
    "#search-results-heading"
  );
  const pagination = document.querySelector("#pagination");

  // Clear previous results
  while (searchResults.firstChild) {
    searchResults.firstChild.remove();
  }
  searchResultsHeading.textContent = "";
  pagination.textContent = "";

  results.forEach((result) => {
    searchResults.appendChild(createMediaCard(result, global.search.type));
  });

  const totalResultsText = `${results.length} of ${global.search.totalResults} Results for ${global.search.term}`;
  searchResultsHeading.textContent = totalResultsText;

  displayPagination();
}

// Create & Display Pagination For Search
function displayPagination() {
  const div = document.createElement("div");
  div.classList.add("pagination");

  const prevButton = document.createElement("button");
  prevButton.classList.add("btn", "btn-primary");
  prevButton.id = "prev";
  prevButton.textContent = "Prev";

  const nextButton = document.createElement("button");
  nextButton.classList.add("btn", "btn-primary");
  nextButton.id = "next";
  nextButton.textContent = "Next";

  const pageCounter = document.createElement("div");
  pageCounter.classList.add("page-counter");
  pageCounter.textContent = `Page ${global.search.page} of ${global.search.totalPages}`;

  div.appendChild(prevButton);
  div.appendChild(nextButton);
  div.appendChild(pageCounter);

  // Clear previous pagination
  const pagination = document.querySelector("#pagination");
  while (pagination.firstChild) {
    pagination.firstChild.remove();
  }

  pagination.appendChild(div);

  document.querySelector("#pagination").appendChild(div);

  // Disable prev button if on first page
  if (global.search.page === 1) {
    document.querySelector("#prev").disabled = true;
  }

  // Disable next button if on last page
  if (global.search.page === global.search.totalPages) {
    document.querySelector("#next").disabled = true;
  }

  // Next page
  document.querySelector("#next").addEventListener("click", async () => {
    global.search.page++;
    const { results, total_pages } = await searchAPIData();
    displaySearchResults(results);
  });

  // Prev page
  document.querySelector("#prev").addEventListener("click", async () => {
    global.search.page--;
    const { results, total_pages } = await searchAPIData();
    displaySearchResults(results);
  });
}

/* // Display Movies
async function displaySlider() {
  const { results } = await fetchAPIData("movie/now_playing");

  results.forEach((movie) => {
    const { title, poster_path, vote_average, overview } = movie;
  });
} */

// Display Slider Movies // Swiper
async function displaySlider() {
  const { results } = await fetchAPIData("movie/now_playing");
  const swiperWrapper = document.querySelector(".swiper-wrapper");

  results.forEach((movie) => {
    const div = document.createElement("div");
    div.classList.add("swiper-slide");

    const link = document.createElement("a");
    link.href = `movie-details.html?id=${movie.id}`;
    div.appendChild(link);

    const image = document.createElement("img");
    image.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
    image.alt = movie.title;
    link.appendChild(image);

    const rating = document.createElement("h4");
    rating.classList.add("swiper-rating");
    rating.textContent = ` ${movie.vote_average.toFixed(2)} / 10`;

    const starIcon = document.createElement("i");
    starIcon.classList.add("fa", "fa-star", "text-secondary");
    rating.insertBefore(starIcon, rating.firstChild);

    div.appendChild(rating);

    swiperWrapper.appendChild(div);

  });

  initSwiper();
}

function initSwiper() {
  new Swiper(".swiper", {
    slidesPerView: 1,
    spaceBetween: 30,
    freeMode: true,
    loop: true,
    autoplay: {
      delay: 4000,
      disableOnInteraction: false,
    },
    breakpoints: {
      500: {
        slidesPerView: 2,
      },
      700: {
        slidesPerView: 3,
      },
      1200: {
        slidesPerView: 4,
      },
    },
  });
}

// Fetch data from TMDB API
async function fetchAPIData(endpoint) {
  const API_KEY = global.api.apiKey;
  const API_URL = global.api.apiUrl;

  const url = new URL(`${API_URL}${endpoint}`);
  url.searchParams.set("api_key", API_KEY);
  url.searchParams.set("language", "it-IT");
  const response = await fetch(url);
  if (!response.ok) throw new Error(`TMDB ha restituito ${response.status}`);
  return response.json();
}

// Make Request To Search
async function searchAPIData() {
  const API_KEY = global.api.apiKey;
  const API_URL = global.api.apiUrl;

  const url = new URL(`${API_URL}search/${global.search.type}`);
  url.searchParams.set("api_key", API_KEY);
  url.searchParams.set("language", "it-IT");
  url.searchParams.set("query", global.search.term);
  url.searchParams.set("page", global.search.page);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`TMDB ha restituito ${response.status}`);
  return response.json();
}

// Highlight active link
function highlightActiveLink() {
  const links = document.querySelectorAll(".navLink");
  links.forEach((link) => {
    const targetPage = new URL(link.href, window.location.href).pathname.split("/").pop() || "index.html";
    if (targetPage === global.currentPage) {
      link.classList.add("active");
    }
  });
}

// Show Alert
function showAlert(message, className = "error") {
  const alertEl = cE("div");
  alertEl.className = `alert ${className}`;
  alertEl.appendChild(document.createTextNode(message));
  const container = document.querySelector("#alert") || document.querySelector("main") || document.body;
  container.prepend(alertEl);

  setTimeout(() => alertEl.remove(), 3000);
}

function addCommasToNumber(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**********Movie by Genres feature :///// ***********/

/* const movieGenres = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
}; */

// Init App
async function init() {
  try {
    switch (global.currentPage) {
    case "":
    case "index.html":
      await Promise.all([displaySlider(), displayPopularMovies()]);
      break;
    case "shows.html":
      await displayPopularShows();
      break;
    case "movie-details.html":
      await displayMovieDetails();
      break;
    case "tv-details.html":
      await displayShowDetails();
      break;
    case "search.html":
      await search();
      break;
    case "favorites.html":
      displayFavorites();
      break;
    }
  } catch (error) {
    console.error("Errore durante il caricamento della pagina.", error);
    showAlert("Non è stato possibile caricare i contenuti. Controlla la connessione e riprova.");
  }

  highlightActiveLink();
}

document.addEventListener("DOMContentLoaded", init);
