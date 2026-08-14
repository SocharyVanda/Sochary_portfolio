import { initFloatingLines } from "./floating-lines.js";

function start() {
  const el = document.getElementById("linesBg");
  if (!el) return;

  const small = window.matchMedia("(max-width: 640px)").matches;

  try {
    initFloatingLines(el, {
      enabledWaves: ["top", "middle", "bottom"],
      lineCount: small ? [4, 6, 8] : [8, 12, 16],
      lineDistance: [10, 7, 5],
      linesGradient: ["#8b5cf6", "#c084fc", "#f0abfc", "#38bdf8"],
      bendRadius: 4.5,
      bendStrength: -0.6,
      mouseDamping: 0.06,
      animationSpeed: 0.8,
      interactive: !small,
      parallax: !small,
      parallaxStrength: 0.12
    });
  } catch (err) {
    // WebGL unavailable — the CSS gradient wallpaper still shows underneath.
    console.warn("FloatingLines background disabled:", err);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start);
} else {
  start();
}
