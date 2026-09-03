import type { MapEvent, Point, DynamicIsland } from "../../types";
import { renderTerrainFeature } from "./terrainRenderer";
import { getIslandConfig } from "../data_generation/islandGenerator";
import { pseudoRandom } from "../util/random";

export function renderArchipelagoIsland(
    island: DynamicIsland,
    isCurrentDay: boolean,
    activeEventId: string | null,
    isLast: boolean,
): string {
    const { dayData, index, center, radiusX, radiusY, eventPoints } = island;
    const seed = (index + 1) * 42; // Defines island shape

    const config = getIslandConfig(dayData, isLast);

    const reefRing = generateCoastline(center, radiusX, radiusY, seed, 30);
    const sandCoast = generateCoastline(center, radiusX, radiusY, seed, 16);
    const land = generateCoastline(center, radiusX, radiusY, seed, 0);

    return `
    <g class="island-group ${isCurrentDay ? "active-today" : ""}" data-day="${dayData.day}">
      <!-- Coastline and Island -->
      <path d="${reefRing}" fill="none" stroke="#6d4c32" stroke-width="1.6" stroke-dasharray="4,4" opacity="0.45" />
      <path d="${sandCoast}" fill="${config.beachColor}" stroke="#5d4037" stroke-width="2" opacity="0.85" />
      <path d="${land}"
            fill="${config.landColor}"
            stroke="#3e2723"
            stroke-width="${isCurrentDay ? "3.8" : "2.6"}" />

      <!-- Island Banner -->
      <g transform="translate(${center.x}, ${center.y - radiusY - 20})">
        <path d="M -105 -18 L 105 -18 L 88 18 L -88 18 Z" fill="${isCurrentDay ? "#8b261b" : "#2d1c13"}" stroke="#1a0f0a" stroke-width="2.2" />
        <text x="0" y="7" text-anchor="middle" font-size="15" font-weight="900" fill="#f4ebd9" letter-spacing="1.8">
          ${dayData.label.toUpperCase()}
        </text>
      </g>

      <!-- Terrain Feature -->
      <g transform="translate(${center.x + radiusX * 0.58}, ${center.y - radiusY * 0.38}) scale(1.15)">
        ${renderTerrainFeature({ x: 0, y: 0 }, config.terrain)}
      </g>

      <!-- Events alonge vertical axis -->
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

function generateCoastline(
    center: Point,
    rx: number,
    ry: number,
    seed: number,
    expand: number = 0,
): string {
    const count = 16;
    const points: Point[] = [];
    const angleStep = (Math.PI * 2) / count;

    for (let i = 0; i < count; i++) {
        const angle = i * angleStep;
        const noise = 0.82 + pseudoRandom(seed + i * 5) * 0.36;
        points.push({
            x: center.x + Math.cos(angle) * (rx + expand) * noise,
            y: center.y + Math.sin(angle) * (ry + expand) * noise,
        });
    }

    let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
    for (let i = 0; i < points.length; i++) {
        const p1 = points[i];
        const p2 = points[(i + 1) % points.length];
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        d += ` Q ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} ${midX.toFixed(1)} ${midY.toFixed(1)}`;
    }
    d += " Z";
    return d;
}

function renderEventStation(
    event: MapEvent,
    x: number,
    y: number,
    isActive: boolean,
    dayKey: string,
    eventIndex: number,
): string {
    // Event station Card
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
        <!-- Point -->
        <circle cx="0" cy="0" r="${isActive ? "11" : "8"}"
                fill="${isActive ? "#a71d1d" : "#4e342e"}"
                stroke="#f4ebd9" stroke-width="${isActive ? "3.5" : "2.2"}" />

        <!-- Enlarged Note -->
        <g transform="translate(${boxX}, ${boxY})">
          <rect width="${boxW}" height="${boxH}" rx="8"
                fill="${isActive ? "#fffdf5" : "#fdfaf2"}"
                stroke="${isActive ? "#a71d1d" : "#6d4c32"}"
                stroke-width="${isActive ? "3.2" : "2"}"
                filter="drop-shadow(2px 5px ${isActive ? "14px rgba(167, 29, 29, 0.55)" : "6px rgba(0,0,0,0.25)"})" />

          <!-- Mark currently active event -->
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

          <!-- 1. Row: Time -->
          <text x="14" y="20" font-size="12.5" font-weight="bold" fill="${isActive ? "#a71d1d" : "#6d4c41"}">
            ${event.time || "Ganztägig"}
          </text>

          <!-- 2. Row: Title -->
          <text x="14" y="42" font-size="15" font-weight="900" fill="${isActive ? "#8b1e0f" : "#1a0f07"}">
            ${event.title}
          </text>

          <!-- 3. Row: Location -->
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
