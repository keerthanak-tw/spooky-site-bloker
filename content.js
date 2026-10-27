// Prevent multiple injections
if (!document.getElementById("spooky-overlay-container")) {
  
  // 1. Construct the DOM elements
  const overlay = document.createElement("div");
  overlay.id = "spooky-overlay-container";
  
  const textElement = document.createElement("div");
  textElement.className = "spooky-text";
  textElement.id = "spooky-text";
  
  const loader = document.createElement("div");
  loader.className = "spooky-loader";
  loader.innerText = "Channeling the spirit in the machine...";
  
  overlay.appendChild(textElement);
  overlay.appendChild(loader);
  document.body.appendChild(overlay);
  document.body.style.overflow = "hidden";

  // 2. Play Audio (quietly fails if no file)
  try {
    const audioUrl = chrome.runtime.getURL("audio/eerie.mp3");
    const audio = new Audio(audioUrl);
    audio.loop = true;
    audio.play().catch(e => {});
  } catch(e) {}

  // 3. Scrape context for Gemma
  const pageTitle = document.title || "this unknown dimension";
  
  // 4. Ask the background script to talk to Gemma
  chrome.runtime.sendMessage(
    { action: "fetchGemma", title: pageTitle },
    (response) => {
      document.querySelector(".spooky-loader").style.display = "none";
      if (response.error) {
        document.getElementById("spooky-text").innerText = "The void is silent... (Error: " + response.error + ")";
      } else {
        document.getElementById("spooky-text").innerText = response.message;
      }
    }
  );
}