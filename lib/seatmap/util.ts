export class FPSCounter {
    public frameCount: number = 0;
    private frames: number[] = [];

    public tick() {
        const now = performance.now();
        this.frames.push(now);

        // Remove frames older than 1 second
        while (this.frames.length > 0 && this.frames[0] <= now - 1000) {
            this.frames.shift();
        }

        this.frameCount = this.frames.length;
    }
}