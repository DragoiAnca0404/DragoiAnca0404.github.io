const MINIMUM_TRAINING_PICTURES = 10;
const K_NEIGHBOURS = 5;
const ESTIMATE_HAND_INTERVAL = 100;
var knn = null;
var currentWord = 0;
var wordInput;
var insertedWord;
var videoTraining;
var canvasTraining;
var trainForm;
var insertForm;
var saveButton;
var cardsContainer;
var noCardsInContainer;
var lastTrainedPicture;
var predictions;
var words = [];
var showRequirementsInfo;

function readHtmlDocumentForTraining() {
  // Rendering
  videoTraining = document.querySelector("#videoElement");
  canvasTraining = document.querySelector("#canvas");

  // Forms & Inputs
  trainForm = document.querySelector("#trainForm");
  insertForm = document.querySelector("#insertForm");
  wordInput = document.querySelector("#wordInput");
  insertedWord = document.querySelector("#insertedWord");
  displayedNumberOfTrainedPictures = document.querySelector("#trainedPictures");
  showRequirementsInfo = document.querySelector('#showRequirementsInfo');

  // Buttons
  saveButton = document.querySelector("#saveButton");

  // Cards Container
  cardsContainer = $('#cardsContainer');
  noCardsInContainer = document.querySelector('#noCardsInContainer');
}

function initKnn(){
  knn = new knn_image_classifier.KNNImageClassifier(0, K_NEIGHBOURS);
  knn.load();
}

async function main() {
  var model = await handpose.load();
  setInterval(() => {
    detect(model)
  }, ESTIMATE_HAND_INTERVAL);
};

async function detect(model) {
  predictions = await model.estimateHands(videoTraining);
  const ctx = canvasTraining.getContext("2d");

  if (predictions.length > 0) {
    const videoWidth = videoTraining.videoWidth;
    const videoHeight = videoTraining.videoHeight;
    // Set video width
    videoTraining.videoWidth = videoWidth;
    videoTraining.videoHeight = videoHeight;
    // Set canvas height and width
    canvasTraining.width = videoWidth;
    canvasTraining.height = videoHeight;
    drawlinesHand(predictions, ctx);
  }

  if (predictions.length == 0) {
    ctx.clearRect(0, 0, canvasTraining.width, canvasTraining.height);
  }
}

function displayTrainForm() {
  if (!wordInput.value.trim()) {
    alert("Introduceti Cuvantul!");
  } else {
    insertedWord.innerHTML = `Cuvantul Introdus: <b>${wordInput.value}</b>`;

    showRequirementsInfo.innerHTML = `Este Necesar Un Numar De ${MINIMUM_TRAINING_PICTURES} Imagini Captate.`;
    trainForm.classList.remove("d-none");
    insertForm.classList.add("d-none");

    initializeTrainedPictures();

    saveButton.disabled = true;
    wordInput.value = null;

    addWordToKnn();
  }
}

function initializeTrainedPictures() {
  displayedNumberOfTrainedPictures.innerHTML = knn.getClassExampleCount()[currentWord] || 0;
  displayedNumberOfTrainedPictures.classList.remove("green");
  displayedNumberOfTrainedPictures.classList.add("red");
  saveButton.disabled = true;
}

function displayInsertForm() {
  trainForm.classList.add("d-none");
  insertForm.classList.remove("d-none");
}

function pushCardsToContainer() {
  let trainCard = `<div class="card m-5 text-center" style="width: 400px;">
  <div class="card-header">
      <h5 class="card-title">${insertedWord.innerHTML.split(":")[1]}</h5>
  </div>
  <div class="card-body">
    <canvas id="cardCanvas" width="360px" height="270px"></canvas>
      <h6 class="card-subtitle mt-4">${knn.getClassExampleCount()[currentWord]}</h6>
  </div>
</div>`;
  cardsContainer.prepend(trainCard);
  cardCanvas = document.querySelector("#cardCanvas");
  var context = cardCanvas.getContext('2d');
  context.drawImage(lastTrainedPicture, 0, 0, cardCanvas.width, cardCanvas.height);

  let word = insertedWord.innerHTML.split(":")[1].replace('<b>','').trim(); 
  word = word.replace('</b>',''); 
  words.push(word);
  if(!noCardsInContainer.classList.contains("d-none")) {
    noCardsInContainer.classList.add("d-none");
  }
}

function trainWord() {
  const image = dl.fromPixels(videoTraining);
  knn.addImage(image,currentWord);
  createImageBitmap(videoTraining).then(image => {
    lastTrainedPicture = image;
  });
}

function addWordToKnn() {
  knn.numClasses += 1;
  knn.classLogitsMatrices.push(null);
  knn.classExampleCount.push(0);
}

function saveWord() {
  pushCardsToContainer(); 
  displayInsertForm();
  currentWord +=1;
}

function removeWordFromKnn() {
  knn.numClasses -= 1;
  knn.classLogitsMatrices.pop();
  knn.classExampleCount.pop();
}

function captureImage() {
  if(videoTraining.paused) {
    alert("Camera este dezactivata. Captarea a esuat.");
    return;
  }
  trainWord();

  displayedNumberOfTrainedPictures.innerHTML = knn.getClassExampleCount()[currentWord];
  if (requirementsForSaveAreMet()) {
    displayedNumberOfTrainedPictures.classList.remove("red");
    displayedNumberOfTrainedPictures.classList.add("green");
    saveButton.disabled = false;
  }
}

function removeCapturedImages() {
  knn.clearClass(currentWord);
  initializeTrainedPictures();
}

function requirementsForSaveAreMet() {
  return knn.getClassExampleCount()[currentWord] >= MINIMUM_TRAINING_PICTURES;
}
