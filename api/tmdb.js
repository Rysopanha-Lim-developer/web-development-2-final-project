const API_KEY = "691d41eb3434da38d0a673295d90145b"
const BEARER_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2OTFkNDFlYjM0MzRkYTM4ZDBhNjczMjk1ZDkwMTQ1YiIsIm5iZiI6MTc4OTIxNjQzMC43MzIsInN1YiI6IjZhYTU0NmFlMjYwY2Q0MjVjZjc0YTNiMCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.d-uSkpE_74aXjGVQ6ebMNFA-5XX8mZ9gTBMRD2dP-i0"


/**
 * Option 1: Fetch using Bearer token
 */
async function fetchSpiderManWithBearerToken() {
  const query = encodeURIComponent("Spider-Man: Brand New Day");
  const url = `https://api.themoviedb.org/3/search/movie?query=${query}&include_adult=false&language=en-US&page=1`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${BEARER_TOKEN}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Results using Bearer Token:", data);
    return data;
  } catch (error) {
    console.error("Fetch Error:", error);
  }
}

/**
 * Option 2: Fetch using v3 API Key (Query Parameter)
 */
async function fetchSpiderManWithApiKey() {
  const query = encodeURIComponent("batman");
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}&include_adult=false&language=en-US&page=1`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Results using API Key:", data);
    return data;
  } catch (error) {
    console.error("Fetch Error:", error);
  }
}

// Execute one of the functions:
fetchSpiderManWithBearerToken();