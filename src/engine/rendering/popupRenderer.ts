import type { DayData, Point } from "../../types";

export function renderDayPopup(dayData: DayData, pos: Point): string {
    const hasEvents = dayData.events && dayData.events.length > 0;

    const popupX = Math.min(Math.max(pos.x - 110, 20), 980);
    const popupY = pos.y > 450 ? pos.y - 200 : pos.y + 40;

    return `
    <foreignObject x="${popupX}" y="${popupY}" width="240" height="190" class="map-popup" data-popup-day="${dayData.day}">
      <div xmlns="http://www.w3.org/1999/xhtml" class="parchment-scroll">
        <div class="scroll-header">
          <strong>${dayData.label}</strong>
          <span class="close-btn">&times;</span>
        </div>
        <div class="scroll-body">
          ${
              !hasEvents
                  ? `
            <p class="empty-msg">Ruhige See... Keine Kaperfahrten geplant.</p>
          `
                  : dayData.events
                        .map(
                            (event) => `
            <div class="event-entry ${event.isMainEvent ? "main-event" : ""}">
              <div class="event-time">${event.time || "Ganztägig"} ${event.location ? `• ${event.location}` : ""}</div>
              <div class="event-title">${event.title}</div>
              ${event.description ? `<div class="event-desc">${event.description}</div>` : ""}
            </div>
          `,
                        )
                        .join("")
          }
        </div>
      </div>
    </foreignObject>
  `;
}
