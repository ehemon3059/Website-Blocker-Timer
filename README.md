
 🌐 Website Blocker & Timer Chrome Extension

A simple and powerful Chrome browser extension that helps you **stay focused** by **blocking distracting websites** or **limiting usage time** with a customizable timer.


## ✨ Features

✅ Block any website with password protection  
✅ Set daily time limits for specific websites  
✅ Auto-reset timers at midnight  
✅ Works automatically in the background  
✅ Simple and lightweight design  

---

## 🧩 Installation Guide

Follow these steps to install the extension manually in Chrome:

1. **Download or Clone the Repository**
   ```bash
   git clone https://github.com/your-username/website-blocker-timer.git
````

or download the ZIP file and extract it.

2. **Open Chrome Extensions Page**

   * Navigate to: `chrome://extensions/`

3. **Enable Developer Mode**

   * Turn **ON** the switch in the top-right corner labeled **Developer mode**.

4. **Load the Extension**

   * Click **Load unpacked**
   * Select the folder containing your extension files (the one with `manifest.json`).

5. **Verify Installation**

   * The extension icon should appear in your Chrome toolbar.
   * Click it to open the control panel.

---

## 🔒 How to Block a Website

1. Click on the **extension icon** in the Chrome toolbar.
2. In the “Block Website” section:

   * Enter the domain name (example: `facebook.com`).
   * Select **Block Type:** `Block`.
3. (Optional) Enter a password to protect the block settings.
4. Click **Save** or **Add Website**.

📌 When you visit that site, you’ll see a **Blocked Page** (`blocked.html`) instead of the actual website.

---

## ⏰ How to Set a Website Timer

1. Open the **extension panel**.
2. Go to the “Set Timer” section.
3. Enter the website (example: `youtube.com`).
4. Select **Block Type:** `Time Limit`.
5. Set a time limit (in minutes).
6. Click **Save**.

When your time is up, the extension automatically redirects you to a **“Time Expired” page** (`time-expired.html`).

💡 Time resets automatically every midnight.

---

## 📋 Example Settings

| Website      | Block Type | Time Limit | Result                                                              |
| ------------ | ---------- | ---------- | ------------------------------------------------------------------- |
| facebook.com | Block      | —          | Instantly blocked and shows the “Blocked” page.                     |
| youtube.com  | Time Limit | 30 minutes | Allowed for 30 minutes per day, then shows the “Time Expired” page. |

---

## 🧰 Troubleshooting

| Problem               | Cause                   | Solution                                   |
| --------------------- | ----------------------- | ------------------------------------------ |
| Extension not working | Developer Mode is off   | Re-enable Developer Mode                   |
| Website still opens   | Incorrect domain format | Use only the domain (e.g., `facebook.com`) |
| Timer not resetting   | Chrome not restarted    | Restart Chrome; the timer resets daily     |

---

## 👨‍💻 Developer Information

**Email:** [eh.emon3059@gmail.com](mailto:eh.emon3059@gmail.com)

---

## ⚖️ License

**Copyright © 2025 EH Emon. All Rights Reserved.**

This project and all related files are the **intellectual property of EH Emon**.
Unauthorized copying, modification, redistribution, or resale of this extension is strictly prohibited.

You are free to:

* Use the extension for **personal, non-commercial purposes**.

To:

* Modify, redistribute, or use commercially — please contact the owner at
  📧 [eh.emon3059@gmail.com](mailto:eh.emon3059@gmail.com).

## 💬 Support

If you face any issues or want to request features, please open a **GitHub Issue**
or contact **EH Emon** directly via email:
📩 [eh.emon3059@gmail.com](mailto:eh.emon3059@gmail.com)


