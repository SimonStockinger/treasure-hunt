import type { DynamicIsland } from "./archipelagoLayout";
import type { Point } from "../types";

/**
 * Erzeugt einen durchgehenden Bézier-Pfad über alle Inseln und Events
 */
export function generateSeamlessMasterRoute(islands: DynamicIsland[]): string {
    const masterPoints: Point[] = [];

    for (let i = 0; i < islands.length; i++) {
        const current = islands[i];

        // 1. Schiff erreicht den Insel-Anleger
        masterPoints.push(current.entryPoint);

        // 2. Fußweg führt über alle Events des Tages
        if (current.eventPoints.length > 0) {
            masterPoints.push(...current.eventPoints);
        } else {
            masterPoints.push(current.center);
        }

        // 3. Weg führt zum Auslauf-Hafen
        masterPoints.push(current.exitPoint);
    }

    return pointsToSmoothSvg(masterPoints);
}

function pointsToSmoothSvg(points: Point[]): string {
    if (points.length < 2) return "";
    let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;

    for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i === 0 ? i : i - 1];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[i + 2] || p2;

        const cp1x = p1.x + (p2.x - p0.x) / 5;
        const cp1y = p1.y + (p2.y - p0.y) / 5;
        const cp2x = p2.x - (p3.x - p1.x) / 5;
        const cp2y = p2.y - (p3.y - p1.y) / 5;

        d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return d;
}
