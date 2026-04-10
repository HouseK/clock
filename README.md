# **Continuous Background Chronometer**

A persistent, "always-on" living room artifact designed to function as a stable background display. It treats your environment like a film set, adjusting its visual temperature based on solar elevation principles used by world-class cinematographers.

Designed for **zero-interaction** environments, it provides continuous photographic-precision timekeeping with zero performance degradation over long durations.

---

## **How to Read the Instrument**

This clock provides multi-layered telemetry across its interface:

### **1. Analog Chronograph**
- **Hours & Minutes**: Bold **Signal Red batons** provide high-contrast readability.
- **Seconds**: A precision **Red Needle** that moves at 60fps for smooth motion tracking.
- **The Lume**: In dark conditions (Night/Blue Hour), the hands gain a soft glow to preserve night vision.

### **2. Digital Index**
- Located on the **right** (or top in portrait), the high-precision digital display provides **HH:MM:SS** accuracy in a monospaced technical font.

### **3. Solar Telemetry Badge**
- Displays current **Light Quality** (e.g., `SOLAR.GOLDEN`) and precise **Solar Altitude** (Angle).
- Elevated above the timeline to provide clear telemetry without interference.

### **4. Smooth Spectrum Light Strip**
The bottom of the screen features a continuous, high-visibility **Smooth Spectrum** that mirrors the natural daily light cycle. Unlike fixed-block timelines, this flow represents the gradual transition of light quality:

| Spectrum Color | Light Quality | Description |
| :--- | :--- | :--- |
| **Deep Grey** | Night | Sun is well below the horizon. |
| **Deep Navy** | Twilight | Transition into the atmospheric blue hour. |
| **Electric Blue** | Blue Hour | Peak atmospheric light for cinematography. |
| **Honey Gold** | Golden Hour | The "Magic Hour" surrounding sunrise and sunset. |
| **Brilliant White**| Daylight | High-intensity peak solar radiance. |

- **Sun Marker**: A high-visibility glowing traveler that indicates the current position in the solar day.

---

## **Key Features**

### **Dynamic Atmospheric Tinting**
While maintaining a strict **Signal Red, Black, and White** core, the instrument subtly shifts its secondary "lume temperature" to match the current spectrum region (e.g., warmer glow during Golden transitions).

### **High-Performance "Always-On" Engine**
Optimized for 24/7 operation on dedicated monitors:
- **Zero-Garbage Updates**: Uses a zero-allocation loop to prevent memory fragmentation.
- **Update Partitioning**: High-frequency motion is isolated from low-frequency telemetry.
- **Accessibility**: Full ARIA support with verbose temporal descriptions.

---

## **Roadmap**

### **Phase 1, 2, & 3: Precision & Environmental Orchestration (Completed)**
- [x] **Smooth Spectrum Strip**: Continuous, high-visibility 24h light mapping.
- [x] **Zero-Garbage Render Loop**: Optimized for 24/7 background persistence.
- [x] **Atmospheric Tinting**: Subtle phase-based color temperature shifts.
- [x] **Telemetry Repositioning**: Optimized layout for edge-to-edge visualization.

### **Debug Overrides**
You can manually override the time and date to test solar phase transitions by appending the following URL parameters:
- `?time=HH:MM:SS` — Force a specific time of day.
- `?date=YYYY-MM-DD` — Force a specific date (crucial for testing seasonal solar variance).
- Example: `index.html?date=2024-12-21&time=16:30:00` (Testing the winter solstice sunset).
