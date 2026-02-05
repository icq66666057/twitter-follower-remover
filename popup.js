document.getElementById("start").onclick = async () => {
  const users = document
    .getElementById("users")
    .value
    .split("\n")
    .map(u => u.trim().replace("@", ""))
    .filter(Boolean);

  await chrome.storage.local.set({
    users,
    removedCount: 0,
    running: true
  });

  chrome.runtime.sendMessage({ action: "START" });
};

document.getElementById("stop").onclick = async () => {
  await chrome.storage.local.set({ running: false });
  chrome.runtime.sendMessage({ action: "STOP" });
};
