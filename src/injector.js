(function initInjector() {
  const extAPI = typeof browser !== "undefined" ? browser : chrome;
  let isCurrentlyInjecting = false;
  let payloadContainer = null;
  let currentProvider = null;
  let currentUrl = "";
  let isEnabledForProvider = true;

  async function handleUrlChange() {
    if (window.location.href === currentUrl && currentProvider) return;
    currentUrl = window.location.href;

    if (isCurrentlyInjecting) unmountPayload();

    currentProvider = null;

    const provider = window.LLMRegistry.getActiveProvider();
    if (!provider) return;

    isEnabledForProvider = window.LLMSettings
      ? await window.LLMSettings.isProviderEnabled(provider.name)
      : true;

    currentProvider = provider;
    checkGeneratingState();
  }

  function checkGeneratingState() {
    if (!currentProvider || !isEnabledForProvider) {
      if (isCurrentlyInjecting) unmountPayload();
      return;
    }

    try {
      const isGenerating = currentProvider.isGenerating();

      if (isGenerating && !isCurrentlyInjecting) {
        mountPayload();
      } else if (!isGenerating && isCurrentlyInjecting) {
        unmountPayload();
      }
    } catch (e) {
      console.error("State check error:", e);
      if (isCurrentlyInjecting) unmountPayload();
    }
  }

  function mountPayload() {
    if (isCurrentlyInjecting) {
      unmountPayload();
    }

    const zombieContainer = document.getElementById("llm-wait-injector-root");
    if (zombieContainer) {
      zombieContainer.remove();
    }

    isCurrentlyInjecting = true;

    try {
      extAPI.runtime.sendMessage({ type: "START_WAIT" }, () => {
        let _ = extAPI.runtime.lastError;
      });
    } catch (e) {}

    try {
      const targetElement = currentProvider.getContainer();
      if (!targetElement) {
        isCurrentlyInjecting = false;
        return;
      }

      const theme = currentProvider.getThemeColors
        ? currentProvider.getThemeColors()
        : { background: "#fff", text: "#000" };

      payloadContainer = document.createElement("div");
      payloadContainer.id = "llm-wait-injector-root";
      targetElement.appendChild(payloadContainer);

      if (window.LLMPayload && typeof window.LLMPayload.mount === "function") {
        window.LLMPayload.mount(payloadContainer, theme);
      }
    } catch (e) {
      console.error("Mount error:", e);
      isCurrentlyInjecting = false;
      if (payloadContainer) {
        payloadContainer.remove();
        payloadContainer = null;
      }
    }
  }

  function unmountPayload() {
    isCurrentlyInjecting = false;

    try {
      extAPI.runtime.sendMessage({ type: "STOP_WAIT" }, () => {
        let _ = extAPI.runtime.lastError;
      });
    } catch (e) {}

    if (window.LLMPayload && typeof window.LLMPayload.unmount === "function") {
      try {
        window.LLMPayload.unmount();
      } catch (e) {
        console.error("Payload unmount error:", e);
      }
    }

    if (payloadContainer) {
      try {
        payloadContainer.remove();
      } catch (e) {}
      payloadContainer = null;
    }
  }

  extAPI.storage.onChanged.addListener(async (changes, areaName) => {
    if (areaName === "local" && currentProvider) {
      isEnabledForProvider = window.LLMSettings
        ? await window.LLMSettings.isProviderEnabled(currentProvider.name)
        : true;

      checkGeneratingState();
    }
  });

  const originalPushState = history.pushState;
  history.pushState = function () {
    originalPushState.apply(this, arguments);
    handleUrlChange();
  };

  const originalReplaceState = history.replaceState;
  history.replaceState = function () {
    originalReplaceState.apply(this, arguments);
    handleUrlChange();
  };

  window.addEventListener("popstate", handleUrlChange);

  handleUrlChange();

  const observer = new MutationObserver(() => {
    checkGeneratingState();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      checkGeneratingState();
    }
  });

  window.addEventListener("focus", () => {
    checkGeneratingState();
  });

  setInterval(() => {
    if (window.location.href !== currentUrl) {
      handleUrlChange();
    } else {
      checkGeneratingState();
    }
  }, 2000);
})();
