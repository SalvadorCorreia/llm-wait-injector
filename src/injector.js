(function initInjector() {
  const extAPI = typeof browser !== "undefined" ? browser : chrome;
  let isCurrentlyInjecting = false;
  let payloadContainer = null;
  let currentProvider = null;
  let currentUrl = "";
  let isEnabledForProvider = true;

  async function handleUrlChange() {
    if (window.location.href === currentUrl) return;
    currentUrl = window.location.href;

    if (isCurrentlyInjecting) unmountPayload();

    // Suspend DOM checks while loading new state
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
    if (!currentProvider || !isEnabledForProvider) return;

    const isGenerating = currentProvider.isGenerating();

    if (isGenerating && !isCurrentlyInjecting) {
      mountPayload();
    } else if (!isGenerating && isCurrentlyInjecting) {
      unmountPayload();
    }
  }

  function mountPayload() {
    isCurrentlyInjecting = true;
    extAPI.runtime.sendMessage({ type: "START_WAIT" });

    const targetElement = currentProvider.getContainer();
    const theme = currentProvider.getThemeColors
      ? currentProvider.getThemeColors()
      : { background: "#fff", text: "#000" };

    payloadContainer = document.createElement("div");
    payloadContainer.id = "llm-wait-injector-root";
    targetElement.appendChild(payloadContainer);

    if (window.LLMPayload) {
      window.LLMPayload.mount(payloadContainer, theme);
    }
  }

  function unmountPayload() {
    isCurrentlyInjecting = false;
    extAPI.runtime.sendMessage({ type: "STOP_WAIT" });

    if (window.LLMPayload) {
      window.LLMPayload.unmount();
    }

    if (payloadContainer) {
      payloadContainer.remove();
      payloadContainer = null;
    }
  }

  // Handle SPA Navigation natively
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

  // Initialize first load
  handleUrlChange();

  // DOM Observer runs only the lightweight state check
  const observer = new MutationObserver(() => {
    checkGeneratingState();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
  });
})();
