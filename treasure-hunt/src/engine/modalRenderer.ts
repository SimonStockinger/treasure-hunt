import type { MapEvent, DayData } from "../types";

export function renderEventModal(event: MapEvent, dayLabel: string): string {
    return `
    <div class="parchment-modal-backdrop" id="modal-backdrop">
      <div class="parchment-modal-scroll" role="dialog">
        <button class="modal-close" id="modal-close-btn" aria-label="Schließen">&times;</button>

        <div class="modal-wax-seal">⚓</div>
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
          ${event.description || "Keine weiteren Kaperbefehle für diesen Wegpunkt verzeichnet."}
        </p>
      </div>
    </div>
  `;
}
