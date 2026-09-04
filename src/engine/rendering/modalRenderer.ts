import type { DayData, MapEvent, Point } from "../../types";
import {
    renderEventStationCard,
    getEventCardDimensions,
} from "./islandRenderer";

export function renderEventModal(event: MapEvent, dayLabel: string): string {
    return `
    <div class="parchment-modal-backdrop" id="modal-backdrop">
      <div class="parchment-modal-scroll" role="dialog">
        <button class="modal-close" id="modal-close-btn" aria-label="Schließen">&times;</button>

        <div class="modal-tag">${dayLabel.toUpperCase()}</div>
        <h2 class="modal-title">${event.title}</h2>

        <div class="modal-meta">
          <div class="modal-meta-item">
            <strong>Zeit:</strong> ${event.time || "Ganztägig"}
          </div>
          ${
              event.location
                  ? `
            <div class="modal-meta-item">
              <strong>Ort:</strong> ${event.location}
            </div>
          `
                  : ""
          }
        </div>

        <div class="modal-divider">~ ☠ ~</div>

        <p class="modal-desc">
          ${event.description || ""}
        </p>
      </div>
    </div>
  `;
}

export function renderIslandModal(
    dayData: DayData,
    dayLabel: string,
    currentDayKey: string,
    activeEventId: string | null,
): string {
    const panelWidth = 500;
    const sideMargin = 12;
    const fullCardWidth = panelWidth - sideMargin * 2;
    const cardGap = 16;
    let currentY = 12;

    const cards = dayData.events.map((event) => {
        const isActive =
            dayData.day === currentDayKey && event.id === activeEventId;
        const { boxH } = getEventCardDimensions(event, isActive, fullCardWidth);

        const x = sideMargin;
        const y = currentY;

        currentY += boxH + cardGap;

        return renderEventStationCard(event, isActive, x, y, fullCardWidth);
    });

    const totalHeight = Math.max(120, currentY + 8);

    return `
    <div class="parchment-modal-backdrop" id="modal-backdrop">
      <div class="parchment-modal-scroll" role="dialog">
        <button class="modal-close" id="modal-close-btn" aria-label="Schließen">&times;</button>

        <div class="modal-tag">${dayLabel.toUpperCase()}</div>

        <div class="island-modal-pannel">
          <svg class="island-modal-svg" viewBox="0 0 ${panelWidth} ${totalHeight}" width="100%" height="${totalHeight}">
            ${cards.join("")}
          </svg>

          <div class="modal-divider">~ ☠ ~</div>
        </div>
      </div>
    </div>
  `;
}
