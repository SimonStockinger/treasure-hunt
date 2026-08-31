import type { DayData, WeekDay } from "../../types";

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

function parseTimeToMinutes(timeStr: string): number {
    const clean = timeStr.trim();
    const [h, m] = clean.split(":").map(Number);
    return (h || 0) * 60 + (m || 0);
}

export function getActiveEventId(
    dayData: DayData,
    now: Date = new Date(),
): string | null {
    if (!dayData.events || dayData.events.length === 0) return null;

    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    for (const event of dayData.events) {
        if (!event.time) continue;
        const parts = event.time.split("-").map((s) => s.trim());
        const start = parseTimeToMinutes(parts[0]);

        if (parts.length > 1) {
            let end = parts[1].toLowerCase().includes("open")
                ? 24 * 60
                : parseTimeToMinutes(parts[1]);
            if (end < start) end += 24 * 60;

            if (currentMinutes >= start && currentMinutes <= end) {
                return event.id;
            }
        } else {
            if (currentMinutes >= start && currentMinutes <= start + 120) {
                return event.id;
            }
        }
    }

    for (const event of dayData.events) {
        if (!event.time) continue;
        const start = parseTimeToMinutes(event.time.split("-")[0]);
        if (start > currentMinutes) {
            return event.id;
        }
    }

    return dayData.events[dayData.events.length - 1].id;
}
