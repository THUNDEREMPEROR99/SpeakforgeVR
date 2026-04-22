# SpeakForge VR

SpeakForge VR is a high-fidelity, AI-driven interview simulation built with React and Three.js. It features a fully immersive 3D environment, voice-to-text response analysis, and a technical diagnostic HUD to ensure hardware compatibility.

## 🚀 Key Features

- **Immersive 3D Lobby & Interview Room**: High-performance rendering using React Three Fiber.
- **AI Neural Feedback**: Real-time evaluation of interview answers using local keyword analysis and speech patterns.
- **Technical Diagnostic HUD**: Live hardware logs (Mic Link, Signal Signal, Transcription Status) to help troubleshoot browser-level blocks.
- **Bypass Sandbox Mode**: A dedicated "Fix Microphone" utility to bypass iframe hardware restrictions.
- **Cross-Platform Support**: Optimized for Desktop 3D and VR headsets (Meta Quest, Vision Pro).

## 🛠️ Technical Setup

### Prerequisites
- Node.js (v18+)
- npm / yarn

### Installation
1. Clone your repository.
2. Install dependencies:
   ```bash
   npm install
   ```

### Development
Start the local development server:
   ```bash
   npm run dev
   ```
The application will be available at `http://localhost:3000`.

### Production Build
Generate a production-ready static site:
   ```bash
   npm run build
   ```
The output will be in the `dist/` directory.

## 🎤 Troubleshooting Microphone
Due to modern browser security (Sandboxing), microphone access is often blocked when the app is running inside an iframe.
- **If the visualizer bars stay blue and don't move**: Use the **"Bypass Sandbox (Fix Microphone)"** button in the main menu to open the app in its own tab.
- **Hardware Link**: Ensure you grant Microphone permissions when prompted by the browser.

## 📦 Tech Stack
- **Framework**: React 19
- **3D Engine**: Three.js / React Three Fiber / Drei
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Transcription**: Web Speech API
- **Motion**: Framer Motion (motion/react)
