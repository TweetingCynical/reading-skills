// Global variables
let timer = 60;
let score = 0;
let currentPageIndex = 0;
let totalPages = 0;
let currentWordIndex = 0;
let soundClickCounter = 0;
let wordClickCounter = 0;
let selectedRefValue = null;

// Constants
const speedsounds = "assets/js/speedsounds.json";
const books = "assets/js/books.json";
const sets = "assets/js/sets.json";

// DOM elements
const choices = document.getElementById("choices");
const speedSoundsSection = document.getElementById("speedsounds");
const wordsSection = document.getElementById("words");
const booksSection = document.getElementById("books");
const gameBtns = document.getElementById("gameBtns");
const successBtn = document.getElementById("success");
const supportBtn = document.getElementById("support");
const supportSound = document.getElementById("supportSound");

// Add event listeners to elements by ID
const addEventListeners = (setsData, booksData, speedsoundsData) => {
  const logo = document.getElementById("logo");
  const createLink = document.getElementById("create-link");
  const speedSoundsLink = document.getElementById("speed-sounds-link");
  const redWordsLink = document.getElementById("red-words-link");
  const booksLink = document.getElementById("books-link");

  // Event listener function
  const handleLinkClick = () => {
    // Invoke setsDropdown function again
    setsDropdown(setsData, booksData, speedsoundsData);
  };

  // Add event listeners to elements
  if (logo) logo.addEventListener("click", handleLinkClick);
  if (createLink) createLink.addEventListener("click", handleLinkClick);
  if (speedSoundsLink)
    speedSoundsLink.addEventListener("click", handleLinkClick);
  if (redWordsLink) redWordsLink.addEventListener("click", handleLinkClick);
  if (booksLink) booksLink.addEventListener("click", handleLinkClick);
};

// Function to fetch data from JSON
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
const setsDropdown = (setsData, booksData, speedsoundsData) => {
  const existingSetsElement = document.getElementById("setsDropdown");
  const existingBooksDropdown = document.getElementById("booksDropdown");
  const existingBooksElement = document.getElementById("bookPageContainer");
  const existingWordSpace = document.getElementById("wordsContainer");
  const existingSoundsSpace = document.getElementById("soundsSpace");

  // Check if any of the elements exist, and remove them if they do
  if (existingSetsElement) existingSetsElement.remove();
  if (existingBooksDropdown) existingBooksDropdown.remove();
  if (existingBooksElement) existingBooksElement.remove();
  if (existingWordSpace) existingWordSpace.remove();
  if (existingSoundsSpace) existingSoundsSpace.remove();

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
    renderBooksDropdown(filteredBooks, speedsoundsData);
  });
};

// Update renderBooksDropdown function
const renderBooksDropdown = (filteredBooks, speedsoundsData) => {
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
    // Render speed sounds
    const resultArray = randmonisedSpeedSounds(selectedBook, speedsoundsData);

    const speedSoundsPractice = renderSpeedSounds(
      selectedBook,
      speedsoundsData,
      resultArray
    );
    gameBtns.classList.remove("hidden");

    // Set selected book as a global variable or use it as needed
    console.log("Selected Book:", selectedBook);
  });
};

// Function to shuffle array elements
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

// Function to render speed sounds based on selected book and speedsounds data
const randmonisedSpeedSounds = (selectedBook, speedsoundsData) => {
  // Generate the new array
  let newArray = [];

  // Calculate the number of iterations based on the number of items in selectedBook.focus_sounds
  let numIterations;
  const focusSoundsCount = selectedBook.focus_sounds.length;
  if (focusSoundsCount === 1) {
    numIterations = 15;
  } else if (focusSoundsCount === 2) {
    numIterations = 9;
  } else if (focusSoundsCount === 3) {
    numIterations = 6;
  } else if (focusSoundsCount === 4) {
    numIterations = 5;
  } else if (focusSoundsCount === 5) {
    numIterations = 4;
  } else if (focusSoundsCount === 6) {
    numIterations = 3;
  } else {
    numIterations = 2;
  }

  for (let i = 0; i < numIterations; i++) {
    newArray.push(...selectedBook.focus_sounds);
  }

  // Count the number of focus sounds added
  let focusSoundsAdded = selectedBook.focus_sounds.length;

  // Find objects from speedsoundsData where collections include selectedBook.type
  speedsoundsData.forEach((collection) => {
    if (collection.collections.includes(selectedBook.type)) {
      refValue = collection.ref;
      collection.sounds.forEach((sound) => {
        // Add the sound to newArray and increment the count
        newArray.push(sound);
        focusSoundsAdded++;

        // If we've reached 30 items, break out of the loop
        if (focusSoundsAdded >= 30) {
          return;
        }
      });
    }
  });

  // Shuffle the array to randomize sound order
  shuffleArray(newArray);

  // If newArray is still less than 30 items, add random sounds from speedsoundsData until it reaches 30
  while (newArray.length < 30) {
    const randomCollection =
      speedsoundsData[Math.floor(Math.random() * speedsoundsData.length)];
    const randomSound =
      randomCollection.sounds[
        Math.floor(Math.random() * randomCollection.sounds.length)
      ];
    newArray.push(randomSound);
  }

  // Ensure newArray contains at most 30 elements
  newArray = newArray.slice(0, 30);

  // Hide dropdowns
  const setsDropdown = document.getElementById("setsDropdown");
  const booksDropdown = document.getElementById("booksDropdown");
  setsDropdown.classList.add("hidden");
  booksDropdown.classList.add("hidden");

  // Return the new array
  return [newArray, refValue];
};

