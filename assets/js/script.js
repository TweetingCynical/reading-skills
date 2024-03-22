// Import JSON objects for stored values
const speedsounds = "assets/js/speedsounds.json";
const books = "assets/js/books.json";
const sets = "assets/js/sets.json";

// Set links to elements in DOM
const choices = document.getElementById("choices");
const speedSoundsSection = document.getElementById("speedsounds");
const redWordsSection = document.getElementById("redwords");
const booksSection = document.getElementById("books");

// Add event listeners to elements by ID
const addEventListeners = (setsData, booksData) => {
  const logo = document.getElementById("logo");
  const createLink = document.getElementById("create-link");
  const speedSoundsLink = document.getElementById("speed-sounds-link");
  const redWordsLink = document.getElementById("red-words-link");
  const booksLink = document.getElementById("books-link");

  // Event listener function
  const handleLinkClick = () => {
    // Invoke setsDropdown function again
    setsDropdown(setsData, booksData);
  };

  // Add event listeners to elements
  if (logo) logo.addEventListener("click", handleLinkClick);
  if (createLink) createLink.addEventListener("click", handleLinkClick);
  if (speedSoundsLink)
    speedSoundsLink.addEventListener("click", handleLinkClick);
  if (redWordsLink) redWordsLink.addEventListener("click", handleLinkClick);
  if (booksLink) booksLink.addEventListener("click", handleLinkClick);
};

// Fetch data from JSON
const fetchData = (url) => {
  return fetch(url).then((response) => {
    if (!response.ok) {
      throw new Error(`Error fetching JSON from ${url}`);
    }
    return response.json();
  });
};

// Create dropdown for choosing Speedsounds / Red words / Books
// Sets
const setsDropdown = (setsData, booksData) => {
  const existingSetsElement = document.getElementById("setsDropdown");
  const existingBooksDropdown = document.getElementById("booksDropdown");
  const existingBooksElement = document.getElementById("bookPageContainer");

  // Check if any of the elements exist, and remove them if they do
  if (existingSetsElement) existingSetsElement.remove();
  if (existingBooksDropdown) existingBooksDropdown.remove();
  if (existingBooksElement) existingBooksElement.remove();

  const setsElement = document.createElement("select");
  setsElement.className = "form-select rounded shadow dropdowns";
  setsElement.id = "setsDropdown";

  // Add default option for sets dropdown
  const defaultSetOption = document.createElement("option");
  defaultSetOption.value = "";
  defaultSetOption.textContent = "Choose a Book Set";
  setsElement.appendChild(defaultSetOption);

  Array.from(setsData.sets).forEach((set) => {
    const option = document.createElement("option");
    option.value = set;
    option.textContent = set;
    setsElement.appendChild(option);
  });
  choices.appendChild(setsElement);

  // Event listener for sets dropdown
  setsElement.addEventListener("change", (event) => {
    const selectedSet = event.target.value;
    const filteredBooks = booksData.filter((book) => book.type === selectedSet);
    createBooksDropdown(filteredBooks);
  });
};

// Books
const createBooksDropdown = (filteredBooks) => {
  // Remove existing books dropdown if it exists
  const existingBooksDropdown = document.getElementById("booksDropdown");
  if (existingBooksDropdown) {
    existingBooksDropdown.remove();
  }

  const booksElement = document.createElement("select");
  booksElement.id = "booksDropdown";
  booksElement.className = "form-select rounded shadow dropdowns";

  // Add default option for books dropdown
  const defaultBookOption = document.createElement("option");
  defaultBookOption.value = "";
  defaultBookOption.textContent = "Choose a Book Title";
  booksElement.appendChild(defaultBookOption);

  filteredBooks.forEach((book) => {
    const option = document.createElement("option");
    option.value = book.title;
    option.textContent = book.title;
    booksElement.appendChild(option);
  });
  choices.appendChild(booksElement);

  // Event listener for books dropdown
  booksElement.addEventListener("change", (event) => {
    const selectedTitle = event.target.value;
    const selectedBook = filteredBooks.find(
      (book) => book.title === selectedTitle
    );
    renderBook(selectedBook);
    // Set selected book as a global variable or use it as needed
    console.log("Selected Book:", selectedBook);
  });
};

