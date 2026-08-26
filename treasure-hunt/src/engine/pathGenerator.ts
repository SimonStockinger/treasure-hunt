import type { Point } from "../types";

export interface DayNode {
    index: number;
    dayKey: string;
    position: Point;
}

// 7 Wegpunkte auf einer 1200x700 Canvas im Abenteuer-Zickzack
const BASE_COORDINATES: Point[] = [
    { x: 150, y: 160 }, // Mo (oben links)
    { x: 380, y: 140 }, // Di (oben mitte)
    { x: 620, y: 220 }, // Mi (zentral)
    { x: 420, y: 400 }, // Do (schleife nach unten links)
    { x: 220, y: 550 }, // Fr (unten links)
    { x: 640, y: 560 }, // Sa (unten mitte)
    { x: 1000, y: 440 }, // So / Finale (rechts - Der Schatz!)
];

/**
 * Erzeugt die Koordinaten für alle 7 Tage.
 */
export function getDayPositions(): DayNode[] {
    const days = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
    return days.map((dayKey, index) => ({
        index,
        dayKey,
        position: BASE_COORDINATES[index],
    }));
}

/**
 * Verbindet die Punkte mit glatten kubischen Bézier-Kurven (Catmull-Rom -> SVG Path).
 */
export function generateCurvedPath(points: Point[]): string {
    if (points.length < 2) return "";

    let d = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i === 0 ? i : i - 1];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[i + 2] || p2;

        // Kontrollpunkte für eine geschmeidige Kurve berechnen
        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;

        d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x} ${p2.y}`;
    }

    return d;
}