// Attach correct sound file source to support button
// Attach correct sound file source to support button
const updateSupportSoundSource = (type, refValue, itemValue) => {
  const filePath = `./assets/audio/${type}/${refValue}/${itemValue}.mp3`;

  // Use fetch to check if the file exists
  fetch(filePath)
    .then((response) => {
      if (!response.ok) {
        // File doesn't exist, use default source
        supportSound.src = "./assets/audio/nosupport.mp3";
      } else {
        // File exists, set the source to the actual file
        supportSound.src = filePath;
      }
    })
    .catch((error) => {
      // Error occurred, use default source
      console.error("Error checking file existence:", error);
      supportSound.src = "./assets/audio/nosupport.mp3";
    });
};

// Function to render speed sounds based on selected book and speedsounds data
const renderSpeedSounds = (selectedBook, speedsoundsData, resultArray) => {
  newArray = resultArray[0];
  selectedRefValue = resultArray[1];

  updateSupportSoundSource("speedsounds", selectedRefValue, newArray[0]);

  // Remove existing speed sounds space if it exists
  const existingSpeedSoundsSpace = document.getElementById("soundsSpace");
  if (existingSpeedSoundsSpace) {
    existingSpeedSoundsSpace.remove();
  }

  const soundsSpace = document.createElement("div");
  soundsSpace.id = "soundsSpace";
  soundsSpace.classList = "m-3 p-3 shadow-lg rounded";
  speedSoundsSection.appendChild(soundsSpace);
  soundsSpace.addEventListener("click", () =>
    handleSoundCardClick(selectedBook, speedsoundsData, newArray)
  );
  successBtn.addEventListener("click", () =>
    handleSoundCardClick(selectedBook, speedsoundsData, newArray)
  );

  // Create initial sound card
  const soundCard = document.createElement("div");
  soundCard.textContent = newArray[0];
  soundCard.id = "soundCard";
  soundCard.classList = "card border-white d-flex m-3 p-3";

  const soundImg = document.createElement("img");
  soundImg.id = "soundImg";
  soundImg.src = `./assets/images/speedsounds/${selectedRefValue}/${newArray[0]}.png`;
  soundImg.classList = "d-flex m-3 p-3";

  soundsSpace.appendChild(soundCard);
  soundsSpace.appendChild(soundImg);

  console.log(`selectedRefValue in renderSpeedSounds is: ${selectedRefValue}`);
  // Display first sound
  displayCurrentSound(newArray[0]);
};

// Function to display current sound
const displayCurrentSound = (sound) => {
  console.log(`selectedRefValue in displayCurrentSound is: ${refValue}`);
  const soundCard = document.getElementById("soundCard");
  if (!soundCard) return; // Ensure soundCard element exists

  // Update sound card with current sound
  soundCard.textContent = sound;

  const soundImg = document.getElementById("soundImg");
  if (!soundImg || !selectedRefValue) return; // Ensure soundImg element exists and refValue is selected

  // Update sound image source based on sound text and selected refValue
  soundImg.src = `./assets/images/speedsounds/${selectedRefValue}/${sound}.png`;
  updateSupportSoundSource("speedsounds", selectedRefValue, sound);
};

// Function to handle card click and display next word or sound
const handleSoundCardClick = (selectedBook, speedsoundsData, newArray) => {
  // Increment the click counter
  soundClickCounter++;

  if (soundClickCounter < 30) {
    console.log("Click count less than 30");
    displayCurrentSound(newArray[soundClickCounter]);
  } else if (soundClickCounter === 30) {
    const space = document.getElementById("soundsSpace");
    if (space) {
      space.remove();
    }
    soundClickCounter = 0;
    // Render words
    renderWords(selectedBook);
  }
};

// Update renderWords function
const renderWords = (selectedBook) => {
  const existingWordSpace = document.getElementById("wordsContainer");
  if (existingWordSpace) {
    existingWordSpace.remove();
  }

  const wordSpace = document.createElement("div");
  wordSpace.id = "wordsContainer";
  wordSpace.classList = "card m-3 p-3 shadow-lg rounded";
  wordsSection.appendChild(wordSpace);

  // Create initial word card
  const wordCard = document.createElement("div");
  wordCard.textContent = "Test";
  wordCard.id = "wordCard";
  wordCard.classList = "card d-flex m-3 p-3 shadow-lg rounded";
  wordSpace.addEventListener("click", () => {
    handleWordCardClick(selectedBook);
  });
  successBtn.addEventListener("click", () => {
    handleWordCardClick(selectedBook);
  });
  wordSpace.appendChild(wordCard);

  // Display first word
  displayCurrentWord(selectedBook);
  wordsCompleted = true;
};

