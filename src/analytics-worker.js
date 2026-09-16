const extAPI = typeof browser !== "undefined" ? browser : chrome;
let activeWaits = {};

extAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!sender.tab) return;
  const tabId = sender.tab.id;

  if (message.type === "START_WAIT") {
    activeWaits[tabId] = Date.now();
  } else if (message.type === "STOP_WAIT") {
    const startTime = activeWaits[tabId];
    if (startTime) {
      const duration = Date.now() - startTime;
      delete activeWaits[tabId];

      extAPI.storage.local.get(["totalWaitTimeMs"], (result) => {
        const currentTotal = result.totalWaitTimeMs || 0;
        extAPI.storage.local.set({ totalWaitTimeMs: currentTotal + duration });
      });
    }
  }
});

extAPI.tabs.onRemoved.addListener((tabId) => {
  delete activeWaits[tabId];
});
