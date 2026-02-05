chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "START" || msg.action === "STOP") {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, msg);
      }
    });
  }

  if (msg.action === "ERROR") {
    chrome.storage.local.set({ running: false });
    alert("Stopped due to error");
  }

  if (msg.action === "REMOVED") {
    chrome.storage.local.get("removedCount", data => {
      const count = (data.removedCount || 0) + 1;
      chrome.storage.local.set({ removedCount: count });

      if (count >= 40) {
        chrome.storage.local.set({ running: false });
        alert("Daily limit reached (40)");
      }
    });
  }
});
