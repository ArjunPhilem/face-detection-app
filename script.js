// Global variables
let webcam = null;
let stream = null;
let isDetecting = false;
let isRecognizing = false;
let detectionInterval = null;
let recognitionInterval = null;
let faceMatcher = null;
let storedFaces = [];
let capturedPhotos = [];

// DOM elements
const videoElement = document.getElementById('webcam');
const canvasElement = document.getElementById('overlay');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const detectBtn = document.getElementById('detectBtn');
const captureBtn = document.getElementById('captureBtn');
const personNameInput = document.getElementById('personName');
const trainBtn = document.getElementById('trainBtn');
const recognizeBtn = document.getElementById('recognizeBtn');
const stopRecognitionBtn = document.getElementById('stopRecognitionBtn');
const clearStorageBtn = document.getElementById('clearStorageBtn');
const statusText = document.getElementById('statusText');
const faceCountElement = document.getElementById('faceCount');
const capturedPhotosContainer = document.getElementById('capturedPhotos');
const recognitionResults = document.getElementById('recognitionResults');
const storedFacesContainer = document.getElementById('storedFaces');
const loadingOverlay = document.getElementById('loadingOverlay');
const loadingText = document.getElementById('loadingText');

// Check if face-api is loaded
function checkFaceApiLoaded() {
    return typeof faceapi !== 'undefined';
}

// Initialize the application
async function init() {
    showLoading('Loading face detection models...');
    
    // Wait for face-api to be available
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds
    
    while (!checkFaceApiLoaded() && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
    }
    
    if (!checkFaceApiLoaded()) {
        hideLoading();
        updateStatus('Error: face-api.js library failed to load. Please refresh the page.', 'error');
        return;
    }
    
    try {
        // Load face-api.js models from local directory
        loadingText.textContent = 'Loading face detection models...';
        await faceapi.nets.tinyFaceDetector.loadFromUri('./models/face-api.js-models/tiny_face_detector');
        await faceapi.nets.faceLandmark68Net.loadFromUri('./models/face-api.js-models/face_landmark_68');
        await faceapi.nets.faceRecognitionNet.loadFromUri('./models/face-api.js-models/face_recognition');
        await faceapi.nets.ageGenderNet.loadFromUri('./models/face-api.js-models/age_gender_model');
        
        hideLoading();
        updateStatus('Models loaded successfully! Click "Start Webcam" to begin.');
        
        // Load stored faces from localStorage
        loadStoredFaces();
        
    } catch (error) {
        hideLoading();
        updateStatus('Error loading models: ' + error.message + '. Please check if models are in the correct location.', 'error');
        console.error('Model loading error:', error);
    }
}

// Event listeners
startBtn.addEventListener('click', startWebcam);
stopBtn.addEventListener('click', stopWebcam);
detectBtn.addEventListener('click', toggleDetection);
captureBtn.addEventListener('click', capturePhoto);
trainBtn.addEventListener('click', trainFaces);
recognizeBtn.addEventListener('click', startRecognition);
stopRecognitionBtn.addEventListener('click', stopRecognition);
clearStorageBtn.addEventListener('click', clearAllData);

// Start webcam
async function startWebcam() {
    try {
        updateStatus('Starting webcam...');
        
        // Get user media with lower resolution for better performance
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 480 }, // Reduced from 640
                height: { ideal: 360 }, // Reduced from 480
                facingMode: 'user'
            }
        });
        
        // Set video source
        videoElement.srcObject = stream;
        
        // Wait for video to load
        videoElement.onloadedmetadata = () => {
            // Set canvas size to match video
            canvasElement.width = videoElement.videoWidth;
            canvasElement.height = videoElement.videoHeight;
            
            // Update UI
            startBtn.disabled = true;
            stopBtn.disabled = false;
            detectBtn.disabled = false;
            captureBtn.disabled = false;
            
            updateStatus('Webcam started! Click "Start Detection" to begin face detection.');
        };
        
    } catch (error) {
        updateStatus('Error starting webcam: ' + error.message, 'error');
        console.error('Webcam error:', error);
    }
}

