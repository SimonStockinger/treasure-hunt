import type { DayData, WeekDay } from "../types";

const DAY_MAP: Record<number, WeekDay> = {
    0: "So",
    1: "Mo",
    2: "Di",
    3: "Mi",
    4: "Do",
    5: "Fr",
    6: "Sa",
};

export function getCurrentWeekDay(): WeekDay {
    const dayIndex = new Date().getDay();
    return DAY_MAP[dayIndex];
}

/**
 * Wandelt einen "HH:MM" String in Minuten seit Mitternacht um.
 */
function parseTimeToMinutes(timeStr: string): number {
    const clean = timeStr.trim();
    const [h, m] = clean.split(":").map(Number);
    return (h || 0) * 60 + (m || 0);
}

/**
 * Ermittelt die Event-ID des aktuell laufenden bzw. nächsten Events des Tages.
 */
export function getActiveEventId(
    dayData: DayData,
    now: Date = new Date(),
): string | null {
    if (!dayData.events || dayData.events.length === 0) return null;

    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // 1. Prüfen, ob ein Event gerade aktiv läuft
    for (const event of dayData.events) {
        if (!event.time) continue;
        const parts = event.time.split("-").map((s) => s.trim());
        const start = parseTimeToMinutes(parts[0]);

        if (parts.length > 1) {
            let end = parts[1].toLowerCase().includes("open")
                ? 24 * 60
                : parseTimeToMinutes(parts[1]);
            // Event über Mitternacht hinaus
            if (end < start) end += 24 * 60;

            if (currentMinutes >= start && currentMinutes <= end) {
                return event.id;
            }
        } else {
            // Einzeltraining / Slot (z. B. 2 Stunden Puffer)
            if (currentMinutes >= start && currentMinutes <= start + 120) {
                return event.id;
            }
        }
    }

    // 2. Falls keines aktiv läuft: Nächstes anstehendes Event finden
    for (const event of dayData.events) {
        if (!event.time) continue;
        const start = parseTimeToMinutes(event.time.split("-")[0]);
        if (start > currentMinutes) {
            return event.id;
        }
    }

    // 3. Wenn alle Events des Tages vorbei sind -> Letztes Event als Rückblick
    return dayData.events[dayData.events.length - 1].id;
}
