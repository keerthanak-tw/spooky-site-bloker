// Prevent multiple injections if the script runs twice
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

  // Stop the user from scrolling the underlying page
  document.body.style.overflow = "hidden";

  // 2. Play Audio (Ensure you place an eerie.mp3 in the audio folder)
  try {
    const audioUrl = chrome.runtime.getURL("audio/eerie.mp3");
    const audio = new Audio(audioUrl);
    audio.loop = true;
    audio.play().catch(err => console.log("Browser blocked autoplay, but the ghost is here."));
  } catch(e) {}

  // 3. Scrape context for Gemma
  const pageTitle = document.title || "this unknown dimension";
  
  // 4. Call Local Gemma
  fetchHauntingMessage(pageTitle);
}

async function fetchHauntingMessage(title) {
  // The system prompt that gives Gemma its personality
  const prompt = `Act as a sinister poltergeist haunting a computer. The user is procrastinating by looking at a web page titled "${title}". Write a short, creepy message (2 sentences maximum) telling them their time is up, the tab is dead, and they need to close it.`;

  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gemma:2b", // Update this if your local model tag is just "gemma"
        prompt: prompt,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error("Portal to Ollama is closed.");
    }

    const data = await response.json();
    
    // Update the overlay with Gemma's generated response
    document.querySelector(".spooky-loader").style.display = "none";
    document.getElementById("spooky-text").innerText = data.response;

  } catch (error) {
    document.querySelector(".spooky-loader").style.display = "none";
    document.getElementById("spooky-text").innerText = "The void is silent, but you must still leave this place. (Error connecting to local Gemma)";
    console.error("Local AI fetch failed:", error);
  }
}