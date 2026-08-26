import type { Point } from "../types";

function pseudoRandom(seed: number) {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

/**
 * Generiert eine organische Insel-Form (Pill/Blob), die sich nach unten streckt,
 * wenn viele Events vorhanden sind.
 */
export function generateOrganicIsland(
    center: Point,
    width: number,
    height: number,
    seed: number,
    padding: number = 0,
): string {
    const w = width / 2 + padding;
    const h = height / 2 + padding;
    const cx = center.x;
    const cy = center.y;

    // 12 Kontrollpunkte im Kreis/Oval um das Zentrum mit prozeduralem Rauschen
    const numPoints = 14;
    const points: Point[] = [];
    const angleStep = (Math.PI * 2) / numPoints;

    for (let i = 0; i < numPoints; i++) {
        const angle = i * angleStep;
        // Verzerrung für organische Küstenlinie
        const noise = 0.85 + pseudoRandom(seed + i * 7) * 0.3;

        // Elliptische Ausdehnung
        const rx = Math.cos(angle) * w * noise;
        const ry = Math.sin(angle) * h * noise;

        points.push({
            x: cx + rx,
            y: cy + ry,
        });
    }

    // Sanfte kubische Kurve durch alle Punkte schließen
    let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
    for (let i = 0; i < points.length; i++) {
        const p1 = points[i];
        const p2 = points[(i + 1) % points.length];
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        d += ` Q ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} ${midX.toFixed(1)} ${midY.toFixed(1)}`;
    }
    d += " Z";
    return d;
}
