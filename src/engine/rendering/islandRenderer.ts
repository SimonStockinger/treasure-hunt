import type { DynamicIsland } from "../layout/archipelagoLayout";
import type { MapEvent } from "../../types";
import { generateCoastline } from "./pirateArtRenderer";
import { renderTerrainFeature } from "./terrainRenderer";
import { getIslandConfig } from "../data_generation/islandGenerator";

export function renderArchipelagoIsland(
    island: DynamicIsland,
    isCurrentDay: boolean,
    activeEventId: string | null,
    isLast: boolean,
): string {
    const { dayData, index, center, radiusX, radiusY, eventPoints } = island;
    const seed = (index + 1) * 47;

    const config = getIslandConfig(dayData, isLast);

    const reefRing = generateCoastline(center, radiusX, radiusY, seed, 30);
    const sandCoast = generateCoastline(center, radiusX, radiusY, seed, 16);
    const land = generateCoastline(center, radiusX, radiusY, seed, 0);

    return `
    <g class="island-group ${isCurrentDay ? "active-today" : ""}" data-day="${dayData.day}">
      <!-- Küstenlinien & Landmasse mit dynamischer Farbe -->
      <path d="${reefRing}" fill="none" stroke="#6d4c32" stroke-width="1.6" stroke-dasharray="4,4" opacity="0.45" />
      <path d="${sandCoast}" fill="${config.beachColor}" stroke="#5d4037" stroke-width="2" opacity="0.85" />
      <path d="${land}"
            fill="${config.landColor}"
            stroke="#3e2723"
            stroke-width="${isCurrentDay ? "3.8" : "2.6"}" />

      <!-- Insel-Banner -->
      <g transform="translate(${center.x}, ${center.y - radiusY - 20})">
        <path d="M -105 -18 L 105 -18 L 88 18 L -88 18 Z" fill="${isCurrentDay ? "#8b261b" : "#2d1c13"}" stroke="#1a0f0a" stroke-width="2.2" />
        <text x="0" y="7" text-anchor="middle" font-size="15" font-weight="900" fill="#f4ebd9" letter-spacing="1.8">
          ${dayData.label.toUpperCase()}
        </text>
      </g>

      <!-- Terrain-Icon passend zum gewählten Terrain -->
      <g transform="translate(${center.x + radiusX * 0.58}, ${center.y - radiusY * 0.38}) scale(1.15)">
        ${renderTerrainFeature({ x: 0, y: 0 }, config.terrain)}
      </g>

      <!-- Events entlang der gebündelten Mittelachse -->
      ${dayData.events
          .map((event, eIdx) => {
              const pt = eventPoints[eIdx] || center;
              const isActive = isCurrentDay && event.id === activeEventId;
              return renderEventStation(
                  event,
                  pt.x,
                  pt.y,
                  isActive,
                  dayData.day,
                  eIdx,
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
    isActive: boolean,
    dayKey: string,
    eventIndex: number,
): string {
    const isRightSide = eventIndex % 2 === 0;

    const titleLen = event.title ? event.title.length : 0;
    const locLen = event.location ? event.location.length + 3 : 0;
    const timeLen = (event.time || "Ganztägig").length + 3;

    const maxChars = Math.max(titleLen, locLen, timeLen, 14);
    const paddingX = isActive ? 50 : 32;
    const boxW = Math.max(210, Math.round(maxChars * 9.8) + paddingX);

    const hasLocation = Boolean(event.location);
    const boxH = hasLocation ? 76 : 58;

    const boxX = isRightSide ? 22 : -(boxW + 22);
    const boxY = -(boxH / 2);

    return `
    <g transform="translate(${x}, ${y})"
       class="event-node ${isActive ? "is-current-active" : ""}"
       data-event-id="${event.id}"
       data-day-key="${dayKey}"
       data-day="${dayKey}">
      <g class="event-node-inner">
        <!-- Zentraler Wegpunkt-Pin -->
        <circle cx="0" cy="0" r="${isActive ? "11" : "8"}"
                fill="${isActive ? "#a71d1d" : "#4e342e"}"
                stroke="#f4ebd9" stroke-width="${isActive ? "3.5" : "2.2"}" />

        <!-- Vergrößertes Kärtchen -->
        <g transform="translate(${boxX}, ${boxY})">
          <rect width="${boxW}" height="${boxH}" rx="8"
                fill="${isActive ? "#fffdf5" : "#fdfaf2"}"
                stroke="${isActive ? "#a71d1d" : "#6d4c32"}"
                stroke-width="${isActive ? "3.2" : "2"}"
                filter="drop-shadow(2px 5px ${isActive ? "14px rgba(167, 29, 29, 0.55)" : "6px rgba(0,0,0,0.25)"})" />

          <!-- Rotes "X" für das aktive Event -->
          ${
              isActive
                  ? `
            <g transform="translate(${boxW - 24}, ${boxH / 2 + 12}) scale(1.4)">
              <text x="1" y="1" font-size="30" font-weight="900" fill="#e8d8ba" text-anchor="middle" opacity="0.9">✕</text>
              <text x="0" y="0" font-size="30" font-weight="900" fill="#a71d1d" text-anchor="middle">✕</text>
            </g>
          `
                  : ""
          }

          <!-- 1. Zeile: Uhrzeit (groß & fett) -->
          <text x="14" y="20" font-size="12.5" font-weight="bold" fill="${isActive ? "#a71d1d" : "#6d4c41"}">
            ${event.time || "Ganztägig"}
          </text>

          <!-- 2. Zeile: Voller Titel (15px, sehr gut lesbar) -->
          <text x="14" y="42" font-size="15" font-weight="900" fill="${isActive ? "#8b1e0f" : "#1a0f07"}">
            ${event.title}
          </text>

          <!-- 3. Zeile: Subtitle Location -->
          ${
              hasLocation
                  ? `
            <text x="14" y="62" font-size="12.5" font-weight="bold" fill="#5d4037">
              📍 ${event.location}
            </text>
          `
                  : ""
          }
        </g>
      </g>
    </g>
  `;
}
