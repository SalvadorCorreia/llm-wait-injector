window.DeepSeekProvider = {
  name: "DeepSeek",
  urlMatch: /chat\.deepseek\.com/,

  isGenerating: () => {
    return (
      document.querySelector('div[role="button"] svg path[d^="M2 4.88C2"]') !==
      null
    );
  },

  getContainer: () => {
    return document.body;
  },

  getThemeColors: () => {
    const bodyStyles = window.getComputedStyle(document.body);
    return {
      background: bodyStyles.backgroundColor || "rgb(21, 21, 23)",
      text: bodyStyles.color || "rgb(128, 0, 128)",
    };
  },
};

if (window.LLMRegistry) {
  window.LLMRegistry.register(window.DeepSeekProvider);
}