// Function to update word card with current word
const displayCurrentWord = (selectedBook) => {
  const wordCard = document.getElementById("wordCard");
  const wordSpace = document.getElementById("wordsContainer");
  if (!wordCard) return; // Ensure wordCard element exists

  let currentWord;
  let wordTypeClass;

  // Arrays with values
  const arraysWithValue = [];

  // Check if green_words array has values
  if (selectedBook.green_words && selectedBook.green_words.length > 0) {
    arraysWithValue.push({
      array: selectedBook.green_words,
      type: "green-word",
    });
  }
  // Check if red_words array has values
  if (selectedBook.red_words && selectedBook.red_words.length > 0) {
    arraysWithValue.push({ array: selectedBook.red_words, type: "red-word" });
  }
  // Check if new_red_words array has values
  if (selectedBook.new_red_words && selectedBook.new_red_words.length > 0) {
    arraysWithValue.push({
      array: selectedBook.new_red_words,
      type: "new-red-word",
    });
  }

  // Ensure at least one array has values
  if (arraysWithValue.length === 0) {
    console.error("No word arrays with values found.");
    return;
  }

  // Randomly select one of the arrays with values
  const { array, type } =
    arraysWithValue[Math.floor(Math.random() * arraysWithValue.length)];

  // Generate a random index to select a word from the selected array
  const randomIndex = Math.floor(Math.random() * array.length);

  // Get the current word
  currentWord = array[randomIndex];

  // Apply class to wordCard
  wordCard.className = `d-flex m-3 p-3`;
  wordSpace.className = `${type} shadow-lg rounded justify-content-center`;

  if (type === "green-word") {
    // Play the sound
    const specialFriendsSound = document.getElementById("specialFriendsSound");
    // Rewind to the beginning in case the sound is already playing
    specialFriendsSound.currentTime = 0;
    specialFriendsSound.play();
  }

  // Update word card with current word
  wordCard.textContent = currentWord;
};

// Function to handle card click and display next word or sound
const handleWordCardClick = (selectedBook) => {
  // Increment the click counter
  wordClickCounter++;
  console.log(wordClickCounter);

  if (wordClickCounter < 30) {
    let nextWordIndex;
    do {
      // Generate a random index for the next word
      nextWordIndex = Math.floor(
        Math.random() * selectedBook.green_words.length
      );
    } while (nextWordIndex === currentWordIndex); // Ensure the next word is different from the current one
    currentWordIndex = nextWordIndex;

    displayCurrentWord(selectedBook);
  } else if (wordClickCounter === 30) {
    // Remove word space
    const space = document.getElementById("wordContainer");
    if (space) {
      space.remove();
    }

    wordClickCounter = 0;
    // Render words
    renderBook(selectedBook);
  }
};

// Create Book render
const renderBook = (selectedBook) => {
  // Remove existing book space if it exists
  const existingWordSpace = document.getElementById("wordsContainer");
  if (existingWordSpace) {
    existingWordSpace.remove();
  }

  const existingBookSpace = document.getElementById("bookPageContainer");
  if (existingBookSpace) {
    existingBookSpace.remove();
  }

  gameBtns.classList = "hidden";

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
};

// Function to load and display the current book page
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

// Initialise code on load
const init = () => {
  Promise.all([fetchData(speedsounds), fetchData(books), fetchData(sets)])
    .then(([speedsoundsData, booksData, setsData]) => {
      console.log("Speedsounds data:", speedsoundsData);
      console.log("Books data:", booksData);
      console.log("Sets data:", setsData);
      setsDropdown(setsData, booksData, speedsoundsData);
      addEventListeners(setsData, booksData, speedsoundsData);
    })
    .catch((error) => {
      console.error("Error fetching JSON:", error);
    });
};

/// TEMPORARY SCORING solution: Increment score by 1 when clicking the score button
document.getElementById("success").addEventListener("click", function () {
  // Increment the score by 1
  score++; // Assuming score is a global variable representing the current score
  // Update the score display
  document.getElementById("score").textContent = score;

  // Play the sound
  const pointSound = document.getElementById("pointSound");
  pointSound.currentTime = 0; // Rewind to the beginning in case the sound is already playing
  pointSound.play();
});

document.getElementById("support").addEventListener("click", function () {
  // Play the sound
  supportSound.currentTime = 0; // Rewind to the beginning in case the sound is already playing
  supportSound.play();
});

document.getElementById("scoreCard").addEventListener("click", function () {
  score = 0;
  // Update the score display
  document.getElementById("score").textContent = score;

  // Play the sound
  const pointSound = document.getElementById("pointSound");
  pointSound.currentTime = 0; // Rewind to the beginning in case the sound is already playing
  pointSound.play();
});

// Initialize code on load
init();
