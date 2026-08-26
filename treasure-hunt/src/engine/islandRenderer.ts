import type { DayData, Point, MapEvent } from "../types";
import { generateOrganicIsland } from "./islandShape";

export interface IslandSlot {
    dayData: DayData;
    index: number;
    center: Point;
    width: number;
    height: number;
}

/**
 * Verteilt die 7 Inseln auf dem 1400x850 Kartenausschnitt
 */
export function layoutIslands(days: DayData[]): IslandSlot[] {
    const weekKeys = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
    const colWidth = 165;
    const startX = 110;
    const gapX = 28;

    return weekKeys.map((key, index) => {
        const dayData = days.find((d) => d.day === key) || {
            day: key as any,
            label: key,
            events: [],
        };

        const eventCount = Math.max(dayData.events.length, 1);
        // Insel wird höher bei mehr Events
        const islandHeight = 160 + eventCount * 85;
        const islandWidth = colWidth;

        // Leicht versetzte Y-Höhen für einen abenteuerlichen Archipel-Look
        const yOffsets = [0, 25, -15, 30, -10, 20, -5];
        const centerY = 130 + islandHeight / 2 + yOffsets[index];
        const centerX = startX + index * (colWidth + gapX);

        return {
            dayData,
            index,
            center: { x: centerX, y: centerY },
            width: islandWidth,
            height: islandHeight,
        };
    });
}

/**
 * Rendert eine einzelne organische Insel mit ihren Event-Stationen
 */
export function renderIsland(slot: IslandSlot): string {
    const { dayData, index, center, width, height } = slot;
    const seed = (index + 1) * 31;
    const hasEvents = dayData.events.length > 0;
    const hasMain = dayData.events.some((e) => e.isMainEvent);

    // Farben für Sandstrand, Flachwasser und Inselfläche
    const landColor = hasMain
        ? "#8f9f69"
        : index % 2 === 0
          ? "#b29d6c"
          : "#a2b377";
    const beachColor = "#d9c79e";
    const shallowWaterColor = "#81a9a2";

    // 1. Küsten-Ebenen
    const waterRing = generateOrganicIsland(center, width, height, seed, 20);
    const beach = generateOrganicIsland(center, width, height, seed, 8);
    const land = generateOrganicIsland(center, width, height, seed, 0);

    // 2. Start-Y für die Events innerhalb der Insel
    const topY = center.y - height / 2 + 45;

    return `
    <g class="island-node" data-day="${dayData.day}">
      <!-- Flachwasser-Gischt & Strand -->
      <path d="${waterRing}" fill="${shallowWaterColor}" opacity="0.35" />
      <path d="${beach}" fill="${beachColor}" opacity="0.75" />

      <!-- Haupt-Landmasse -->
      <path d="${land}" fill="${landColor}" stroke="#4e3524" stroke-width="2" />

      <!-- Insel-Name als Holz-Banner / Flagge -->
      <g transform="translate(${center.x}, ${center.y - height / 2 + 20})">
        <rect x="-65" y="-14" width="130" height="24" rx="4" fill="#3e2723" stroke="#23140f" stroke-width="1.5"/>
        <text x="0" y="3" text-anchor="middle" font-size="12" font-weight="900" fill="#f5ecd7" letter-spacing="1">
          ${dayData.label.toUpperCase()}
        </text>
      </g>

      <!-- Inland-Pfad (Verbindung der Events) -->
      ${
          hasEvents && dayData.events.length > 1
              ? `
        <line x1="${center.x}" y1="${topY + 15}"
              x2="${center.x}" y2="${topY + (dayData.events.length - 1) * 85 + 15}"
              stroke="#5c4033" stroke-width="2" stroke-dasharray="3,3" opacity="0.7" />
      `
              : ""
      }

      <!-- Events als Stationen auf der Insel -->
      ${
          !hasEvents
              ? `
        <g transform="translate(${center.x}, ${center.y + 10})">
          <text x="0" y="0" text-anchor="middle" font-size="12" font-style="italic" fill="#3e2723" opacity="0.8">
            Unentdeckte Bucht
          </text>
          <text x="0" y="16" text-anchor="middle" font-size="10" fill="#5c4033" opacity="0.6">
            (Keine Termine)
          </text>
        </g>
      `
              : dayData.events
                    .map((event, eIdx) => {
                        const eventY = topY + eIdx * 85;
                        return renderEventStation(event, center.x, eventY);
                    })
                    .join("")
      }

      <!-- Großes Schatz-X bei Hauptevent -->
      ${
          hasMain
              ? `
        <text x="${center.x + width * 0.28}" y="${center.y + height * 0.35}"
              font-size="34" font-weight="900" fill="#a71d1d" text-anchor="middle" opacity="0.9">✕</text>
      `
              : ""
      }
    </g>
  `;
}

/**
 * Rendert eine einzelne Event-Station (Pergament-Schild & Wegpunkt)
 */
function renderEventStation(event: MapEvent, x: number, y: number): string {
    const isMain = event.isMainEvent;
    const badgeFill = isMain ? "#fdf0cd" : "#f9f4e8";
    const borderColor = isMain ? "#9e2a2b" : "#6b4f3b";

    return `
    <g class="event-station" transform="translate(${x}, ${y})">
      <!-- Wegpunkt-Marker -->
      <circle cx="0" cy="0" r="5" fill="${isMain ? "#b71c1c" : "#4e342e"}" stroke="#f9f4e8" stroke-width="1.5" />

      <!-- Ausklappbares Infoplakat direkt auf der Insel -->
      <g transform="translate(-65, 10)">
        <rect width="130" height="62" rx="5"
              fill="${badgeFill}" stroke="${borderColor}" stroke-width="${isMain ? "2" : "1.2"}"
              filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))" />

        <!-- Uhrzeit -->
        <text x="6" y="14" font-size="9.5" font-weight="bold" fill="${isMain ? "#9e2a2b" : "#6f4e37"}">
          ⚓ ${event.time || "Ganztägig"}
        </text>

        <!-- Titel -->
        <text x="6" y="28" font-size="10.5" font-weight="bold" fill="#2b1a09">
          ${event.title.length > 15 ? event.title.substring(0, 14) + "…" : event.title}
        </text>

        <!-- Ort -->
        ${
            event.location
                ? `
          <text x="6" y="42" font-size="9" fill="#543d2b">
            📍 ${event.location.length > 16 ? event.location.substring(0, 15) + "…" : event.location}
          </text>
        `
                : ""
        }

        <!-- Details-Hinweis -->
        ${
            event.description
                ? `
          <text x="6" y="54" font-size="8" font-style="italic" fill="#8d735e">
            ${event.description.length > 20 ? event.description.substring(0, 18) + "…" : event.description}
          </text>
        `
                : ""
        }
      </g>
    </g>
  `;
}
