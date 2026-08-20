window.LLMPayload = {
  container: null,
  animationInterval: null,

  // Dynamic ASCII frames for the "processing" animation
  asciiFrames: [
    "  [ - ] thinking... ",
    "  [ \\ ] thinking... ",
    "  [ | ] thinking... ",
    "  [ / ] thinking... ",
  ],
  frameIndex: 0,

  mount: function (targetElement, theme) {
    this.container = targetElement;

    const wrapper = document.createElement("div");
    wrapper.className = "llm-ascii-widget";

    // 1. Signature Color: Apply extracted text color to the whole widget (text and border)
    wrapper.style.color = theme.text;
    wrapper.style.borderColor = theme.text; // Uses text color as border accent

    // 2. Background Color: Apply extracted background, perhaps slightly opaque for depth
    // If the extracted background is hex, we can leave it, or make it slightly translucent if desired.
    // Let's use the solid background for strong thematic mapping as requested.
    wrapper.style.backgroundColor = theme.background;

    // Create the ASCII display element
    this.asciiDisplay = document.createElement("pre");
    this.asciiDisplay.className = "ascii-art";
    this.asciiDisplay.innerText = this.asciiFrames[0];

    wrapper.appendChild(this.asciiDisplay);
    this.container.appendChild(wrapper);

    // Start the animation loop
    this.startAnimation();
  },

  startAnimation: function () {
    if (this.animationInterval) return; // Prevent duplicates

    this.animationInterval = setInterval(() => {
      this.frameIndex = (this.frameIndex + 1) % this.asciiFrames.length;
      if (this.asciiDisplay) {
        this.asciiDisplay.innerText = this.asciiFrames[this.frameIndex];
      }
    }, 250); // Update every 250ms
  },

  unmount: function () {
    // 1. Clean up resources immediately
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
      this.animationInterval = null;
    }

    // 2. Disconnect reference
    this.container = null;
    this.asciiDisplay = null;
  },
};
