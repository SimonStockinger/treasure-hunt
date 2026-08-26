import { layoutArchipelago } from "./engine/archipelagoLayout";
import { generateSeamlessMasterRoute } from "./engine/seamlessPath";
import { renderArchipelagoIsland } from "./engine/islandRenderer";
import { renderRhumbLines } from "./engine/pirateArtRenderer";
import {
    renderCompassRose,
    renderSeaMonster,
    renderDockedShip,
    renderSeaWaves,
} from "./engine/terrainRenderer";
import type { DayData, Point } from "./types";
import { getCurrentWeekDay, getActiveEventId } from "./engine/timeUtils";

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
          max-width: 1600px;
          margin: 0 auto;
          user-select: none;
          font-family: 'Cinzel Decorative', Georgia, serif;
        }
        .parchment-frame {
          position: relative;
          width: 100%;
          background: #d8c29d;
          border: 12px solid #2b1810;
          border-radius: 14px;
          box-shadow: inset 0 0 80px rgba(43, 24, 16, 0.6), 0 20px 50px rgba(0,0,0,0.6);
          overflow: hidden;
        }
        svg {
          display: block;
          width: 100%;
          height: auto;
        }
        .event-node {
          cursor: pointer;
          transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .event-node:hover {
          transform: scale(1.1);
        }
        .island-group {
          transition: filter 0.2s ease;
        }
        .island-group:hover {
          filter: drop-shadow(0 8px 16px rgba(43, 24, 16, 0.35));
        }
        .docked-flagship-bob {
          transform-origin: 14px 0px;
          animation: shipBobbing 3.5s ease-in-out infinite alternate;
        }

        @keyframes shipBobbing {
          0% { transform: translateY(0px) rotate(-3deg); }
          100% { transform: translateY(-6px) rotate(3deg); }
        }

        .is-current-active {
          transform-origin: 0px 0px;
          animation: currentPulse 2s ease-in-out infinite alternate;
        }

        @keyframes currentPulse {
          0% { transform: scale(1); }
          100% { transform: scale(1.06); }
        }
      </style>
      <div class="parchment-frame">
        <svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid meet" id="map-svg"></svg>
      </div>
    `;
    }

    // In updateMap(days: DayData[]):
    private updateMap(days: DayData[]) {
        const svg = this.shadow.querySelector("#map-svg");
        if (!svg) return;

        const currentDayKey = getCurrentWeekDay();
        const islands = layoutArchipelago(days);
        const masterRouteD = generateSeamlessMasterRoute(islands);

        // Finde die Insel des heutigen Tages für das Piratenschiff
        const currentIsland =
            islands.find((isl) => isl.dayData.day === currentDayKey) ||
            islands[0];
        const activeEventId = getActiveEventId(currentIsland.dayData);

        const wavePoints: Point[] = [
            { x: 420, y: 110 },
            { x: 850, y: 130 },
            { x: 1450, y: 320 },
            { x: 1200, y: 880 },
            { x: 740, y: 920 },
            { x: 120, y: 850 },
        ];

        svg.innerHTML = `
        <defs>
          <radialGradient id="vignette" cx="50%" cy="50%" r="50%">
            <stop offset="60%" stop-color="#ebd8b5" stop-opacity="0" />
            <stop offset="100%" stop-color="#462c19" stop-opacity="0.6" />
          </radialGradient>
          <filter id="paper-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise" />
            <feDiffuseLighting in="noise" lighting-color="#eedcba" surfaceScale="2.8" result="light">
              <feDistantLight azimuth="60" elevation="65" />
            </feDiffuseLighting>
            <feBlend mode="multiply" in="SourceGraphic" in2="light" />
          </filter>
        </defs>

        <!-- Ozean / Pergament -->
        <rect width="1600" height="1000" fill="#eedcba" filter="url(#paper-grain)" />
        <rect width="1600" height="1000" fill="url(#vignette)" style="mix-blend-mode: multiply;" />

        <!-- Deko & Seekarten-Grafiken -->
        ${renderRhumbLines({ x: 800, y: 480 })}
        ${renderCompassRose({ x: 1460, y: 140 })}
        ${renderSeaWaves(wavePoints)}
        ${renderSeaMonster({ x: 1320, y: 860 })}

        <!-- Der rote Schatzpfad -->
        <path d="${masterRouteD}" fill="none" stroke="#a71d1d" stroke-width="4.5" stroke-dasharray="12, 9" stroke-linecap="round" />

        <!-- Die 7 Inseln -->
        ${islands
            .map((isl) => {
                const isToday = isl.dayData.day === currentDayKey;
                return renderArchipelagoIsland(
                    isl,
                    isToday,
                    isToday ? activeEventId : null,
                );
            })
            .join("")}

        <!-- ⚓ Piratenschiff am heutigen Tag vor Anker -->
        ${renderDockedShip(currentIsland.entryPoint)}
      `;
    }
}
