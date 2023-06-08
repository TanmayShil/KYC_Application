// Variables to store recorded audio/video
let stream;
let mediaRecorder;
let recordedChunks = [];

// Get HTML elements
const recordButton = document.getElementById('recordButton');
const stopButton = document.getElementById('stopButton');
const preview = document.getElementById('preview');
const submitButton = document.getElementById('submitButton');

// Set up event listeners
recordButton.addEventListener('click', startRecording);
stopButton.addEventListener('click', stopRecording);
submitButton.addEventListener('click', submitRecording);

// Function to start recording
function startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        .then((mediaStream) => {
            stream = mediaStream;
            preview.srcObject = mediaStream;
            recordButton.disabled = true;
            stopButton.disabled = false;
            submitButton.disabled = true;

            recordedChunks = []; // Reset the recorded chunks array

            // Create the MediaRecorder instance
            mediaRecorder = new MediaRecorder(mediaStream);

            // Event handler for dataavailable event
            mediaRecorder.addEventListener('dataavailable', (event) => {
                if (event.data.size > 0) {
                    recordedChunks.push(event.data);
                }
            });

            // Start recording
            mediaRecorder.start();
        })
        .catch((error) => {
            console.error('Error accessing media devices:', error);
        });
}

// Function to stop recording
function stopRecording() {
    recordButton.disabled = false;
    stopButton.disabled = true;
    submitButton.disabled = false;

    // Stop recording
    mediaRecorder.stop();

    // Stop the media stream tracks
    const tracks = stream.getTracks();
    tracks.forEach((track) => {
        track.stop();
    });
}

// Function to handle the submission of the recorded audio/video
function submitRecording() {
    // Create a new Blob from the recorded chunks
    const recordedBlob = new Blob(recordedChunks, { type: 'video/webm' });

    // Create a FormData object to send the recorded data
    const formData = new FormData();
    formData.append('file', recordedBlob, 'kyc_recording.webm');

    // Send the data to the server using an AJAX request
    fetch('/upload', {
        method: 'POST',
        body: formData
    })
        .then((response) => {
            // Handle the server response
            if (response.ok) {
                console.log('Recording submitted successfully!');
            } else {
                console.error('Error submitting recording:', response.statusText);
            }
        })
        .catch((error) => {
            console.error('Error submitting recording:', error);
        });
}