// Stop webcam
function stopWebcam() {
    if (stream) {
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    
    // Clear video
    videoElement.srcObject = null;
    
    // Stop detection and recognition if running
    if (isDetecting) {
        toggleDetection();
    }
    if (isRecognizing) {
        stopRecognition();
    }
    
    // Clear canvas
    const ctx = canvasElement.getContext('2d');
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    
    // Update UI
    startBtn.disabled = false;
    stopBtn.disabled = true;
    detectBtn.disabled = true;
    captureBtn.disabled = true;
    detectBtn.textContent = 'Start Detection';
    
    // Clear face count
    faceCountElement.innerHTML = '';
    
    updateStatus('Webcam stopped. Click "Start Webcam" to begin again.');
}

// Toggle face detection
function toggleDetection() {
    if (isDetecting) {
        // Stop detection
        if (detectionInterval) {
            clearInterval(detectionInterval);
            detectionInterval = null;
        }
        
        isDetecting = false;
        detectBtn.textContent = 'Start Detection';
        
        // Clear canvas
        const ctx = canvasElement.getContext('2d');
        ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        
        // Clear face count
        faceCountElement.innerHTML = '';
        
        updateStatus('Face detection stopped.');
        
    } else {
        // Start detection
        isDetecting = true;
        detectBtn.textContent = 'Stop Detection';
        
        updateStatus('Face detection started!');
        
        // Start detection loop - reduced to 5 FPS for better performance
        detectionInterval = setInterval(detectFaces, 200); // 5 FPS instead of 10 FPS
    }
}

// Detect faces in video stream - optimized version
async function detectFaces() {
    if (!isDetecting || videoElement.paused || videoElement.ended) {
        return;
    }
    
    try {
        // Check if face-api is available
        if (!checkFaceApiLoaded()) {
            console.error('face-api not loaded');
            return;
        }
        
        // Detect faces with age and gender - using more efficient options
        const detections = await faceapi.detectAllFaces(
            videoElement, 
            new faceapi.TinyFaceDetectorOptions({
                inputSize: 224, // Smaller input size for better performance
                scoreThreshold: 0.5 // Higher threshold to reduce false positives
            })
        ).withAgeAndGender();
        
        // Clear previous drawings
        const ctx = canvasElement.getContext('2d');
        ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        
        // Draw detections
        if (detections.length > 0) {
            // Resize detections to match canvas
            const resizedDetections = faceapi.resizeResults(detections, {
                width: canvasElement.width,
                height: canvasElement.height
            });
            
            // Draw face boxes
            faceapi.draw.drawDetections(canvasElement, resizedDetections);
            
            // Draw age and gender labels - only for first 2 faces to reduce lag
            resizedDetections.slice(0, 2).forEach((detection, index) => {
                const age = Math.round(detection.age);
                const gender = detection.gender;
                const genderProbability = Math.round(detection.genderProbability * 100);
                
                const box = detection.detection.box;
                const labelX = box.x;
                const labelY = box.y + box.height + 20; // Position below the box
                
                // Draw background rectangle for age/gender label
                const ctx = canvasElement.getContext('2d');
                const text = `${gender} (${genderProbability}%) • Age: ${age}`;
                const textMetrics = ctx.measureText(text);
                const textWidth = textMetrics.width;
                const textHeight = 16;
                
                // Draw background
                ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                ctx.fillRect(labelX - 5, labelY - textHeight - 5, textWidth + 10, textHeight + 10);
                
                // Draw border
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1;
                ctx.strokeRect(labelX - 5, labelY - textHeight - 5, textWidth + 10, textHeight + 10);
                
                // Draw text
                ctx.font = 'bold 12px Arial';
                ctx.fillStyle = 'white';
                ctx.fillText(text, labelX, labelY);
            });
            
            // Update face count
            faceCountElement.innerHTML = `Faces detected: ${detections.length}`;
            
        } else {
            // No faces detected
            faceCountElement.innerHTML = 'No faces detected';
        }
        
    } catch (error) {
        console.error('Detection error:', error);
    }
}

// Capture photo from webcam
async function capturePhoto() {
    if (!stream || videoElement.paused || videoElement.ended) {
        updateStatus('Please start webcam first.', 'error');
        return;
    }
    
    try {
        // Create a canvas to capture the current frame
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        
        // Draw the current video frame to canvas
        ctx.drawImage(videoElement, 0, 0);
        
        // Detect faces in the captured frame with landmarks and descriptors first
        const detections = await faceapi.detectAllFaces(
            canvas, 
            new faceapi.TinyFaceDetectorOptions()
        ).withFaceLandmarks().withFaceDescriptors();
        
        if (detections.length === 0) {
            updateStatus('No faces detected in the photo. Please try again.', 'error');
            return;
        }
        
        // Now get age and gender for the detected faces
        const ageGenderDetections = await faceapi.detectAllFaces(
            canvas, 
            new faceapi.TinyFaceDetectorOptions()
        ).withAgeAndGender();
        
        // Combine the detections
        const combinedDetections = detections.map((detection, index) => {
            const ageGender = ageGenderDetections[index];
            return {
                ...detection,
                age: ageGender ? ageGender.age : null,
                gender: ageGender ? ageGender.gender : null,
                genderProbability: ageGender ? ageGender.genderProbability : null
            };
        });
        
        // Convert canvas to data URL
        const photoDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        
        // Add photo to captured photos with age/gender info
        const photoItem = {
            id: Date.now(),
            dataUrl: photoDataUrl,
            detections: combinedDetections,
            name: ''
        };
        
        capturedPhotos.push(photoItem);
        updateCapturedPhotosDisplay();
        
        // Enable training controls
        personNameInput.disabled = false;
        trainBtn.disabled = false;
        
        updateStatus(`Photo captured! ${combinedDetections.length} face(s) detected. Enter a name and click "Train Recognition".`);
        
    } catch (error) {
        updateStatus('Error capturing photo: ' + error.message, 'error');
        console.error('Photo capture error:', error);
    }
}

// Update captured photos display
function updateCapturedPhotosDisplay() {
    if (capturedPhotos.length === 0) {
        capturedPhotosContainer.innerHTML = '<p class="no-photos">No photos captured yet. Start webcam and click "Capture Photo" to begin.</p>';
        return;
    }
    
    capturedPhotosContainer.innerHTML = '';
    
    capturedPhotos.forEach((photo, index) => {
        const photoItem = document.createElement('div');
        photoItem.className = 'photo-item';
        
        const img = document.createElement('img');
        img.src = photo.dataUrl;
        img.alt = 'Captured face';
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.innerHTML = '×';
        removeBtn.onclick = () => removeCapturedPhoto(index);
        
        // Add age/gender info if available
        if (photo.detections.length > 0 && photo.detections[0].age && photo.detections[0].gender) {
            const detection = photo.detections[0];
            const age = Math.round(detection.age);
            const gender = detection.gender;
            const genderProbability = Math.round(detection.genderProbability * 100);
            
            const infoDiv = document.createElement('div');
            infoDiv.className = 'photo-info';
            infoDiv.innerHTML = `${gender} (${genderProbability}%) • Age: ${age}`;
            photoItem.appendChild(infoDiv);
        }
        
        photoItem.appendChild(img);
        photoItem.appendChild(removeBtn);
        capturedPhotosContainer.appendChild(photoItem);
    });
}

// Remove captured photo
function removeCapturedPhoto(index) {
    capturedPhotos.splice(index, 1);
    updateCapturedPhotosDisplay();
    
    if (capturedPhotos.length === 0) {
        personNameInput.disabled = true;
        trainBtn.disabled = true;
    }
}

// Train faces for recognition
async function trainFaces() {
    const personName = personNameInput.value.trim();
    
    if (!personName) {
        updateStatus('Please enter a name for the person.', 'error');
        return;
    }
    
    if (capturedPhotos.length === 0) {
        updateStatus('No photos captured. Please capture some photos first.', 'error');
        return;
    }
    
    showLoading('Training face recognition model...');
    
    try {
        const descriptors = [];
        let ageInfo = '';
        let genderInfo = '';
        
        // Extract descriptors and age/gender info from all captured photos
        for (const photo of capturedPhotos) {
            // Ensure descriptors are properly extracted as Float32Array
            for (const detection of photo.detections) {
                if (detection.descriptor && detection.descriptor instanceof Float32Array) {
                    descriptors.push(detection.descriptor);
                    
                    // Get age/gender info from first detection
                    if (detection.age && detection.gender) {
                        const age = Math.round(detection.age);
                        const gender = detection.gender;
                        const genderProbability = Math.round(detection.genderProbability * 100);
                        
                        ageInfo = `Age: ${age}`;
                        genderInfo = `${gender} (${genderProbability}%)`;
                    }
                }
            }
        }
        
        if (descriptors.length === 0) {
            hideLoading();
            updateStatus('No valid face descriptors found. Please try capturing photos again.', 'error');
            return;
        }
        
        // Store the face data with age/gender info
        const faceData = {
            name: personName,
            descriptors: descriptors,
            imageSrc: capturedPhotos[0].dataUrl,
            age: ageInfo,
            gender: genderInfo,
            timestamp: Date.now()
        };
        
        storedFaces.push(faceData);
        saveStoredFaces();
        updateStoredFacesDisplay();
        
        // Update face matcher
        updateFaceMatcher();
        
        // Clear captured photos
        capturedPhotos = [];
        updateCapturedPhotosDisplay();
        personNameInput.value = '';
        personNameInput.disabled = true;
        trainBtn.disabled = true;
        
        hideLoading();
        updateStatus(`Successfully trained face recognition for ${personName}!`);
        
        // Enable recognition if we have trained faces
        if (storedFaces.length > 0) {
            recognizeBtn.disabled = false;
        }
        
    } catch (error) {
        hideLoading();
        updateStatus('Error training faces: ' + error.message, 'error');
        console.error('Training error:', error);
    }
}

// Start face recognition
function startRecognition() {
    if (storedFaces.length === 0) {
        updateStatus('No trained faces available. Please train some faces first.', 'error');
        return;
    }
    
    isRecognizing = true;
    recognizeBtn.disabled = true;
    stopRecognitionBtn.disabled = false;
    
    updateStatus('Face recognition started!');
    
    // Start recognition loop - reduced to 5 FPS for better performance
    recognitionInterval = setInterval(recognizeFaces, 200); // 5 FPS instead of 10 FPS
}

// Stop face recognition
function stopRecognition() {
    if (recognitionInterval) {
        clearInterval(recognitionInterval);
        recognitionInterval = null;
    }
    
    isRecognizing = false;
    recognizeBtn.disabled = false;
    stopRecognitionBtn.disabled = true;
    
    // Clear recognition results
    recognitionResults.innerHTML = '';
    
    updateStatus('Face recognition stopped.');
}

// Update recognition results display
function updateRecognitionResultsDisplay(results) {
    recognitionResults.innerHTML = '';
    
    if (results.length === 0) {
        recognitionResults.innerHTML = '<p>No faces detected</p>';
        return;
    }
    
    results.forEach((result, index) => {
        const isRecognized = result.distance < result.threshold;
        const confidence = Math.max(0, (1 - result.distance) * 100);
        
        const resultItem = document.createElement('div');
        resultItem.className = 'recognition-result';
        
        let resultHTML = `
            <h3>Face ${index + 1}</h3>
            <p><strong>Name:</strong> ${isRecognized ? result.name : 'Unknown'}</p>
            <p><strong>Confidence:</strong> ${confidence.toFixed(1)}%</p>
            <p><strong>Distance:</strong> ${result.distance.toFixed(3)}</p>
        `;
        
        // Add age/gender info if available
        if (result.age && result.gender) {
            resultHTML += `
                <p><strong>Gender:</strong> ${result.gender} (${result.genderProbability}%)</p>
                <p><strong>Age:</strong> ${result.age} years</p>
            `;
        }
        
        resultHTML += `<p><strong>Status:</strong> ${isRecognized ? '✅ Recognized' : '❌ Unknown'}</p>`;
        
        resultItem.innerHTML = resultHTML;
        recognitionResults.appendChild(resultItem);
    });
}

// Update face matcher
function updateFaceMatcher() {
    if (storedFaces.length === 0) {
        faceMatcher = null;
        return;
    }
    
    try {
        const labeledDescriptors = storedFaces.map(face => 
            new faceapi.LabeledFaceDescriptors(face.name, face.descriptors)
        );
        
        faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);
    } catch (error) {
        console.error('Error creating face matcher:', error);
        faceMatcher = null;
    }
}

