
import {
  requireAccount,
  listByUser,
  insert
} from "../js/mockoon-api.js";

let currentMovie = null;

const TMDB_KEY = "9b6ce572fb03b0d30c462b4b89fff65c";
const API = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p";
const state = { list: "trending/movie/week", genre: null, movies: [] };
const elementSelection = (id) => document.getElementById(id);
const BLOCKED_GENRES = [99];//this is the id of documentation genres that we do not what to display


const tmdb = async (path, params = {}) => {
  const url = new URL(`${API}/${path}`);
  console.log(url)
  url.search = new URLSearchParams({ api_key: TMDB_KEY, language: "en-US", ...params });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDB error ${res.status}`);
  return res.json();
}


const renderHeroSection = (movie) => {
  if (!movie) return;

  currentMovie = movie;

  elementSelection("hero").style.backgroundImage =
    `url(${IMG}/original${movie.backdrop_path})`;

  elementSelection("hero-title").textContent = movie.title;
  elementSelection("hero-rating").textContent =
    movie.vote_average.toFixed(1);

  elementSelection("hero-year").textContent =
    (movie.release_date || "").slice(0, 4);

  elementSelection("hero-overview").textContent = movie.overview;

  elementSelection("hero-book").onclick = () => openBooking();
  elementSelection("hero-save").onclick = () => saveMovie(movie);
}


const saveMovie = async (movie) => {
  const user = requireAccount();
  if (!user) return;

  try {
    const saved = await listByUser("watchlist", user.id);

    // Don't save the same movie twice
    if (saved.some(item => Number(item.movieId) === movie.id)) {
      alert("This movie is already in your list.");
      return;
    }

    await insert("watchlist", {
      userId: String(user.id),
      movieId: movie.id,
      movieTitle: movie.title,
      posterPath: movie.poster_path,
      addedAt: new Date().toISOString()
    });

    alert("Movie added to your list!");

  } catch (error) {
    console.error(error);
    alert("Could not save movie. Check that Mockoon is running.");
  }
}

const openBooking = () => {
  if (!requireAccount()) return;

  const dialog = elementSelection("booking-dialog");

  elementSelection("booking-title").textContent =
    `Book: ${currentMovie.title}`;

  const dateInput = elementSelection("booking-date");
  const now = new Date();

  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0")
  ].join("-");

  dateInput.min = today;

  if (!dateInput.value || dateInput.value < today) {
    dateInput.value = today;
  }

  dialog.showModal();
}

elementSelection("cancel-booking").addEventListener("click", () => {
  elementSelection("booking-dialog").close();
});

elementSelection("booking-form").addEventListener(
  "submit",
  async (event) => {
    event.preventDefault();

    const user = requireAccount();
    if (!user || !currentMovie) return;

    const button = elementSelection("confirm-booking");
    button.disabled = true;

    try {
      await insert("bookings", {
        userId: String(user.id),
        movieId: currentMovie.id,
        movieTitle: currentMovie.title,
        posterPath: currentMovie.poster_path,

        showDate: elementSelection("booking-date").value,
        showTime: elementSelection("booking-time").value,
        quantity: Number(
          elementSelection("booking-quantity").value
        ),

        bookedAt: new Date().toISOString()
      });

      elementSelection("booking-dialog").close();

      alert(
        "Demo booking confirmed! Check your Account page."
      );

    } catch (error) {
      console.error(error);
      alert("Booking failed. Check that Mockoon is running.");

    } finally {
      button.disabled = false;
    }
  }
);


const renderMovieRow = (movies) => {
  elementSelection("row").replaceChildren();
  elementSelection("status").textContent = movies.length ? "" : "No movies found. Try another genre.";

  movies.filter((m) => m.poster_path).forEach((m) => {
    const card = document.createElement("button");
    card.className = "card";

    const img = document.createElement("img");
    img.src = `${IMG}/w342${m.poster_path}`;
    img.alt = `${m.title} poster`;
    img.loading = "lazy";

    const title = document.createElement("span");
    title.textContent = m.title;

    card.append(img, title);
    card.onclick = () => {
      renderHeroSection(m);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    elementSelection("row").append(card);
  });
}

const renderChips = (genres) => {
  elementSelection("chips").replaceChildren();
  genres.filter((g) => !BLOCKED_GENRES.includes(g.id))
    .forEach((g) => {
      const chip = document.createElement("button");
      chip.className = "chip";
      chip.textContent = g.name;

      chip.onclick = () => {
        state.genre = state.genre === g.id ? null : g.id; // click again to clear
        document.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
        if (state.genre) chip.classList.add("active");
        loadMovies();
      };

      elementSelection("chips").append(chip);
    });
}

// ---- Data loading ----
const loadMovies = async () => {
  elementSelection("status").textContent = "Loading…";
  try {
    const data = state.genre
      ? await tmdb("discover/movie", { with_genres: state.genre, sort_by: "popularity.desc" })
      : await tmdb(state.list);
    state.movies = data.results;
    renderMovieRow(state.movies);
    if (!state.genre) renderHeroSection(state.movies.find((m) => m.backdrop_path));
  } catch (err) {
    elementSelection("status").textContent = "Could not load movies. Check your API key and connection.";
    console.error(err);
  }
}

elementSelection("tabs").addEventListener("click", (e) => {
  const tab = e.target.closest(".tab");
  if (!tab) return;
  document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
  tab.classList.add("active");
  state.list = tab.dataset.list;
  state.genre = null;
  document.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
  loadMovies();
});

const startDisplayMovie = async () => {
  try {
    const { genres } = await tmdb("genre/movie/list");
    renderChips(genres);
  } catch (err) { console.error(err); }
  loadMovies();
};
startDisplayMovie();