// Global variables to keep track of current page and total pages
let currentPageIndex = 0;
let totalPages = 0;

// Function to load and display the current page
const displayCurrentPage = (selectedBook) => {
  const bookPage = document.getElementById("bookPage");
  bookPage.src = `./assets/images/books/${selectedBook.code}/${selectedBook.pages[currentPageIndex]}.jpg`;
};

// Function to handle next page navigation
const nextPage = (selectedBook) => {
  if (currentPageIndex < totalPages - 1) {
    currentPageIndex++;
    displayCurrentPage(selectedBook);
    updateNavigationButtons();
  }
};

// Function to handle previous page navigation
const previousPage = (selectedBook) => {
  if (currentPageIndex > 0) {
    currentPageIndex--;
    displayCurrentPage(selectedBook);
    updateNavigationButtons();
  }
};

// Function to update navigation buttons based on current page
const updateNavigationButtons = () => {
  const prevButton = document.getElementById("prevButton");
  const nextButton = document.getElementById("nextButton");
  if (prevButton && nextButton) {
    prevButton.disabled = currentPageIndex === 0;
    nextButton.disabled = currentPageIndex === totalPages - 1;
  }
};

// Create navigation buttons
// Function to create navigation buttons with Font Awesome icons
const createNavigationButtons = (selectedBook) => {
  const prevButton = document.createElement("button");
  prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
  prevButton.classList.add("navigation-button", "prev-button");
  prevButton.addEventListener("click", () => previousPage(selectedBook));

  const nextButton = document.createElement("button");
  nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
  nextButton.classList.add("navigation-button", "next-button");
  nextButton.addEventListener("click", () => nextPage(selectedBook));

  // Append buttons to bookPageContainer
  const bookPageContainer = document.getElementById("bookPageContainer");
  bookPageContainer.appendChild(prevButton);
  bookPageContainer.appendChild(nextButton);

  // Update button states initially
  updateNavigationButtons();
};

// Create Book render
const renderBook = (selectedBook) => {
  // Remove existing book space if it exists
  const existingBookSpace = document.getElementById("bookPageContainer");
  if (existingBookSpace) {
    existingBookSpace.remove();
  }

  const bookPageContainer = document.createElement("div");
  bookPageContainer.id = "bookPageContainer";
  bookPageContainer.classList = "mt-3 shadow-lg rounded";
  booksSection.appendChild(bookPageContainer);

  const bookPage = document.createElement("img");
  bookPage.id = "bookPage";
  bookPage.classList = "m-3 book-page";
  bookPage.src = `./assets/images/books/${selectedBook.code}/${selectedBook.pages[currentPageIndex]}.jpg`;
  bookPageContainer.appendChild(bookPage);

  // Create navigation buttons
  createNavigationButtons(selectedBook);

  // Update total pages
  totalPages = selectedBook.pages.length;

  // Hide dropdowns
  const setsDropdown = document.getElementById("setsDropdown");
  const booksDropdown = document.getElementById("booksDropdown");
  setsDropdown.classList.add("hidden");
  booksDropdown.classList.add("hidden");
};

// Initialise code on load
const init = () => {
  Promise.all([fetchData(speedsounds), fetchData(books), fetchData(sets)])
    .then(([speedsoundsData, booksData, setsData]) => {
      console.log("Speedsounds data:", speedsoundsData);
      console.log("Books data:", booksData);
      console.log("Sets data:", setsData);
      setsDropdown(setsData, booksData);
      addEventListeners(setsData, booksData);
    })
    .catch((error) => {
      console.error("Error fetching JSON:", error);
    });
};

init();
