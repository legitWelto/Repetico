<p align="center">
  <img src="public/Logo.png" alt="Repetico Logo" width="200">
</p>

# Repetico Audio Player

**Repetico** is a high-performance, specialized Progressive Web App (PWA) designed for musicians, dancers, and athletes who require granular control over their audio training sessions. Unlike standard media players, Repetico focuses on section-based navigation, precise time-stretching, and automated looping.

## 🚀 Core Audio & Playback Features
The heart of the application is a custom-built audio engine designed for precision.

* **Dynamic Playback Interface:** A custom UI featuring a toggleable Play/Pause button, a high-precision timeline slider, and manual timestamp input for exact positioning.
* **Pitch-Preserved Speed Control:** Adjust playback speed without affecting the pitch.
* **Section-Based Navigation:** Jump instantly between predefined song segments using dedicated section buttons on the primary dashboard.

![Main Player Screen](/public/screenshot_player.png)

## 🔄 Advanced Training & Looping
Designed for repetitive practice, the training module allows users to master specific parts of a track.

* **Section Training Mode:** A dedicated screen to select a "Starting Section" and "Ending Section" to define a training interval.
* **Flexible Loop Logic:**
    * **Auto-Loop:** Automatically restarts the interval once the end is reached.
    * **Stop-on-End:** Plays the selection once and pauses; hitting play again restarts the loop from the beginning of the intervall.
* **Configurable Delay:** Set a custom delay (in seconds) between loops to allow time for resetting positions or instruments.

![Interval Settings Screen](/public/screenshot_intervals.png)

## 📂 Library & Metadata Management
Repetico is a "privacy-first" local-storage app. Your files never leave your device.

* **IndexedDB Persistence:** Audio files and section metadata are stored directly in your browser's IndexedDB. Your library remains intact even after closing the browser or restarting your device.
* **Song Manager:** Easily switch between tracks, upload new files from your local system, or delete songs to free up storage.
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

## Installing on Android

You can install Repetico directly on your Android phone using the provided installation file (`repectico.apk`). No app store or complicated setup is required.

### Simple Installation Steps

1. **Transfer the file to your phone**
   Send the `repectico.apk` file from this repository to your Android device. You can do this via:
   - USB cable transfer
   - Uploading it to Google Drive or Dropbox
   - Emailing it to yourself
   - Messaging apps (like Telegram or WhatsApp)

2. **Open the file**
   On your phone, open your **File Manager** or **Downloads** folder and tap on the `repectico.apk` file.

3. **Allow Installation**
   If this is your first time installing an app this way, Android will ask for permission:
   - A message will pop up saying "For your security, your phone is not allowed to install unknown apps from this source."
   - Tap **Settings**.
   - Toggle the switch for **Allow from this source** to ON.
   - Tap the **Back** button.

4. **Confirm Install**
   A window will appear asking if you want to install the app. Tap **Install**.

5. **Open and Play**
   Once finished, tap **Open** to start using Repetico!

> [!TIP]
   You can find the app in your app drawer with the blue circular "R" icon.

