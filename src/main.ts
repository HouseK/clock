import './style.css';
import { SolarEngine } from './logic/SolarEngine';
import { Chronograph } from './logic/Chronograph';
import type { TimeState } from './logic/Chronograph';
import { Renderer } from './render/Renderer';

/**
 * ClockApp
 * Designed as a persistent, long-duration background display.
 * This application is intentionaly zero-interaction; it contains no 
 * input handlers or interactivity to ensure stability in always-on setups.
 */
class ClockApp {
  private solar = new SolarEngine();
  private renderer = new Renderer();
  private chronograph: Chronograph;

  constructor() {
    this.chronograph = new Chronograph(this.onTick.bind(this));
  }

  public init(): void {
    this.chronograph.start();
  }

  private onTick(time: TimeState): void {
    const solarState = this.solar.getState(time.date);
    const solarTimes = this.solar.getSolarTimes(time.date);
    this.renderer.update(time, solarState, solarTimes);
  }
}

// Initialize the application
const app = new ClockApp();
app.init();
