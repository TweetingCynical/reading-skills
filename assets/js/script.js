const speedsounds = "assets/js/speedsounds.json";
const books = "assets/js/books.json";
const sets = "assets/js/sets.json";
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const choices = document.getElementsByClassName("choices");
const speedSoundsSection = document.getElementById("speedsounds");
const redWordsSection = document.getElementById("redwords");
const booksSection = document.getElementById("books");

// Set pen colours
const penColors = {
  "dark-blue-pen": "#2a2e70",
  "red-pen": "#de3d2c",
  "yellow-pen": "#f7c43f",
  "green-pen": "#cccf3b",
  "blue-pen": "#56c0d3",
  "purple-pen": "#5d2550",
  eraser: "white",
};

// Function to handle pen color change
function changePenColor(color) {
  ctx.strokeStyle = color;
}

// Add event listeners to each pen color image
const penColorImages = document.querySelectorAll(".pen-color");
penColorImages.forEach((image) => {
  image.addEventListener("click", function () {
    const colorId = this.id;
    const color = penColors[colorId];
    if (color) {
      changePenColor(color);
    }

    // Toggle class 'selectedBtn' for the clicked image
    this.classList.add("selectedBtn");

    // Remove class 'selectedBtn' from all other pen color images
    penColorImages.forEach((img) => {
      if (img !== this) {
        img.classList.remove("selectedBtn");
      }
    });
  });
});

const undoStack = []; // Stack to store drawing actions for undo
const redoStack = []; // Stack to store undone actions for redo

// Event listener for undo button
document.getElementById("undo").addEventListener("click", undo);

// Event listener for redo button
document.getElementById("redo").addEventListener("click", redo);

// Event listener for refresh button
document.getElementById("refresh").addEventListener("click", refreshCanvas);

const fetchData = (url) => {
  return fetch(url).then((response) => {
    if (!response.ok) {
      throw new Error(`Error fetching JSON from ${url}`);
    }
    return response.json();
  });
};

// Variables to track mouse movements
let painting = false;
let lastX = 0;
let lastY = 0;

// Function to start painting
function startPainting(e) {
  painting = true;
  let clientX, clientY;

  if (e.type.includes("touch")) {
    // Prevent default touch behaviour to avoid scrolling
    e.preventDefault();
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else {
    clientX = e.clientX;
    clientY = e.clientY;
  }
  const canvasRect = canvas.getBoundingClientRect();
  lastX = e.clientX - canvasRect.left;
  lastY = e.clientY - canvasRect.top;

  draw();
}

// Event listener to track mouse movements
canvas.addEventListener("mousedown", startPainting);
canvas.addEventListener("mouseup", stopPainting);
canvas.addEventListener("mousemove", draw);

// Add touch event listeners
canvas.addEventListener("touchstart", startPainting, { passive: false });
canvas.addEventListener("touchend", stopPainting, { passive: false });
canvas.addEventListener("touchmove", draw, { passive: false });

// Modified event listener to stop painting, compatible with touch
function stopPainting(e) {
  if (e.type.includes("touch")) {
    e.preventDefault(); // Prevent scrolling/zooming
  }
  painting = false;
  ctx.beginPath(); // Start a new path for subsequent drawings
  updateButtonStates(); // Update button states
}

function updateButtonStates() {
  const undoButton = document.getElementById("undo");
  const redoButton = document.getElementById("redo");
  const saveButton = document.getElementById("save"); // Assuming you have a save button
  const refreshButton = document.getElementById("refresh");

  // Updating undo and redo buttons based on their respective stacks
  undoButton.classList.toggle("deactivated", undoStack.length === 0);
  redoButton.classList.toggle("deactivated", redoStack.length === 0);

  // Deactivate save and refresh buttons if undo stack is empty
  const isCanvasClean = undoStack.length === 0;
  saveButton.classList.toggle("deactivated", isCanvasClean);
  refreshButton.classList.toggle("deactivated", isCanvasClean);
}

// Function to undo the last drawing action
function undo() {
  let lastColor = null;
  let consecutiveSameColorActions = 0;

  while (undoStack.length > 0) {
    const action = undoStack.pop();
    if (action.type === "draw") {
      if (lastColor === null) {
        lastColor = action.color;
        consecutiveSameColorActions++;
      } else if (lastColor === action.color) {
        consecutiveSameColorActions++;
      } else {
        // Different color encountered, stop undoing
        undoStack.push(action); // Push back the action for the different color
        break;
      }
    }

    // Draw the action
    redrawCanvas();

    if (consecutiveSameColorActions === 20) {
      // Undo all actions with the same color
      break;
    }

    // Push undone action onto redo stack
    redoStack.push(action);
  }

  // Reset consecutiveSameColorActions counter
  consecutiveSameColorActions = 0;
  updateButtonStates(); // Update button states after redo
}

// Function to redo the last undone action
function redo() {
  if (redoStack.length > 0) {
    const lastRedoAction = redoStack.pop(); // Get the last action from redo stack

    if (lastRedoAction.type === "draw") {
      undoStack.push(lastRedoAction); // Push the action back to undo stack
      redrawCanvas(); // Redraw canvas with the last undone action
    }
  }
  updateButtonStates(); // Update button states after redo
}

// Function to refresh the canvas (wipe clean)
function refreshCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
  undoStack.length = 0; // Clear undo stack
  redoStack.length = 0; // Clear redo stack
  updateButtonStates(); // Update button states after redo
}

