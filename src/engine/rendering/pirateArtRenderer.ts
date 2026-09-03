import type { Point } from "../../types";

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
