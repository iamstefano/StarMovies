const cE = (type) => document.createElement(type);

const global = {
  currentPage: window.location.pathname,
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

// Display 20 most popular movies
async function displayPopularMovies() {
  const { results } = await fetchAPIData("movie/popular");
  const popularMoviesContainer = document.querySelector("#popular-movies");

  results.forEach((movie) => {
    const div = cE("div");
    div.className = "card";

    const link = cE("a");
    link.href = `movie-details.html?id=${movie.id}`;

    const img = cE("img");
    img.src = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : "../images/no-image.jpg";
    img.className = "card-img-top";
    img.alt = movie.title;

    link.appendChild(img);
    div.appendChild(link);

    const cardBody = cE("div");
    cardBody.className = "card-body";

    const title = cE("h5");
    title.className = "card-title";
    title.textContent = movie.title;

    const vote = cE("p");
    const starIcon = cE("i");
    starIcon.classList.add("fa", "fa-star", "star_primary");
    vote.textContent = `${movie.vote_average.toFixed(2)}/10`;
    vote.appendChild(starIcon);

    cardBody.appendChild(title);
    cardBody.appendChild(vote);
    div.appendChild(cardBody);

    popularMoviesContainer.appendChild(div);
  });
}

// Display 20 most popular tv shows

async function displayPopularShows() {
  const { results } = await fetchAPIData("tv/popular");
  const popularShowsContainer = document.querySelector("#popular-shows");

  results.forEach((show) => {
    const div = document.createElement("div");
    div.classList.add("card");

    const link = document.createElement("a");
    link.href = `tv-details.html?id=${show.id}`;

    const img = document.createElement("img");
    img.classList.add("card-img-top");
    img.alt = show.name;
    img.src = show.poster_path
      ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
      : "../images/no-image.jpg";

    link.appendChild(img);
    div.appendChild(link);

    const cardBody = document.createElement("div");
    cardBody.classList.add("card-body");

    const title = document.createElement("h5");
    title.classList.add("card-title");
    title.textContent = show.name;

    const airDate = document.createElement("p");
    airDate.classList.add("card-text");
    const airDateText = document.createElement("small");
    airDateText.classList.add("text-muted");
    airDateText.textContent = `Air Date: ${show.first_air_date}`;
    airDate.appendChild(airDateText);

    cardBody.appendChild(title);
    cardBody.appendChild(airDate);

    div.appendChild(cardBody);

    popularShowsContainer.appendChild(div);
  });
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
    image.src = "../assets/images/no-image.png";
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

  document.querySelector("#movie-details").appendChild(div);
}

// Display Show Details // not working
async function displayShowDetails() {
  const showId = window.location.search.split("=")[1];
  const show = await fetchAPIData(`tv/${showId}`);
  const detailsContainer = document.querySelector("#show-details");

  // Overlay for background image
  displayBackgroundImage("tv", show.backdrop_path);

  const detailsTopDiv = document.createElement("div");
  detailsTopDiv.classList.add("details-top");

  const imageDiv = document.createElement("div");
  const imageSrc = show.poster_path
    ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
    : "../images/no-image.jpg";
  const imageAlt = show.name;
  const image = document.createElement("img");
  image.classList.add("card-img-top");
  image.setAttribute("src", imageSrc);
  image.setAttribute("alt", imageAlt);
  imageDiv.appendChild(image);

  const infoDiv = document.createElement("div");
  const title = document.createElement("h2");
  title.textContent = show.name;
  const rating = document.createElement("p");
  rating.innerHTML = `<i class="fas fa-star text-primary"></i> ${show.vote_average.toFixed(
    2
  )} / 10`;
  const lastAirDate = document.createElement("p");
  lastAirDate.classList.add("text-muted");
  lastAirDate.textContent = `Last Air Date: ${show.last_air_date}`;
  const overview = document.createElement("p");
  overview.textContent = show.overview;
  const genresTitle = document.createElement("h5");
  genresTitle.textContent = "Genres";
  const genresList = document.createElement("ul");
  genresList.classList.add("list-group");
  show.genres.forEach((genre) => {
    const genreItem = document.createElement("li");
    genreItem.textContent = genre.name;
    genresList.appendChild(genreItem);
  });
  const homepageLink = document.createElement("a");
  homepageLink.setAttribute("href", show.homepage);
  homepageLink.setAttribute("target", "_blank");
  homepageLink.classList.add("btn");
  homepageLink.textContent = "Visit show Homepage";

  infoDiv.appendChild(title);
  infoDiv.appendChild(rating);
  infoDiv.appendChild(lastAirDate);
  infoDiv.appendChild(overview);
  infoDiv.appendChild(genresTitle);
  infoDiv.appendChild(genresList);
  infoDiv.appendChild(homepageLink);

  detailsTopDiv.appendChild(imageDiv);
  detailsTopDiv.appendChild(infoDiv);

  const detailsBottomDiv = document.createElement("div");
  detailsBottomDiv.classList.add("details-bottom");

  const showInfoTitle = document.createElement("h2");
  showInfoTitle.textContent = "Show Info";

  const showInfoList = document.createElement("ul");
  const numOfEpisodesItem = document.createElement("li");
  numOfEpisodesItem.innerHTML = `<span class="text-secondary">Number of Episodes:</span> ${show.number_of_episodes}`;
  const lastEpisodeItem = document.createElement("li");
  lastEpisodeItem.innerHTML = `<span class="text-secondary">Last Episode To Air:</span> ${show.last_episode_to_air.name}`;
  const statusItem = document.createElement("li");
  statusItem.innerHTML = `<span class="text-secondary">Status:</span> ${show.status}`;

  showInfoList.appendChild(numOfEpisodesItem);
  showInfoList.appendChild(lastEpisodeItem);
  showInfoList.appendChild(statusItem);

  const productionCompaniesTitle = document.createElement("h4");
  productionCompaniesTitle.textContent = "Production Companies";

  const productionCompaniesDiv = document.createElement("div");
  productionCompaniesDiv.classList.add("list-group");
  show.production_companies.forEach((company) => {
    const companySpan = document.createElement("span");
    companySpan.textContent = company.name;
    productionCompaniesDiv.appendChild(companySpan);
  });

  detailsBottomDiv.appendChild(showInfoTitle);
  detailsBottomDiv.appendChild(showInfoList);
  detailsBottomDiv.appendChild(productionCompaniesTitle);
  detailsBottomDiv.appendChild(productionCompaniesDiv);

  detailsContainer.appendChild(detailsTopDiv);
  detailsContainer.appendChild(detailsBottomDiv);
}

// Display Backdrop On Details Pages
function displayBackgroundImage(type, backgroundPath) {
  const overlayDiv = document.createElement("div");
  overlayDiv.style.backgroundImage = `url(https://image.tmdb.org/t/p/original/${backgroundPath})`;
  overlayDiv.style.backgroundSize = "cover";
  overlayDiv.style.backgroundPosition = "center";
  overlayDiv.style.height = "100vh";
  overlayDiv.style.width = "100vw";
  overlayDiv.style.position = "absolute";
  overlayDiv.style.top = "0";
  overlayDiv.style.left = "0";
  overlayDiv.style.zIndex = "-1";
  overlayDiv.style.opacity = "0.1";

  if (type === "movie") {
    document.querySelector("#movie-details").appendChild(overlayDiv);
  } //futura implementazione tv shows
}

// Search Movies/Shows --> futura implementazione serie tv
async function search() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  global.search.type = urlParams.get("type");
  global.search.term = urlParams.get("search-term");

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

    document.querySelector("#search-term").value = "";
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
    const div = document.createElement("div");
    div.classList.add("card");

    const link = document.createElement("a");
    link.href = `${global.search.type}-details.html?id=${result.id}`;

    const img = document.createElement("img");
    img.src = result.poster_path
      ? `https://image.tmdb.org/t/p/w500${result.poster_path}`
      : "../images/no-image.jpg";
    img.classList.add("card-img-top");
    img.alt = global.search.type === "movie" ? result.title : result.name;

    link.appendChild(img);
    div.appendChild(link);

    const cardBody = document.createElement("div");
    cardBody.classList.add("card-body");

    const title = document.createElement("h5");
    title.classList.add("card-title");
    title.textContent =
      global.search.type === "movie" ? result.title : result.name;
    cardBody.appendChild(title);

    const release = document.createElement("p");
    release.classList.add("card-text");
    const small = document.createElement("small");
    small.classList.add("text-muted");
    small.textContent =
      "Release: " +
      (global.search.type === "movie"
        ? result.release_date
        : result.first_air_date);
    release.appendChild(small);
    cardBody.appendChild(release);

    div.appendChild(cardBody);

    searchResults.appendChild(div);
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

    initSwiper();
  });
}

