window.LLMSettings = {
  getConfig: async function () {
    const extAPI = typeof browser !== "undefined" ? browser : chrome;
    return new Promise((resolve) => {
      extAPI.storage.local.get(
        {
          globalEnabled: true,
          disabledProviders: [],
          totalWaitTimeMs: 0,
        },
        resolve,
      );
    });
  },

  isProviderEnabled: async function (providerName) {
    const config = await this.getConfig();
    return (
      config.globalEnabled && !config.disabledProviders.includes(providerName)
    );
  },
};
