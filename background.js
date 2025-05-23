// Track active tabs and their time
let activeTabs = {};
let intervalId = null;

// Start tracking time when extension is loaded
chrome.runtime.onStartup.addListener(startTimeTracking);
chrome.runtime.onInstalled.addListener(startTimeTracking);

// Function to start time tracking
function startTimeTracking() {
  if (intervalId) {
    clearInterval(intervalId);
  }
  
  // Check and update time every second
  intervalId = setInterval(updateBrowsingTime, 1000);
}

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    checkWebsite(tabId, tab.url);
  }
});

// Listen for tab activation
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab.url) {
      checkWebsite(tab.id, tab.url);
    }
  });
});

// Check if a website should be blocked or time-limited
function checkWebsite(tabId, tabUrl) {
  try {
    const hostname = new URL(tabUrl).hostname;
    
    // Skip checking internal extension pages
    if (tabUrl.startsWith('chrome-extension://')) {
      return;
    }
    
    chrome.storage.local.get('websites', (data) => {
      const websites = data.websites || [];
      
      // Find matching website in our list
      const website = websites.find(site => hostname.includes(site.url));
      
      if (website) {
        if (website.blockType === 'block') {
          // Block the website and pass the URL as a parameter
          chrome.tabs.update(tabId, { url: `blocked.html?url=${website.url}` });
        } else if (website.blockType === 'timeLimit') {
          // Track time for this website
          activeTabs[tabId] = {
            url: website.url,
            startTime: Date.now()
          };
          
          // Check if time limit is already exceeded
          if (website.timeSpent && website.timeSpent >= website.timeLimit * 60) {
            chrome.tabs.update(tabId, { url: 'time-expired.html' });
          }
        }
      } else {
        // Not in our list, remove from active tabs
        if (activeTabs[tabId]) {
          delete activeTabs[tabId];
        }
      }
    });
  } catch (e) {
    // Invalid URL, ignore
  }
}

// Update browsing time for active tabs
function updateBrowsingTime() {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (tabs.length === 0) return;
    
    const activeTabId = tabs[0].id;
    const activeTab = activeTabs[activeTabId];
    
    if (!activeTab) return;
    
    // Get current website list
    chrome.storage.local.get('websites', (data) => {
      const websites = data.websites || [];
      const websiteIndex = websites.findIndex(site => site.url === activeTab.url);
      
      if (websiteIndex !== -1 && websites[websiteIndex].blockType === 'timeLimit') {
        // Update time spent
        const timeElapsed = Math.floor((Date.now() - activeTab.startTime) / 1000);
        activeTab.startTime = Date.now(); // Reset start time
        
        websites[websiteIndex].timeSpent = (websites[websiteIndex].timeSpent || 0) + timeElapsed;
        websites[websiteIndex].lastVisited = Date.now();
        
        // Save updated time
        chrome.storage.local.set({websites: websites}, () => {
          // Check if time limit exceeded
          if (websites[websiteIndex].timeSpent >= websites[websiteIndex].timeLimit * 60) {
            chrome.tabs.update(activeTabId, { url: 'time-expired.html' });
            delete activeTabs[activeTabId];
          }
        });
      }
    });
  });
}

// Listen for tab removal
chrome.tabs.onRemoved.addListener((tabId) => {
  if (activeTabs[tabId]) {
    delete activeTabs[tabId];
  }
});

// Reset time spent at midnight
chrome.alarms.create('resetTimeSpent', {
  periodInMinutes: 60 * 24 // Check daily
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'resetTimeSpent') {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() < 60) {
      // Reset all time tracking at midnight
      chrome.storage.local.get('websites', (data) => {
        const websites = data.websites || [];
        websites.forEach(site => {
          if (site.blockType === 'timeLimit') {
            site.timeSpent = 0;
          }
        });
        chrome.storage.local.set({websites: websites});
      });
    }
  }
});