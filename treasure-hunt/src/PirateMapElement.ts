import { layoutArchipelago } from "./engine/archipelagoLayout";
import { generateSeamlessMasterRoute } from "./engine/seamlessPath";
import { renderArchipelagoIsland } from "./engine/islandRenderer";
import { renderRhumbLines } from "./engine/pirateArtRenderer";
import {
    renderCompassRose,
    renderSeaMonster,
    renderSeaWaves,
    renderDockedShip,
} from "./engine/terrainRenderer";
import { getCurrentWeekDay, getActiveEventId } from "./engine/timeUtils";
import type { DayData, Point, MapOrientation } from "./types";
import { renderEventModal } from "./engine/modalRenderer";

export class PirateMapElement extends HTMLElement {
    private shadow: ShadowRoot;
    private cachedData: DayData[] = [];
    private resizeObserver: ResizeObserver | null = null;

    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: "open" });
    }

    static get observedAttributes() {
        return ["src", "orientation"];
    }

    connectedCallback() {
        this.render();
        this.setupResizeObserver();
        const src = this.getAttribute("src");
        if (src) this.loadData(src);
    }

    disconnectedCallback() {
        this.resizeObserver?.disconnect();
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (oldValue === newValue) return;
        if (name === "src") this.loadData(newValue);
        if (name === "orientation" && this.cachedData.length > 0) {
            this.updateMap(this.cachedData);
        }
    }

    private setupResizeObserver() {
        this.resizeObserver = new ResizeObserver(() => {
            if (
                this.cachedData.length > 0 &&
                !this.getAttribute("orientation")
            ) {
                this.updateMap(this.cachedData);
            }
        });
        this.resizeObserver.observe(this);
    }

    private detectOrientation(): MapOrientation {
        const explicit = this.getAttribute("orientation");
        if (explicit === "horizontal" || explicit === "vertical") {
            return explicit;
        }
        const width = this.getBoundingClientRect().width || window.innerWidth;
        return width < 800 ? "vertical" : "horizontal";
    }

    async loadData(url: string) {
        try {
            const response = await fetch(url);
            this.cachedData = await response.json();
            this.updateMap(this.cachedData);
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
        max-width: 100%;
        margin: 0 auto;
        user-select: none;
        font-family: 'Cinzel Decorative', 'Georgia', serif;
        position: relative;
      }

      .parchment-frame {
        position: relative;
        width: 100%;
        background: #d8c29d;
        border: 10px solid #2b1810;
        border-radius: 12px;
        box-shadow: inset 0 0 70px rgba(43, 24, 16, 0.5), 0 15px 40px rgba(0,0,0,0.55);
        overflow: hidden;
      }

      svg {
        display: block;
        width: 100%;
        height: auto;
      }

      /* Background ignores mouse interaction */
      .map-bg, .map-deko, .rhumb-line {
        pointer-events: none;
      }

      /* Hover-Effekte auf Inseln */
      .island-group {
        cursor: pointer;
        transition: filter 0.25s ease;
      }

      .island-group:hover {
        filter: drop-shadow(0 0 14px rgba(43, 24, 16, 0.45));
      }

      /* Hover-Effekte auf Event-Stationen */
      .event-node {
        cursor: pointer;
      }

      .event-node-inner {
        transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }

      .event-node:hover .event-node-inner {
        transform: scale(1.12);
      }

      .event-node:hover rect {
        stroke: #8b261b;
        stroke-width: 2.2px;
      }

      /* Animationen */
      .docked-flagship-bob {
        transform-origin: 14px 0px;
        animation: shipBobbing 3.5s ease-in-out infinite alternate;
      }

      @keyframes shipBobbing {
        0% { transform: translateY(0px) rotate(-3deg); }
        100% { transform: translateY(-6px) rotate(3deg); }
      }

      .is-current-active .event-node-inner {
        animation: currentPulse 2.2s ease-in-out infinite alternate;
      }

      @keyframes currentPulse {
        0% { transform: scale(1); }
        100% { transform: scale(1.08); }
      }

      /* Pergament-Detail Modal */
      .parchment-modal-backdrop {
        position: absolute;
        inset: 0;
        background: rgba(26, 15, 10, 0.65);
        backdrop-filter: blur(3px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1.5rem;
        z-index: 100;
        animation: fadeIn 0.2s ease;
      }

      .parchment-modal-scroll {
        position: relative;
        background: #fdf5e2;
        border: 4px solid #4a2e18;
        border-radius: 8px;
        box-shadow: 0 15px 40px rgba(0,0,0,0.6), inset 0 0 50px rgba(139, 90, 43, 0.25);
        max-width: 480px;
        width: 100%;
        padding: 2rem 2.2rem;
        color: #2b1704;
        font-family: 'Georgia', serif;
        transform: scale(0.95);
        animation: popIn 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
      }

      .modal-close {
        position: absolute;
        top: 10px;
        right: 14px;
        background: none;
        border: none;
        font-size: 28px;
        color: #8b261b;
        cursor: pointer;
        line-height: 1;
      }

      .modal-wax-seal {
        font-size: 32px;
        text-align: center;
        margin-bottom: 0.25rem;
      }

      .modal-tag {
        text-align: center;
        font-size: 11px;
        font-weight: bold;
        letter-spacing: 2px;
        color: #8b261b;
        font-family: 'Cinzel Decorative', Georgia, serif;
      }

      .modal-title {
        margin: 0.5rem 0 1rem 0;
        text-align: center;
        font-size: 20px;
        color: #1f1208;
        font-family: 'Cinzel Decorative', Georgia, serif;
      }

      .modal-meta {
        background: rgba(139, 90, 43, 0.08);
        border-radius: 4px;
        padding: 0.6rem 0.8rem;
        margin-bottom: 1rem;
        font-size: 13px;
      }

      .modal-meta-item {
        margin-bottom: 4px;
      }

      .modal-divider {
        text-align: center;
        color: #8b5a2b;
        margin: 0.8rem 0;
        font-size: 14px;
      }

      .modal-desc {
        font-size: 14px;
        line-height: 1.6;
        color: #3e2723;
        margin: 0;
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes popIn {
        to { transform: scale(1); }
      }
      </style>
      <div class="parchment-frame">
        <svg preserveAspectRatio="xMidYMid meet" id="map-svg"></svg>
      </div>
    `;
    }

    private updateMap(days: DayData[]) {
        const container = this.shadow.querySelector(".parchment-frame");
        const svg = this.shadow.querySelector("#map-svg");
        if (!svg || !container) return;

        const currentDayKey = getCurrentWeekDay();
        const orientation = this.detectOrientation();
        const { islands, totalWidth, totalHeight } = layoutArchipelago(
            days,
            orientation,
        );
        const masterRouteD = generateSeamlessMasterRoute(islands);

        svg.setAttribute("viewBox", `0 0 ${totalWidth} ${totalHeight}`);

        const currentIsland =
            islands.find((isl) => isl.dayData.day === currentDayKey) ||
            islands[0];
        const activeEventId = getActiveEventId(currentIsland.dayData);

        const wavePoints: Point[] =
            orientation === "horizontal"
                ? [
                      { x: 300, y: 120 },
                      { x: 900, y: 150 },
                      { x: 1400, y: 100 },
                      { x: 600, y: 820 },
                      { x: 1200, y: 800 },
                  ]
                : [
                      { x: 120, y: 100 },
                      { x: 880, y: 150 },
                      { x: 100, y: totalHeight * 0.5 },
                      { x: 900, y: totalHeight - 120 },
                  ];

        svg.innerHTML = `
        <defs>
          <radialGradient id="vignette" cx="50%" cy="50%" r="50%">
            <stop offset="65%" stop-color="#ebd8b5" stop-opacity="0" />
            <stop offset="100%" stop-color="#462c19" stop-opacity="0.5" />
          </radialGradient>
          <filter id="paper-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise" />
            <feDiffuseLighting in="noise" lighting-color="#eedcba" surfaceScale="2.8" result="light">
              <feDistantLight azimuth="60" elevation="65" />
            </feDiffuseLighting>
            <feBlend mode="multiply" in="SourceGraphic" in2="light" />
          </filter>
        </defs>

        <!-- Ozean / Hintergrund (mit pointer-events: none) -->
        <rect class="map-bg" width="${totalWidth}" height="${totalHeight}" fill="#eedcba" filter="url(#paper-grain)" />
        <rect class="map-bg" width="${totalWidth}" height="${totalHeight}" fill="url(#vignette)" style="mix-blend-mode: multiply;" />

        <!-- Deko -->
        <g class="map-deko">${renderRhumbLines({ x: totalWidth / 2, y: totalHeight / 2 })}</g>
        <g class="map-deko">${renderCompassRose({ x: totalWidth - 90, y: 85 })}</g>
        <g class="map-deko">${renderSeaWaves(wavePoints)}</g>
        <g class="map-deko">${renderSeaMonster({ x: totalWidth - 140, y: totalHeight - 140 })}</g>

        <!-- Schatzpfad -->
        <path class="map-bg" d="${masterRouteD}" fill="none" stroke="#a71d1d" stroke-width="4.5" stroke-dasharray="12, 9" stroke-linecap="round" />

        <!-- Interaktive Inseln & Events -->
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

        <!-- ⚓ Flaggschiff -->
        ${renderDockedShip(currentIsland.entryPoint)}
      `;

        this.attachInteractions(days);
    }

    private attachInteractions(days: DayData[]) {
        const container = this.shadow.querySelector(".parchment-frame");
        if (!container) return;

        this.shadow.querySelectorAll(".event-node").forEach((node) => {
            node.addEventListener("click", (e) => {
                e.stopPropagation();
                const eventId = node.getAttribute("data-event-id");
                const dayKey = node.getAttribute("data-day");

                const day = days.find((d) => d.day === dayKey);
                const event = day?.events.find((ev) => ev.id === eventId);

                if (event && day) {
                    this.openModal(event, day.label);
                }
            });
        });
    }

    private openModal(event: any, dayLabel: string) {
        const container = this.shadow.querySelector(".parchment-frame");
        if (!container) return;

        this.shadow.querySelector("#modal-backdrop")?.remove();

        container.insertAdjacentHTML(
            "beforeend",
            renderEventModal(event, dayLabel),
        );

        const backdrop = this.shadow.querySelector("#modal-backdrop");
        const closeBtn = this.shadow.querySelector("#modal-close-btn");

        const closeModal = () => backdrop?.remove();

        closeBtn?.addEventListener("click", closeModal);
        backdrop?.addEventListener("click", (e) => {
            if (e.target === backdrop) closeModal();
        });
    }
}
