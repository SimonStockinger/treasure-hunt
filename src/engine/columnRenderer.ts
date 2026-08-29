import type { ColumnLayout } from "./columnLayout";
import { createIslandColumnPath } from "./islandColumnGenerator";
import { getIslandConfig } from "./islandGenerator";
import { renderTerrainFeature } from "./terrainRenderer";

export function renderIslandColumn(col: ColumnLayout): string {
    const { dayData, x, y, width, headerHeight, eventRowHeight } = col;
    const isLast = col.index === 6;
    const config = getIslandConfig(dayData, isLast);

    const beachPath = createIslandColumnPath(col, 8, col.index * 23);
    const landPath = createIslandColumnPath(col, 0, col.index * 23);

    const centerX = x + width / 2;

    return `
    <g class="island-column" data-day="${dayData.day}">
      <!-- Strand & Landfläche -->
      <path d="${beachPath}" fill="${config.beachColor}" opacity="0.55" />
      <path d="${landPath}" fill="${config.landColor}" stroke="#4e342e" stroke-width="2.5" />

      <!-- Insel-Header: Wochentag & Terrain-Icon -->
      <g class="column-header" transform="translate(0, 0)">
        <text x="${centerX}" y="${y + 28}" text-anchor="middle" font-size="15" font-weight="bold" fill="#2b1704" font-family="'Cinzel Decorative', Georgia, serif">
          ${dayData.label}
        </text>
        <g transform="translate(${centerX}, ${y + 50}) scale(0.75)">
          ${renderTerrainFeature({ x: 0, y: 0 }, config.terrain)}
        </g>
        <!-- Dekorative Trennlinie unter Header -->
        <line x1="${x + 15}" y1="${y + headerHeight}" x2="${x + width - 15}" y2="${y + headerHeight}" stroke="#5c4033" stroke-width="1.5" stroke-dasharray="3,3" />
      </g>

      <!-- Event-Zeilen innerhalb der Insel -->
      <g class="event-rows" transform="translate(0, ${y + headerHeight})">
        ${
            dayData.events.length === 0
                ? `
          <text x="${centerX}" y="60" text-anchor="middle" font-size="12" font-style="italic" fill="#5c4033">
            Ruhige See...
          </text>
        `
                : dayData.events
                      .map((event, idx) => {
                          const rowY = idx * eventRowHeight;
                          const isMain = event.isMainEvent;

                          return `
            <g class="event-item ${isMain ? "main-event-item" : ""}" transform="translate(${x + 10}, ${rowY + 10})">
              <!-- Event-Hintergrundkarte -->
              <rect width="${width - 20}" height="${eventRowHeight - 16}" rx="6"
                    fill="${isMain ? "#fff2cc" : "#fdfaf2"}"
                    stroke="${isMain ? "#b71c1c" : "#8d6e63"}"
                    stroke-width="${isMain ? "2" : "1"}"
                    opacity="0.95" />

              <!-- Rotes X Badge für Hauptevents -->
              ${
                  isMain
                      ? `
                <text x="${width - 32}" y="18" font-size="16" font-weight="900" fill="#b71c1c">✕</text>
              `
                      : ""
              }

              <!-- Uhrzeit -->
              <text x="8" y="16" font-size="11" font-weight="bold" fill="#795548">
                ${event.time || "Ganztägig"}
              </text>

              <!-- Event Titel (automatisch umgebrochen/platziert) -->
              <text x="8" y="34" font-size="12" font-weight="bold" fill="#2b1704">
                ${event.title.length > 18 ? event.title.substring(0, 16) + "..." : event.title}
              </text>

              <!-- Ort -->
              ${
                  event.location
                      ? `
                <text x="8" y="52" font-size="10" fill="#5d4037">
                  📍 ${event.location.length > 20 ? event.location.substring(0, 18) + "..." : event.location}
                </text>
              `
                      : ""
              }

              <!-- Beschreibung / Teaser -->
              ${
                  event.description
                      ? `
                <text x="8" y="68" font-size="9.5" fill="#757575" font-style="italic">
                  ${event.description.length > 24 ? event.description.substring(0, 22) + "..." : event.description}
                </text>
              `
                      : ""
              }
            </g>
          `;
                      })
                      .join("")
        }
      </g>
    </g>
  `;
}
