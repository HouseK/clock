import SunCalc from 'suncalc';

export const SolarPhase = {
  DAY: 'DAY',
  GOLDEN: 'GOLDEN',
  BLUE: 'BLUE',
  NIGHT: 'NIGHT',
} as const;

export type SolarPhase = (typeof SolarPhase)[keyof typeof SolarPhase];

export interface SolarState {
  readonly altitude: number;
  readonly phase: SolarPhase;
  readonly darkness: number; // 0 to 1
  readonly sunlight: number; // 0 to 1
  readonly lat: number;
  readonly lng: number;
  readonly themeColor: string;
}

export interface SolarTimes {
  readonly sunrise: Date;
  readonly sunriseEnd: Date;
  readonly goldenHourEnd: Date;
  readonly solarNoon: Date;
  readonly goldenHour: Date;
  readonly sunsetStart: Date;
  readonly sunset: Date;
  readonly dusk: Date;
  readonly nauticalDusk: Date;
  readonly night: Date;
  readonly nadir: Date;
  readonly nightEnd: Date;
  readonly nauticalDawn: Date;
  readonly dawn: Date;
}

export class SolarEngine {
  private lat = 51.5074; // Default to London
  private lng = -0.1278;

  constructor() {
    this.initGeolocation();
  }

  private initGeolocation(): void {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p): void => {
          this.lat = p.coords.latitude;
          this.lng = p.coords.longitude;
        },
        (err): void => console.warn('SolarEngine: Geolocation denied, using default.', err)
      );
    }
  }

  public getState(date: Date): SolarState {
    const sun = SunCalc.getPosition(date, this.lat, this.lng);
    const altitude = sun.altitude * (180 / Math.PI);

    // Derived factors for UI
    const darkness = Math.min(Math.max((altitude - 6) / -18, 0), 1);
    const sunlight = Math.min(Math.max((altitude - 15) / 30, 0), 1);

    let phase: SolarPhase = SolarPhase.DAY;
    if (altitude < -6) phase = SolarPhase.NIGHT;
    else if (altitude < -0.3) phase = SolarPhase.BLUE;
    else if (altitude < 6) phase = SolarPhase.GOLDEN;

    return {
      altitude,
      phase,
      darkness,
      sunlight,
      lat: this.lat,
      lng: this.lng,
      themeColor: this.calculateThemeColor(altitude),
    };
  }

  private calculateThemeColor(altitude: number): string {
    const anchors = [
      { alt: 10,  color: '#ffffff' }, // Day
      { alt: 6,   color: '#ffaa00' }, // Golden Start
      { alt: -0.3, color: '#ff5500' }, // Horizon (Deep Orange)
      { alt: -4,  color: '#00c8ff' }, // Blue Hour Peak
      { alt: -12, color: '#ff0000' }  // Night (Signal Red)
    ];

    let themeColor = anchors[anchors.length - 1].color;
    for (let i = 0; i < anchors.length - 1; i++) {
      const a = anchors[i];
      const b = anchors[i + 1];
      if (altitude <= a.alt && altitude > b.alt) {
        const alpha = (altitude - b.alt) / (a.alt - b.alt);
        return this.lerpColor(b.color, a.color, alpha);
      } else if (altitude > anchors[0].alt) {
        return anchors[0].color;
      }
    }
    return themeColor;
  }

  private lerpColor(c1: string, c2: string, alpha: number): string {
    const r1 = parseInt(c1.substring(1, 3), 16);
    const g1 = parseInt(c1.substring(3, 5), 16);
    const b1 = parseInt(c1.substring(5, 7), 16);
    const r2 = parseInt(c2.substring(1, 3), 16);
    const g2 = parseInt(c2.substring(3, 5), 16);
    const b2 = parseInt(c2.substring(5, 7), 16);
    
    const r = Math.round(r1 + (r2 - r1) * alpha).toString(16).padStart(2, '0');
    const g = Math.round(g1 + (g2 - g1) * alpha).toString(16).padStart(2, '0');
    const b = Math.round(b1 + (b2 - b1) * alpha).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }

  public getSolarTimes(date: Date): SolarTimes {
    return SunCalc.getTimes(date, this.lat, this.lng) as any;
  }
}
