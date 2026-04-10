import type { SolarState, SolarTimes } from "../logic/SolarEngine";
import type { TimeState } from "../logic/Chronograph";
import { getHoliday } from "../config/holidays";

export class Renderer {
  private readonly root = document.documentElement;
  private readonly timeEl = document.getElementById("time")!;
  private readonly dateEl = document.getElementById("date")!;
  private readonly badgeEl = document.getElementById("solar-status")!;
  private readonly locationEl = document.getElementById("location-badge")!;
  private readonly leetEl = document.getElementById("leet-text")!;
  private readonly holidayEl = document.getElementById("holiday-text")!;
  private readonly markersEl = document.getElementById("markers")!;
  private readonly timelineEl = document.getElementById("solar-timeline")!;
  private readonly sunMarkerEl = document.querySelector(
    ".sun-marker",
  ) as HTMLElement;

  private lastMeasured = 0;
  private frameCount = 0;
  private lastSecond = -1;
  private lastMinute = -1;
  private lastLat = -1;

  constructor() {
    this.createTicks();
    this.initA11y();
  }

  private initA11y(): void {
    this.timeEl.setAttribute("role", "timer");
    this.timeEl.setAttribute("aria-live", "polite");
    this.timeEl.setAttribute("aria-label", "Current Digital Time");
  }

