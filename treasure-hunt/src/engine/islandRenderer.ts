import type { DynamicIsland } from "./archipelagoLayout";
import type { MapEvent } from "../types";
import { generateCoastline } from "./pirateArtRenderer";
import { renderTerrainFeature } from "./terrainRenderer";

export function renderArchipelagoIsland(
    island: DynamicIsland,
    isCurrentDay: boolean,
    activeEventId: string | null,
): string {
    const { dayData, index, center, radiusX, radiusY, eventPoints } = island;
    const seed = (index + 1) * 47;

    const reefRing = generateCoastline(center, radiusX, radiusY, seed, 22);
    const sandCoast = generateCoastline(center, radiusX, radiusY, seed, 10);
    const land = generateCoastline(center, radiusX, radiusY, seed, 0);

    return `
    <g class="island-group ${isCurrentDay ? "active-today" : ""}" data-day="${dayData.day}">
      <!-- Küsten-Ebenen -->
      <path d="${reefRing}" fill="none" stroke="#6d4c32" stroke-width="1" stroke-dasharray="3,3" opacity="0.45" />
      <path d="${sandCoast}" fill="#dfca9e" stroke="#5d4037" stroke-width="1.2" opacity="0.85" />
      <path d="${land}" fill="${isCurrentDay ? "#9bb37d" : "#caba94"}" stroke="#3e2723" stroke-width="${isCurrentDay ? "3" : "2"}" />

      <!-- Insel-Banner -->
      <g transform="translate(${center.x}, ${center.y - radiusY - 14})">
        <path d="M -70 -12 L 70 -12 L 60 12 L -60 12 Z" fill="${isCurrentDay ? "#8b261b" : "#2d1c13"}" stroke="#1a0f0a" stroke-width="1.5" />
        <text x="0" y="5" text-anchor="middle" font-size="12" font-weight="900" fill="#f4ebd9" letter-spacing="1">
          ${dayData.label.toUpperCase()} ${isCurrentDay ? "📍" : ""}
        </text>
      </g>

      <!-- Terrain-Icon -->
      <g transform="translate(${center.x + radiusX * 0.45}, ${center.y - radiusY * 0.3}) scale(0.85)">
        ${renderTerrainFeature({ x: 0, y: 0 }, dayData.terrain || (index === 6 ? "volcano" : "jungle"))}
      </g>

      <!-- Events -->
      ${dayData.events
          .map((event, eIdx) => {
              const pt = eventPoints[eIdx] || center;
              const isActive = isCurrentDay && event.id === activeEventId;
              return renderEventStation(
                  event,
                  pt.x,
                  pt.y,
                  center.x,
                  isActive,
                  dayData.day,
              );
          })
          .join("")}
    </g>
  `;
}

function renderEventStation(
    event: MapEvent,
    x: number,
    y: number,
    centerX: number,
    isActive: boolean,
    dayKey: string,
): string {
    const alignLeft = x > centerX;
    const boxX = alignLeft ? 12 : -140;

    return `
    <g transform="translate(${x}, ${y})"
       class="event-node ${isActive ? "is-current-active" : ""}"
       data-event-id="${event.id}"
       data-day-key="${dayKey}"
       data-day="${dayKey}">
      <g class="event-node-inner">
        <!-- Wegpunkt / Anker-Pin -->
        <circle cx="0" cy="0" r="${isActive ? "8" : "5"}"
                fill="${isActive ? "#a71d1d" : "#4e342e"}"
                stroke="#f4ebd9" stroke-width="${isActive ? "2.5" : "1.5"}" />

        <!-- Ausklappbare Event-Karte -->
        <g transform="translate(${boxX}, -20)">
          <rect width="132" height="42" rx="5"
                fill="${isActive ? "#fffbf0" : "#fcf8ef"}"
                stroke="${isActive ? "#a71d1d" : "#6d4c32"}"
                stroke-width="${isActive ? "2.5" : "1.2"}"
                filter="drop-shadow(1px 3px ${isActive ? "8px rgba(167, 29, 29, 0.45)" : "4px rgba(0,0,0,0.2)"})" />

          ${
              isActive
                  ? `
            <g transform="translate(112, 28) scale(1.1)">
              <text x="1" y="1" font-size="28" font-weight="900" fill="#e8d8ba" text-anchor="middle" opacity="0.9">✕</text>
              <text x="0" y="0" font-size="28" font-weight="900" fill="#a71d1d" text-anchor="middle">✕</text>
            </g>
          `
                  : ""
          }

          <text x="8" y="14" font-size="10" font-weight="bold" fill="${isActive ? "#a71d1d" : "#607d8b"}">
            ⚓ ${event.time || "Ganztägig"}
          </text>
          <text x="8" y="30" font-size="11" font-weight="900" fill="${isActive ? "#8b1e0f" : "#1f140e"}">
            ${event.title.length > 13 ? event.title.substring(0, 12) + "…" : event.title}
          </text>
        </g>
      </g>
    </g>
  `;
}