// Function to handle drawing actions
function draw(e) {
  if (!painting || !e) return;

  let clientX, clientY;
  if (e && e.type.includes("touch")) {
    // Prevent default behavior
    e.preventDefault();
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else if (e) {
    clientX = e.clientX;
    clientY = e.clientY;
  }

  const canvasRect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - canvasRect.left;
  const mouseY = e.clientY - canvasRect.top;

  // Calculate distance and angle between current and previous points
  const dx = mouseX - lastX;
  const dy = mouseY - lastY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx);

  // Set pen width based on distance (optional)
  ctx.lineWidth = Math.max(5, 20 - distance * 0.05);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  // Number of additional points to add between current and previous points
  const segments = Math.floor(distance / 5); // Adjust segment length as needed

  // Draw additional points along the path
  for (let i = 0; i <= segments; i++) {
    const x = lastX + Math.cos(angle) * (distance * (i / segments));
    const y = lastY + Math.sin(angle) * (distance * (i / segments));
    ctx.lineTo(x, y);
    ctx.stroke();

    // Save drawing action for undo
    undoStack.push({
      type: "draw",
      path: { startX: lastX, startY: lastY, endX: x, endY: y },
      color: ctx.strokeStyle,
      lineWidth: ctx.lineWidth,
    });
  }

  lastX = mouseX;
  lastY = mouseY;
}

// Function to redraw canvas based on drawing actions in the undo stack
function redrawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
  undoStack.forEach((action) => {
    if (action.type === "draw") {
      ctx.strokeStyle = action.color;
      ctx.lineWidth = action.lineWidth;
      drawAction(action.path);
    }
  });
}

// Function to draw a single action
function drawAction(path) {
  ctx.beginPath();
  ctx.moveTo(path.startX, path.startY);
  ctx.lineTo(path.endX, path.endY);
  ctx.stroke();
}

// TIDY UP LATER
const setsDropdown = (setsData) => {
  const setsElement = document.createElement("select");
  Array.from(setsData.sets).forEach((set) => {
    const option = document.createElement("option");
    option.value = set;
    option.textContent = set;
    setsElement.appendChild(option);
  });
  choices[0].appendChild(setsElement);
};

const createSpeedSounds = (speedsoundsData) => {
  Array.from(speedsoundsData).forEach((set) => {
    const cardParent = document.createElement("div");
    cardParent.className = `speed-sounds-set ${set.type} d-flex`;
    const cardHeader = document.createElement("h2");
    cardHeader.innerText = set.type;
    cardParent.appendChild(cardHeader);
    Array.from(set.sounds).forEach((sound) => {
      const card = document.createElement("div");
      card.id = sound;
      card.className =
        "card d-flex shadow m-2 p-2 rounded border border-dark border-2 sound-card";
      const cardSound = document.createElement("p");
      // Display oo instead of ooo for the look sound
      cardSound.textContent = sound === "ooo" ? sound.substring(0, 2) : sound;
      const cardImg = document.createElement("img");
      cardImg.src = `assets/images/sounds/${set.ref}/${sound}.png`;
      cardImg.className = "soundImg p-1 m-1";
      card.appendChild(cardSound);
      card.appendChild(cardImg);
      cardParent.appendChild(card);
    });
    speedSoundsSection.appendChild(cardParent);
  });
};

