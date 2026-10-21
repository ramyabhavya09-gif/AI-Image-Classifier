
const modelStatus = document.getElementById("modelStatus");
const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const uploadPrompt = document.getElementById("uploadPrompt");
const dropZone = document.getElementById("dropZone");
const fileName = document.getElementById("fileName");
const classifyBtn = document.getElementById("classifyBtn");
const resetBtn = document.getElementById("resetBtn");
const errorMessage = document.getElementById("errorMessage");
const emptyState = document.getElementById("emptyState");
const loadingState = document.getElementById("loadingState");
const loadingText = document.getElementById("loadingText");
const results = document.getElementById("results");
const bestLabel = document.getElementById("bestLabel");
const bestConfidence = document.getElementById("bestConfidence");
const predictionList = document.getElementById("predictionList");

let model = null;
let imageReady = false;
let isClassifying = false;
let currentObjectUrl = null;
let selectionVersion = 0;

function setModelStatus(message, ready = false) {
  modelStatus.textContent = message;
  document.querySelector(".live-dot").style.background =
    ready ? "#4ade80" : "#fbbf24";
}

function showError(message) {
  errorMessage.textContent = message;
}

function clearResults() {
  results.hidden = true;
  emptyState.hidden = false;
  loadingState.hidden = true;
  predictionList.replaceChildren();
}

async function loadModel() {
  try {
    if (typeof tf === "undefined" || typeof mobilenet === "undefined") {
      throw new Error("AI libraries did not load.");
    }

    await tf.ready();
    model = await mobilenet.load({ version: 2, alpha: 1.0 });
    setModelStatus("AI model ready", true);
    classifyBtn.disabled = !imageReady;
  } catch (error) {
    console.error("Model loading error:", error);
    setModelStatus("Model could not load");
    showError(
      "Unable to load the AI model. Check your internet connection and refresh the page."
    );
  }
}

function resetPredictions() {
  clearResults();
  showError("");
}

function isSupportedImage(file) {
  return (
    file &&
    ["image/jpeg", "image/png", "image/webp"].includes(file.type)
  );
}

function handleImage(file) {
  if (!file) return;

  if (!isSupportedImage(file)) {
    showError("Please select a JPG, PNG, or WEBP image.");
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    showError("Please choose an image smaller than 10 MB.");
    return;
  }

  const version = ++selectionVersion;
  imageReady = false;
  classifyBtn.disabled = true;
  showError("");
  resetPredictions();
  resetBtn.hidden = false;
  fileName.textContent = file.name;
  uploadPrompt.hidden = true;
  preview.hidden = true;

  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
  }

  currentObjectUrl = URL.createObjectURL(file);
  preview.onload = () => {
    if (version !== selectionVersion) return;
    imageReady = true;
    classifyBtn.disabled = !model || isClassifying;
    preview.hidden = false;
    uploadPrompt.hidden = true;
  };

  preview.onerror = () => {
    if (version !== selectionVersion) return;
    showError("The image could not be opened. Try another image.");
    imageReady = false;
    classifyBtn.disabled = true;
    preview.hidden = true;
    uploadPrompt.hidden = false;
  };

  preview.src = currentObjectUrl;
}

imageInput.addEventListener("change", (event) => {
  handleImage(event.target.files[0]);
});

dropZone.addEventListener("dragover", (event) => {
  event.preventDefault();
  dropZone.style.borderColor = "#a78bfa";
});

dropZone.addEventListener("dragleave", () => {
  dropZone.style.borderColor = "";
});

dropZone.addEventListener("drop", (event) => {
  event.preventDefault();
  dropZone.style.borderColor = "";
  handleImage(event.dataTransfer.files[0]);
});

classifyBtn.addEventListener("click", async () => {
  if (!model || !imageReady || isClassifying) return;

  isClassifying = true;
  classifyBtn.disabled = true;
  resetBtn.disabled = true;
  showError("");
  emptyState.hidden = true;
  results.hidden = true;
  loadingState.hidden = false;
  loadingText.textContent = "AI is analyzing your image...";

  try {
    // MobileNet returns labels and probability scores from a real model.
    const predictions = await model.classify(preview, 3);

    if (!predictions || predictions.length === 0) {
      throw new Error("No predictions were returned.");
    }

    displayPredictions(predictions);
  } catch (error) {
    console.error("Classification error:", error);
    loadingState.hidden = true;
    emptyState.hidden = false;
    showError(
      "Classification failed. Try another image or refresh the page."
    );
  } finally {
    isClassifying = false;
    classifyBtn.disabled = !model || !imageReady;
    resetBtn.disabled = false;
  }
});

function displayPredictions(predictions) {
  loadingState.hidden = true;
  emptyState.hidden = true;
  results.hidden = false;
  predictionList.replaceChildren();

  const best = predictions[0];
  bestLabel.textContent = formatLabel(best.className);
  bestConfidence.textContent = `${(best.probability * 100).toFixed(1)}% confidence`;

  predictions.forEach((prediction, index) => {
    const percentage = Math.max(
      0,
      Math.min(100, prediction.probability * 100)
    );

    const row = document.createElement("div");
    row.className = "prediction-row";

    const top = document.createElement("div");
    top.className = "prediction-top";

    const label = document.createElement("span");
    label.className = "prediction-label";
    label.textContent = `${index + 1}. ${formatLabel(prediction.className)}`;

    const score = document.createElement("span");
    score.className = "prediction-score";
    score.textContent = `${percentage.toFixed(1)}%`;

    const track = document.createElement("div");
    track.className = "progress-track";

    const fill = document.createElement("div");
    fill.className = "progress-fill";
    fill.style.width = `${percentage}%`;

    top.append(label, score);
    track.append(fill);
    row.append(top, track);
    predictionList.append(row);
  });
}

function formatLabel(label) {
  return label
    .split(",")[0]
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

resetBtn.addEventListener("click", () => {
  if (isClassifying) return;

  selectionVersion++;
  imageInput.value = "";
  preview.removeAttribute("src");
  preview.hidden = true;
  uploadPrompt.hidden = false;
  fileName.textContent = "No image selected";
  imageReady = false;
  classifyBtn.disabled = true;
  resetBtn.hidden = true;
  showError("");
  resetPredictions();

  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = null;
  }
});

window.addEventListener("beforeunload", () => {
  if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl);
});

// Load the real pretrained model when the page opens.
loadModel();
  
