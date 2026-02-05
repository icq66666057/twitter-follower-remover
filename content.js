console.log("[Remover] content.js loaded");

const sleep = ms => new Promise(r => setTimeout(r, ms));
const rand = (min, max) => Math.random() * (max - min) + min;

let isRunning = false;

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "START") {
    if (!isRunning) {
      isRunning = true;
      console.log("[Remover] Started");
      mainLoop();
    }
  }

  if (msg.action === "STOP") {
    isRunning = false;
    console.log("[Remover] Stopped");
  }
});

async function mainLoop() {
  while (isRunning) {
    const { users, running } = await chrome.storage.local.get(["users", "running"]);
    if (!running || !users?.length) {
      isRunning = false;
      return;
    }

    for (const username of users) {
      if (!isRunning) return;

      const { removedCount } = await chrome.storage.local.get("removedCount");
      if ((removedCount || 0) >= 40) {
        console.log("[Remover] Daily limit reached");
        isRunning = false;
        return;
      }

      console.log("[Remover] Looking for", username);

      // автоскролл
      window.scrollBy(0, 1200);
      await sleep(2000);

      const link = [...document.querySelectorAll(`a[href^='/${username}']`)][0];
      if (!link) {
        console.log("[Remover] Not found:", username);
        continue;
      }

      const card = link.closest("div[data-testid='cellInnerDiv']");
      if (!card) continue;

      try {
        // визуальный индикатор
        card.style.border = "2px solid red";

        const menuBtn = card.querySelector("button[aria-label='More']");
        if (!menuBtn) throw "Menu button not found";

        menuBtn.click();
        await sleep(1500);

        const removeBtn = [...document.querySelectorAll("span")]
          .find(s => s.textContent.trim() === "Remove this follower");

        if (!removeBtn) throw "Remove option missing";

        removeBtn.click();

        // ждём модалку подтверждения
        await sleep(1500);

        const confirmBtn = [...document.querySelectorAll("button span")]
          .find(s => s.textContent.trim() === "Remove")
          ?.closest("button");

        if (!confirmBtn) throw "Confirm Remove button not found";

        confirmBtn.click();
        console.log("[Remover] Confirmed removal");

        chrome.runtime.sendMessage({ action: "REMOVED" });

        // пауза между удалениями (безопасная)
        await sleep(rand(7000, 18000));

      } catch (e) {
        console.error("[Remover] ERROR:", e);
        chrome.runtime.sendMessage({ action: "ERROR" });
        isRunning = false;
        return;
      }
    }
  }
}
