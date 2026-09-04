import { layoutArchipelago } from "./engine/layout/archipelagoLayout";
import { generateSeamlessMasterRoute } from "./engine/rendering/seamlessPath";
import { renderArchipelagoIsland } from "./engine/rendering/islandRenderer";
import mapStyles from "./styles/style.css?inline";

import { renderRhumbLines } from "./engine/rendering/pirateArtRenderer";
import {
    renderCompassRose,
    renderSeaMonster,
    renderSeaWaves,
    renderDockedShip,
    renderShip,
} from "./engine/rendering/terrainRenderer";
import { getCurrentWeekDay, getActiveEventId } from "./engine/util/timeUtils";
import type { DayData, Point, MapOrientation } from "./types";
import {
    renderEventModal,
    renderIslandModal,
} from "./engine/rendering/modalRenderer";

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
      <style>${mapStyles}</style>
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

        <!-- Ocean / Background -->
        <rect class="map-bg" width="${totalWidth}" height="${totalHeight}" fill="#eedcba" filter="url(#paper-grain)" />
        <rect class="map-bg" width="${totalWidth}" height="${totalHeight}" fill="url(#vignette)" style="mix-blend-mode: multiply;" />

        <!-- Decoration -->
        <g class="map-deko">${renderRhumbLines({ x: totalWidth / 2, y: totalHeight / 2 })}</g>
        <g class="map-deko">${renderCompassRose({ x: totalWidth - 90, y: 85 })}</g>
        <g class="map-deko">${renderSeaWaves(wavePoints)}</g>
        <g class="map-deko">${renderSeaMonster({ x: totalWidth - 140, y: totalHeight - 140 })}</g>
        <g class="map-deko">${renderShip({ x: totalWidth - 1900, y: totalHeight - 180 })}</g>


        <!-- Sea Path -->
        <path class="map-bg" d="${masterRouteD}" fill="none" stroke="#a71d1d" stroke-width="4.5" stroke-dasharray="12, 9" stroke-linecap="round" />


        <!-- Interactive Islands and Events -->
        ${islands
            .map((isl) => {
                const isToday = isl.dayData.day === currentDayKey;
                return renderArchipelagoIsland(
                    isl,
                    isToday,
                    isToday ? activeEventId : null,
                    isl.index === islands.length - 1,
                );
            })
            .join("")}

      `;

        this.attachInteractions(days, currentDayKey, activeEventId);
    }

    private attachInteractions(
        days: DayData[],
        currentDayKey: string,
        activeEventId: string | null,
    ) {
        const container = this.shadow.querySelector(".parchment-frame");
        if (!container) return;

        container.addEventListener("click", (e: Event) => {
            const target = e.target as HTMLElement;

            const node = target.closest<HTMLElement>(".event-node");
            if (node) {
                e.stopPropagation();
                const { event, day } = this.resolveEventData(node, days);
                if (event && day) {
                    this.openEventModal(event, day.label);
                }
                return;
            }

            const island = target.closest<HTMLElement>(".island-group");
            if (island) {
                const dayKey = island.getAttribute("data-day");

                e.stopPropagation();
                const day = days.find((d) => d.day === dayKey);
                if (day?.events) {
                    this.openIslandModal(
                        day,
                        day.label,
                        currentDayKey,
                        activeEventId,
                    );
                }
                return;
            }
        });
    }

    private resolveEventData(el: HTMLElement, days: DayData[]) {
        const eventId = el.getAttribute("data-event-id");
        const dayKey = el.getAttribute("data-day");

        const day = days.find((d) => d.day === dayKey);
        const event = day?.events.find((ev) => ev.id === eventId);

        return { event, day };
    }

    private openIslandModal(
        dayData: DayData,
        dayLabel: string,
        currentDayKey: string,
        activeEventId: string | null,
    ) {
        const container = this.shadow.querySelector(".parchment-frame");
        if (!container) return;

        this.shadow.querySelector("#modal-backdrop")?.remove();

        container.insertAdjacentHTML(
            "beforeend",
            renderIslandModal(dayData, dayLabel, currentDayKey, activeEventId),
        );

        const backdrop = this.shadow.querySelector("#modal-backdrop");
        const closeBtn = this.shadow.querySelector("#modal-close-btn");
        const closeModal = () => backdrop?.remove();

        closeBtn?.addEventListener("click", closeModal);
        backdrop?.addEventListener("click", (e) => {
            if (e.target === backdrop) closeModal();
        });

        const eventCards = backdrop?.querySelectorAll<SVGElement>(
            ".event-station-card",
        );
        eventCards?.forEach((card) => {
            card.addEventListener("click", (e) => {
                e.stopPropagation();
                const eventId = card.getAttribute("data-event-id");
                const event = dayData.events.find((ev) => ev.id === eventId);
                if (!event) return;

                this.openEventModal(event, dayLabel, () => {
                    this.openIslandModal(
                        dayData,
                        dayLabel,
                        currentDayKey,
                        activeEventId,
                    );
                });
            });
        });
    }

    private openEventModal(event: any, dayLabel: string, onBack?: () => void) {
        const container = this.shadow.querySelector(".parchment-frame");
        if (!container) return;

        this.shadow.querySelector("#modal-backdrop")?.remove();

        container.insertAdjacentHTML(
            "beforeend",
            renderEventModal(event, dayLabel),
        );

        const backdrop = this.shadow.querySelector("#modal-backdrop");
        const closeBtn = this.shadow.querySelector("#modal-close-btn");

        const handleClose = () => {
            backdrop?.remove();
            if (onBack) {
                onBack();
            }
        };

        closeBtn?.addEventListener("click", handleClose);
        backdrop?.addEventListener("click", (e) => {
            if (e.target === backdrop) handleClose();
        });
    }
}
