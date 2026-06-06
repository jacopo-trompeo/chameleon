const CONFETTI_DURATION_MS = 1800;
const CONFETTI_COLORS = ["#4ade80", "#22c55e", "#fbbf24", "#ffffff"];

export async function fireConfetti(signal?: AbortSignal): Promise<void> {
  const { default: confetti } = await import("canvas-confetti");
  if (signal?.aborted) {
    return;
  }

  const end = performance.now() + CONFETTI_DURATION_MS;

  function frame() {
    if (signal?.aborted) {
      return;
    }
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 60,
      startVelocity: 45,
      origin: { x: 0, y: 0.7 },
      colors: CONFETTI_COLORS,
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 60,
      startVelocity: 45,
      origin: { x: 1, y: 0.7 },
      colors: CONFETTI_COLORS,
    });
    if (performance.now() < end) {
      requestAnimationFrame(frame);
    }
  }

  frame();
}
