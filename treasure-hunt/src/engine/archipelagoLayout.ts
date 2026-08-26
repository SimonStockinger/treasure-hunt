import type { DayData, Point } from "../types";

export interface IslandWaypoint {
    eventIndex: number;
    position: Point;
}

export interface DynamicIsland {
    dayData: DayData;
    index: number;
    center: Point;
    radiusX: number;
    radiusY: number;
    entryPoint: Point;
    exitPoint: Point;
    eventPoints: Point[];
}

// Organische Ankerpunkte auf einer 1600x1000 Leinwand (S-Kurve über die Karte)
const ISLAND_POSITIONS: Point[] = [
    { x: 220, y: 220 }, // Mo: Nordwest
    { x: 620, y: 190 }, // Di: Nord-Zentral
    { x: 1040, y: 260 }, // Mi: Nordost
    { x: 1350, y: 560 }, // Do: Ost-Küste
    { x: 920, y: 720 }, // Fr: Süd-Zentral (Große Event-Insel)
    { x: 500, y: 790 }, // Sa: Südwest
    { x: 190, y: 560 }, // So: Westen / Das Finale (X)
];

export function layoutArchipelago(days: DayData[]): DynamicIsland[] {
    const weekKeys = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

    return weekKeys.map((key, index) => {
        const dayData = days.find((d) => d.day === key) || {
            day: key as any,
            label: key,
            events: [],
        };

        const eventCount = dayData.events.length;
        const hasMain = dayData.events.some((e) => e.isMainEvent);
        const center = ISLAND_POSITIONS[index];

        // Inselgröße skaliert mit der Event-Anzahl
        const radiusX = Math.max(90, 80 + eventCount * 8 + (hasMain ? 20 : 0));
        const radiusY = Math.max(75, 65 + eventCount * 12 + (hasMain ? 25 : 0));

        // Entry (wo das Schiff anlegt) und Exit (wo es abfährt)
        const entryPoint: Point = {
            x: center.x - radiusX * 0.7,
            y: center.y + radiusY * 0.6,
        };
        const exitPoint: Point = {
            x: center.x + radiusX * 0.7,
            y: center.y - radiusY * 0.6,
        };

        // Event-Pfade schlängeln sich innerhalb der Insel
        const eventPoints: Point[] = [];
        if (eventCount > 0) {
            const stepY = (radiusY * 1.2) / (eventCount + 1);
            for (let i = 0; i < eventCount; i++) {
                // Leichte Zickzack-Verschiebung im Inland
                const offsetX = (i % 2 === 0 ? -1 : 1) * 15;
                eventPoints.push({
                    x: center.x + offsetX,
                    y: center.y - radiusY * 0.6 + (i + 1) * stepY,
                });
            }
        }

        return {
            dayData,
            index,
            center,
            radiusX,
            radiusY,
            entryPoint,
            exitPoint,
            eventPoints,
        };
    });
}