function initSwiper() {
  const swiper = new Swiper(".swiper", {
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

  const response = await fetch(
    `${API_URL}${endpoint}?api_key=${API_KEY}&language=en-US`
  );

  const data = await response.json();

  return data;
}

// Make Request To Search
async function searchAPIData() {
  const API_KEY = global.api.apiKey;
  const API_URL = global.api.apiUrl;

  const response = await fetch(
    `${API_URL}search/${global.search.type}?api_key=${API_KEY}&language=en-US&query=${global.search.term}&page=${global.search.page}`
  );

  const data = await response.json();

  return data;
}

// Highlight active link
function highlightActiveLink() {
  const links = document.querySelectorAll(".navLink");
  links.forEach((link) => {
    if (link.getAttribute("href") === global.currentPage) {
      link.classList.add("active");
    }
  });
}

// Show Alert
function showAlert(message, className = "error") {
  const alertEl = cE("div");
  alertEl.className = "alert";
  alertEl.appendChild(document.createTextNode(message));
  document.querySelector("#alert").appendChild(alertEl);

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
function init() {
  switch (global.currentPage) {
    case "/":
    case "/index.html":
      displaySlider();
      displayPopularMovies();
      break;
    case "/shows.html":
      displayPopularShows();
      break;
    case "/movie-details.html":
      displayMovieDetails();
      break;
    case "/search.html":
      search();
      break;
  }

  highlightActiveLink();
}

document.addEventListener("DOMContentLoaded", init);
