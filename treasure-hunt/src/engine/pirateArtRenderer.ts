import type { DynamicIsland } from "./archipelagoLayout";
import type { Point } from "../types";

function pseudoRandom(seed: number) {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

/**
 * Organische Insel-Umrisse mit Tiefenlinien
 */
export function generateCoastline(
    center: Point,
    rx: number,
    ry: number,
    seed: number,
    expand: number = 0,
): string {
    const count = 16;
    const points: Point[] = [];
    const angleStep = (Math.PI * 2) / count;

    for (let i = 0; i < count; i++) {
        const angle = i * angleStep;
        const noise = 0.82 + pseudoRandom(seed + i * 5) * 0.36;
        points.push({
            x: center.x + Math.cos(angle) * (rx + expand) * noise,
            y: center.y + Math.sin(angle) * (ry + expand) * noise,
        });
    }

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

/**
 * Navigationslinien (Rhumb Lines) von einer Kompassrose
 */
export function renderRhumbLines(origin: Point = { x: 800, y: 500 }): string {
    const lines: string[] = [];
    for (let deg = 0; deg < 360; deg += 22.5) {
        const rad = (deg * Math.PI) / 180;
        const x2 = origin.x + Math.cos(rad) * 1200;
        const y2 = origin.y + Math.sin(rad) * 1200;
        lines.push(
            `<line x1="${origin.x}" y1="${origin.y}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#6b4c35" stroke-width="0.75" stroke-dasharray="8,6" opacity="0.25" />`,
        );
    }
    return lines.join("");
}
