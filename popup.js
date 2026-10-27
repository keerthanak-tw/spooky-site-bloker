document.getElementById('saveBtn').addEventListener('click', () => {
  const site = document.getElementById('site').value.trim();
  const timeValue = parseFloat(document.getElementById('timeValue').value);
  const timeUnit = document.getElementById('timeUnit').value;

  if (site && timeValue > 0) {
    // Convert hours to minutes if necessary
    let blockMinutes = timeValue;
    if (timeUnit === 'hours') {
      blockMinutes = timeValue * 60;
    }

    // Save to Chrome's local storage
    chrome.storage.local.set({ blockSite: site, blockMinutes: blockMinutes, displayUnit: timeUnit, displayValue: timeValue }, () => {
      document.getElementById('status').textContent = 'Timer saved!';
      
      // Notify the background script to start the alarm
      chrome.runtime.sendMessage({ action: "startTimer", minutes: blockMinutes });
      
      setTimeout(() => {
        document.getElementById('status').textContent = '';
      }, 2000);
    });
  } else {
    document.getElementById('status').textContent = 'Please enter valid inputs.';
    document.getElementById('status').style.color = 'red';
  }
});

// Load existing settings when popup opens
chrome.storage.local.get(['blockSite', 'displayValue', 'displayUnit'], (result) => {
  if (result.blockSite) document.getElementById('site').value = result.blockSite;
  if (result.displayValue) document.getElementById('timeValue').value = result.displayValue;
  if (result.displayUnit) document.getElementById('timeUnit').value = result.displayUnit;
});