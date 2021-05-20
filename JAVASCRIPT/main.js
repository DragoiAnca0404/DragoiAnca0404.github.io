function loadPage() {
  readHtmlDocumentForTraining();
  readHtmlDocumentForTesting();
  initStepper();
  loadWebcam();
  initKnn();
  predict();
}

function loadWebcam() {
  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(function (stream) {
        videoTraining.srcObject = stream;
        videoTesting.srcObject = stream;
        canvasTraining.classList.remove("loader");
        canvasTesting.classList.remove("loader");
      })
      .catch(function () {
        canvasTraining.classList.remove("loader");
        canvasTesting.classList.remove("loader");
        alert("Camera Web nu a putut fi pornita");
      });
  }
}