  private createTicks(): void {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 60; i++) {
      const t = document.createElement("div");
      t.className = `tick ${i % 5 === 0 ? "hour" : "min"}`;
      t.style.transform = `rotate(${i * 6}deg)`;
      frag.appendChild(t);
    }
    this.markersEl.prepend(frag);
  }

  public update(
    time: TimeState,
    solar: SolarState,
    solarTimes: SolarTimes,
  ): void {
    // High-Frequency Updates (60fps)
    this.updateClockHands(time);
    this.updateSolarVariables(solar);
    this.updateSunMarker(time);

    // Low-Frequency Updates (Once per second)
    if (time.seconds !== this.lastSecond) {
      this.updateDigitalTime(time);
      this.updateStatusIndicators(time, solar, solarTimes);
      this.lastSecond = time.seconds;
    }

    this.measurePerformance();
  }

  private updateClockHands(time: TimeState): void {
    const sAcc = time.seconds + time.milliseconds / 1000;
    const mAcc = time.minutes + sAcc / 60;
    const hAcc = (time.hours % 12) + mAcc / 60;

    // Apply high-frequency rotation transforms directly to the clock container,
    // avoiding expensive full-DOM CSS recalcs on the :root element at 60fps.
    this.markersEl.style.setProperty("--s-deg", `${(sAcc * 6).toFixed(2)}deg`);
    this.markersEl.style.setProperty("--m-deg", `${(mAcc * 6).toFixed(2)}deg`);
    this.markersEl.style.setProperty("--h-deg", `${(hAcc * 30).toFixed(2)}deg`);
  }

  private updateSolarVariables(solar: SolarState): void {
    this.root.style.setProperty("--darkness", solar.darkness.toFixed(3));
    this.root.style.setProperty("--sunlight", solar.sunlight.toFixed(3));
  }

  private updateDigitalTime(time: TimeState): void {
    // Zero-allocation formatting (simple padding)
    const h = time.hours.toString().padStart(2, "0");
    const m = time.minutes.toString().padStart(2, "0");
    const s = time.seconds.toString().padStart(2, "0");

    this.timeEl.textContent = `${h}:${m}:${s}`;

    // Update verbose label once a second for A11y
    this.timeEl.setAttribute(
      "aria-label",
      `The time is ${h} ${m} and ${s} seconds`,
    );
  }

  private updateSunMarker(time: TimeState): void {
    const daySeconds = 86400; // 24 * 3600
    const currentSeconds = time.hours * 3600 + time.minutes * 60 + time.seconds;
    const progress = (currentSeconds / daySeconds) * 100;
    this.sunMarkerEl.style.left = `${progress.toFixed(2)}%`;
  }

  private updateStatusIndicators(
    time: TimeState,
    solar: SolarState,
    solarTimes: SolarTimes,
  ): void {
    // Throttled UI updates
    this.dateEl.textContent = time.date
      .toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "2-digit",
      })
      .toUpperCase();

    this.badgeEl.textContent = `SOLAR.${solar.phase} (${solar.altitude.toFixed(1)}°)`;
    this.badgeEl.setAttribute(
      "aria-label",
      `Solar Phase: ${solar.phase}, Sun Altitude: ${solar.altitude.toFixed(1)} degrees`,
    );

    // Location Telemetry (Throttled unless GPS moves)
    if (this.lastLat !== solar.lat) {
      this.locationEl.textContent = `GPS.LAT ${solar.lat.toFixed(2)} / LNG ${solar.lng.toFixed(2)}`;
      this.lastLat = solar.lat;
    }

    // Spectral Interpolation (Continuous Atmospheric Blend) - Throttled to 1-minute intervals
    if (time.minutes !== this.lastMinute) {
      this.root.style.setProperty("--phase-color", solar.themeColor);
      this.lastMinute = time.minutes;
    }

    this.checkStatusIndicators(time);

    // Timeline markers re-render every minute to catch geolocation updates
    if (this.frameCount === 0 || time.seconds === 0) {
      this.renderTimelineMarkers(solarTimes);
    }
  }

  private renderTimelineMarkers(solarTimes: SolarTimes): void {
    const getPos = (date: Date): string => {
      const seconds =
        date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
      return `${((seconds / 86400) * 100).toFixed(2)}%`;
    };

    // Remove any legacy regions
    const existing = this.timelineEl.querySelectorAll(".timeline-region");
    existing.forEach((m): void => m.remove());

    const colors = {
      night: "#111111",
      twilight: "#003366",
      blue: "#00c8ff",
      golden: "#ffaa00",
      day: "#ffffff",
      horizon: "#ff0000",
    };

    // Build the 24h linear gradient
    const stops = [
      `${colors.night} 0%`,
      `${colors.night} ${getPos(solarTimes.nightEnd)}`,
      `${colors.twilight} ${getPos(solarTimes.nauticalDawn)}`,
      `${colors.blue} ${getPos(solarTimes.dawn)}`,
      `${colors.horizon} ${getPos(solarTimes.sunrise)}`,
      `${colors.golden} ${getPos(solarTimes.goldenHourEnd)}`,
      `${colors.day} ${getPos(solarTimes.solarNoon)}`,
      `${colors.golden} ${getPos(solarTimes.goldenHour)}`,
      `${colors.horizon} ${getPos(solarTimes.sunset)}`,
      `${colors.blue} ${getPos(solarTimes.dusk)}`,
      `${colors.twilight} ${getPos(solarTimes.nauticalDusk)}`,
      `${colors.night} ${getPos(solarTimes.night)}`,
      `${colors.night} 100%`,
    ];

    this.timelineEl.style.background = `linear-gradient(to right, ${stops.join(", ")})`;
  }

  private checkStatusIndicators(time: TimeState): void {
    const isLeetTime = time.hours === 13 && time.minutes === 37;
    this.leetEl.classList.toggle("active", isLeetTime);

    const holiday = getHoliday(time.date);
    if (holiday) {
      this.holidayEl.textContent = holiday.toUpperCase();
      this.holidayEl.classList.add("active");
    } else {
      this.holidayEl.classList.remove("active");
    }
  }

  private measurePerformance(): void {
    this.frameCount++;
    const now = performance.now();
    if (now - this.lastMeasured >= 1000) {
      const fps = Math.round(
        (this.frameCount * 1000) / (now - this.lastMeasured),
      );
      if (fps < 55) console.warn(`Performance Drop: ${fps} FPS`);
      this.lastMeasured = now;
      this.frameCount = 0;
    }
  }
}
