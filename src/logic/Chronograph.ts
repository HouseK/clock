export interface TimeState {
  readonly date: Date;
  readonly seconds: number;
  readonly minutes: number;
  readonly hours: number;
  readonly milliseconds: number;
}

export class Chronograph {
  private timeOffset: number = 0;
  private readonly onTick: (state: TimeState) => void;

  constructor(onTick: (state: TimeState) => void) {
    this.onTick = onTick;
    this.initOverrides();
  }

  private initOverrides(): void {
    const params = new URLSearchParams(window.location.search);
    const debugTime = params.get('time');
    const debugDate = params.get('date');

    if (debugTime || debugDate) {
      const now = new Date();
      const target = new Date(now);
      if (debugTime) {
        const [h, m, s] = debugTime.split(':').map((n): number => parseInt(n) || 0);
        target.setHours(h, m, s);
      }
      if (debugDate) {
        const [y, m, d] = debugDate.split('-').map((n): number => parseInt(n));
        if (y > 1000) target.setFullYear(y);
        const month = y > 1000 ? m : y; // Fallback for MM-DD
        const day = y > 1000 ? d : m;
        target.setMonth(month - 1, day);
      }
      this.timeOffset = target.getTime() - now.getTime();
    }
  }

  public start(): void {
    const loop = (): void => {
      // Calculate delta to avoid bottlenecks if needed, 
      // but for a clock we usually just want the current absolute time.
      const now = new Date(Date.now() + this.timeOffset);
      
      this.onTick({
        date: now,
        seconds: now.getSeconds(),
        minutes: now.getMinutes(),
        hours: now.getHours(),
        milliseconds: now.getMilliseconds(),
      });

      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}
