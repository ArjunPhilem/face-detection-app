# Webcam Face Detection App

A lightweight, browser-based face detection application that uses your webcam to detect faces in real-time. Built with face-api.js, this app provides instant face detection with visual bounding boxes and face count.

## Features

- **Real-time Face Detection**: Detect faces using your webcam
- **Live Video Feed**: See yourself in real-time with face detection overlay
- **Face Count Display**: Shows the number of faces detected
- **Responsive Design**: Works on desktop and mobile devices
- **No Server Required**: Runs entirely in the browser using face-api.js
- **Privacy Focused**: All processing happens locally in your browser
- **Local Models**: Uses local face-api.js models for faster loading

## Live Demo

[View the live demo here](https://your-username.github.io/face-detection-app)

**Note**: Replace `your-username` with your actual GitHub username and `face-detection-app` with your repository name after deployment.

## Setup Instructions

### Prerequisites

1. **Git**: Download and install from [https://git-scm.com/](https://git-scm.com/)
2. **GitHub Account**: Create a free account at [https://github.com/](https://github.com/)
3. **Modern Browser**: Chrome, Firefox, Safari, or Edge with webcam support

### Step-by-Step Setup

#### 1. Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Name it `face-detection-app` (or any name you prefer)
5. Make it **public** (required for free GitHub Pages)
6. Don't initialize with README (we'll add our own)
7. Click "Create repository"

#### 2. Clone Repository Locally

Open your terminal/command prompt and run:

```bash
git clone https://github.com/your-username/face-detection-app.git
cd face-detection-app
```

#### 3. Add Project Files

The project files are already created in your workspace. You can now add them to your repository:

```bash
git add .
git commit -m "Initial commit: Webcam face detection app"
git push origin main
```

#### 4. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click "Settings" tab
3. Scroll down to "Pages" section
4. Under "Source", select "Deploy from a branch"
5. Choose "main" branch
6. Click "Save"
7. Your app will be available at `https://your-username.github.io/face-detection-app`

## How to Use

### Getting Started

1. **Load the App**: Open the app in your browser
2. **Allow Camera Access**: Click "Start Webcam" and allow camera permissions
3. **Start Detection**: Click "Start Detection" to begin face detection
4. **View Results**: See face bounding boxes and count in real-time

### Controls

- **Start Webcam**: Enables your camera and starts the video feed
- **Stop Webcam**: Disables the camera and stops the video feed
- **Start Detection**: Begins real-time face detection
- **Stop Detection**: Stops face detection but keeps camera running

### Features

- **Real-time Detection**: Detects faces at 10 FPS
- **Visual Feedback**: Green bounding boxes around detected faces
- **Face Count**: Shows number of faces currently detected
- **Responsive**: Automatically adjusts to different screen sizes
- **Privacy**: No data is sent to external servers
- **Local Models**: Fast loading with local face detection models

## Technical Details

### Technologies Used

- **HTML5**: Structure and video elements
- **CSS3**: Modern styling with gradients and animations
- **JavaScript (ES6+)**: Application logic and face-api.js integration
- **face-api.js**: Face detection library using TinyFaceDetector
- **WebRTC**: Camera access and video streaming
- **Local Models**: Face detection models stored locally

### Face Detection Process

1. **Camera Access**: Uses `getUserMedia()` to access webcam
2. **Video Stream**: Displays live video feed in HTML5 video element
3. **Face Detection**: Uses TinyFaceDetector for fast, efficient detection
4. **Canvas Overlay**: Draws bounding boxes on transparent canvas
5. **Real-time Updates**: Continuously processes video frames

### Performance Features

- **Efficient Detection**: Uses TinyFaceDetector for faster processing
- **Optimized FPS**: Runs at 10 FPS for smooth performance
- **Memory Management**: Automatically stops detection when tab is hidden
- **Error Handling**: Graceful handling of camera permissions and errors
- **Local Models**: No network requests for model loading

## Browser Compatibility

- Chrome 60+ (recommended)
- Firefox 55+
- Safari 12+
- Edge 79+

**Note**: Requires HTTPS for camera access on most browsers.

## File Structure

```
webcam-face-detection/
├── index.html                    # Main HTML file
├── styles.css                    # CSS styles
├── script.js                     # JavaScript logic
├── README.md                     # This file
└── models/
    └── face-api.js-models/       # Local face detection models
        ├── tiny_face_detector/   # TinyFaceDetector model
        ├── face_landmark_68/     # Face landmarks model
        ├── face_recognition/     # Face recognition model
        └── ...                   # Other models
```

## Customization

### Changing Detection Settings

In `script.js`, you can modify:

```javascript
// Detection frequency (milliseconds)
detectionInterval = setInterval(detectFaces, 100); // 10 FPS

// Detection options
const detections = await faceapi.detectAllFaces(
    videoElement, 
    new faceapi.TinyFaceDetectorOptions()
);
```

### Adding More Models

You can load additional models from the local directory:

```javascript
// Load face landmarks
await faceapi.nets.faceLandmark68Net.loadFromUri('./models/face-api.js-models/face_landmark_68');

// Load face recognition
await faceapi.nets.faceRecognitionNet.loadFromUri('./models/face-api.js-models/face_recognition');
```

### Styling Changes

Edit `styles.css` to customize:
- Colors and gradients
- Button styles and animations
- Video container layout
- Responsive breakpoints

### Adding Features

The modular structure makes it easy to add:
- Face landmark detection
- Emotion recognition
- Age/gender detection
- Screenshot functionality
- Recording capabilities

## Troubleshooting

### Common Issues

1. **Camera not working**: 
   - Ensure you're using HTTPS
   - Check browser permissions
   - Try refreshing the page

2. **No faces detected**:
   - Ensure good lighting
   - Face the camera directly
   - Check if camera is working properly

3. **Models not loading**:
   - Check if models are in the correct directory
   - Ensure all model files are present
   - Check browser console for errors

4. **Slow performance**:
   - Close other browser tabs
   - Reduce browser window size
   - Use a modern browser

### Performance Tips

- Use good lighting for better detection
- Face the camera directly
- Keep browser window open and active
- Use a modern browser with WebGL support
- Close unnecessary browser tabs

## Privacy & Security

- **Local Processing**: All face detection happens in your browser
- **No Data Storage**: No images or data are stored or transmitted
- **Camera Access**: Only requests camera permission when needed
- **No Tracking**: No analytics or tracking code included
- **Local Models**: All models are stored locally, no external requests

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Ensure you're using a supported browser
3. Try refreshing the page
4. Clear browser cache if needed

---

**Note**: This app runs entirely in your browser. No data is sent to external servers, ensuring your privacy and security. 

