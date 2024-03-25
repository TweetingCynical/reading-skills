// Global variables
let timer = 60;
let score = 0;
const numberFrameSource = "https://apps.mathlearningcenter.org/number-frames/";

// DOM elements
const mathsSpace = document.getElementById("mathsSpace");

// Create iframe from number frames
const renderNumberFrames = () => {
  const numberFrame = document.createElement("iframe");
  numberFrame.src = numberFrameSource;
  numberFrame.style.width = "100%";
  numberFrame.style.height = "900px";
  mathsSpace.appendChild(numberFrame);
};

// Initialise code on load
const initMaths = () => {
  renderNumberFrames();
};

// Initialize code on load
initMaths();
