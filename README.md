# 👻 Ghost in the Machine: Local AI Site Blocker

A privacy-first, locally powered Chrome extension built for the **Hacktoberfest "Ghost in the Machine" Challenge**. 

This extension monitors the time you spend on distracting websites. When your time is up, it locks the page with a spooky overlay and uses a local AI model (Gemma) to generate a context-aware, creepy message based on the specific tab you were reading, telling you to get back to work.

## 🦇 Why Open Innovation Matters Here

A time-tracking extension that actively reads the DOM and titles of your browser tabs is a massive privacy risk if it sends that data to a cloud provider. 

By building this with **Ollama** and the **Gemma:2b** open-weight model, this project ensures:

* **Total Privacy:** Your browsing habits and tab history never leave your machine.
* **Offline Capability:** The poltergeist in your machine doesn't need an internet connection to haunt you. If your router dies, the site blocker still functions perfectly.
* **Zero Vendor Lock-in:** The extension isn't reliant on a paid API that might change its pricing tier or shut down tomorrow. 

## ✨ Features

* **Multi-Site Tracking:** Configure independent timers for multiple websites (e.g., Reddit, YouTube) directly from the extension popup.
* **Context-Aware Hauntings:** The AI dynamically reads the title of your current page to generate a hyper-specific, sinister message about what you are procrastinating with.
* **CSP Bypass Architecture:** Utilizes Manifest V3 background service workers to safely route local API calls without triggering cross-site scripting security blocks.

## 🛠️ Prerequisites

* Google Chrome, Brave, or Edge (Chromium-based browser).
* [Ollama](https://ollama.com/) installed on your machine.

## 🚀 Installation & Setup

### 1. Prepare the Local AI

Open your terminal and download the open-weight Gemma model:

```bash
ollama run gemma:2b
```

(Once it downloads and opens a chat prompt, type /bye to exit).

### 2. Start Ollama with CORS Enabled

By default, Ollama blocks browser requests. You must start the server with CORS enabled so the extension can communicate with it.
Quit any background Ollama apps running in your system tray/menu bar, then run:

```bash
OLLAMA_ORIGINS="chrome-extension://*" ollama serve
```

(Leave this terminal window open in the background).

### 3. Install the Extension

1. Open Chrome and navigate to `chrome://extensions/`.
2. Toggle Developer mode ON (top right corner).
3. Click Load unpacked (top left).
4. Select the directory containing this project's `manifest.json` file.
5. Click the puzzle icon in your Chrome toolbar and pin the Ghost in the Machine extension.

### 🕰️ How to Use

1. Click the ghost icon in your toolbar.
2. Enter a website domain (e.g., `youtube.com`) and a time limit.
3. Click Add Site.
4. Browse to that site. Once the timer expires, the page will lock down, the background worker will fetch a custom generation from your local Gemma model, and the ghost will appear.
