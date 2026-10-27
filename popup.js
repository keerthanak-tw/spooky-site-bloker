document.addEventListener('DOMContentLoaded', loadSites);

document.getElementById('saveBtn').addEventListener('click', () => {
  const site = document.getElementById('site').value.trim().toLowerCase();
  const timeValue = parseFloat(document.getElementById('timeValue').value);
  const timeUnit = document.getElementById('timeUnit').value;

  if (site && timeValue > 0) {
    let blockMinutes = timeValue;
    if (timeUnit === 'hours') {
      blockMinutes = timeValue * 60;
    }

    chrome.storage.local.get(['blockList'], (result) => {
      const list = result.blockList || [];
      
      // Prevent duplicates
      if (!list.some(item => item.site === site)) {
        list.push({ site, minutes: blockMinutes });
        chrome.storage.local.set({ blockList: list }, () => {
          document.getElementById('site').value = '';
          document.getElementById('status').textContent = 'Added!';
          setTimeout(() => document.getElementById('status').textContent = '', 2000);
          
          loadSites();
          // Tell background script to start tracking this new site
          chrome.runtime.sendMessage({ action: "updateTimers" });
        });
      } else {
        document.getElementById('status').textContent = 'Site already exists!';
        document.getElementById('status').style.color = 'red';
        setTimeout(() => {
          document.getElementById('status').textContent = '';
          document.getElementById('status').style.color = 'green';
        }, 2000);
      }
    });
  }
});

// Render the list of sites
function loadSites() {
  chrome.storage.local.get(['blockList'], (result) => {
    const list = result.blockList || [];
    const ul = document.getElementById('activeSites');
    ul.innerHTML = '';

    list.forEach((item, index) => {
      const li = document.createElement('li');
      li.className = 'site-item';
      
      const textSpan = document.createElement('span');
      textSpan.textContent = `${item.site} (${item.minutes}m)`;
      
      const btn = document.createElement('button');
      btn.textContent = 'X';
      btn.className = 'remove-btn';
      btn.onclick = () => removeSite(index);
      
      li.appendChild(textSpan);
      li.appendChild(btn);
      ul.appendChild(li);
    });
  });
}

// Remove a site and cancel its timer
function removeSite(index) {
  chrome.storage.local.get(['blockList'], (result) => {
    const list = result.blockList || [];
    list.splice(index, 1);
    chrome.storage.local.set({ blockList: list }, () => {
      loadSites();
      // Tell background script to clean up the deleted timer
      chrome.runtime.sendMessage({ action: "updateTimers" });
    });
  });
}