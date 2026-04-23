# Repetico Audio Player

**Repetico** is a high-performance, specialized Progressive Web App (PWA) designed for musicians, dancers, and athletes who require granular control over their audio training sessions. Unlike standard media players, Repetico focuses on section-based navigation, precise time-stretching, and automated looping.

## 🚀 Core Audio & Playback Features
The heart of the application is a custom-built audio engine designed for precision.

* **Dynamic Playback Interface:** A custom UI featuring a toggleable Play/Pause button, a high-precision timeline slider, and manual timestamp input for exact positioning.
* **Pitch-Preserved Speed Control:** Adjust playback speed without affecting the pitch. 
    * **Fine-Tuning:** Use incremental buttons for $\pm 1\%$ and $\pm 5\%$ adjustments.
    * **Direct Input:** Enter specific percentage values for instant speed changes.
* **Section-Based Navigation:** Jump instantly between predefined song segments using dedicated section buttons on the primary dashboard.

![Main Player Screen](/public/screenshot_player.png)

## 🔄 Advanced Training & Looping
Designed for repetitive practice, the training module allows users to master specific parts of a track.

* **Section Training Mode:** A dedicated screen to select a "Starting Section" and "Ending Section" to define a training interval.
* **Flexible Loop Logic:**
    * **Auto-Loop:** Automatically restarts the interval once the end is reached.
    * **Stop-on-End:** Plays the selection once and pauses; hitting play again restarts the loop from the beginning.
* **Configurable Delay:** Set a custom delay (in seconds) between loops to allow time for resetting positions or instruments.

![Interval Settings Screen](/public/screenshot_intervals.png)

## 📂 Library & Metadata Management
Repetico is a "privacy-first" local-storage app. Your files never leave your device.

* **IndexedDB Persistence:** Audio files and section metadata are stored directly in your browser's IndexedDB. Your library remains intact even after closing the browser or restarting your device.
* **Song Manager:** Easily switch between tracks via a dropdown menu, upload new files from your local system, or delete songs to free up storage.
* **Section Editor:** A visual tool to define song segments.
    * Assign custom names to sections.
    * Define precise start and end timestamps.
    * "Preview" mode to listen to a section's boundaries while editing.
* **Portable Project Files:** Export a custom file format containing both the audio and the JSON-based section settings to share your practice setup with other Repetico users.

![Song Settings Screen](/public/screenshot_settings.png)

## 📱 Mobile & System Integration
Optimized for the "Lock Screen" experience and cross-platform reliability.

* **System Media Control (Media Session API):** Control your training without unlocking your phone.
    * The notification drawer/lock screen shows the **current section name** instead of just the song title.
    * Skip buttons are re-mapped to navigate between **Sections** rather than tracks.
    * Includes custom buttons for Speed Up/Slow Down directly in the system tray.
* **Native APK Support:** Wrapped via **Capacitor** for a high-performance native Android experience, allowing full hardware integration and offline reliability.

## 🎨 Adaptive UI & Styling
The interface intelligently morphs to fit your device and environment.

* **Responsive Layouts:**
    * **Portrait:** A streamlined, stack-based mobile view.
    * **Landscape:** A specialized wide-screen layout that optimizes the timeline and section buttons.
    * **Desktop Grid:** On larger screens, "cards" (Player, Training, Settings) are displayed in a multi-column grid for simultaneous access.
* **Dark & Light Modes:** Full theme support that respects system preferences or manual toggles.

## 🛠 Tech Stack
* **Frontend:** HTML5, CSS3 (Flexbox/Grid), JavaScript.
* **Audio Engine:** Web Audio API & Media Session API.
* **Storage:** IndexedDB for local persistence.
* **Deployment:** Dockerized and hosted on **Google Cloud Run**.
* **Platform:** PWA (Progressive Web App) with a native **Capacitor** wrapper for Android.

## 🛠 Local Development

### Prerequisites
- **Node.js:** Ensure you have Node.js (v18 or higher) installed on your system. You can download it from [nodejs.org](https://nodejs.org/).

### Setup Instructions
1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Repetico
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Start the development server:**
   ```bash
   npm run dev
   ```
4. **Open the app:**
   Navigate to `http://localhost:3000` in your browser.

## Android Packaging Instructions

We use **Capacitor** to wrap this web application into a native Android APK. Follow these steps on a machine with Android Studio installed:

### 1. Project Setup
Ensure all dependencies are installed:
```bash
npm install
```

### 2. Initialize Capacitor
Initialize the Capacitor configuration (if not already done):
```bash
npm run cap:init
```

### 3. Add Android Platform
Create the native Android project folder:
```bash
npm run cap:add:android
```

### 4. Deploy to Android Studio (Combined)
The fastest way to test on Android is to use the combined command which runs tests, syncs assets, and opens the IDE:
```bash
npm run android:deploy
```

### 5. Manual Sync (Individual Steps)
If you prefer to run steps manually:
- **Sync Web Assets**: `npm run cap:copy`
- **Open in Android Studio**: `npm run cap:open:android`

### 6. Build the APK (Detailed)
Once Android Studio opens, follow these sub-steps to generate the final file:

1. **Wait for Gradle Sync**: Look at the bottom status bar in Android Studio. Wait for "Gradle sync finished" and for the progress bars to disappear. This can take several minutes the first time.
2. **Select Build Variant**: Ensure the build variant is set to `debug` (default) for testing, or `release` if you have signing keys configured.
3. **Trigger Build**: In the top menu bar, go to **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
4. **Locate Output**: 
   - A small notification bubble will appear in the bottom-right corner once the build finishes (usually labeled "Build APK: APK(s) generated successfully").
   - Click the blue **"locate"** link inside that bubble.
   - This will open your file explorer to the folder containing `app-debug.apk`.
5. **Install on Device**: Transfer this `.apk` file to your Android phone (via USB, Drive, or Email) and open it to install the game.