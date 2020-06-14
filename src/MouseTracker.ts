export default class MouseTracker {
  private mouseMove = { x: 0, y: 0 };
  private lastReset = 0;

  constructor(canv: HTMLCanvasElement) {
    document.onmousemove = e => {
      if (document.pointerLockElement !== canv || e.timeStamp < this.lastReset) return;
      this.mouseMove.x += e.movementX;
      this.mouseMove.y += e.movementY;
    };
  }

  reset() {
    this.mouseMove.x = 0;
    this.mouseMove.y = 0;
    this.lastReset = performance.now();
  }

  getMovement() {
    const copy = { ...this.mouseMove };
    this.mouseMove.x = 0;
    this.mouseMove.y = 0;
    return copy;
  }
}
