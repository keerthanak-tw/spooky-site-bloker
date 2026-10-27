// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startTimer") {
    // Clear any existing alarm
    chrome.alarms.clear("spookyTimer");
    
    // Reset the haunted state
    chrome.storage.local.set({ isHaunted: false }, () => {
      // Create a new alarm
      chrome.alarms.create("spookyTimer", { delayInMinutes: request.minutes });
      console.log(`Timer set for ${request.minutes} minutes.`);
    });
  }
});

// Listen for the alarm to go off
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "spookyTimer") {
    chrome.storage.local.get(['blockSite'], (result) => {
      if (result.blockSite) {
        // Flag the site as actively haunted
        chrome.storage.local.set({ isHaunted: true });
        
        // Find all currently open tabs
        chrome.tabs.query({}, (tabs) => {
          for (let tab of tabs) {
            // If the tab matches the target site, haunt it immediately
            if (tab.url && tab.url.includes(result.blockSite)) {
              injectHaunting(tab.id);
            }
          }
        });
      }
    });
  }
});

// Listen for tab updates (if you try to open the site AFTER the timer went off)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    chrome.storage.local.get(['blockSite', 'isHaunted'], (result) => {
      if (result.isHaunted && result.blockSite && tab.url.includes(result.blockSite)) {
        injectHaunting(tabId);
      }
    });
  }
});

// Helper function to inject the CSS and JS into the target page
function injectHaunting(tabId) {
  chrome.scripting.insertCSS({
    target: { tabId: tabId },
    files: ["content.css"]
  });
  
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    files: ["content.js"]
  });
}