// Recognize faces in video stream - optimized version
async function recognizeFaces() {
    if (!isRecognizing || videoElement.paused || videoElement.ended) {
        return;
    }
    
    try {
        // Check if face-api is available
        if (!checkFaceApiLoaded()) {
            console.error('face-api not loaded');
            return;
        }
        
        // Check if face matcher is available
        if (!faceMatcher) {
            return;
        }
        
        // Detect faces with landmarks and descriptors first - using optimized options
        const detections = await faceapi.detectAllFaces(
            videoElement, 
            new faceapi.TinyFaceDetectorOptions({
                inputSize: 224, // Smaller input size for better performance
                scoreThreshold: 0.5 // Higher threshold to reduce false positives
            })
        ).withFaceLandmarks().withFaceDescriptors();
        
        // Get age and gender separately - only for first 2 faces
        const ageGenderDetections = await faceapi.detectAllFaces(
            videoElement, 
            new faceapi.TinyFaceDetectorOptions({
                inputSize: 224,
                scoreThreshold: 0.5
            })
        ).withAgeAndGender();
        
        // Clear previous drawings
        const ctx = canvasElement.getContext('2d');
        ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        
        // Process recognitions - limit to first 2 faces for better performance
        const recognitionResults = [];
        const maxFaces = Math.min(detections.length, 2);
        
        for (let i = 0; i < maxFaces; i++) {
            const detection = detections[i];
            const ageGender = ageGenderDetections[i];
            
            if (detection.descriptor instanceof Float32Array) {
                const match = faceMatcher.findBestMatch(detection.descriptor);
                
                recognitionResults.push({
                    name: match.label,
                    distance: match.distance,
                    threshold: 0.6,
                    age: ageGender ? Math.round(ageGender.age) : null,
                    gender: ageGender ? ageGender.gender : null,
                    genderProbability: ageGender ? Math.round(ageGender.genderProbability * 100) : null
                });
            }
        }
        
        // Draw detections with recognition results
        if (detections.length > 0) {
            // Resize detections to match canvas
            const resizedDetections = faceapi.resizeResults(detections, {
                width: canvasElement.width,
                height: canvasElement.height
            });
            
            // Draw face boxes
            faceapi.draw.drawDetections(canvasElement, resizedDetections);
            
            // Draw recognition labels with age/gender info - only for first 2 faces
            resizedDetections.slice(0, 2).forEach((detection, index) => {
                const result = recognitionResults[index];
                const isRecognized = result && result.distance < result.threshold;
                const label = isRecognized ? result.name : 'Unknown';
                const confidence = result ? Math.max(0, (1 - result.distance) * 100) : 0;
                
                // Calculate better position for the label
                const box = detection.detection.box;
                const labelX = box.x;
                const labelY = box.y - 25; // Position above the box
                
                // Draw background rectangle for better visibility
                const ctx = canvasElement.getContext('2d');
                const text = `${label} (${confidence.toFixed(1)}%)`;
                const textMetrics = ctx.measureText(text);
                const textWidth = textMetrics.width;
                const textHeight = 16;
                
                // Draw background
                ctx.fillStyle = isRecognized ? 'rgba(76, 175, 80, 0.9)' : 'rgba(255, 87, 34, 0.9)';
                ctx.fillRect(labelX - 5, labelY - textHeight - 5, textWidth + 10, textHeight + 10);
                
                // Draw border
                ctx.strokeStyle = isRecognized ? '#4CAF50' : '#FF5722';
                ctx.lineWidth = 2;
                ctx.strokeRect(labelX - 5, labelY - textHeight - 5, textWidth + 10, textHeight + 10);
                
                // Draw text
                ctx.font = 'bold 14px Arial';
                ctx.fillStyle = 'white';
                ctx.fillText(text, labelX, labelY);
                
                // Draw age/gender info below the box
                if (result && result.age && result.gender) {
                    const ageGenderText = `${result.gender} (${result.genderProbability}%) • Age: ${result.age}`;
                    const ageGenderMetrics = ctx.measureText(ageGenderText);
                    const ageGenderWidth = ageGenderMetrics.width;
                    const ageGenderHeight = 14;
                    const ageGenderY = box.y + box.height + 20;
                    
                    // Draw background for age/gender
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                    ctx.fillRect(labelX - 5, ageGenderY - ageGenderHeight - 5, ageGenderWidth + 10, ageGenderHeight + 10);
                    
                    // Draw border for age/gender
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(labelX - 5, ageGenderY - ageGenderHeight - 5, ageGenderWidth + 10, ageGenderHeight + 10);
                    
                    // Draw age/gender text
                    ctx.font = 'bold 12px Arial';
                    ctx.fillStyle = 'white';
                    ctx.fillText(ageGenderText, labelX, ageGenderY);
                }
            });
            
            // Update recognition results display
            updateRecognitionResultsDisplay(recognitionResults);
            
        } else {
            recognitionResults.innerHTML = '<p>No faces detected</p>';
        }
        
    } catch (error) {
        console.error('Recognition error:', error);
    }
}

