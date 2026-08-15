<div align="center">

# 🛡️ AmniSphere

**An Open-Source, Privacy-First, Islamic Ethics-Aligned Web Browser**  
*Crafted with moral integrity by [Al-Haq Studio](https://alhaq.uk)*

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Zero Telemetry](https://img.shields.io/badge/Privacy-100%25%20Zero--Telemetry-brightgreen.svg)](#-zero-telemetry-privacy-promise)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)](https://tailwindcss.com/)

</div>

---

## 📖 Overview

**AmniSphere** is a modern, ethical browser designed from the ground up to protect user privacy, mental focus, and moral wellbeing. Operating on zero-telemetry principles, AmniSphere intercepts predatory ad networks, trackers, gambling (*Maysir*), usurious finance schemes (*Riba*), adult/NSFW content, and deceptive web patterns.

---

## ✨ Key Features

- **🛡️ Al-Haq Ethics Shield**:
  - Real-time URL & content filter blocking adult content, gambling, predatory usury, malware, and fingerprinting trackers.
  - Dynamic cosmetic element hiding for distraction-free reading.
  - Per-site exception controls and custom user blocklist management.
- **🔒 Isolated Sandbox Architecture**:
  - Sandboxed execution (`iframe` with restrictive Content Security Policy) preventing unauthorized script execution and cross-site data exfiltration.
  - Bidirectional action API (`window.FlashLiteAPI`) bridging forms, intents, and navigation securely.
- **✨ BYOK (Bring-Your-Own-Key) AI Engine**:
  - Zero cloud reliance by default — complete offline fallback generation when no API keys are configured.
  - Optional support for Google Gemini, OpenAI, and local LLM endpoints (Ollama / LocalAI) with Server-Sent Events (SSE) streaming.
- **🧩 Ultra-Lean Extension Engine & UserScripts**:
  - Zero bloated built-in extensions — ultra-fast, minimal memory footprint by default.
  - Fully sandboxed WebExtensions runner supporting user-created TypeScript UserScripts and standard Manifest V2 / V3 JSON modules.
- **🛠️ In-Tab Developer Tools**:
  - Live console streaming and network inspector directly embedded in the browser shell.

---

## 🔒 Zero-Telemetry Privacy Promise

AmniSphere enforces strict local-first data processing:
1. **No Analytics**: Zero Google Analytics, Meta Pixels, Mixpanel, or telemetry beacons.
2. **Local Storage**: All history, bookmarks, tabs, and shield statistics are stored locally on your device in `localStorage`.
3. **No Background AI Calls**: AI endpoints are invoked **only** upon explicit user request (e.g. clicking 'Summarize' or 'Ethics Audit').

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ (Node 24 LTS recommended)
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/alhaq-studio/amnisphere.git
cd amnisphere

# Install dependencies
npm install
```

### Running Locally (Development Mode)

```bash
npm run dev
```

Open [http://127.0.0.1:3300](http://127.0.0.1:3300) in your browser.

### Building for Production

```bash
# Compile frontend and server bundle
npm run build

# Start production server
npm start
```

---

## ⚙️ Configuration (Optional AI Key)

To use server-side Gemini AI features:
1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Add your Gemini API key in `.env.local`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
Alternatively, configure your API key or self-hosted Ollama endpoint anytime directly inside the browser under **Settings (⚙️) > AI Utilities**.

---

## 🏛️ Ecosystem Architecture

AmniSphere is part of the **Amn Product Family** developed by **Al-Haq Studio**:
- **AmniSphere**: Privacy-First Ethical Web Browser
- **AmnShield-Android**: App, Content & Distraction Blocker
- **AmnShield-Windows**: Desktop Focus & Process Blocker
- **AmnShield-Extension**: Manifest V3 Content Filter Extension
- **AmnGuard-FireWall**: Android VPN / Local NetFilter DNS Filter
- **AmnGaze**: Real-Time AI On-Device Screen & Web Moderation

---

## 📄 License

Released under the [MIT License](LICENSE).  
Copyright © 2026 [Al-Haq Studio](https://alhaq.uk). All rights reserved.
