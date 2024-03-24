//!Initial setup
const canvas = document.getElementById("myCanvas");
const penColorImages = document.querySelectorAll(".pen-color");
const ctx = canvas.getContext("2d");

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

//!State variables
const undoStack = []; // Stack to store drawing actions for undo
const redoStack = []; // Stack to store undone actions for redo

// Variables to track mouse movements
let painting = false;
let lastX = 0;
let lastY = 0;

//!Event Listeners
const setupEventListeners = () => {
  // Event listener to track mouse movements
  canvas.addEventListener("mousedown", startPainting);
  canvas.addEventListener("mouseup", stopPainting);
  canvas.addEventListener("mousemove", draw);

  // Add touch event listeners
  canvas.addEventListener("touchstart", startPainting, { passive: false });
  canvas.addEventListener("touchend", stopPainting, { passive: false });
  canvas.addEventListener("touchmove", draw, { passive: false });

  // Event listener for undo, redo and refresh buttons
  document.getElementById("undo").addEventListener("click", undo);
  document.getElementById("redo").addEventListener("click", redo);
  document.getElementById("refresh").addEventListener("click", refreshCanvas);

  // Add event listeners to each pen color image
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
};

//!Drawing functions
// Function to start painting
const startPainting = (e) => {
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
};

// Modified event listener to stop painting, compatible with touch
const stopPainting = (e) => {
  if (e.type.includes("touch")) {
    e.preventDefault(); // Prevent scrolling/zooming
  }
  painting = false;
  ctx.beginPath(); // Start a new path for subsequent drawings
  updateButtonStates(); // Update button states
};

// Function to handle drawing actions
const draw = (e) => {
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
};

//!Utility functions

// Function to handle pen color change
const changePenColor = (color) => {
  ctx.strokeStyle = color;
};

const updateButtonStates = () => {
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
};

// Function to undo the last drawing action
const undo = () => {
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
};

// Function to redo the last undone action
const redo = () => {
  if (redoStack.length > 0) {
    const lastRedoAction = redoStack.pop(); // Get the last action from redo stack

    if (lastRedoAction.type === "draw") {
      undoStack.push(lastRedoAction); // Push the action back to undo stack
      redrawCanvas(); // Redraw canvas with the last undone action
    }
  }
  updateButtonStates(); // Update button states after redo
};

// Function to refresh the canvas (wipe clean)
const refreshCanvas = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
  undoStack.length = 0; // Clear undo stack
  redoStack.length = 0; // Clear redo stack
  updateButtonStates(); // Update button states after redo
};

// Function to redraw canvas based on drawing actions in the undo stack
const redrawCanvas = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
  undoStack.forEach((action) => {
    if (action.type === "draw") {
      ctx.strokeStyle = action.color;
      ctx.lineWidth = action.lineWidth;
      drawAction(action.path);
    }
  });
};

// Function to draw a single action
const drawAction = (path) => {
  ctx.beginPath();
  ctx.moveTo(path.startX, path.startY);
  ctx.lineTo(path.endX, path.endY);
  ctx.stroke();
};

const initCanvas = () => {
  setupEventListeners();
  updateButtonStates();
};

initCanvas();