const createBooks = (booksData) => {
  const bookSection = document.createElement("section");
  bookSection.className =
    "card d-flex shadow m-2 p-2 rounded border border-dark border-2";
  Array.from(booksData).forEach((book) => {
    const bookCard = document.createElement("div");
    bookCard.className =
      "card d-flex shadow m-2 p-2 rounded border border-dark border-2";
    const bookTitle = document.createElement("h2");
    bookTitle.innerText = `${book.title} (${book.type} - ${book.book})`;
    const newRedWords = document.createElement("h3");
    newRedWords.innerText = "New Red Words:";
    const redWords = document.createElement("h3");
    redWords.innerText = "Red Words:";
    const greenWords = document.createElement("h3");
    greenWords.innerText = "Green Words:";
    bookCard.appendChild(bookTitle);

    // Conditionally append newRedWords
    if (book.new_red_words && book.new_red_words.length > 0) {
      const newRedWords = document.createElement("h3");
      newRedWords.innerText = "New Red Words:";
      bookCard.appendChild(newRedWords);
      const newRedWordsContainer = document.createElement("div");
      newRedWordsContainer.className = "d-flex flex-wrap";
      Array.from(book.new_red_words).forEach((word) => {
        const wordCard = document.createElement("h4");
        wordCard.className =
          "card shadow m-2 p-2 rounded border border-danger border-2 red-word word-card";
        wordCard.innerText = word;
        newRedWordsContainer.appendChild(wordCard);
      });
      bookCard.appendChild(newRedWordsContainer);
    }

    // Conditionally append redWords
    if (book.red_words && book.red_words.length > 0) {
      const redWords = document.createElement("h3");
      redWords.innerText = "Red Words:";
      bookCard.appendChild(redWords);
      const redWordsContainer = document.createElement("div");
      redWordsContainer.className = "d-flex flex-wrap";
      Array.from(book.red_words).forEach((word) => {
        const wordCard = document.createElement("h4");
        wordCard.className =
          "card shadow m-2 p-2 rounded border border-danger border-2 red-word word-card";
        wordCard.innerText = word;
        redWordsContainer.appendChild(wordCard);
      });
      bookCard.appendChild(redWordsContainer);
    }

    // Conditionally append greenWords
    if (book.green_words && book.green_words.length > 0) {
      const greenWords = document.createElement("h3");
      greenWords.innerText = "Green Words:";
      bookCard.appendChild(greenWords);
      const greenWordsContainer = document.createElement("div");
      greenWordsContainer.className = "d-flex flex-wrap";
      Array.from(book.green_words).forEach((word) => {
        const wordCard = document.createElement("h4");
        wordCard.className =
          "card d-flex shadow m-2 p-2 rounded border border-success border-2 green-word word-card";
        wordCard.innerText = word;
        greenWordsContainer.appendChild(wordCard);
      });
      bookCard.appendChild(greenWordsContainer);
    }

    bookSection.appendChild(bookCard);
  });
  booksSection.appendChild(bookSection);
};
// TIDY UP LATER

const init = () => {
  Promise.all([fetchData(speedsounds), fetchData(books), fetchData(sets)])
    .then(([speedsoundsData, booksData, setsData]) => {
      console.log("Speedsounds data:", speedsoundsData);
      console.log("Books data:", booksData);
      console.log("Sets data:", setsData);
      updateButtonStates();
      setsDropdown(setsData);
      createSpeedSounds(speedsoundsData);
      createBooks(booksData);
    })
    .catch((error) => {
      console.error("Error fetching JSON:", error);
    });
};

init();
