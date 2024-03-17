const speedsounds = "assets/js/speedsounds.json";
const books = "assets/js/books.json";
const sets = "assets/js/sets.json";

const fetchData = (url) => {
  return fetch(url).then((response) => {
    if (!response.ok) {
      throw new Error(`Error fetching JSON from ${url}`);
    }
    return response.json();
  });
};

const init = () => {
  Promise.all([fetchData(speedsounds), fetchData(books), fetchData(sets)])
    .then(([speedsoundsData, booksData, setsData]) => {
      console.log("Speedsounds data:", speedsoundsData);
      console.log("Books data:", booksData);
      console.log("Sets data:", setsData);
    })
    .catch((error) => {
      console.error("Error fetching JSON:", error);
    });
};

init();
