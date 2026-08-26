import { layoutIslands, renderIsland } from "./engine/islandRenderer";
import { generateCurvedPath } from "./engine/pathGenerator";
import {
    renderCompassRose,
    renderSeaWaves,
    renderShip,
    renderSeaMonster,
} from "./engine/terrainRenderer";
import type { DayData, Point } from "./types";

export class PirateMapElement extends HTMLElement {
    private shadow: ShadowRoot;

    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: "open" });
    }

    static get observedAttributes() {
        return ["src"];
    }

    connectedCallback() {
        this.render();
        const src = this.getAttribute("src");
        if (src) this.loadData(src);
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (name === "src" && oldValue !== newValue) {
            this.loadData(newValue);
        }
    }

    async loadData(url: string) {
        try {
            const response = await fetch(url);
            const data: DayData[] = await response.json();
            this.updateMap(data);
        } catch (err) {
            console.error("Fehler beim Laden der Schatzkarte:", err);
        }
    }

    private render() {
        this.shadow.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          max-width: 1450px;
          margin: 0 auto;
          font-family: 'Cinzel Decorative', Georgia, serif;
          user-select: none;
        }
        .map-wrapper {
          position: relative;
          width: 100%;
          background: #467685; /* Tiefes Ozeanblau */
          border: 6px solid #2b1810;
          border-radius: 12px;
          box-shadow: 0 15px 40px rgba(0,0,0,0.5);
          overflow: hidden;
        }
        svg {
          display: block;
          width: 100%;
          height: auto;
        }
        .island-node {
          transition: transform 0.2s ease, filter 0.2s ease;
          cursor: pointer;
        }
        .island-node:hover {
          filter: drop-shadow(0 6px 12px rgba(0,0,0,0.3));
        }
        .event-station {
          transition: transform 0.15s ease;
        }
        .event-station:hover {
          transform: scale(1.04);
        }
      </style>
      <div class="map-wrapper">
        <svg viewBox="0 0 1440 860" preserveAspectRatio="xMidYMid meet" id="map-svg"></svg>
      </div>
    `;
    }

    private updateMap(days: DayData[]) {
        const svg = this.shadow.querySelector("#map-svg");
        if (!svg) return;

        const islandSlots = layoutIslands(days);

        // Seeroute verbindet die Ankerpunkte unterhalb der Inseln
        const seaPathPoints: Point[] = islandSlots.map((slot) => ({
            x: slot.center.x,
            y: slot.center.y + slot.height / 2 + 22,
        }));
        const seaRouteD = generateCurvedPath(seaPathPoints);

        const waveDecorations: Point[] = [
            { x: 80, y: 70 },
            { x: 450, y: 45 },
            { x: 850, y: 60 },
            { x: 1360, y: 80 },
            { x: 150, y: 800 },
            { x: 650, y: 820 },
            { x: 1150, y: 810 },
        ];

        svg.innerHTML = `
      <defs>
        <!-- Ozean-Wasserwellen Textur & Filter -->
        <filter id="ocean-texture">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" result="noise" />
          <feDiffuseLighting in="noise" lighting-color="#55828b" surfaceScale="2" result="light">
            <feDistantLight azimuth="45" elevation="60" />
          </feDiffuseLighting>
          <feBlend mode="multiply" in="SourceGraphic" in2="light" />
        </filter>
      </defs>

      <!-- Ozean-Hintergrund -->
      <rect width="1440" height="860" fill="#467685" filter="url(#ocean-texture)" />

      <!-- Seekarten Deko (Wellen, Kompass, Ungeheuer, Segler) -->
      ${renderCompassRose({ x: 1360, y: 75 })}
      ${renderSeaWaves(waveDecorations)}
      ${renderShip({ x: 280, y: 60 })}
      ${renderSeaMonster({ x: 1100, y: 70 })}

      <!-- Große Schiffsroute zwischen den Inseln -->
      <path d="${seaRouteD}" fill="none" stroke="#b71c1c" stroke-width="4" stroke-dasharray="10, 8" stroke-linecap="round" />

      <!-- Die 7 organischen Inseln mit ihren Stationen -->
      ${islandSlots.map((slot) => renderIsland(slot)).join("")}
    `;
    }
}