// Load stored faces from localStorage
function loadStoredFaces() {
    const stored = localStorage.getItem('storedFaces');
    if (stored) {
        try {
            const parsedFaces = JSON.parse(stored);
            
            // Convert descriptors back to Float32Array objects
            storedFaces = parsedFaces.map(face => ({
                ...face,
                descriptors: face.descriptors.map(desc => new Float32Array(desc))
            }));
            
            updateFaceMatcher();
            updateStoredFacesDisplay();
            
            // Enable recognition if we have trained faces
            if (storedFaces.length > 0) {
                recognizeBtn.disabled = false;
            }
        } catch (error) {
            console.error('Error loading stored faces:', error);
            // Clear corrupted data
            localStorage.removeItem('storedFaces');
            storedFaces = [];
        }
    }
}

// Save stored faces to localStorage
function saveStoredFaces() {
    localStorage.setItem('storedFaces', JSON.stringify(storedFaces));
}

// Update stored faces display
function updateStoredFacesDisplay() {
    storedFacesContainer.innerHTML = '';
    
    if (storedFaces.length === 0) {
        storedFacesContainer.innerHTML = '<p>No stored faces yet.</p>';
        return;
    }
    
    storedFaces.forEach((face, index) => {
        const faceItem = document.createElement('div');
        faceItem.className = 'stored-face-item';
        
        let faceHTML = `
            <img src="${face.imageSrc}" alt="${face.name}">
            <h4>${face.name}</h4>
            <p>${face.descriptors.length} descriptors</p>
        `;
        
        // Add age/gender info if available
        if (face.age) {
            faceHTML += `<p>${face.age}</p>`;
        }
        if (face.gender) {
            faceHTML += `<p>${face.gender}</p>`;
        }
        
        faceHTML += `<p>${new Date(face.timestamp).toLocaleDateString()}</p>`;
        
        faceItem.innerHTML = faceHTML;
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'btn btn-danger';
        removeBtn.style.marginTop = '10px';
        removeBtn.style.fontSize = '0.8rem';
        removeBtn.innerHTML = 'Remove';
        removeBtn.onclick = () => removeStoredFace(index);
        
        faceItem.appendChild(removeBtn);
        storedFacesContainer.appendChild(faceItem);
    });
}

