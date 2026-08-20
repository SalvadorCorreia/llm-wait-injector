window.ClaudeProvider = {
  name: "Claude",
  urlMatch: /claude\.ai/,

  isGenerating: () => {
    return document.querySelector('[data-testid="chat-input-stop"]') !== null;
  },

  getContainer: () => {
    return document.body;
  },

  getThemeColors: () => {
    const styles = window.getComputedStyle(document.body);
    return {
      background: styles.getPropertyValue("--cds-page-bg").trim() || "#151515",
      text: styles.getPropertyValue("--cds-fill-brand").trim() || "#c6613f",
    };
  },
};

if (window.LLMRegistry) {
  window.LLMRegistry.register(window.ClaudeProvider);
}
