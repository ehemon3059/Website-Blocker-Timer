document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const websiteUrlInput = document.getElementById('websiteUrl');
    const blockTypeRadios = document.getElementsByName('blockType');
    const timeLimitInput = document.getElementById('timeLimit');
    const blockPasswordInput = document.getElementById('blockPassword');
    const timeInputContainer = document.getElementById('timeInputContainer');
    const passwordInputContainer = document.getElementById('passwordInputContainer');
    const addWebsiteButton = document.getElementById('addWebsite');
    const websiteListContainer = document.getElementById('websiteList');
    
    // Password modal elements
    const passwordModal = document.getElementById('passwordModal');
    const verifyPasswordInput = document.getElementById('verifyPassword');
    const confirmPasswordButton = document.getElementById('confirmPassword');
    const cancelPasswordButton = document.getElementById('cancelPassword');
    
    // Variables for password verification
    let currentWebsiteIndex = -1;
    let currentWebsites = [];
    
    // Show/hide input containers based on radio selection
    for (const radio of blockTypeRadios) {
      radio.addEventListener('change', function() {
        if (this.value === 'timeLimit') {
          timeInputContainer.style.display = 'block';
          passwordInputContainer.style.display = 'none';
        } else {
          // If 'block' is selected
          timeInputContainer.style.display = 'none';
          passwordInputContainer.style.display = 'block';
        }
      });
    }
    
    // Initial setup - show password input for block option
    passwordInputContainer.style.display = 'block';
    
    // Load existing websites from storage
    loadWebsites();
    
    // Add website button click handler
    addWebsiteButton.addEventListener('click', function() {
      const url = normalizeUrl(websiteUrlInput.value);
      if (!url) {
        alert('Please enter a valid URL');
        return;
      }
      
      const blockType = document.querySelector('input[name="blockType"]:checked').value;
      let timeLimit = null;
      let password = null;
      
      if (blockType === 'timeLimit') {
        timeLimit = parseInt(timeLimitInput.value);
        if (isNaN(timeLimit) || timeLimit <= 0) {
          alert('Please enter a valid time limit');
          return;
        }
      } else if (blockType === 'block') {
        password = blockPasswordInput.value;
        if (!password || password.length < 4) {
          alert('Please enter a password with at least 4 characters');
          return;
        }
      }
      
      chrome.storage.local.get('websites', function(data) {
        const websites = data.websites || [];
        
        // Check if website already exists
        const existingIndex = websites.findIndex(site => site.url === url);
        if (existingIndex !== -1) {
          if (confirm('This website is already in your list. Do you want to update it?')) {
            websites[existingIndex] = {
              url: url,
              blockType: blockType,
              timeLimit: blockType === 'timeLimit' ? timeLimit : null,
              password: blockType === 'block' ? password : null,
              timeSpent: 0,
              lastVisited: null
            };
          } else {
            return;
          }
        } else {
          // Add new website
          websites.push({
            url: url,
            blockType: blockType,
            timeLimit: blockType === 'timeLimit' ? timeLimit : null,
            password: blockType === 'block' ? password : null,
            timeSpent: 0,
            lastVisited: null
          });
        }
        
        // Save to storage
        chrome.storage.local.set({websites: websites}, function() {
          // Clear inputs
          websiteUrlInput.value = '';
          blockPasswordInput.value = '';
          timeLimitInput.value = '30';
          
          // Reload websites list
          loadWebsites();
        });
      });
    });
    
    // Function to load and display websites
    function loadWebsites() {
      chrome.storage.local.get('websites', function(data) {
        const websites = data.websites || [];
        currentWebsites = websites; // Save for password verification
        websiteListContainer.innerHTML = '';
        
        if (websites.length === 0) {
          websiteListContainer.innerHTML = '<p>No websites added yet.</p>';
          return;
        }
        
        websites.forEach(function(website, index) {
          const websiteItem = document.createElement('div');
          websiteItem.className = 'website-item';
          
          const urlElement = document.createElement('div');
          urlElement.className = 'website-url';
          urlElement.textContent = website.url;
          websiteItem.appendChild(urlElement);
          
          const typeElement = document.createElement('div');
          typeElement.className = 'website-type';
          if (website.blockType === 'block') {
            typeElement.textContent = 'Blocked (Password Protected)';
          } else {
            typeElement.textContent = `Time Limit: ${website.timeLimit} minutes`;
            
            const timeElement = document.createElement('div');
            timeElement.className = 'time-remaining';
            if (website.timeSpent) {
              const remaining = Math.max(0, website.timeLimit * 60 - website.timeSpent);
              const minutes = Math.floor(remaining / 60);
              const seconds = remaining % 60;
              timeElement.textContent = `Remaining: ${minutes}m ${seconds}s`;
            } else {
              timeElement.textContent = 'Not visited yet';
            }
            websiteItem.appendChild(timeElement);
          }
          websiteItem.appendChild(typeElement);
          
          const deleteButton = document.createElement('button');
          deleteButton.className = 'delete-btn';
          deleteButton.textContent = '×';
          deleteButton.dataset.index = index;
          deleteButton.addEventListener('click', function() {
            const websiteIndex = parseInt(this.dataset.index);
            const website = websites[websiteIndex];
            
            if (website.blockType === 'block' && website.password) {
              // Show password modal for blocked websites
              showPasswordModal(websiteIndex);
            } else {
              // Regular confirmation for time-limited websites
              if (confirm('Are you sure you want to delete this website?')) {
                websites.splice(websiteIndex, 1);
                chrome.storage.local.set({websites: websites}, loadWebsites);
              }
            }
          });
          websiteItem.appendChild(deleteButton);
          
          websiteListContainer.appendChild(websiteItem);
        });
      });
    }
    
    // Function to show password modal
    function showPasswordModal(websiteIndex) {
      currentWebsiteIndex = websiteIndex;
      verifyPasswordInput.value = '';
      passwordModal.style.display = 'flex';
      verifyPasswordInput.focus();
    }
    
    // Password verification
    confirmPasswordButton.addEventListener('click', function() {
      const enteredPassword = verifyPasswordInput.value;
      const correctPassword = currentWebsites[currentWebsiteIndex].password;
      
      if (enteredPassword === correctPassword) {
        // Password correct, remove website
        currentWebsites.splice(currentWebsiteIndex, 1);
        chrome.storage.local.set({websites: currentWebsites}, function() {
          passwordModal.style.display = 'none';
          loadWebsites();
        });
      } else {
        alert('Incorrect password');
        verifyPasswordInput.value = '';
        verifyPasswordInput.focus();
      }
    });
    
    // Cancel password verification
    cancelPasswordButton.addEventListener('click', function() {
      passwordModal.style.display = 'none';
    });
    
    // Close modal if clicked outside
    window.addEventListener('click', function(event) {
      if (event.target === passwordModal) {
        passwordModal.style.display = 'none';
      }
    });
    
    // Normalize URL (add https:// if missing and extract hostname)
    function normalizeUrl(url) {
      if (!url) return '';
      
      // Add http:// if protocol is missing
      if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
      }
      
      try {
        const urlObj = new URL(url);
        return urlObj.hostname;
      } catch (e) {
        return '';
      }
    }
  });