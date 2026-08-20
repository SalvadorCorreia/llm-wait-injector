(function initInjector() {
  const provider = window.LLMRegistry.getActiveProvider();
  if (!provider) return;

  let isCurrentlyInjecting = false;
  let payloadContainer = null;

  function checkState() {
    const isGenerating = provider.isGenerating();

    if (isGenerating && !isCurrentlyInjecting) {
      isCurrentlyInjecting = true;

      const targetElement = provider.getContainer();
      const theme = provider.getThemeColors
        ? provider.getThemeColors()
        : { background: "#fff", text: "#000" };

      payloadContainer = document.createElement("div");
      payloadContainer.id = "llm-wait-injector-root";
      targetElement.appendChild(payloadContainer);

      if (window.LLMPayload) {
        window.LLMPayload.mount(payloadContainer, theme);
      }
    } else if (!isGenerating && isCurrentlyInjecting) {
      isCurrentlyInjecting = false;

      if (window.LLMPayload) {
        window.LLMPayload.unmount();
      }

      if (payloadContainer) {
        payloadContainer.remove();
        payloadContainer = null;
      }
    }
  }

  // Check state every 500ms
  setInterval(checkState, 500);
})();