// Remove stored face
function removeStoredFace(index) {
    storedFaces.splice(index, 1);
    saveStoredFaces();
    updateFaceMatcher();
    updateStoredFacesDisplay();
    
    // Disable recognition if no faces left
    if (storedFaces.length === 0) {
        recognizeBtn.disabled = true;
    }
    
    showMessage('Face removed successfully.', 'success');
}

// Clear all data
function clearAllData() {
    if (confirm('Are you sure you want to clear all stored face data?')) {
        storedFaces = [];
        faceMatcher = null;
        localStorage.removeItem('storedFaces');
        updateStoredFacesDisplay();
        recognizeBtn.disabled = true;
        showMessage('All data cleared successfully.', 'success');
    }
}

// Update status message
function updateStatus(message, type = 'info') {
    statusText.textContent = message;
    
    // Add visual feedback for errors
    if (type === 'error') {
        statusText.style.color = '#e53e3e';
    } else {
        statusText.style.color = '#4a5568';
    }
}

// Show message
function showMessage(message, type = 'success') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Show loading overlay
function showLoading(message) {
    loadingText.textContent = message;
    loadingOverlay.classList.remove('hidden');
}

// Hide loading overlay
function hideLoading() {
    loadingOverlay.classList.add('hidden');
}

// Handle page visibility change
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause detection and recognition when tab is not visible
        if (isDetecting) {
            toggleDetection();
        }
        if (isRecognizing) {
            stopRecognition();
        }
    }
});

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', init); 