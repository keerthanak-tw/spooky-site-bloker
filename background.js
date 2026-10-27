// Helper to get clean domains for the tracking report (e.g., turns "https://www.youtube.com/watch..." into "www.youtube.com")
function getDomain(url) {
  try { return new URL(url).hostname; } catch (e) { return null; }
}

// 1. Listen for Tab Updates (Track Visits & Enforce Multiple Blocks)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome://')) {
    
    // --- A. Record the Visit for the Report ---
    const domain = getDomain(tab.url);
    if (domain) {
      chrome.storage.local.get(['siteReport'], (result) => {
        const report = result.siteReport || {};
        if (!report[domain]) report[domain] = { visits: 0 };
        report[domain].visits += 1;
        chrome.storage.local.set({ siteReport: report });
      });
    }

    // --- B. Check against Multiple Blocked Sites ---
    chrome.storage.local.get(['blockList', 'hauntedSites'], (result) => {
      const blockList = result.blockList || [];
      const hauntedSites = result.hauntedSites || {};

      for (let item of blockList) {
        if (tab.url.includes(item.site)) {
          // If already haunted, block immediately
          if (hauntedSites[item.site]) {
            injectHaunting(tabId);
          } else {
            // If not haunted, ensure a specific timer is running for this site
            const alarmName = "ghost_" + item.site;
            chrome.alarms.get(alarmName, (alarm) => {
              if (!alarm) {
                chrome.alarms.create(alarmName, { delayInMinutes: item.minutes });
                console.log(`Started timer for ${item.site}`);
              }
            });
          }
          break; // Match found, stop checking
        }
      }
    });
  }
});

// 2. Listen for Alarms (When ANY site's time is up)
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name.startsWith("ghost_")) {
    const site = alarm.name.replace("ghost_", "");
    
    // Mark this specific site as haunted
    chrome.storage.local.get(['hauntedSites'], (result) => {
      const hauntedSites = result.hauntedSites || {};
      hauntedSites[site] = true;
      chrome.storage.local.set({ hauntedSites: hauntedSites }, () => {
        
        // Find all open tabs for this specific site and haunt them
        chrome.tabs.query({}, (tabs) => {
          for (let tab of tabs) {
            if (tab.url && tab.url.includes(site)) {
              injectHaunting(tab.id);
            }
          }
        });
      });
    });
  }
});

// 3. Listen for Messages (Gemma Fetching & Timer Cleanup)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  
  // Cleanup deleted timers when dashboard updates
  if (request.action === "updateTimers") {
    chrome.storage.local.get(['blockList'], (result) => {
      const list = result.blockList || [];
      chrome.alarms.getAll((alarms) => {
        alarms.forEach(alarm => {
          if (alarm.name.startsWith("ghost_")) {
            const site = alarm.name.replace("ghost_", "");
            // If alarm exists but site was deleted from list, kill the alarm
            if (!list.some(item => item.site === site)) {
              chrome.alarms.clear(alarm.name);
            }
          }
        });
      });
    });
  }

  // Fetch Gemma (Bypassing CSP)
  if (request.action === "fetchGemma") {
    const prompt = `Act as a sinister poltergeist haunting a computer. The user is procrastinating by looking at a web page titled "${request.title}". Write a short, creepy message (2 sentences maximum) telling them their time is up, the tab is dead, and they need to close it.`;

    fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gemma:2b", prompt: prompt, stream: false })
    })
    .then(res => {
      if (!res.ok) throw new Error("Ollama connection failed.");
      return res.json();
    })
    .then(data => sendResponse({ message: data.response }))
    .catch(err => sendResponse({ error: err.toString() }));
    return true; 
  }
});

// Helper: Inject CSS and JS
function injectHaunting(tabId) {
  chrome.scripting.insertCSS({ target: { tabId: tabId }, files: ["content.css"] }).catch(e => console.error(e));
  chrome.scripting.executeScript({ target: { tabId: tabId }, files: ["content.js"] }).catch(e => console.error(e));
}