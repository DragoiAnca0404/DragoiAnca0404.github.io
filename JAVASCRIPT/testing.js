var status;
var videoTesting;
var canvasTesting;
var identifiedWords;
var isTestingStepActive;

const DETECTING_STATUS_DURATION = 1000;
const WRITING_WORD_INTERVAL = 2000;

const TESTING_STATUS = {
    NO_WORDS_TRAINED: 'Nu exista cuvinte antrenate.',
    READY_TO_PREDICT: 'Se asteapta gest.',
    PREDICTING: 'In curs de detectie.'
};

function readHtmlDocumentForTesting() {
    videoTesting = document.querySelector("#videoElementTesting");
    canvasTesting = document.querySelector("#canvasTesting");
    identifiedWords = document.querySelector('#identifiedWords');
}

function predict() {
    setInterval(() => {
        writeWord();
    }, WRITING_WORD_INTERVAL);
}

function writeWord() {
    if (
        !currentWord ||
        !predictions ||
        predictions.length < 1 ||
        !isTestingStepActive ||
        document.querySelector('#status').innerHTML !== TESTING_STATUS.READY_TO_PREDICT
    ) {
        return;
    }

    document.querySelector('#status').innerHTML = TESTING_STATUS.PREDICTING;
    const image = dl.fromPixels(videoTesting);
    knn.predictClass(image)
        .then(resp => {
            setTimeout(() => {
                identifiedWords.value += `${words[resp.classIndex]} `;
                document.querySelector('#status').innerHTML = TESTING_STATUS.READY_TO_PREDICT;
            }, DETECTING_STATUS_DURATION)
        });
}

function clearIdentifiedWords() {
    identifiedWords.value = '';
}